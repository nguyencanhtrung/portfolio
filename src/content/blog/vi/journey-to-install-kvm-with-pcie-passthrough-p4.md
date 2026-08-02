---
title: 'Series - Setup KVM with PCIe passthrough - p4'
description: 'Guide to split IOMMU group. In case your MOBO does not support ACS feature, patching the kernel is required.'
date: 2023-09-28
lang: vi
key: journey-to-install-kvm-with-pcie-passthrough-p4
tags: ['kvm']
---
## A. Splitting IOMMU group

### 1. PCIe ACS override

PCIe ACS (Access Control Services) Override is a feature in Linux-based systems and server systems that use PCIe (Peripheral Component Interconnect Express) ports. This feature allows you to override or modify the configuration of the ACS protocol within the PCIe system. ACS is part of the PCIe standard and plays a role in controlling access to PCIe devices, especially when using PCIe passthrough in virtualization.

Specifically, the PCIe ACS Override feature allows you to:

**Override:** Modify the ACS configuration to eliminate or modify access constraints between PCIe devices. This can be useful when you want to share PCIe devices among virtual machines or different Linux systems and need to disable or adjust ACS constraints.

**Configuration Management:** Adjust how the system manages access to PCIe devices. You can specify access rights for virtual machines or physical devices to specific PCIe devices.

**Customization:** PCIe ACS Override enables you to customize the ACS configuration based on your specific needs, especially when using PCIe passthrough in a virtualized environment.

Please note that using PCIe ACS Override should be done carefully and following the specific guidelines of your system and virtualization management software, such as KVM/QEMU or VMware. Adjusting the ACS configuration can affect the stability and security of the PCIe system, so it should be performed knowledgeably, taking into account its impact on the system.

### 2. Enable PCIe ACS override

Open the grub configuration file:

```shell
sudo nano /etc/default/grub
```

Add the `pcie_acs_override=downstream,multifunction` flags to the `GRUB_CMDLINE_LINUX` variable:

```shell
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on pcie_acs_override=downstream,multifunction vfio-pci.ids=10ee:5000,10ee:5001"
```

Update grub:

```shell
sudo update-grub
```

or

```shell
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

Check the new content of Grub by

```shell
cat /proc/cmdline

BOOT_IMAGE=/boot/vmlinuz-5.15.0-acso root=UUID=2006ace4-1a9a-4d7f-aa7c-685cae3abe4c ro quiet intel_iommu=on pcie_acs_override=downstream,multifunction vfio-pci.ids=10ee:5000,10ee:5001
```

Then, reboot the host.

```shell
sudo reboot now
```

After rebooting, re-check IOMMU group:

```shell
./iommu_viewer.sh
```


```
...
Group:  1   0000:00:01.0 PCI bridge [0604]: Intel Corporation Xeon E3-1200 v5/E3-1500 v5/6th Gen Core Processor PCIe Controller (x16) [8086:1901] (rev 0a)   Driver: pcieport
Group:  1   0000:00:01.1 PCI bridge [0604]: Intel Corporation Xeon E3-1200 v5/E3-1500 v5/6th Gen Core Processor PCIe Controller (x8) [8086:1905] (rev 0a)   Driver: pcieport
Group:  1   0000:01:00.0 Processing accelerators [1200]: Xilinx Corporation Device [10ee:5000]   Driver: vfio-pci
Group:  1   0000:01:00.1 Processing accelerators [1200]: Xilinx Corporation Device [10ee:5001]   Driver: vfio-pci
Group:  1   0000:02:00.0 VGA compatible controller [0300]: NVIDIA Corporation Device [10de:2489] (rev a1)   Driver: nvidia
Group:  1   0000:02:00.1 Audio device [0403]: NVIDIA Corporation Device [10de:228b] (rev a1)   Driver: snd_hda_intel
Group:  2   0000:00:02.0 Display controller [0380]: Intel Corporation UHD Graphics 630 (Desktop 9 Series) [8086:3e98]   Driver: i915
Group:  3   0000:00:12.0 Signal processing controller [1180]: Intel Corporation Cannon Lake PCH Thermal Controller [8086:a379] (rev 10)   Driver: intel_pch_thermal
Group:  4   0000:00:14.0 USB controller [0c03]: Intel Corporation Cannon Lake PCH USB 3.1 xHCI Host Controller [8086:a36d] (rev 10)   Driver: xhci_hcd
...
```

Unfortunately, it DID NOT work since my machine which includes a MOBO (Z390 Gigabyte Wifi Pro + CPU 9900K) does not support `pcie_acs_override`. 

The last solution would be rebuild the host's kernel that patched ACS feature and use that kernel instead. Luckily, I found a way to do so.

## B. Build patched ACS kernel

### 1. Download ACS patch and original kernel to build

On the host machine, 

```shell
sudo apt update && sudo apt upgrade
sudo reboot now
sudo apt install build-essential libncurses5-dev fakeroot xz-utils libelf-dev liblz4-tool unzip flex bison bc debhelper rsync libssl-dev:native 
mkdir ~/kernel
cd ~/kernel
wget https://github.com/nguyencanhtrung/kvm-pcie/blob/main/acso.patch
wget https://github.com/torvalds/linux/archive/refs/tags/v5.15.zip
unzip v5.15.zip
```

### 2. Editing config file to avoid building error


```shell
cd linux-5.15
sudo find /boot/ \( -iname "*config*" -a -iname "*`uname -r`*" \) -exec cp -i -t ./ {} \;
mv *`uname -r`* .config
ls /boot | grep config
sudo nano .config
```

Use `Ctrl+w` to search for `CONFIG_SYSTEM_TRUSTED_KEYS` on nano and comment out the line like:
`#CONFIG_SYSTEM_TRUSTED_KEYS`
`Ctrl+x` to Save & Exit


