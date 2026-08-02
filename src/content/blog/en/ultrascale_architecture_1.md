---
title: 'UltraScale architecture - part 1: CLB resources'
description: 'What changed in the UltraScale CLB compared to the 7 series: the slice boundary is gone, the carry chain doubled to 8 bits, and every flip-flop output reaches the router — plus what 8-flip-flop granularity really means for control sets and packing.'
date: 2023-03-31
lang: en
key: ultrascale_architecture_1
tags: ['xilinx']
---

## 1. CLB layout

### 1.1 What changed from the 7 series?

- **The slice boundary is gone.** In the 7 series a CLB contained two
  independent slices. UltraScale removes that wall and adds a mux across it, so
  a single logic function can span what used to be two separate slices. Wider
  functions now fit without paying a routing hop.
- **The carry chain doubled**, from 4 bits to 8 bits per CLB. Adders and
  counters climb the chain in half as many steps.
- **Every flip-flop output is always available** to the routing fabric. In the
  7 series some flip-flop outputs were reachable only through a shared path,
  which forced the packer to leave registers unused. Removing that restriction
  is what lets the tools pack more tightly.

![](/images/blog/ultrascale_architecture_1/1.png)

The comparison between the 7 series and UltraScale architecture is shown here:

![](/images/blog/ultrascale_architecture_1/2.png)

### 1.2 A CLB has 16 flip-flops, so why talk about 8-flip-flop granularity?

The two numbers count different things. Sixteen is how many flip-flops the CLB
*contains*; eight is the size of the group that has to **share control
signals**.

A flip-flop does not stand alone. It comes with a clock, a clock enable, and a
set/reset — and those control lines are not routed per flip-flop, they are
routed per group. In the UltraScale CLB the 16 flip-flops are organised as two
groups of 8, and within one group every flip-flop sees the same clock enable
and the same set/reset. The clock is shared across the whole CLB.

The practical consequence shows up at packing time. Two registers can only sit
in the same group of 8 if they agree on their control set:

- same clock,
- same clock enable (or none),
- same reset signal, same polarity, and same synchronous/asynchronous flavour.

If your design uses many distinct control sets — a different enable per small
register bank, say — each set claims its own group of 8, and a CLB that holds
16 flip-flops may end up holding only two or three useful ones. The device
report will show high CLB usage with low flip-flop usage, which is the
signature of control-set fragmentation.

That is why "8 flip-flop granularity" is a *placement* statement rather than a
capacity one: registers are allocated eight at a time, because eight is the
number that must move together.

### 1.3 What to do about it

- Keep the number of distinct clock-enable and reset signals small. One enable
  driving a wide bank beats eight enables driving narrow ones.
- Prefer synchronous reset, and only reset what genuinely needs it. A register
  that is written every cycle before it is read does not need a reset at all,
  and leaving it out lets the packer group it freely.
- Check `report_control_sets` in Vivado when CLB usage looks disproportionate
  to flip-flop count. It lists the control sets and how many flip-flops each
  one holds; the ones holding a handful are the ones costing you area.
