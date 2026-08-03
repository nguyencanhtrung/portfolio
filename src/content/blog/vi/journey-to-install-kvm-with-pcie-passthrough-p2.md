---
title: 'Setup KVM với PCIe passthrough - phần 2: cài đặt KVM'
description: 'Phần 2: cài KVM, libvirt và bộ công cụ đi kèm trên Ubuntu, kiểm tra CPU có hỗ trợ ảo hoá, cấp quyền cho user, dựng mạng NAT và mạng bridge, rồi tạo máy ảo đầu tiên bằng virt-install.'
date: 2023-09-28
lang: vi
key: journey-to-install-kvm-with-pcie-passthrough-p2
tags: ['kvm']
series: 'Setup KVM với PCIe passthrough'
seriesOrder: 2
---
## 1. Giới thiệu

Phần 1 đã nói vì sao phải đưa hẳn một card PCIe vào máy ảo, và VFIO cùng IOMMU
đóng vai trò gì. Phần này dựng cỗ máy sẽ nhận card đó: cài bộ KVM, xác nhận host
thật sự chạy được ảo hoá phần cứng, dựng mạng và storage, rồi tạo máy ảo đầu
tiên bằng `virt-install`. Phần passthrough sẽ bắt đầu từ bài 3.

## 2. Điều kiện cần

Trước khi bắt đầu, cần đảm bảo đủ ba thứ sau:

1. **Hệ điều hành**: Ubuntu 20.04, kernel v5.15.

2. **BIOS**: bật Intel Virtualization Technology (Intel VT) và Intel VT-d trong
   BIOS của server. Thiếu VT-d thì phần passthrough ở các bài sau sẽ không chạy.

3. **CPU**: kiểm tra CPU có hỗ trợ ảo hoá và IOMMU hay không:

```bash
egrep -c '(vmx|svm)' /proc/cpuinfo
```
Kết quả trả về `0` nghĩa là CPU không chạy được KVM. Bất kỳ số nào khác `0` đều
hợp lệ — con số đó chính là số core có hỗ trợ.

Đủ ba điều kiện trên là cài được.

## 3. Cài đặt KVM

### 3.1 Cài KVM và bộ công cụ đi kèm

```shell
sudo apt update
sudo apt install qemu-kvm libvirt-clients libvirt-daemon-system virtinst bridge-utils cpu-checker virt-viewer virt-manager qemu-system
```

### 3.2 Kiểm tra hệ thống dùng được KVM acceleration chưa

```shell
sudo kvm-ok
```

Kết quả mong đợi:

```shell
tesla@tesla:~/kvm$ kvm-ok
INFO: /dev/kvm exists
KVM acceleration can be used
```

Sau đó chạy `virt-host-validate` để soát toàn bộ các điều kiện ảo hoá cùng một
lượt. Dòng đáng quan tâm nhất cho loạt bài này là
`Checking for device assignment IOMMU support` — nó phải `PASS`, nếu không thì
quay lại BIOS bật VT-d.

