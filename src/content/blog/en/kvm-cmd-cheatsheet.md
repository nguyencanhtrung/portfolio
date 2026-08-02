---
title: 'KVM commands cheatsheet'
description: 'A copy-paste set of virsh and virt-install commands, in the order you need them: confirm KVM acceleration, point virsh at the system daemon, set up NAT and bridged networking, define a storage pool, then create, start and delete a guest.'
date: 2023-09-29
lang: en
key: kvm-cmd-cheatsheet
tags: ['kvm']
---

A working set of `virsh` and `virt-install` commands for running KVM guests on
Ubuntu, in the order you actually need them: confirm the host can accelerate,
point the client at the system daemon, get networking and storage in place, then
create and drive a VM. Every block below is copy-paste ready.

## 1. Check the host can run KVM
```shell
sudo kvm-ok
```

The output should look like this:

```shell
tesla@tesla:~/kvm$ kvm-ok
INFO: /dev/kvm exists
KVM acceleration can be used
```


## 2. Point virsh at the system daemon

Without this, `virsh` talks to a per-user session daemon and cannot see the
VMs that were created with `sudo`.

```shell
# use same connection and objects as sudo
export LIBVIRT_DEFAULT_URI=qemu:///system
```


## 3. Networking

The default NAT network lives on `virbr0`. A bridged network gives guests an
address on the physical LAN instead.

```shell
ip addr show virbr0
```


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


### 3.1 IP forwarding

```shell
# this needs to be "1"
cat /proc/sys/net/ipv4/ip_forward
# if not, then add it
echo net.ipv4.ip_forward=1 | sudo tee -a /etc/sysctl.conf

# make permanent
sudo sysctl -p /etc/sysctl.conf
```


## 4. Storage pools

A pool is just a directory libvirt is allowed to write disk images into.

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


## 5. Fix ownership after running virsh as root

```shell
# chown is only necessary if virsh was run previously as sudo
ls -l ~/.virtinst
sudo chown -R $USER:$USER ~/.virtinst

# list VMs
virsh list --all
```

## 6. Installing `ukvm2004` VM

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

## 7. Start the VM

```shell
virsh start ukvm2004
```

## 8. View the running VM

```shell
virt-viewer ukvm2004
```

## 9. Close the VM

```shell
virsh destroy ukvm2004
```

## 10. Delete the VM

```shell
virsh undefine ukvm2004
```