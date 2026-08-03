---
title: 'Catapult Journey - Untimed C++ - lab 4'
description: 'Lab 4 of the Catapult HLS series: when a C++ array becomes a memory interface instead of registers, and why the loop that reads it cannot be unrolled — worked through a 4-tap FIR with a 32x4 coefficient table.'
date: 2022-11-06
lang: en
key: catapult-journey-4
tags: ['catapult']
---

The first three labs worked with `ac_channel` — data flowing through the design
as a stream. This lab moves to the second kind of interface: **arrays mapped to
memory**. The point to take away is that the same array declaration in C++ can
become registers or RAM, and that choice changes the whole pipeline Catapult
generates.

## 1. Map C++ arrays to memories

The design below is a 4-tap FIR with a selectable coefficient set: `coeff_addr`
picks which row of a 32x4 table applies to the current sample.

```cpp
#include "test.h"
#include <mc_scverify.h>

#pragma hls_design top
void CCS_BLOCK(test)(ac_channel<ac_int<10> >      &data_in,
                     ac_int<7>                    coeffs[32][4], // array is mem interface not ac_channel
                     ac_channel<ac_int<5,false> > &coeff_addr,
                     ac_channel<ac_int<19> >      &result)
{
  static ac_int<10> regs[4]; // shift register
  ac_int<19> acc = 0;
  ac_int<5,false> addr = coeff_addr.read();
#pragma unroll yes
  SHIFT:for (int i=3; i>=0; i--) {
    if (i==0) {
      regs[i] = data_in.read();
    } else {
      regs[i] = regs[i-1];
    }
  }

  MAC:for (int i=0; i<4; i++) {
    acc += regs[i] * coeffs[addr][i];
  }

  result.write(acc);
}
```

### 1.1 Two kinds of array in one function

There are exactly two arrays in that code, and they synthesise in completely
different ways:

| Array | Declared as | What Catapult generates |
| ----- | ----------- | ----------------------- |
| `coeffs[32][4]` | a top-level function parameter | a **memory interface** — a RAM port leaving the block |
| `regs[4]` | a local `static` | 4 registers inside the block |

The difference is where it is declared, not what type it has. An array in the
top function's parameter list is something that lives **outside** the design, so
Catapult must generate address pins, data pins and an enable to reach it. A
local `static` array lives inside the design, keeps its value across calls, and
at four elements is mapped straight to flip-flops.

That is exactly what the comment in the code is warning about — *"array is mem
interface not ac_channel"*. An `ac_channel` describes a sequential stream with a
handshake; an array describes randomly addressable storage. Picking the wrong
interface means picking the wrong architecture.

### 1.2 Why SHIFT unrolls but MAC does not

The `SHIFT` loop carries `#pragma unroll yes` and unrolls happily: every element
of `regs` is a register, so all four assignments happen in parallel in one
cycle. That is what a shift register is.

`MAC` is different. Each iteration reads `coeffs[addr][i]`, which is an access
to the external memory. A single-port RAM serves **one read per cycle**, so even
if you force the unroll, the scheduler still has to spread four reads across
four cycles. The loop body does not get shorter; you only pay for extra
multiplexing.

To make `MAC` genuinely parallel, the fix is on the memory side, not the loop
side:

- **Split the coefficient table into 4 memories** (32x1 per tap). The four reads
  then land in four different RAMs and happen simultaneously.
- **Use a dual-port RAM** to read 2 coefficients per cycle, halving it to two
  cycles.
- **Reorganise the table** as `coeffs[32]` with each element 28 bits wide (four
  coefficients packed together). One read fetches a whole row, and the split
  into taps is bit slicing.

The third option usually wins when the tap count is small and fixed: one read
cycle, no duplicated RAM, and the unpacking is just wiring.

### 1.3 Confirming it in Design Analyzer

After synthesis, open Design Analyzer and look at the `MAC` loop. Four reads
lined up one after another on the same RAM resource is the bottleneck, and no
pragma will move them. The Gantt chart says the same thing at loop level: the
initiation interval of `MAC` is limited by the number of memory ports, not by
the multiplier.

## 2. Summary

- An array in the top function's parameters becomes a memory interface; a small
  local `static` array becomes registers. Where you declare it decides the
  architecture.
- Unrolling only helps when the underlying resource can actually go parallel.
  For memory accesses, the real limit is the port count.
- To speed up a loop that reads a table, change how the table is organised —
  split it, dual-port it, or pack a whole row into one word.