```shell
$ sudo virt-host-validate
QEMU: Checking for hardware virtualization                                 : PASS
QEMU: Checking if device /dev/kvm exists                                   : PASS
QEMU: Checking if device /dev/kvm is accessible                            : PASS
QEMU: Checking if device /dev/vhost-net exists                             : PASS
QEMU: Checking if device /dev/net/tun exists                               : PASS
QEMU: Checking for cgroup 'memory' controller support                      : PASS
QEMU: Checking for cgroup 'memory' controller mount-point                  : PASS
QEMU: Checking for cgroup 'cpu' controller support                         : PASS
QEMU: Checking for cgroup 'cpu' controller mount-point                     : PASS
QEMU: Checking for cgroup 'cpuacct' controller support                     : PASS
QEMU: Checking for cgroup 'cpuacct' controller mount-point                 : PASS
QEMU: Checking for cgroup 'cpuset' controller support                      : PASS
QEMU: Checking for cgroup 'cpuset' controller mount-point                  : PASS
QEMU: Checking for cgroup 'devices' controller support                     : PASS
QEMU: Checking for cgroup 'devices' controller mount-point                 : PASS
QEMU: Checking for cgroup 'blkio' controller support                       : PASS
QEMU: Checking for cgroup 'blkio' controller mount-point                   : PASS
QEMU: Checking for device assignment IOMMU support                         : PASS
 LXC: Checking for Linux >= 2.6.26                                         : PASS
 LXC: Checking for namespace ipc                                           : PASS
 LXC: Checking for namespace mnt                                           : PASS
 LXC: Checking for namespace pid                                           : PASS
 LXC: Checking for namespace uts                                           : PASS
 LXC: Checking for namespace net                                           : PASS
 LXC: Checking for namespace user                                          : PASS
 LXC: Checking for cgroup 'memory' controller support                      : PASS
 LXC: Checking for cgroup 'memory' controller mount-point                  : PASS
 LXC: Checking for cgroup 'cpu' controller support                         : PASS
 LXC: Checking for cgroup 'cpu' controller mount-point                     : PASS
 LXC: Checking for cgroup 'cpuacct' controller support                     : PASS
 LXC: Checking for cgroup 'cpuacct' controller mount-point                 : PASS
 LXC: Checking for cgroup 'cpuset' controller support                      : PASS
 LXC: Checking for cgroup 'cpuset' controller mount-point                  : PASS
 LXC: Checking for cgroup 'devices' controller support                     : PASS
 LXC: Checking for cgroup 'devices' controller mount-point                 : PASS
 LXC: Checking for cgroup 'blkio' controller support                       : PASS
 LXC: Checking for cgroup 'blkio' controller mount-point                   : PASS
 LXC: Checking if device /sys/fs/fuse/connections exists                   : PASS
```

### 3.3 Thêm user vào các group libvirt

Để quản lý máy ảo mà không phải gõ `sudo` mỗi lần, thêm user hiện tại vào tất cả
các group `libvirt*` và cả group `kvm`:

```shell
cat /etc/group | grep libvirt | awk -F':' {'print $1'} | xargs -n1 sudo adduser $USER

# add user to kvm group also
sudo adduser $USER kvm

# relogin, then show group membership
exec su -l $USER
id | grep libvirt
```

Thay đổi group chỉ có hiệu lực sau khi đăng nhập lại. Nếu lệnh `id` chưa thấy
các group `libvirt*` thì logout rồi login lại, hoặc dùng `exec su -l $USER`.

### 3.4 Trỏ QEMU về system daemon

Nếu không khai báo rõ, QEMU ở userspace sẽ kết nối tới `qemu:///session` chứ
không phải `qemu:///system`. Hệ quả là chạy `virsh` bằng user thường và bằng
`sudo` sẽ thấy hai tập domain, network và storage pool hoàn toàn khác nhau —
một nguồn nhầm lẫn kinh điển khi máy ảo "biến mất".

Thêm biến môi trường sau vào profile để mọi phiên đăng nhập đều dùng chung một
kết nối:

```shell
# use same connection and objects as sudo
export LIBVIRT_DEFAULT_URI=qemu:///system
```

### 3.5 Mạng mặc định

Mặc định KVM tạo một virtual switch, hiện ra trên host dưới dạng interface
`virbr0` với dải 192.168.122.0/24. Kiểm tra bằng `ip`:

```shell
$ ip addr show virbr0
3: virbr0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default qlen 1000
    link/ether 00:00:00:00:00:00 brd ff:ff:ff:ff:ff:ff
    inet 192.168.122.1/24 brd 192.168.122.255 scope global virbr0
       valid_lft forever preferred_lft forever
```

`virbr0` chạy ở chế độ NAT: máy ảo đi ra ngoài được, nhưng chiều ngược lại thì
chỉ host (và các máy ảo cùng subnet) mới kết nối vào được.

### 3.6 Mạng bridge

Muốn máy ảo nằm cùng lớp mạng với host — để máy khác trong LAN truy cập thẳng
vào máy ảo — thì phải tạo bridge tới interface vật lý (`eth0`, `ens4`,
`enp1s0`…).

Trước hết dùng NetPlan để bridge interface vật lý thành `br0` ở mức hệ điều
hành, sau đó tạo một libvirt network tên `host-bridge` trỏ vào `br0`:

```shell
# bridge to physical network
$ virsh net-dumpxml host-bridge

<network connections='2'>
  <name>host-bridge</name>
  <uuid>44d2c3f5-6301-4fc6-be81-5ae2be4a47d8</uuid>
  <forward mode='bridge'/>
  <bridge name='br0'/>
</network>
```

`host-bridge` sẽ được dùng lại ở các bài sau.

