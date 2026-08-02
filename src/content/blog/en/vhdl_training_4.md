---
title: 'VHDL - Operators'
description: 'The full VHDL operator set and the four places it bites: logical operators sit at the bottom of the precedence table, array comparison is lexicographic rather than numeric, srl throws away the sign, and mod differs from rem.'
date: 2023-02-25
lang: en
key: vhdl_training_4
tags: ['vhdl']
series: 'VHDL training'
seriesOrder: 4
---

Operators look like the easy part of a language. In VHDL they are where a lot of
silent bugs come from, because three things are not what a C or Python habit
expects: logical operators sit at the *bottom* of the precedence table, array
comparison is lexicographic rather than numeric, and the shift operators do not
respect signedness. This part walks the whole operator set and stops at each of
those traps.

## 1. Precedence

VHDL has seven precedence levels. The highest binds first:

| Level | Operators | Class |
| ----- | --------- | ----- |
| 1 (highest) | `**` `abs` `not` | miscellaneous |
| 2 | `*` `/` `mod` `rem` | multiplying |
| 3 | `+` `-` (unary) | sign |
| 4 | `+` `-` `&` | adding and concatenation |
| 5 | `sll` `srl` `sla` `sra` `rol` `ror` | shift |
| 6 | `=` `/=` `<` `<=` `>` `>=` | relational |
| 7 (lowest) | `and` `or` `nand` `nor` `xor` `xnor` | logical |

### 1.1 The consequence people trip over

Because logical operators are the lowest level, a comparison binds tighter than
an `and`. That part is intuitive. What is not intuitive is that VHDL refuses to
guess when you mix two different logical operators:

```vhdl
-- Illegal: the language will not choose between (a and b) or c
--          and a and (b or c) on your behalf.
z <= a and b or c;

-- Legal, and the intent is now on the page.
z <= (a and b) or c;
```

Repeating the same operator is fine, because it is associative:

```vhdl
z <= a and b and c;    -- legal
z <= a nand b nand c;  -- ILLEGAL: nand and nor are not associative
```

`nand` and `nor` are the exception. Even repeated they need parentheses,
because `(a nand b) nand c` and `a nand (b nand c)` genuinely differ.

## 2. Logical operators

`and`, `or`, `nand`, `nor`, `xor`, `xnor` and `not` are defined for `bit` and
`boolean`, and through `std_logic_1164` for `std_ulogic` and `std_logic`. They
are also defined element-wise over arrays of those types:

```vhdl
signal a, b, z : std_logic_vector(7 downto 0);

z <= a and b;   -- bit 7 with bit 7, bit 6 with bit 6, and so on
z <= not a;
```

Two rules apply to the array form:

- Both operands must have the **same length**. In many tools a mismatch is a
  runtime error rather than a compile error, so the message only arrives during
  simulation.
- The result takes the index range of the left operand. Direction (`to` versus
  `downto`) is not checked, so an operand declared `0 to 7` mixed with one
  declared `7 downto 0` will line bit 0 up against bit 7 without complaint.

`xnor` arrived in VHDL-93; VHDL-87 code has to write `not (a xor b)`.

## 3. Relational operators

`=`, `/=`, `<`, `<=`, `>` and `>=` return `boolean`, never a bit. That is why a
comparison cannot drive a signal directly:

```vhdl
signal eq : std_logic;

eq <= (a = b);                   -- illegal: boolean assigned to std_logic
eq <= '1' when a = b else '0';   -- correct
```

### 3.1 Array comparison is lexicographic, not numeric

For `std_logic_vector` and `bit_vector`, ordering is defined element by element
from the left, exactly the way strings sort. Length only breaks a tie:

```text
"0100" versus "011"
  position 1: '0' against '0'  -> equal
  position 2: '1' against '1'  -> equal
  position 3: '0' against '1'  -> the left operand is smaller

so "0100" < "011", even though 4 > 3 numerically
```

This is the most expensive habit to carry over from software. When you mean a
numeric comparison, the operands have to carry a numeric type:

```vhdl
use ieee.numeric_std.all;

signal a, b : unsigned(7 downto 0);

if a > b then ...             -- numeric; shorter operands are zero-extended
if signed(a) > signed(b) then -- numeric with sign extension
```

