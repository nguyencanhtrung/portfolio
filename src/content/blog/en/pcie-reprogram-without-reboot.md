---
title: 'PCIe - Re-programing FPGA without reboot'
description: 'Reprogramming an FPGA over JTAG without rebooting the host. When a PCIe remove-and-rescan is enough, when a dropped link forces a hot reset from the upstream bridge, and why function-level reset rarely helps.'
date: 2022-09-29
lang: en
key: pcie-reprogram-without-reboot
tags: ['pcie']
---

## 1. Rescan

The cheapest thing to try first. Linux lets you remove a device from its bus
and then re-enumerate it, which is enough **only** when the FPGA still holds a
working PCIe endpoint across the reprogramming:

```bash
# remove the endpoint, reprogram the FPGA, then bring it back
echo 1 | sudo tee /sys/bus/pci/devices/0000:01:00.0/remove
# ... program the device over JTAG here ...
echo 1 | sudo tee /sys/bus/pci/rescan
```

Two conditions decide whether this works:

- **The link must stay up.** If reconfiguration drops the PCIe link, the root
  port logs the surprise-down and a rescan finds nothing. Devices that keep the
  hard PCIe block in a separate reconfiguration region — Xilinx partial
  reconfiguration, Intel's PR regions — survive this; a full-chip reprogram
  usually does not.
- **The driver must be unloaded first.** A driver still bound to the device
  holds references to BARs that are about to disappear, and the removal either
  hangs or takes the kernel down with it.

When the link does drop, a rescan cannot help and the next step is a hot reset.


## 2. Hot reset

Resets in PCI express are a bit complex. There are two main types of resets - conventional reset, and function-level reset. There are also two types of conventional resets, fundamental resets and non-fundamental resets. See the PCI express specification for all of the details.

A 'cold reset' is a fundamental reset that takes place after power is applied to a PCIe device. There appears to be no standard way of triggering a cold reset, save for turning the system off and back on again. On my machines, the `/sys/bus/pci/slots` directory is empty.

A 'warm reset' is a fundamental reset that is triggered without disconnecting power from the device. There appears to be no standard way of triggering a warm reset.

A 'hot reset' is a conventional reset that is triggered across a PCI express link. A hot reset is triggered either when a link is forced into electrical idle or by sending TS1 and TS2 ordered sets with the hot reset bit set. Software can initiate a hot reset by setting and then clearing the secondary bus reset bit in the bridge control register in the PCI configuration space of the bridge port upstream of the device.

A 'function-level reset' (FLR) is a reset that affects only a single function of a PCI express device. It must not reset the entire PCIe device. Implementing function-level resets is not required by the PCIe specification. A function-level reset is initiated by setting the initiate function-level reset bit in the function's device control register in the PCI express capability structure in the PCI configuration space.

Linux exposes the function-level reset functionality in the form of `/sys/bus/pci/devices/$dev/reset`. Writing a 1 to this file will initiate a function-level reset on the corresponding function. Note that this only affects that specific function of the device, not the whole device, and devices are not required to implement function-level resets as per the PCIe specification.

I am not aware of any 'nice' method for triggering a hot reset (there is no sysfs entry for that). However, it is possible to use setpci to do so:

```bash
#!/bin/bash
dev=$1

if [ -z "$dev" ]; then
    echo "Error: no device specified"
    exit 1
fi

if [ ! -e "/sys/bus/pci/devices/$dev" ]; then
    dev="0000:$dev"
fi

if [ ! -e "/sys/bus/pci/devices/$dev" ]; then
    echo "Error: device $dev not found"
    exit 1
fi

port=$(basename $(dirname $(readlink "/sys/bus/pci/devices/$dev")))

if [ ! -e "/sys/bus/pci/devices/$port" ]; then
    echo "Error: device $port not found"
    exit 1
fi

echo "Removing $dev..."

echo 1 > "/sys/bus/pci/devices/$dev/remove"

echo "Performing hot reset of port $port..."

bc=$(setpci -s $port BRIDGE_CONTROL)

echo "Bridge control:" $bc

setpci -s $port BRIDGE_CONTROL=$(printf "%04x" $(("0x$bc" | 0x40)))
sleep 0.01
setpci -s $port BRIDGE_CONTROL=$bc
sleep 0.5

echo "Rescanning bus..."

echo 1 > "/sys/bus/pci/devices/$port/rescan"
```

Ensure that all attached drivers are unloaded before running this script. This script will attempt to remove the PCIe device, then command the upstream switch port to issue a hot reset, then attempt to rescan the PCIe bus. This script has also only been tested on devices with a single function, so it may need some reworking for devices with multiple functions.

References  ( <a href="https://unix.stackexchange.com/questions/73908/how-to-reset-cycle-power-to-a-pcie-device/474378#474378"> Link </a> )

***

## 3. Conclusion

Reprogramming an FPGA without rebooting the host comes down to how far the
disturbance travels:

- If the hard PCIe block survives the reprogram, **remove plus rescan** is
  enough, and it is the only method that needs no special privileges beyond
  root.
- If the link goes down, the endpoint has to be re-trained, and that means a
  **hot reset issued by the upstream bridge** — the `setpci` script above.
  Unload the drivers first, and expect to redo it for each function on a
  multi-function device.
- A **function-level reset** via `/sys/.../reset` looks convenient but only
  resets one function, is optional in the specification, and does nothing about
  a link that has already dropped.

There is no portable way to trigger a cold or warm reset from software, so the
power switch remains the last resort. In practice the reliable setup is to put
the PCIe block in a region that reconfiguration does not touch — then the whole
problem reduces to a rescan.

