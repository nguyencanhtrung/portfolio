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

The **design flow** — the sequence of steps that turns a request into a working
IP core — is something every FPGA developer needs to have straight. This post
walks through the traditional flow, the oldest of them and still the most
widely used, one stage at a time.

## 1. Specification

When customer A asks design house B for an IP core, they have to write down
what that core must do and hand it over. That document is the **informal
specification**.

Say customer A wants a core that computes the area of a circle. The properties
are:

* The core computes in single precision floating point
* It follows the IEEE rounding standard
* The error of the computation is under 0.1%
* Throughput < 500 ps
* Latency < 10 ns

Those bullet points are the informal specification the core is designed
from.

## 2. Modeling

From the informal specification, a model is thrown together as quickly as
possible in a high-level language — MATLAB, Python — to check what the core
does. Only the *functional behaviour* matters at this point: not how the data
is represented, and not timing. This step is **functional modeling**, and what
comes out of it is the **floating-point model**.

Once the function is confirmed, a second model should be built, this time to
pin down *how the data is represented*. It simulates only what goes into the
core and what comes out, and its purpose is to produce the stimulus and the
golden results that verification will need later. What comes out of it is the
**fixed-point, or bit true, model**, also written in a high-level language such
as C or C++.

## 3. RTL design

With the function and the data representation both settled, the high-level
model is translated into an RTL model. In this flow that translation is
**entirely by hand**, into an HDL — VHDL or Verilog. The step goes by several
names; one of them is **RTL design**.

To confirm the RTL matches the high-level model, the developer runs a behaviour
simulation here, feeding the stimulus through the HDL model and its testbench.

Two things this simulation does not tell you: nothing about timing is
guaranteed at this stage, and nothing yet says the core will work on real
hardware.

## 4. Synthesis

Next the HDL is compiled and synthesized, entirely automatically, into a **gate
netlist**. This is RTL synthesis, also called logic synthesis; it deserves a
post of its own.

With the netlist in hand the developer can run a **post-synthesis simulation**,
also known as gate-level simulation, driving the same stimulus through the gate
netlist instead of the RTL. If that passes, the core's function has survived
synthesis.

## 5. Implementation

### 5.1 Translate

Once the gate netlist (`*.NGC`, Native Generic Circuit) exists, the tool merges
it with the UCF and NCF constraint files into an NGD, a Native Generic
Database.

### 5.2 Map

The design now lives in that database as generic logic. Mapping fits it onto
what the device actually offers — LUTs and the other primitives of the FPGA
fabric. The product of this step is the NCD, a Native Circuit Description.

### 5.3 Place & Route

Placement assigns the mapped LUTs to specific CLBs on the die, and routing
connects them, both working towards positions and paths that meet the timing
constraints.

### 5.4 Simulation during implementation

* Post-translate simulation: static timing analysis against estimated gate
  delays
* Post place & route simulation: static timing analysis against the real delays

Static timing analysis only ever looks at timing. It says nothing about whether
the design computes the right answer.

## 6. Bitstream generation

The routed NCD is translated into the binary bitstream (`*.BIT`) that programs
the FPGA.

## 7. In-circuit simulation

Testing on the programmed hardware itself. An ILA core captures the real
signals on the board, and ChipScope brings the waveforms back to the host
computer — the first point in the whole flow where you are looking at the
device rather than a model of it.
