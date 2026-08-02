---
title: 'Catapult Journey - Untimed C++ - lab 4'
description: 'Working with memory'
date: 2022-11-06
lang: vi
key: catapult-journey-4
tags: ['catapult']
---

## 1. Map C++ arrays to memories

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