### 3. Apply patches ACS

```shell
patch -p1 < ../acso.patch
```

Output should be something like this:


```shell
patching file Documentation/admin-guide/kernel-parameters.txt
Hunk #1 succeeded at 3892 (offset 383 lines).
patching file drivers/pci/quirks.c
Hunk #1 succeeded at 3515 with fuzz 2 (offset -29 lines).
Hunk #2 succeeded at 5049 with fuzz 1 (offset 153 lines).
```

This shows a successful patch that required a fuzz (slight offset change) because the patch was made for an earlier kernel version. As long as there isn't an error this should be okay.
Run the following command to build the kernel:

### 4. Build patched kernel

```shell
sudo make -j `getconf _NPROCESSORS_ONLN` bindeb-pkg LOCALVERSION=-acso KDEB_PKGVERSION=$(make kernelversion)-1
```

Press Enter for all prompts.

**Note:** If you get a build failure remove the "-j `getconf _NPROCESSORS_ONLN`"" part from the make line and run it again to see the error with more detail and fix it.


### 5. Install the patched kernel

When you get a successful build run the following to install the kernel:

```shell
ls ../linux-*.deb
sudo dpkg -i ../linux-*.deb
```

```shell
sudo -i
echo "vfio" >> /etc/modules
echo "vfio_iommu_type1" >> /etc/modules
echo "vfio_pci" >> /etc/modules
echo "kvm" >> /etc/modules
echo "kvm_intel" >> /etc/modules
```

```shell
update-initramfs -u
reboot
```

When the system rebooting, hold `SHIFT` to entering the patched kernel  `Advanced Ubuntu` > `5.15.0-acso`

### 6. In case booting hang (optional)

Reboot the system hold `SHIFT` to entering the patched kernel  `Advanced Ubuntu` > `5.15.0-acso`

Press `e` to edit the grub

Appending `nomodeset` in the command line (watch video in the following reference to know the detail)

```
linux     /boot/vmlinuz ....    .... downstream nomodeset ...
```

Then press `F10` to save and reload.


After rebooting, let's check IOMMU group now

