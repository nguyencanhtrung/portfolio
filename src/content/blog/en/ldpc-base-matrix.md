---
title: '5G LDPC - Base matrices'
description: 'The base matrix behind 5G LDPC: how B relates to the parity check matrix H, the sub-matrix structure that makes encoding cheap, how to build B from the 3GPP TS 38.212 tables, and why an FPGA stores 16 matrices rather than 102.'
date: 2022-10-06
lang: en
key: ldpc-base-matrix
tags: ['5g']
---

## 1. Overview

The base matrix $$B$$ is one of the things you have to understand properly
before the 5G LDPC encoding and decoding algorithms make sense. On an FPGA it
ends up in ROM — precomputed rather than derived on the fly. This post covers
what a base matrix is, how it is built, and how much of it actually has to be
stored.

## 2. Base matrix (B) and parity check matrix (H)

The **base matrix** $$B$$ has a fixed size per base graph:

* Base graph 1: 46 rows x 68 columns
* Base graph 2: 42 rows x 52 columns

The **parity check matrix** $$H$$ is produced by replacing every entry of $$B$$
with a $$Z_c \times Z_c$$ block:

| **Value** | **Meaning** |
|:---------:|:-----------:|
| -1 | ignore, i.e. the all-zero matrix |
| 0 | the identity matrix $$I$$ |
| $$Z_c > a > 0$$ | $$I$$ cyclically shifted right $$a$$ times |

The figure below shows an example with expansion factor $$Z_c = 5$$ — some
references call it the lifting factor and write it $$Z$$. See
[the post on Zc](/blog/ldpc-lifting-factor/) for how that value is chosen.

![](/images/blog/ldpc-base-matrix/1.png)

The reason this representation matters: every non-zero block is a rotation of
the identity. So a matrix that is nominally tens of thousands of elements wide
is described by a few hundred small integers, and the hardware that multiplies
by it is a barrel shifter rather than a multiplier array.

## 3. Base matrix structure

The two base graphs differ in size but share the same structure:

$$
 B =
\left[\begin{array}{cc}
A  & E  & O \\
C_1 & C_2 & I
\end{array}\right]
$$

with the sub-matrices sized as follows:

| **Matrix** | **Base graph 1** | **Base graph 2** |
|:----------:|:----------------:|:----------------:|
| A | 4 x 22 | 4 x 10 |
| E | 4 x 4 | 4 x 4 |
| $$C_1$$ | 42 x 22 | 38 x 10 |
| $$C_2$$ | 42 x 4 | 38 x 4 |
| O | 4 x 42 | 4 x 38 |
| I | 42 x 42 | 38 x 38 |

$$A$$ and $$E$$ produce the first four parity bits, written $$p_a$$.

$$C_1$$ and $$C_2$$ take those four parity bits
$$\{p_{a_1}, p_{a_2}, p_{a_3}, p_{a_4}\}$$ and produce the rest, written
$$p_c$$.

$$O$$ and $$I$$ can be skipped during the computation — $$O$$ is all zeros and
$$I$$ contributes only the parity bit being solved for.

![](/images/blog/ldpc-base-matrix/4.png)

$$E$$ is a special case: a **double diagonal matrix**. That shape is what makes
the first four parity bits solvable by back-substitution instead of by inverting
anything, which is the trick that keeps a 5G LDPC encoder cheap.

## 4. How to construct 5G LDPC base matrices

A base matrix is determined by three parameters:
{ **`NBG`**, $$i_{LS}$$, $$Z_c$$ }.

From `NBG` and $$i_{LS}$$, tables 5.3.2-2 and 5.3.2-3 of 3GPP TS 38.212
(section 5.3.2) give the base matrix for the **largest** $$Z_c$$ in that lifting
set.

![](/images/blog/ldpc-base-matrix/2.png)

**Example.** `NBG = 2` (base graph 2), $$i_{LS} = 6$$. Looking up table 5.3.2-3:

![](/images/blog/ldpc-base-matrix/3.png)

gives the base matrix for $$Z_c = 208$$:

$$
 B =
\left[\begin{array}{cc}
143 & 19 & 176 & 165 & -1 & -1  & 196 & -1 & -1 & 13  & 0  & 0 & -1 & -1 & -1 & ... \\
18  & -1 & -1  & 27  &  3 & 102 & 185 & 17 & 14 & 180 & -1 & 0 & 0  & -1 & -1 & ... \\
...
\end{array}\right]
$$

The remaining lifting sizes for $$i_{LS} = 6$$ — that is
$$Z_c = 13, 26, 52, 104$$ — are not tabulated separately. Each entry is derived
from the tabulated one:

$$
b = a \bmod Z_c \qquad (1)
$$

where

* $$a$$ is the entry of $$B$$ for the largest $$Z_c$$ in the set,
* $$b$$ is the entry of $$B$$ for the $$Z_c$$ being derived.

The modulo is the whole point: a shift of $$a$$ positions in a ring of $$Z_c$$
elements is the same as a shift of $$a \bmod Z_c$$. So for $$Z_c = 13$$ the
matrix above becomes:

$$
 B =
\left[\begin{array}{cc}
0  & 6 & 7 & 9 & -1 & -1  & 1 & -1 & -1 & 0  & 0  & 0 & -1 & -1 & -1 & ... \\
5 & -1 & -1  & 1  &  3 & 11 & 3 & 4 & 1 & 11 & -1 & 0 & 0  & -1 & -1 & ... \\
...
\end{array}\right]
$$

**What this means for an implementation**

* There are 51 legal values of $$Z_c$$, so 51 base matrices per base graph and
  102 in total. Storing all of them naively is both wasteful and a bandwidth
  problem during encoding and decoding.
* You do not have to. Store only the 16 matrices that correspond to the largest
  $$Z_c$$ of each lifting set — 8 per base graph — and derive the rest on the
  fly with equation (1). A modulo by a constant is trivial in hardware.
* You can go further. As shown in section 3, encoding only needs $$A$$, $$E$$,
  $$C_1$$ and $$C_2$$. The $$O$$ and $$I$$ blocks never need to be stored at
  all.

## 5. Precomputed base matrices

The 102 base matrices of 5G LDPC are available [here](https://bibo.id.vn/).

## 6. References

[3GPP TS 38.212, section 5.3.2](https://www.3gpp.org/ftp/Specs/archive/38_series/38.212/)
