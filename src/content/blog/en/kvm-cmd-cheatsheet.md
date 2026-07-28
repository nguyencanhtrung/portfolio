---
title: 'KVM commands cheatsheet'
description: 'All commands for KVM'
date: 2023-09-29
lang: en
key: kvm-cmd-cheatsheet
tags: ['kvm']
---

```shell
sudo kvm-ok
```

The output should look like this:

```shell
tesla@tesla:~/kvm$ kvm-ok
INFO: /dev/kvm exists
KVM acceleration can be used
```


```shell
# use same connection and objects as sudo
export LIBVIRT_DEFAULT_URI=qemu:///system
```


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


```shell
# this needs to be "1"
cat /proc/sys/net/ipv4/ip_forward
# if not, then add it
echo net.ipv4.ip_forward=1 | sudo tee -a /etc/sysctl.conf

# make permanent
sudo sysctl -p /etc/sysctl.conf
```


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


```shell
# chown is only necessary if virsh was run previously as sudo
ls -l ~/.virtinst
sudo chown -R $USER:$USER ~/.virtinst

# list VMs
virsh list --all
```

### Installing `ukvm2004` VM

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

### Start the VM

```shell
virsh start ukvm2004
```

### View the running VM

```shell
virt-viewer ukvm2004
```

### Close the VM

```shell
virsh destroy ukvm2004
```

### Delete the VM

```shell
virsh undefine ukvm2004
```