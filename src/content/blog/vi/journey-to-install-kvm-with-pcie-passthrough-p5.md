---
title: 'Series - Setup KVM with PCIe passthrough - p5'
description: 'Phần 5: gắn card PCIe vào máy ảo. Xác định thiết bị, tách khỏi host, chuyển địa chỉ domain/bus/slot/function sang hex và khai báo hostdev trong file XML của máy ảo.'
date: 2023-09-28
lang: vi
key: journey-to-install-kvm-with-pcie-passthrough-p5
tags: ['kvm']
series: 'Setup KVM with PCIe passthrough'
seriesOrder: 5
---

There are 2 ways to attach or detach PCIe devices to/from KVM which are

* GUI method
* Commandline method


GUI and commandline method are described [here](https://documentation.suse.com/smart/virtualization-cloud/html/task-assign-pci-device-libvirt/index.html).

## 1. Command line method to assign PCIe device to VM Guest

### 1.1 Identify the host PCI device to assign to the VM Guest

```bash
lspci -nn | grep "Xilinx"

```

The output is

```console
tesla@tesla:~/kvm$ sudo lspci -nn | grep "Xilinx"
01:00.0 Processing accelerators [1200]: Xilinx Corporation Device [10ee:5000]
01:00.1 Processing accelerators [1200]: Xilinx Corporation Device [10ee:5001]
```

Xilinx has 2 IDs: (`01:00.0`  and `01:00.1`)

### 1.2 Gather detailed information about the device


```console
$ virsh nodedev-dumpxml pci_0000_01_00_0

<device>
  <name>pci_0000_01_00_0</name>
  <path>/sys/devices/pci0000:00/0000:00:01.0/0000:01:00.0</path>
  <parent>pci_0000_00_01_0</parent>
  <driver>
    <name>vfio-pci</name>
  </driver>
  <capability type='pci'>
    <class>0x120000</class>
    <domain>0</domain>
    <bus>1</bus>
    <slot>0</slot>
    <function>0</function>
    <product id='0x5000'/>
    <vendor id='0x10ee'>Xilinx Corporation</vendor>
    <iommuGroup number='12'>
      <address domain='0x0000' bus='0x01' slot='0x00' function='0x0'/>
    </iommuGroup>
    <pci-express>
      <link validity='cap' port='0' speed='8' width='16'/>
      <link validity='sta' speed='8' width='8'/>
    </pci-express>
  </capability>
</device>

```


and, do the same with the other

```console
$ virsh nodedev-dumpxml pci_0000_01_00_1
```

Write down the values for domain, bus, slot and function.

### 1.3 Detach the device from the host system

```bash
virsh nodedev-detach pci_0000_01_00_0
```

**Tip: Multi-function PCI devices**

When using a multi-function PCI device that does not support FLR (function level reset) or PM (power management) reset, you need to detach all its functions from the VM Host Server. The whole device must be reset for security reasons. libvirt will refuse to assign the device if one of its functions is still in use by the VM Host Server or another VM Guest.

**Note:**

Trong trường hợp của ta, `detach` or `reattach` không có ý nghĩa, vì ta đã cố định card FPGA với `VFIO` ở GRUB. Tôi sẽ thử bỏ command đó đi và chạy theo flow này xem ntn. Vì với flow này có thể sử dụng card FPGA ở cả host lẫn VM.

### 1.4 Convert the domain, bus, slot and function from dec to hex

```bash
printf "<address domain='0x%x' bus='0x%x' slot='0x%x' function='0x%x'/>\n" 0 1 0 0
printf "<address domain='0x%x' bus='0x%x' slot='0x%x' function='0x%x'/>\n" 0 1 0 1
```

Output:

```console
tesla@tesla:~/kvm$ printf "<address domain='0x%x' bus='0x%x' slot='0x%x' function='0x%x'/>\n" 0 1 0 0
<address domain='0x0' bus='0x1' slot='0x0' function='0x0'/>
tesla@tesla:~/kvm$ printf "<address domain='0x%x' bus='0x%x' slot='0x%x' function='0x%x'/>\n" 0 1 0 1
<address domain='0x0' bus='0x1' slot='0x0' function='0x1'/>

```

### 1.5 Run `virsh edit`

```bash
virsh edit ukvm2004
```

Add the following device entry in the <devices> section using the result from the previous step:

```xml
<hostdev mode='subsystem' type='pci' managed='yes'>
  <source>
    <address domain='0x0' bus='0x1' slot='0x0' function='0x0'/>
  </source>
</hostdev>
```

and,

```xml
<hostdev mode='subsystem' type='pci' managed='yes'>
  <source>
    <address domain='0x0' bus='0x1' slot='0x0' function='0x1'/>
  </source>
</hostdev>
```

Then, start the VM

```bash
virsh start ukvm2004
```


**Notes:**

managed compared to unmanaged

libvirt recognizes two modes for handling PCI devices: managed or unmanaged.

If the device is managed, libvirt handles all of the details of adding or removing the device. Before starting the domain, libvirt unbinds the device from the existing driver if needed, resets the device, and binds it to vfio-pci. When the domain is terminated or the device is removed from the domain, libvirt unbinds the device from vfio-pci and rebinds it to the original driver.

If the device is unmanaged, you must manually manage these tasks before assigning the device to a domain, and after the device is no longer used by the domain.

In the example above, the managed='yes' option means that the device is managed. To switch the device mode to unmanaged, set managed='no'. If you do so, you need to take care of the related driver with the virsh nodedev-detach and virsh nodedev-reattach commands. Prior to starting the VM Guest you need to detach the device from the host by running

```bash
virsh nodedev-detach pci_0000_01_00_0
```

When the VM Guest is not running, you can make the device available for the host by running

```bash
virsh nodedev-reattach pci_0000_01_00_0
```

Sẽ test flow này sau ... Nếu có thể flexible attach với VM và Host thì ngon quá.


## 2. Another way to attach PCIe devices

Create a file named `pass-user.xml` and pasting the following content


```xml
<hostdev mode="subsystem" type="pci" managed="yes">
  <source>
    <address domain="0x0000" bus="0x01" slot="0x00" function="0x1"/>
  </source>
  <address type="pci" domain="0x0000" bus="0x07" slot="0x00" function="0x0"/>
</hostdev>

```

Create a file named `pass-mgmt.xml` and pasting the following content

```xml
<hostdev mode="subsystem" type="pci" managed="yes">
  <source>
    <address domain="0x0000" bus="0x01" slot="0x00" function="0x0"/>
  </source>
  <address type="pci" domain="0x0000" bus="0x06" slot="0x00" function="0x0"/>
</hostdev>
```

`<address domain ..>`: address of PCIe device in the HOST

`<address type ..>`: address of PCIe device in the KVM (optional)


Attach or detach must be processed when VM is destroyed.

```shell
 virsh attach-device ukvm2004 --file pass-user.xml --config
 virsh attach-device ukvm2004 --file pass-mgmt.xml --config
```


```shell
 virsh detach-device ukvm2004 --file pass-user.xml --config
 virsh detach-device ukvm2004 --file pass-mgmt.xml --config
```

Then, starting the VM

```shell
virsh start ukvm2004
```

Now you can see the PCIe card is available in your VM with the following command

```bash
lspci -nn
```


## 3. References

Visit [the instruction](https://documentation.suse.com/smart/virtualization-cloud/html/task-assign-pci-device-libvirt/index.html) and [Xilinx instruction](https://www.xilinx.com/developer/articles/using-alveo-data-center-accelerator-cards-in-a-kvm-environment.html)