Hướng dẫn tạo `br0` bằng NetPlan xem [tại đây](https://fabianlee.org/2019/04/01/kvm-creating-a-bridged-network-with-netplan-on-ubuntu-bionic/).

### 3.7 Bật IPv4 forwarding trên host

Để host định tuyến được cho NAT network, phải bật IPv4 forwarding:

```shell
# this needs to be "1"
cat /proc/sys/net/ipv4/ip_forward
# if not, then add it
echo net.ipv4.ip_forward=1 | sudo tee -a /etc/sysctl.conf

# make permanent
sudo sysctl -p /etc/sysctl.conf
```

### 3.8 Storage pool

Storage pool mặc định cho ổ đĩa máy ảo là `/var/lib/libvirt/images`. Dùng để thử
nghiệm thì ổn, nhưng nếu muốn đặt đĩa máy ảo lên một ổ khác (SSD chẳng hạn) thì
nên tạo pool riêng.

Dưới đây là các lệnh tạo pool tên `kvmpool` trên SSD mount tại `/data/kvm/pool`:

```shell
$ virsh pool-list --all
 Name                 State      Autostart 
-------------------------------------------
 default              active     yes       

$ virsh pool-define-as kvmpool --type dir --target /data/kvm/pool
Pool kvmpool defined
$ virsh pool-list --all
$ virsh pool-start kvmpool
$ virsh pool-autostart kvmpool

$ virsh pool-list --all
 Name                 State      Autostart 
-------------------------------------------
 default              active     yes       
 kvmpool              active     yes
```


## 4. Tạo máy ảo bằng `virt-install`

### 4.1 Tải ISO Ubuntu 20.04

Cần một image để boot. Ở đây dùng luôn ISO Ubuntu 20.04, tải về thành file
`~/kvm/mini.iso`:


```shell
wget https://releases.ubuntu.com/20.04.6/ubuntu-20.04.6-desktop-amd64.iso -O ~/kvm/mini.iso
```

Trước khi tạo, liệt kê xem host đang có máy ảo nào:

```shell
# chown is only necessary if virsh was run previously as sudo
ls -l ~/.virtinst
sudo chown -R $USER:$USER ~/.virtinst

# list VMs
virsh list --all
```

Danh sách sẽ rỗng vì chưa có máy ảo nào được tạo.

### 4.2 Cài máy ảo `ukvm2004`

```shell
virt-install --virt-type=kvm --name=ukvm2004 --ram 8192 --vcpus=4 --virt-type=kvm --hvm --cdrom ~/kvm/mini.iso --network network=default --disk pool=default,size=20,bus=virtio,format=qcow2 --noautoconsole --machine q35
```

Lưu ý quan trọng: phải chọn machine type `q35`. Đây là điều kiện để máy ảo có
PCIe đầy đủ — nếu tạo máy ảo bằng `virt-manager` thì cũng phải chọn `q35`, không
dùng mặc định `i440fx`. Chọn sai ở bước này thì tới bài 5 sẽ không gắn được card
vào máy ảo.

* VM name:   `ukvm2004`
* VCPU: `4`
* RAM:  `8G`
* Network: `default virbr0 NAT network`
* Pool storage:  `default` and size = 20GB
* Graphic: `default` - spice

### 4.3 Mở máy ảo

```shell
# open console to VM
virt-viewer ukvm2004
```

`virt-viewer` mở một cửa sổ hiển thị màn hình máy ảo. Click chuột vào cửa sổ rồi
nhấn `Enter` sẽ thấy màn hình cài đặt Ubuntu.

`virt-manager` là giao diện đồ hoạ để tạo và quản lý máy ảo; những máy ảo tạo
bằng `virt-install` từ dòng lệnh cũng hiện trong danh sách này.

### 4.4 Dừng và xoá máy ảo

Muốn xoá hẳn máy ảo, đóng cửa sổ `virt-viewer` rồi chạy:

```shell
virsh destroy ukvm2004
virsh undefine ukvm2004
```


## 5. Tham khảo

Xem thêm [tổng hợp lệnh KVM](https://fabianlee.org/2018/08/27/kvm-bare-metal-virtualization-on-ubuntu-with-kvm/)  and [Xilinx instruction](https://www.xilinx.com/developer/articles/using-alveo-data-center-accelerator-cards-in-a-kvm-environment.html)