`numeric_std` overloads the relational operators for `signed` and `unsigned`
and handles operands of different lengths correctly. `std_logic_vector` carries
no numeric meaning, so it gets no such treatment.

## 4. Shift and rotate operators

VHDL-93 defines six: `sll`, `srl`, `sla`, `sra`, `rol` and `ror`. The right
operand is an `integer`, and a negative count shifts the other way.

| Operator | Action | Fill |
| -------- | ------ | ---- |
| `sll` | shift left logical | `'0'` |
| `srl` | shift right logical | `'0'` |
| `sla` | shift left arithmetic | copy of the **rightmost** bit |
| `sra` | shift right arithmetic | copy of the **leftmost** bit |
| `rol` and `ror` | rotate | wraps around |

`sla` filling from the right end surprises most people. It exists so that `sla`
and `sra` invert each other on a signed magnitude, and it is rarely what you
actually want.

### 4.1 The trap: srl does not know about sign

`numeric_std` overloads the shift operators for `signed`, but `srl` stays a
logical shift. It fills with `'0'` even on a signed value, quietly turning a
negative number positive. Use the functions instead, which respect the type:

```vhdl
use ieee.numeric_std.all;

signal s : signed(7 downto 0) := "11110000";  -- -16

s srl 1             -- "01111000" = +120   <- sign destroyed
shift_right(s, 1)   -- "11111000" = -8     <- arithmetic, correct
```

Rule of thumb: reach for `shift_left` and `shift_right` from `numeric_std`, and
leave the operators for `bit_vector` work.

## 5. Arithmetic operators

`+`, `-`, `*`, `/`, `mod`, `rem`, `**` and `abs` are defined for `integer` and
`real`, and for `signed` and `unsigned` once `numeric_std` is in scope. They are
not defined for `std_logic_vector` — which is the entire reason the numeric
types exist.

```vhdl
use ieee.numeric_std.all;

signal a, b : unsigned(7 downto 0);
signal sum  : unsigned(8 downto 0);

sum <= ('0' & a) + ('0' & b);   -- widen first, or the carry is lost
```

`+` and `-` return a result as wide as the widest operand, so the carry out is
dropped unless you extend the operands yourself.

### 5.1 mod versus rem

Both produce a remainder, and they differ on negative operands. `rem` takes the
sign of the **left** operand, `mod` takes the sign of the **right** one:

```text
 7 rem  3 =  1        7 mod  3 =  1
-7 rem  3 = -1       -7 mod  3 =  2
 7 rem -3 =  1        7 mod -3 = -2
-7 rem -3 = -1       -7 mod -3 = -1
```

For unsigned values the two agree, which is why the difference stays hidden
until the day a signed value reaches the expression.

### 5.2 What actually synthesises

- `+`, `-`, `abs` and the comparisons: always.
- `*`: yes, and it maps onto DSP blocks when the widths and pipelining suit the
  device.
- `/`, `mod` and `rem`: only when the right operand is a **constant power of
  two**, where the tool turns the operation into a shift or a bit select. A
  general divider has to be instantiated as an IP core.
- `**`: only with a constant base of 2 and a constant exponent, which makes it a
  compile-time constant.

## 6. Concatenation

`&` joins arrays and elements into a longer array. It is the workhorse for
widening, padding and reordering:

```vhdl
signal byte   : std_logic_vector(7 downto 0);
signal word   : std_logic_vector(15 downto 0);
signal nibble : std_logic_vector(3 downto 0);

word   <= x"00" & byte;                           -- zero-extend
nibble <= byte(0) & byte(1) & byte(2) & byte(3);  -- bit reversal
```

With `numeric_std` in scope, `resize` says the same thing more clearly and
handles sign extension for you:

```vhdl
word <= std_logic_vector(resize(unsigned(byte), 16));  -- zero-extend
word <= std_logic_vector(resize(signed(byte), 16));    -- sign-extend
```

## 7. Summary

- Logical operators bind last, and mixing `and` with `or` in one expression is a
  compile error. Parenthesise by intent rather than by habit.
- Comparing `std_logic_vector` compares text, not numbers. Cast to `unsigned` or
  `signed` whenever magnitude is what you mean.
- `srl` on a `signed` value throws the sign away; `shift_right` does not.
- `mod` and `rem` only diverge once a negative operand shows up.
- `+` and `-` keep the operand width, so widen before you add when the carry
  matters.
