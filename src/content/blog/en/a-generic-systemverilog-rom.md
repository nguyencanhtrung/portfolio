---
title: 'A generic ROM in SystemVerilog'
description: 'A parameterised, vendor-independent ROM initialised from a file — and the coding rules that decide whether the tool infers a block RAM or burns a few thousand LUTs on the same table.'
date: 2023-09-13
lang: en
key: a-generic-systemverilog-rom
tags: ['core', 'rtl']
---

Nearly every RTL project needs a lookup table: filter coefficients, a sine
table, an LDPC base matrix, a CRC table. The fastest way to get one is the
vendor's IP core — and also the fastest way to tie the design to a single
vendor. This post builds a generic ROM in SystemVerilog: parameterised width
and depth, contents loaded from a text file, and — the part that actually
matters — written so the synthesis tool **infers a block RAM** instead of
spreading the table across thousands of LUTs.

## 1. Why not the vendor IP core

Three practical reasons:

- **Portability.** The same `.sv` file targets Xilinx, Intel and the simulator,
  with no regeneration step when the target changes.
- **Reviewability.** An IP core generates dozens of derived files; an RTL module
  is one file you can diff and review in a merge request.
- **Iteration speed.** Changing the table means editing a `.mem` file, not
  opening a GUI and regenerating.

The trade: you take on responsibility for writing the template the tool
recognises. That is the rest of this post.

## 2. The module

```systemverilog
module rom_generic #(
    parameter int          DATA_WIDTH = 16,
    parameter int          DEPTH      = 1024,
    parameter string       INIT_FILE  = "",     // "" = all-zero ROM
    parameter bit          INIT_HEX   = 1'b1    // 1: $readmemh, 0: $readmemb
) (
    input  logic                         clk,
    input  logic                         en,
    input  logic [$clog2(DEPTH)-1:0]     addr,
    output logic [DATA_WIDTH-1:0]        dout
);

    // The storage array. Deliberately not `const`: the tool has to see memory.
    logic [DATA_WIDTH-1:0] mem [0:DEPTH-1];

    initial begin
        if (INIT_FILE != "") begin
            if (INIT_HEX) $readmemh(INIT_FILE, mem);
            else          $readmemb(INIT_FILE, mem);
        end else begin
            for (int i = 0; i < DEPTH; i++) mem[i] = '0;
        end
    end

    // Synchronous read with an output register — the condition for block RAM.
    always_ff @(posedge clk) begin
        if (en) dout <= mem[addr];
    end

endmodule
```

`$clog2(DEPTH)` derives the address width, so changing `DEPTH` needs no other
edit. If `DEPTH` is not a power of two, the surplus addresses read back
undefined values — block that at a higher level if it matters.

## 3. Four conditions for block RAM inference

This is the difference between a ROM that costs one block RAM and one that costs
3000 LUTs. Same contents, different code.

### 3.1 The read must be synchronous

FPGA block RAM has **no** asynchronous read port. Writing this forces the tool
to flatten the whole table into combinational logic:

```systemverilog
assign dout = mem[addr];   // asynchronous read -> LUTs, not block RAM
```

The address always has to pass through a register, which means reading inside an
`always_ff` as in the module above. The price is one cycle of latency — a real
property of the hardware, not something you added.

### 3.2 Do not reset the array

The most common mistake:

```systemverilog
always_ff @(posedge clk or posedge rst) begin
    if (rst) dout <= '0;          // resetting the output register: fine
    else if (en) dout <= mem[addr];
end
```

Resetting the output register is fine. But resetting **the array** — a `for`
loop assigning `mem[i] <= '0` in the reset branch — forces flip-flops for every
storage cell, because block RAM has no reset on its contents. The result is a
resource explosion.

### 3.3 Only one process may touch the array

If two different `always_ff` blocks read `mem`, the tool either duplicates the
memory or abandons inference. If you need two read ports, say so explicitly and
do both reads inside **one** `always_ff`.

### 3.4 Force it when the tool still refuses

When everything is right and the synthesis report still shows LUTs, state the
intent directly. These are vendor pragmas, harmless to the other vendor:

```systemverilog
(* rom_style = "block" *)     logic [DATA_WIDTH-1:0] mem [0:DEPTH-1];  // Xilinx
(* ramstyle = "M20K"   *)     logic [DATA_WIDTH-1:0] mem [0:DEPTH-1];  // Intel
```

The opposite values — `"distributed"` on Xilinx, `"logic"` on Intel — are useful
for very small tables, under about 64 entries, where a whole block RAM is
wasteful.

## 4. The contents file

`$readmemh` reads a text file with one hex value per line, and tolerates `//`
comments and blank lines:

```text
// sin_lut.mem — quarter period of a sine, Q1.15
0000
0324
0648
096a
// ...
```

Three things to watch:

- If the file holds **fewer** values than `DEPTH`, the remainder is `'x` in
  simulation but usually `0` after synthesis. That mismatch is exactly the kind
  of bug that only appears on the board.
- `INIT_FILE` is resolved relative to the tool's working directory, not to the
  `.sv` file. Pass an absolute path from the build script.
- Generate the file with a script (Python, Matlab) and commit both the script
  and the `.mem`. Six months later, "where did this table come from" has an
  answer.

## 5. Using it

```systemverilog
rom_generic #(
    .DATA_WIDTH (16),
    .DEPTH      (256),
    .INIT_FILE  ("sin_lut.mem")
) u_sin_lut (
    .clk  (clk),
    .en   (lut_en),
    .addr (lut_addr),
    .dout (lut_data)
);
```

## 6. Checking it

A wrong ROM makes everything downstream wrong, so it is worth a few minutes to
compare against a reference model:

```systemverilog
// Read back the same file the RTL loaded, then compare element by element.
logic [15:0] golden [0:255];
initial $readmemh("sin_lut.mem", golden);

initial begin
    for (int i = 0; i < 256; i++) begin
        @(posedge clk);
        addr <= i[7:0]; en <= 1'b1;
        @(posedge clk);                 // absorb the one-cycle read latency
        assert (dout === golden[i])
            else $error("ROM mismatch at %0d: %h instead of %h", i, dout, golden[i]);
    end
    $display("ROM matches all %0d entries", 256);
end
```

This catches both of the usual failures: an address off by one cycle, from
forgetting the read latency, and a `.mem` file that was never loaded, where
`dout` comes back all `x`.

## 7. Summary

- Synchronous read, no array reset, one process touching the array — those three
  decide whether your ROM lands in block RAM or spreads across LUTs.
- `$readmemh` plus a script-generated `.mem` keeps the table diffable and
  reproducible.
- `rom_style` and `ramstyle` are how you tell the tool directly, once the
  template is already correct.
- Always check the ROM against its own contents file in a testbench. An address
  off by one cycle is a silent error, and it follows you all the way to the
  board.
