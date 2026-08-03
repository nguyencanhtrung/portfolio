---
title: 'Catapult Journey - Untimed C++ - lab 3'
description: 'Lab 3 of the Catapult HLS series: Catapult treats main as an infinite loop so it can be pipelined, but it never unrolls inner loops for you — and a dynamic array index turns a fully unrolled loop into a resource explosion.'
date: 2022-11-06
lang: en
key: catapult-journey-3
tags: ['catapult']
---

## 1. Main

Unlike some other HLS tools, Catapult treats `main` as an unbounded — infinite —
loop. That means you can configure the tool to synthesise `main` itself into a
pipelined architecture. What Catapult will *not* do, unlike Vitis HLS, is
automatically unroll the loops inside `main`. That decision is left entirely to
the designer.

## 2. Loops

Only two transformations apply to a loop:

* loop unrolling
  * fully unrolled
  * partially unrolled
* loop pipelining

The unroll pragma:

```bash
#pragma unroll yes
```

## 3. Dynamic index

```cpp
void test_orig(int din[40], uint6 offset, int dout[40])
{
  static int regs[40];

  // Loop is fully unrolled
#pragma unroll yes
  for (int i=0; i<40; i++) {
    if (i+offset < 40) {
      regs[i + offset] = din[i];
    }
  }

  // Loop is fully unrolled
#pragma unroll yes
  for (int i=0; i<40; i++) {
    dout[i] = regs[i];
  }
}
```

The line `regs[i+offset] = din[i]` produces a warning:

```bash
# Warning: test_orig.cpp(11): Writing to register bank 'test_orig:regs' with 17 registers using a dynamic index can cause excessive runtime and undesired hardware.  Please inspect coding style. (MEM-74)
```

The reason: `offset` is an input parameter, so its value is unknown at compile
time. `i` is a loop counter, but once the loop is unrolled it becomes a
constant. The sum of a constant and an unknown is still unknown — so the index
is dynamic.

Catapult handles an array accessed by a dynamic index by splitting it into
separate variables and building the selection logic explicitly. Here `regs` is
mapped to registers, so it gets split once for every possible value of `offset`.
Worse, the statement sits inside a fully unrolled loop, so that split is
repeated for each of the 40 iterations. Runtime goes up and area goes up with
it.

**The fix**

```cpp
void test(int din[40], uint6 offset, int dout[40])
{
  static int regs[40];

#pragma unroll yes
  for (int i=0; i<40; i++) {
#pragma unroll yes
    for (int j=0; j<40; j++) {
      if ((j==offset) & (j+i<40)) {
        regs[j+i] = din[i];
      }
    }
  }

  // Loop is fully unrolled
#pragma unroll yes
  for (int i=0; i<40; i++) {
    dout[i] = regs[i];
  }
}
```

With both loops fully unrolled, `i` and `j` are both constants, so the index
`j+i` is constant too — every write targets a known register. The runtime value
of `offset` has moved out of the index and into a guard condition, `j==offset`,
which synthesises into a simple enable on each register.

The idea generalises: when a tool complains about a dynamic index, the fix is
usually not a different pragma but moving the unknown value from the *address*
into a *condition*. You trade one variable index for a comparison per element,
which is cheap and, unlike the split, does not multiply.
