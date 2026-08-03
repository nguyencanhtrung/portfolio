---
title: 'FPGA design flow – Traditional flow'
description: 'The traditional IP core design flow, from informal specification through floating-point and fixed-point models, RTL design, synthesis, implementation and bitstream — and what each simulation step actually guarantees.'
date: 2017-10-16
lang: en
key: fpga-design-flow-traditional
tags: ['rtl']
---

> Brought over from my old personal blog,
> [unicornsnippets](https://unicornsnippets.wordpress.com/2017/10/16/fpga-note-design-flow/)
> (2017-10-16).

**The design flow — the steps for building an IP core** — is something every
FPGA developer needs to have straight. This post walks through the design flows
in use and explains where each of them came from.

We start with the traditional design flow, the most common one and the one most
widely applied.

## 1. Specification

When customer A asks company B for an IP core C, they have to list the
properties that core must have and hand that over to the design house. That
document is the **informal specification**.

An example: company A wants an IP core that computes the area of a circle, with
these properties:

* The core computes in single precision floating point
* It follows the IEEE rounding standard
* The error of the computation is under 0.1%
* Throughput < 500 ps
* Latency < 10 ns

Those bullet points are the informal specification the IP core is designed
from.

## 2. Modeling

From the **informal specification**, a model is built as quickly as possible in
a high-level language (MATLAB, Python, …) to evaluate what the core does:
*functional behaviour only*, *no concern for how the data is represented*, *no
concern for timing*. This step is **functional modeling**, and its product is
the **floating-point model**.

Once the function is confirmed, a second model should be built to *check the
data representation*. Put differently, this model simulates the core's input
and output data — only INPUT and OUTPUT matter here. The point is to produce
the stimulus and the golden results for verification later. Its product is the
**fixed-point / bit true model**, also written in a high-level language (C/C++).

## 3. RTL design

With the function and the data representation both settled, the next step is
translating the high-level model (bit true, floating point) into an RTL-level
model. In this flow the translation is **entirely manual**, and the language is
HDL — VHDL or Verilog. The step goes by several names; one of them is **RTL
design**.

To confirm this model matches the high-level one, the developer runs a
behaviour simulation here, with the VHDL model + testbench + stimulus.

Note: timing is not guaranteed at this stage of simulation. Neither is the
question of whether the core will actually run on hardware.

## 4. Synthesize

Next, the VHDL is compiled and synthesized. The end product is a **gate
netlist**, produced entirely automatically by the compiler and the synthesis
tool. This process is called RTL synthesis (or logic synthesis) — a later post
will go into it properly.

After this step the developer can run a **post-synthesis simulation**, also
known as gate-level simulation, where the stimulus is exercised against the
gate netlist. If that passes, the function of the core has survived synthesis.

## 5. Implementation

### 5.1 Translate

Once the gate netlist (`*.NGC` — Native Generic Circuit) exists, the tool
combines it with the UCF and NCF to produce an NGD (Native Generic Database).

### 5.2 Map

The core now lives in that database, and is mapped down onto the FPGA
architecture (the LUT architecture) to program the gate arrays. The product of
this step is the NCD (Native Circuit Description).

### 5.3 Place & Route

Place and route arrange the LUTs into CLBs at positions that satisfy the timing
constraints.

### 5.4 Simulation during implementation

* Post-translate simulation: static timing analysis with estimated gate delays
* Post place & route simulation: static timing analysis with exact delays

Static timing analysis only looks at timing, never at function.

## 6. Generate bitstream

The routed NCD is translated into the binary bitstream file (`*.BIT`) that
programs the FPGA board.

## 7. In-circuit simulation

Testing directly on the programmed hardware. An ILA core captures the physical
signals on the board, and ChipScope displays the waveforms on the host computer.
