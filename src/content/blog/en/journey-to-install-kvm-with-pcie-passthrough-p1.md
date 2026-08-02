---
title: 'Setup KVM with PCIe passthrough - part 1: the problem and the pieces'
description: 'Part 1: why an FPGA card has to be handed to a guest in the first place, the host used throughout this series, and the four pieces the setup rests on — KVM, VFIO, IOMMU, and IOMMU groups.'
date: 2023-09-28
lang: en
key: journey-to-install-kvm-with-pcie-passthrough-p1
tags: ['kvm']
series: 'Setup KVM with PCIe passthrough'
seriesOrder: 1
---

## 1. Introduction

A former colleague asked me for access to my Xilinx Alveo AU200 so he could work
on an `XDMA` and `QDMA` project. Handing over the physical machine was not an
option — it holds a lot of my own material. So I went the other way: build a
virtual machine, pass the PCIe card straight through to it, and let him install
drivers and program the FPGA inside the guest, with the hardware client in the
VM talking to a hardware server on the host.

I expected to lose an afternoon to it. It took more than two days — about
eighteen hours. This series retraces those steps in the order they actually
happened, including the dead end in part 4.

## 2. The host

* Motherboard: Z390 Gigabyte Aorus Wifi Pro
* CPU: Core i9 9900K
* RAM: 64 GB DDR4
* SSD: 2 TB
* OS: Ubuntu 20.04, kernel 5.15.06

The motherboard matters more than it looks. A consumer Z390 board is exactly the
kind that does not advertise PCIe ACS, and that is what turns part 4 into a
kernel rebuild.

## 3. KVM

The virtualisation layer I chose is KVM. **KVM (Kernel-based Virtual Machine)**
is built into the Linux kernel itself, which is the property that matters here:
the hypervisor is not a program running beside the kernel, it *is* the kernel
with hardware virtualisation switched on.

That gives it a few practical advantages:

**It inherits the kernel.** Scheduling, memory management, drivers and security
features are the ones Linux already has, rather than a parallel implementation.

**It runs close to the hardware.** Because guests use the host's CPU
virtualisation extensions directly, the overhead is low and the latency is
predictable — the reason it is the right base for passing a real card through.

**It is broad.** Multiple host architectures (x86, ARM and others), and guest
operating systems from Linux to Windows to BSD.

**Resources are yours to allocate.** CPU, RAM and disk are assigned per guest
and adjusted as needed.

**It is free and open source**, with a large community behind it and a
well-worn path into cloud stacks such as OpenStack.

Part 2 covers the installation itself.

## 4. VFIO

For a guest to drive a PCIe card directly, that card has to be taken away from
the host and handed to a framework that can safely expose it. That framework is
VFIO.

**VFIO (Virtual Function I/O)** lets a userspace process — here, QEMU on behalf
of a guest — own a physical device: its registers, its interrupts, and its DMA.
The key points:

**PCIe passthrough.** The guest talks to the real device rather than to an
emulated one. For an FPGA accelerator this is not an optimisation, it is the
whole point: an emulated card cannot be programmed.

**Performance.** No emulation layer in the data path, so the guest sees the
device's real throughput and latency.

**Safety.** VFIO does not simply hand the hardware over. It relies on the IOMMU
to constrain what the device can reach, which is why the next section matters.

## 5. IOMMU

Passthrough only works if the IOMMU is enabled on the host. It is the piece that
makes handing hardware to a guest safe rather than reckless.

**IOMMU (Input-Output Memory Management Unit)** is a hardware block, usually in
the chipset or the CPU, that translates the memory addresses devices use into
real physical addresses.

The comparison worth holding onto: the IOMMU is to devices what the MMU is to
processes. An MMU gives every process its own address space and stops it
reaching into another's memory. The IOMMU does the same for a device — so a card
performing DMA writes into the guest's memory, and *only* the guest's memory,
even though the card is physically wired to the host.

Without it, a device passed to a guest could issue a DMA write anywhere in
system RAM, and a compromised guest would own the host. With it, the mapping is
enforced in hardware.

There is one more concept that decides how much work the rest of this series
takes: the **IOMMU group**. Devices are not isolated one by one but in groups,
and the group is the smallest unit the hardware can guarantee separation for.
Every device in a group must go to the same guest. Part 3 shows the card landing
in the same group as the GPU, and part 4 deals with the consequences.
