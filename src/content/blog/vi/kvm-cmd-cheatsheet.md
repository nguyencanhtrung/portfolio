---
title: 'Tổng hợp lệnh KVM'
description: 'Bộ lệnh virsh và virt-install dùng được ngay, xếp theo đúng thứ tự cần đến: kiểm tra máy chạy được KVM, trỏ virsh về system daemon, dựng mạng NAT và bridge, khai báo storage pool, rồi tạo, chạy và xoá máy ảo.'
date: 2023-09-29
lang: vi
key: kvm-cmd-cheatsheet
tags: ['kvm']
---

Bộ lệnh `virsh` và `virt-install` để chạy máy ảo KVM trên Ubuntu, sắp theo đúng
thứ tự thực tế cần đến: xác nhận host tăng tốc được, trỏ client về đúng daemon,
dựng mạng và storage, rồi tạo và điều khiển máy ảo. Mọi khối lệnh bên dưới đều
copy-paste chạy được ngay.

## 1. Kiểm tra host chạy được KVM

```shell
sudo kvm-ok
```

Kết quả mong đợi:

```shell
tesla@tesla:~/kvm$ kvm-ok
INFO: /dev/kvm exists
KVM acceleration can be used
```

## 2. Trỏ virsh về system daemon

Không có biến này, `virsh` sẽ nói chuyện với session daemon riêng của từng user
và không thấy được những máy ảo tạo bằng `sudo`.

```shell
# dùng chung connection và object với sudo
export LIBVIRT_DEFAULT_URI=qemu:///system
```

## 3. Mạng

Mạng NAT mặc định nằm trên `virbr0`. Mạng bridge thì cho máy ảo một địa chỉ ngay
trên LAN vật lý thay vì nằm sau NAT.

```shell
ip addr show virbr0
```

```shell
# bridge sang mạng vật lý
$ virsh net-dumpxml host-bridge

<network connections='2'>
  <name>host-bridge</name>
  <uuid>44d2c3f5-6301-4fc6-be81-5ae2be4a47d8</uuid>
  <forward mode='bridge'/>
  <bridge name='br0'/>
</network>
```

### 3.1 IP forwarding

```shell
# giá trị này phải là "1"
cat /proc/sys/net/ipv4/ip_forward
# nếu chưa, thêm vào
echo net.ipv4.ip_forward=1 | sudo tee -a /etc/sysctl.conf

# áp dụng vĩnh viễn
sudo sysctl -p /etc/sysctl.conf
```

## 4. Storage pool

Pool thực chất chỉ là một thư mục mà libvirt được phép ghi file ổ đĩa vào.

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

## 5. Sửa quyền sau khi lỡ chạy virsh bằng root

```shell
# chỉ cần chown nếu trước đó đã chạy virsh bằng sudo
ls -l ~/.virtinst
sudo chown -R $USER:$USER ~/.virtinst

# liệt kê máy ảo
virsh list --all
```

## 6. Tạo máy ảo `ukvm2004`

```shell
virt-install \
--virt-type=kvm \
--name=ukvm2004 \
--ram 8192 \
--vcpus=4 \
--virt-type=kvm \
--hvm \
--cdrom ~/kvm/mini.iso \
--network network=default \
--disk pool=default,size=20,bus=virtio,format=qcow2 \
--noautoconsole \
--machine q35 \
```

Chú ý `--machine q35`: đây là điều kiện để máy ảo có PCIe đầy đủ. Nếu định làm
PCIe passthrough sau này thì bắt buộc phải có, và không sửa được sau khi máy ảo
đã tạo.

## 7. Khởi động máy ảo

```shell
virsh start ukvm2004
```

## 8. Mở màn hình máy ảo

```shell
virt-viewer ukvm2004
```

## 9. Tắt máy ảo

```shell
virsh destroy ukvm2004
```

## 10. Xoá máy ảo

```shell
virsh undefine ukvm2004
```
