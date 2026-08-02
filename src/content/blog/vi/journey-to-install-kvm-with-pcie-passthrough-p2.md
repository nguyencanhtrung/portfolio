---
title: 'Series - Setup KVM with PCIe passthrough - p2'
description: 'Phần 2: cài KVM, libvirt và bộ công cụ đi kèm trên Ubuntu, kiểm tra CPU có hỗ trợ ảo hoá, cấp quyền cho user, dựng mạng NAT và mạng bridge, rồi tạo máy ảo đầu tiên bằng virt-install.'
date: 2023-09-28
lang: vi
key: journey-to-install-kvm-with-pcie-passthrough-p2
tags: ['kvm']
series: 'Setup KVM with PCIe passthrough'
seriesOrder: 2
---
## 1. Giới thiệu

Nối tiếp phần 1, phần này sẽ mô tả chi tiết về việc cài đặt máy ảo KVM. Phần hướng dẫn này sẽ được mô tả bằng tiếng Anh.

## 2. Prerequisites

Before getting started, ensure that you meet the following prerequisites:

1. **Linux System**: Ubuntu 20.04 - kernel v5.15.

2. **Bios**: Make sure Intel Virtualization Technology (Intel VT) and Intel ® VT-d must be enabled from server BIOS

3. **CPU Support**: Check if your CPU supports virtualization and IOMMU (Input-Output Memory Management Unit) by running:

```bash
egrep -c '(vmx|svm)' /proc/cpuinfo
```
If the command returns a value of 0, your processor is not capable of running KVM. On the other hand, any other number means you can proceed with the installation.

You are now ready to start installing KVM.

## 3. KVM Installation

### 3.1 Install KVM and assorted tools

```shell
sudo apt update
sudo apt install qemu-kvm libvirt-clients libvirt-daemon-system virtinst bridge-utils cpu-checker virt-viewer virt-manager qemu-system
```

### 3.2 Check whether your system can use KVM acceleration

```shell
sudo kvm-ok
```

The output should look like this:

```shell
tesla@tesla:~/kvm$ kvm-ok
INFO: /dev/kvm exists
KVM acceleration can be used
```

Then run the virt-host-validate utility to run a whole set of checks against your virtualization ability and KVM readiness.

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

### 3.3 Add user to libvirt groups

To allow the current user to manage the guest VM without sudo, we can add ourselves to all of the libvirt groups (e.g. libvirt, libvirt-qemu) and the kvm group

```shell
cat /etc/group | grep libvirt | awk -F':' {'print $1'} | xargs -n1 sudo adduser $USER

# add user to kvm group also
sudo adduser $USER kvm

# relogin, then show group membership
exec su -l $USER
id | grep libvirt
```

Group membership requires a user to log back in, so if the `id` command does not show your libvirt* group membership, logout and log back in, or try `exec su -l $USER`.

### 3.4 QEMU connection to system

If not explicitly set, the userspace QEMU connection will be to `qemu:///session`, and not to `qemu:///system`.  This will cause you to see different domains, networks, and disk pool when executing virsh as your regular user versus sudo.

Modify your profile so that the environment variable below is exported to your login sessions.

```shell
# use same connection and objects as sudo
export LIBVIRT_DEFAULT_URI=qemu:///system
```

### 3.5 Default network

By default, KVM creates a virtual switch that shows up as a host interface named `virbr0` using 192.168.122.0/24.

This interface should be visible from the Host using the “ip” command below.

```shell
$ ip addr show virbr0
3: virbr0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default qlen 1000
    link/ether 00:00:00:00:00:00 brd ff:ff:ff:ff:ff:ff
    inet 192.168.122.1/24 brd 192.168.122.255 scope global virbr0
       valid_lft forever preferred_lft forever
```

`virbr0` operates in NAT mode, which allows the guest OS to communicate out, but only allowing the Host(and those VMs in its subnet) to make incoming connections.

### 3.6 Bridge network

To enable guest VMs on the same network as the Host, you should create a bridged network to your physical interface (e.g. eth0, ens4, epn1s0).

Read my article here for how to use NetPlan on Ubuntu to bridge your physical network interface to `br0` at the OS level.  And then use that to create a libvirt network named `host-bridge` that uses `br0`.

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

This `host-bridge` will be required in later articles.

Instruction to setup host's OS to create `br0` [here](https://fabianlee.org/2019/04/01/kvm-creating-a-bridged-network-with-netplan-on-ubuntu-bionic/)

### 3.7 Enable IPv4 forwarding on KVM host

In order to handle NAT and routed networks for KVM, enable IPv4 forwarding on this host.

```shell
# this needs to be "1"
cat /proc/sys/net/ipv4/ip_forward
# if not, then add it
echo net.ipv4.ip_forward=1 | sudo tee -a /etc/sysctl.conf

# make permanent
sudo sysctl -p /etc/sysctl.conf
```

### 3.8 Default storage pool

The “default” storage pool for guest disks is `/var/lib/libvirt/images`.   This is fine for test purposes, but if you have another mount that you want to use for guest OS disks, then you should create a custom storage pool.

Below are the commands to create a “kvmpool” on an SSD mounted at `/data/kvm/pool`.

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


## 4. VM creation using `virt-install`

### 4.1 Download ubuntu 20.04 focal iso

In order to test you need an OS boot image.  Since we are on an Ubuntu host, let’s download the ISO for the network installer of Ubuntu 20.04 Focal. When complete, you should have a local file named `~/kvm/mini.iso`


```shell
wget https://releases.ubuntu.com/20.04.6/ubuntu-20.04.6-desktop-amd64.iso -O ~/kvm/mini.iso
```

First list what virtual machines are running on our host:

```shell
# chown is only necessary if virsh was run previously as sudo
ls -l ~/.virtinst
sudo chown -R $USER:$USER ~/.virtinst

# list VMs
virsh list --all
```

This should return an empty list of VMs, because no guest OS have been deployed. 

### 4.2 Installing `ukvm2004` VM

```shell
virt-install --virt-type=kvm --name=ukvm2004 --ram 8192 --vcpus=4 --virt-type=kvm --hvm --cdrom ~/kvm/mini.iso --network network=default --disk pool=default,size=20,bus=virtio,format=qcow2 --noautoconsole --machine q35
```

Note: When creating VM's using virt-manager, make sure to also select `q35` as the machine type for full support of pcie in your guests.

* VM name:   `ukvm2004`
* VCPU: `4`
* RAM:  `8G`
* Network: `default virbr0 NAT network`
* Pool storage:  `default` and size = 20GB
* Graphic: `default` - spice

### 4.3 Open the VM

```shell
# open console to VM
virt-viewer ukvm2004
```

`virt-viewer` will popup a window for the Guest OS, when you click the mouse in the window and then press <ENTER> you will see the initial Ubuntu network install screen.

`virt-manager` provides a convenient interface for creating or managing a guest OS, and any guest OS you create from the CLI using virt-install will show up in this list also.


### 4.4 Stop and delete VM

If you want to delete this guest OS completely, close the GUI window opened with virt-viewer, then use the following commands:

```shell
virsh destroy ukvm2004
virsh undefine ukvm2004
```


## 5. References

Visit [kvm all commands](https://fabianlee.org/2018/08/27/kvm-bare-metal-virtualization-on-ubuntu-with-kvm/)  and [Xilinx instruction](https://www.xilinx.com/developer/articles/using-alveo-data-center-accelerator-cards-in-a-kvm-environment.html)