---
title: 'Series - Setup KVM with PCIe passthrough - p3'
description: 'Setup VFIO và IOMMU for the host'
date: 2023-09-28
lang: vi
key: journey-to-install-kvm-with-pcie-passthrough-p3
tags: ['kvm']
series: 'Setup KVM with PCIe passthrough'
seriesOrder: 3
---

## 1. What is IOMMU?

IOMMU stands for Input-Output Memory Management Unit. It is a hardware component in a computer system, typically integrated into the chipset or CPU, that plays a crucial role in managing memory addressing and data transfers between the CPU and peripheral devices, including those connected via PCIe (Peripheral Component Interconnect Express).

What IOMMU does and why it's important:

**Memory Address Translation:** One of the primary functions of the IOMMU is to translate memory addresses between the CPU and peripheral devices. When a device wants to read from or write to memory, it specifies a memory address. The IOMMU translates this address to ensure that the device can access the correct portion of system memory. This translation is essential for security and protection, as it prevents devices from accessing arbitrary memory locations.

**Memory Isolation:** IOMMU provides memory isolation, which means it can allocate specific regions of memory exclusively to certain devices or virtual machines. This ensures that devices or virtual machines cannot access memory outside their designated regions, enhancing system security and stability.

**PCIe Passthrough:** IOMMU is crucial for PCIe passthrough, a technology that allows a virtual machine to have direct access to a physical PCIe device, such as a graphics card or network adapter. Without IOMMU support, it would be challenging to securely and efficiently share these devices between the host and virtual machines.

**Virtualization:** In virtualized environments, IOMMU enables efficient memory mapping between virtual machines and physical hardware. It allows virtual machines to have their own memory address spaces, reducing overhead and improving performance.

**DMA (Direct Memory Access):** Devices, such as GPUs and network cards, often use DMA to access system memory directly without CPU intervention. IOMMU ensures that DMA operations are properly translated and controlled, preventing unauthorized access to memory.

**Security:** IOMMU enhances system security by preventing devices or malicious software from accessing memory outside their authorized regions. It helps mitigate certain types of attacks that rely on memory manipulation.

**Performance:** While IOMMU adds a layer of address translation, it is designed to do so efficiently, minimizing performance overhead. In fact, for some workloads like GPU passthrough for gaming in virtual machines, IOMMU support can improve performance by providing direct access to the GPU.


## 2. IOMMU and VFIO setup

### a. Enable IOMMU on host

Open the grub configuration file:

```shell
sudo nano /etc/default/grub
```

Add the `amd_iommu=on` or `intel_iommu=on` flags to the `GRUB_CMDLINE_LINUX` variable:

```shell
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on"
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

BOOT_IMAGE=/boot/vmlinuz-5.15.0-acso root=UUID=2006ace4-1a9a-4d7f-aa7c-685cae3abe4c ro quiet intel_iommu=on
```

### b. Assign Xilinx AU200 card to VFIO

Again, open the grub configuration file:

```shell
sudo nano /etc/default/grub
```

Add the `vfio-pci.ids=10ee:5000,10ee:5001` to the `GRUB_CMDLINE_LINUX` variable:

```shell
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on vfio-pci.ids=10ee:5000,10ee:5001"
```

We can identify the pci.ids using the below command.


```shell
$ lspci -nn | grep "Xilinx"

01:00.0 Processing accelerators [1200]: Xilinx Corporation Device [10ee:5000]
01:00.1 Processing accelerators [1200]: Xilinx Corporation Device [10ee:5001]
```

With this command, Xilinx card will be assigned to `vfio-pci`

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

BOOT_IMAGE=/boot/vmlinuz-5.15.0-acso root=UUID=2006ace4-1a9a-4d7f-aa7c-685cae3abe4c ro quiet intel_iommu=on vfio-pci.ids=10ee:5000,10ee:5001
```

Create a new file under `/etc/modprobe.d/vfio.conf` add the below

```shell
options vfio-pci ids=10ee:5000,10ee:5001
```

Update the `initramfs` using the below command and reboot the host.

```shell
sudo update-initramfs -u
```

After the reboot of the host, check Xilinx is configure for Pass-through using the below command.

```bash
lspci -k
```

`Kernel driver in use: vfio-pci` is OK

```
01:00.0 Processing accelerators: Xilinx Corporation Device 5000
    Subsystem: Xilinx Corporation Device 000e
    Kernel driver in use: vfio-pci
    Kernel modules: xclmgmt
01:00.1 Processing accelerators: Xilinx Corporation Device 5001
    Subsystem: Xilinx Corporation Device 000e
    Kernel driver in use: vfio-pci
    Kernel modules: xocl

```

### c. Check IOMMU group

```shell
git clone https://github.com/nguyencanhtrung/kvm-pcie.git
cd kvm-pcie
sudo chmod +x iommu_viewer.sh
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

Now, you can see the Xilinx card is in the same IOMMU group `Group 1` with NVIDIA GPU. Passing through Xilinx card to KVM requires all devices in the same group use the same `vfio-pci`. However, I donot want to virtualize GPU since I want to keep it for host. Therefore, splitting IOMMU is require in this case. The next part will show how to do so. 

## 3. References

To understand about IOMMU group more please watch [this video](https://www.youtube.com/watch?v=qQiMMeVNw-o) and visit [URL](https://medium0.com/techbeatly/virtual-machine-with-gpu-enabled-on-ubuntu-using-kvm-on-ubuntu-22-4-f0354ba74b1)