```shell
tesla@tesla:~/kvm$ ./iommu_viewer.sh 
Please be patient. This may take a couple seconds.
Group:  0   0000:00:00.0 Host bridge [0600]: Intel Corporation 8th Gen Core 8-core Desktop Processor Host Bridge/DRAM Registers [Coffee Lake S] [8086:3e30] (rev 0a)   Driver: skl_uncore
Group:  1   0000:00:01.0 PCI bridge [0604]: Intel Corporation Xeon E3-1200 v5/E3-1500 v5/6th Gen Core Processor PCIe Controller (x16) [8086:1901] (rev 0a)   Driver: pcieport
Group:  2   0000:00:01.1 PCI bridge [0604]: Intel Corporation Xeon E3-1200 v5/E3-1500 v5/6th Gen Core Processor PCIe Controller (x8) [8086:1905] (rev 0a)   Driver: pcieport
Group:  3   0000:00:12.0 Signal processing controller [1180]: Intel Corporation Cannon Lake PCH Thermal Controller [8086:a379] (rev 10)   Driver: intel_pch_thermal
Group:  4   0000:00:14.0 USB controller [0c03]: Intel Corporation Cannon Lake PCH USB 3.1 xHCI Host Controller [8086:a36d] (rev 10)   Driver: xhci_hcd
Group:  4   0000:00:14.2 RAM memory [0500]: Intel Corporation Cannon Lake PCH Shared SRAM [8086:a36f] (rev 10)
Group:  5   0000:00:14.3 Network controller [0280]: Intel Corporation Wireless-AC 9560 [Jefferson Peak] [8086:a370] (rev 10)   Driver: iwlwifi
Group:  6   0000:00:16.0 Communication controller [0780]: Intel Corporation Cannon Lake PCH HECI Controller [8086:a360] (rev 10)   Driver: mei_me
Group:  7   0000:00:17.0 SATA controller [0106]: Intel Corporation Cannon Lake PCH SATA AHCI Controller [8086:a352] (rev 10)   Driver: ahci
Group:  8   0000:00:1b.0 PCI bridge [0604]: Intel Corporation Cannon Lake PCH PCI Express Root Port #17 [8086:a340] (rev f0)   Driver: pcieport
Group:  9   0000:00:1c.0 PCI bridge [0604]: Intel Corporation Cannon Lake PCH PCI Express Root Port #1 [8086:a338] (rev f0)   Driver: pcieport
Group:  10  0000:00:1d.0 PCI bridge [0604]: Intel Corporation Cannon Lake PCH PCI Express Root Port #9 [8086:a330] (rev f0)   Driver: pcieport
Group:  11  0000:00:1f.0 ISA bridge [0601]: Intel Corporation Z390 Chipset LPC/eSPI Controller [8086:a305] (rev 10)
Group:  11  0000:00:1f.3 Audio device [0403]: Intel Corporation Cannon Lake PCH cAVS [8086:a348] (rev 10)   Driver: snd_hda_intel
Group:  11  0000:00:1f.4 SMBus [0c05]: Intel Corporation Cannon Lake PCH SMBus Controller [8086:a323] (rev 10)   Driver: i801_smbus
Group:  11  0000:00:1f.5 Serial bus controller [0c80]: Intel Corporation Cannon Lake PCH SPI Controller [8086:a324] (rev 10)
Group:  11  0000:00:1f.6 Ethernet controller [0200]: Intel Corporation Ethernet Connection (7) I219-V [8086:15bc] (rev 10)   Driver: e1000e
Group:  12  0000:01:00.0 Processing accelerators [1200]: Xilinx Corporation Device [10ee:5000]   Driver: vfio-pci
Group:  13  0000:01:00.1 Processing accelerators [1200]: Xilinx Corporation Device [10ee:5001]   Driver: vfio-pci
Group:  14  0000:02:00.0 VGA compatible controller [0300]: NVIDIA Corporation Device [10de:2489] (rev a1)   Driver: nvidia
Group:  15  0000:02:00.1 Audio device [0403]: NVIDIA Corporation Device [10de:228b] (rev a1)   Driver: snd_hda_intel
Group:  16  0000:03:00.0 Non-Volatile memory controller [0108]: Samsung Electronics Co Ltd NVMe SSD Controller SM981/PM981/PM983 [144d:a808]   Driver: nvme
Group:  17  0000:05:00.0 Non-Volatile memory controller [0108]: Samsung Electronics Co Ltd NVMe SSD Controller SM981/PM981/PM983 [144d:a808]   Driver: nvme
```

Now, Xilinx card and Nvidia card are in different IOMMU groups

### 7. Change Grub to auto boot to patched kernel

```shell
sudo nano /etc/default/grub
```

Change

```shell
GRUB_DEFAULT="1>4"

```

Then,

```bash
sudo update-grub
reboot
```

**Note:** The index `1` or `4` is counted based on the order in the menu (after rebooting, hold `SHIFT`).

```
Ubuntu              (index = 0)
Advanced Ubuntu     (index = 1)
    ubuntu-kernel-xxx           (index = 0)
    ubuntu-kernel-xxx-recovery  (index = 1)
    ubuntu-kernel-xxx           (index = 2)
    ubuntu-kernel-xxx-recovery  (index = 3)
    ubuntu-kernel-xxx           (index = 4)
...
```

## C. References

Visit [video](https://www.youtube.com/watch?v=JBEzshbGPhQ)

[Patched ACS](https://queuecumber.gitlab.io/linux-acs-override/)

[Original script - scroll to the end of page](https://gitlab.com/Queuecumber/linux-acs-override/-/issues/12)

[Repo](https://github.com/benbaker76/linux-acs-override)
