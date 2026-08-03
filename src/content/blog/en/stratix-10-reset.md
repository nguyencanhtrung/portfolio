---
title: 'Stratix 10 - Reset release IP'
description: 'Stratix 10 and Agilex configure sector by sector, so parts of your design leave reset before their neighbours do. Why that puts a state machine into an illegal state, and how the Reset Release IP with INIT_DONE fixes it.'
date: 2022-10-01
lang: en
key: stratix-10-reset
tags: ['intel']
---

## 1. Introduction

Intel Stratix 10 and Intel Agilex fpga are configured through <b>Secure Device Manager </b> (SDM). SDM is a microprocessor block that provides a robust, secure and fully authenticated configuration scheme. The SDM sends configuration data to each sector in the FPGA where there is a microprocessor for each sector that minimally helps with the configuration of its respective sector.

![](/images/blog/stratix-10-reset/1.png)
![](/images/blog/stratix-10-reset/2.png)

The configuration of sectors is done in a <b>pseudo-serial fashion</b>. Each sector starts its configuration <b>asynchronously</b> to each other which results in different areas of the sector entering into user mode before the entire sector has been fully configured. 

This creates a condition where the intended intitial state of the design becomes more a transitory state since a portion of the sector is operational before the entire sector configured.

Lets examine the following examples:

We have a design which has following state machine:
![](/images/blog/stratix-10-reset/3.png)
![](/images/blog/stratix-10-reset/4.png)

On this state machine, design depends on registers entering an initial state. Without an adequate reset, the state machine begins operating when part of the device is active, while nearby logic included in the state machine remains frozen.

Register B is in active mode and changes its state after 1 clock cycle, while the other is still in frozen state. When whole fabric enters user mode, the system enters illegal or unknown state.

Hence, the Intel reset release IP will prevent entering illegal state by holding the fpga in reset state until entire fabric enters user mode.

![](/images/blog/stratix-10-reset/7.png)

![](/images/blog/stratix-10-reset/5.png)

The Reset Release Intel® FPGA IP is available in the Intel® Quartus® Prime Software. This IP consists of a single output signal, `nINIT_DONE`. 

The `nINIT_DONE` signal is the core version of the `INIT_DONE` pin and has the same function in both FPGA First and HPS First configuration modes. 

Intel recommends that you hold your design in reset while the `nINIT_DONE` signal is <b>high</b> or while the `INIT_DONE` pin is <b>low</b>. When you instantiate the Reset Release IP in your design, the SDM drives the nINIT_DONE signal. 

Consequently, the IP does not consume any FPGA fabric resources, but does require routing resources.

## 2. Proposed architecture for safe reset

![](/images/blog/stratix-10-reset/8.png)

People normally use the `pll_lock` signal to hold the system in reset state until PLL circuit output stable frequency. There are posibilities that duration for PLL to lock shorter than time for fabric entering user mode. 

Hence, the best approach is to get PLL reset input with an `INIT_DONE` from the reset release IP as shown in the figure.

```vhdl

RST_REL: component reset_release 
	port map (
		ninit_done => ninit_done; 	-- reset = HIGH
	);

SYS_PLL : component pll
	port map (
		rst      => ninit_done,     
		refclk   => refclk,   
		locked   => locked,   
		outclk_0 => clk   	
	);

sys_rst 	<= rst_in OR (NOT(locked));

```


<b>Another alternative</b> if you're using the PLL lock in your reset sequence is to gate the PLL lock output with the an `NINIT_DONE` signal from the Reset Release IP.

```vhdl

RST_REL: component reset_release 
	port map (
		ninit_done => ninit_done; 	-- HIGH: not done fabric reset
	);

SYS_PLL : component pll
	port map (
		rst      => rst,      
		refclk   => refclk,  
		locked   => locked,   
		outclk_0 => clk   		
	);
	
sys_rst 	<= locked AND (NOT(ninit_done));

```

![](/images/blog/stratix-10-reset/9.png)

Note that `sys_rst <= locked AND (NOT(ninit_done))` is not strictly what the
truth table asks for — that would be
`sys_rst <= ninit_done OR (NOT(locked))`. Two things make the simpler form safe
in practice:

* During power-up, the PLL reaches `locked` before the whole fabric has finished
  entering user mode. So `ninit_done` is the later of the two, and it dominates.
* Once running, `sys_rst` only follows `rst_in` to reset user logic, which means
  it only depends on `locked`.

In other words the fourth row of the truth table never occurs on real hardware,
so `sys_rst <= locked AND (NOT(ninit_done))` is a valid way to drive `sys_rst`.

## 3. Register initialization during Power-On

Initialization during power-up is described in VHDL

```vhdl

signal s1 	: std_logic_vector(3 downto 0) := b"0001";

```

Or in verilog

```cpp

reg q = 1'b1;

```

When design on Stratix 10 or Agilex device, it is <b>recommend not</b> to rely on initial conditions of the registers as in the snippet code above. We should <b> rely on the reset network to maintain desired initial condition</b>.

To ensure having a proper functioning reset, we must disable power-up initialization, so that the simulation can verify the reset network behaviour. Opening assignments menu in the intel quartus prime pro:

`Assignment > Device > Device and Pin Options > Configuration > Disable Register Power-up initialization`


## 4. Reset release IP instantiation

![](/images/blog/stratix-10-reset/6.png)

`ninit_done = '1'` Fabric is in reseting state. Must hold all user logic in the reset state.

`ninit_done = '0'` Fabric finishes its reseting. User logic can transit into operating state.

```vhdl

component reset_release is
		port (
			ninit_done : out std_logic
		);
end component reset_release;

....

RST_REL: component reset_release 
	port map (
		ninit_done => ninit_done
	);

```


## 5. Note for Partial Reconfiguration
<a href="https://www.intel.com/content/www/us/en/docs/programmable/683762/21-3/guidance-when-using-partial-reconfiguration.html">References </a>

## 6. Youtube video

You can look at the following video.

[![References](https://img.youtube.com/vi/qhGfZwX9jKw/0.jpg)](https://www.youtube.com/watch?v=qhGfZwX9jKw)


***
<b>Best resource</b>

<a href="https://www.intel.com/content/www/us/en/docs/programmable/683762/21-3/including-the-reset-release-in-your-design.html"> https://www.intel.com/content/www/us/en/docs/programmable/683762/21-3/including-the-reset-release-in-your-design.html</a>