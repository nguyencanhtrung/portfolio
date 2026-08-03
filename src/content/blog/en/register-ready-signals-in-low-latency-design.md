---
title: 'Pipelining an AXI-Stream bus with a registered ready'
description: 'Putting a register on the AXI4-Stream TREADY path without losing data: why the naive version drops a beat, and the two-register design that cuts the long combinational path while keeping full throughput.'
date: 2023-09-13
lang: en
key: register-ready-signals-in-low-latency-design
tags: ['rtl']
---

## 1. Introduction

Pipelining a handshake protocol is how you keep throughput up. Building a
pipeline stage that still honours the protocol, though, gets complicated fast —
at least it did for me early on, when I wrote an eight-state Moore FSM purely to
absorb backpressure from `TREADY` and break the critical path it created. This
post walks through the problem and a design that solves it with two registers
and no state machine.

## 2. The AXI-Stream protocol and pipelining

### 2.1 How AXI-Stream works

In its simplest form AXI-Stream has three signals: `DATA`, `VALID` and `READY`.
For a single-cycle data transfer, `DATA` is sampled and forwarded if and only if

* `S_AXIS_TVALID = 1`, and
* `M_AXIS_TREADY = 1`

at the sampling edge of the clock.

Two variants of the stage are common:

![](/images/blog/register-ready-signals-in-low-latency-design/3.png)

The one on the left forwards data from input to output only when the downstream
consumer is ready. It also forwards *invalid* inputs, and an invalid beat
travelling down a pipeline is what we call a bubble.

The one on the right behaves the same but can collapse bubbles. That happens
when

* a bubble is detected in the pipe, `m_axis_tvalid = '0'`, and
* a valid input is waiting, `s_axis_tvalid = '1'`.

The stage then accepts the data even though the consumer is not ready, and the
valid beat overwrites the bubble.

Both variants share one serious drawback: a critical path forms on
`m_axis_tready`, running combinationally from the consumer back through the
stage to the producer. It is the path that caps the clock frequency of the whole
chain.

![](/images/blog/register-ready-signals-in-low-latency-design/5.png)

### 2.2 Registering TREADY

Putting a register on `TREADY` breaks that path, but it introduces a new problem.
`S_AXIS_TREADY` now lags `M_AXIS_TREADY` by one cycle. So in the cycle where
`M_AXIS_TREADY = '0'`, the data sitting in the register is *not* sampled by the
consumer — yet the next input beat still arrives and overwrites it. One beat is
lost.

The fix is a second register bank. When `M_AXIS_TREADY = '0'`, the unsampled
value is moved aside into the **expansion registers**, while the incoming beat
continues into the **primary registers** as usual:

```systemverilog
always_ff @(posedge clk)
begin
    if (s_axis_tready == 1'b1) begin
        primary_data_reg        <= s_axis_tdata;
        primary_valid_reg       <= s_axis_tvalid;
        if (m_axis_tready == 1'b0) begin
            expansion_data_reg  <= primary_data_reg;
            expansion_valid_reg <= primary_valid_reg;
        end
    end
end
```

When `M_AXIS_TREADY` goes back to `'1'`, `S_AXIS_TREADY` is still `'0'` for one
cycle because of the register delay — and that is exactly the slot in which the
consumer drains the expansion registers first, then the primary ones. Order is
preserved and nothing is dropped.

![](/images/blog/register-ready-signals-in-low-latency-design/4.png)

This structure is usually called a skid buffer: the extra bank is the room the
data "skids" into while the backpressure signal is still in flight.

### 2.3 The RTL

```systemverilog
logic [WIDTH-1:0]   expansion_data_reg;
logic               expansion_valid_reg;
logic [WIDTH-1:0]   primary_data_reg;
logic               primary_valid_reg;

always_ff @(posedge clk)
begin
    if (s_axis_tready == 1'b1) begin
        primary_data_reg        <= s_axis_tdata;
        primary_valid_reg       <= s_axis_tvalid;
        if (m_axis_tready == 1'b0) begin
            expansion_data_reg  <= primary_data_reg;
            expansion_valid_reg <= primary_valid_reg;
        end
    end
    if (m_axis_tready == 1'b1) begin
        expansion_valid_reg     <= 1'b0;
    end
end

assign s_axis_tready = !(expansion_valid_reg);
assign m_axis_tvalid = (expansion_valid_reg) ?
                            expansion_valid_reg :
                            primary_valid_reg;
assign m_axis_tdata  = (expansion_valid_reg) ?
                            expansion_data_reg :
                            primary_data_reg;
```

Two lines carry the whole idea. `s_axis_tready = !expansion_valid_reg` means the
stage accepts new data whenever the skid slot is empty — so backpressure is
raised one beat *before* the stage is genuinely full, which is what makes the
registered path safe. And the two muxes always present the expansion register
first, which is what keeps the beats in order.

The cost is one extra register bank and one cycle of latency. The gain is that
`m_axis_tready` no longer runs combinationally through the stage, so a long
chain of these can be clocked at full speed.

The design is written in SystemVerilog and available as
[`axis_reg.sv`](https://github.com/nguyencanhtrung/systemverilog_axis/blob/master/rtl/axis_reg.sv).
