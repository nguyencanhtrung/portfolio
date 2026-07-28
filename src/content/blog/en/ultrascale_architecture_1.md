---
title: 'Ultrascale Architecture - part 1'
description: 'CLB resources'
date: 2023-03-31
lang: en
key: ultrascale_architecture_1
tags: ['xilinx']
---
## CLB layout

### What are differences of Ultrascale CLB?

* Removed slice boundaries: In the 7 series architecture, 1 CLB includes 2 slices which are independent. But in the new architecture, this boundary is removed with a new mux as shown in the following picture. Then, it allows wider functions.
* Carry chain is expaned from 4 bits to 8 bits per CLB.
* All flip-flop outputs are always available in the Ultrascale architecture for enhanced packing and routing.
    * Have 8 FFs granularity 

![](/images/blog/ultrascale_architecture_1/1.png)


The comparison between 7 series and Ultrascale architecture is shown here:

![](/images/blog/ultrascale_architecture_1/2.png)

One CLB has 16 FFs why said 8 FFs granularity?
