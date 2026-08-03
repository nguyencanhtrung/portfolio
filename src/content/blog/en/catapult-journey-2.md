---
title: 'Catapult Journey - Untimed C++ - lab 2'
description: 'Lab 2 of the Catapult HLS series: running a project from the GUI and from a script, reading the Gantt Chart and Design Analyzer to find bottlenecks, and inserting STALLs in RTL co-simulation to test the design under backpressure.'
date: 2022-11-04
lang: en
key: catapult-journey-2
tags: ['catapult']
---

## 1. Goals

* Synthesize a design both script-based and GUI-based
* Use the Catapult Gantt Chart and the Catapult Design Analyzer
* Set up and run simulation

## 2. Working from the GUI

A project goes through these stages in order:

![](/images/blog/catapult-journey-2/2.png)
![](/images/blog/catapult-journey-2/3.png)

**1. Add the input files**
  * Add the testbench file but exclude it from compilation
  * Only the `*.cpp` files need adding; the `*.h` headers are picked up
    automatically

**2. Set the hierarchy**
  * Choose the `top-level` module for the tool to compile

**3. Set the libraries**
  * Choose the device, part number and technology, and enable each vendor's
    RAM and ROM libraries

**4. Set the mapping**
  * Clocking and reset (asynchronous or synchronous; active high or active low)

**5. Set the architecture**
  * Interface / IOs
  * Memories
  * Loops

Through development you work from the `Gantt Chart` (the `Schedule` tab) and
the `Design Analyzer` to watch the high-level model turn into an RTL model, and
from there converge on the architecture that best fits the requirements.

## 3. Working from a script

The script-based flow follows exactly the same stages as the GUI. Here is an
example:

```bash
# Get current dir.
set sfd [file dirname [info script]]

# Setup tool
options defaults
options set /Input/CppStandard c++11

project new

flow package require /SCVerify
flow package option set /SCVerify/USE_CCS_BLOCK true

# 1. Read Design Files
solution file add [file join $sfd tb.cpp] -type C++ -exclude true
solution file add [file join $sfd mult_add_pipeline_ref.cpp] -type C++ -exclude true
solution file add [file join $sfd mult_add_pipeline.cpp] -type C++
go compile

# 2. Hierarchy
# Design has only one module, tool will automatically detect the top-level 

# 3. Load Libraries
solution library add nangate-45nm_beh -- -rtlsyntool OasysRTL
go libraries

# 4. Mapping
directive set -CLOCKS {clk {-CLOCK_PERIOD 1.11 }}
go assembly

# 5. Architecture 
#    Apply IO and Loop Constraints
directive set /mult_add_pipeline/a:rsc -MAP_TO_MODULE ccs_ioport.ccs_in_wait
directive set /mult_add_pipeline/b:rsc -MAP_TO_MODULE ccs_ioport.ccs_in_wait
directive set /mult_add_pipeline/c:rsc -MAP_TO_MODULE ccs_ioport.ccs_in_wait
directive set /mult_add_pipeline/gain:rsc        -MAP_TO_MODULE ccs_ioport.ccs_in
directive set /mult_add_pipeline/gain_adjust:rsc -MAP_TO_MODULE ccs_ioport.ccs_in
directive set /mult_add_pipeline/result:rsc      -MAP_TO_MODULE ccs_ioport.ccs_out_wait

directive set /mult_add_pipeline/core/main -PIPELINE_INIT_INTERVAL 1
directive set /mult_add_pipeline/core/main -PIPELINE_STALL_MODE stall
directive set /mult_add_pipeline/core -DESIGN_GOAL area

# 6. Compile 
go extract
```

There are two ways to run the script.

**Script-based**

```bash
catapult -shell -file script.tcl
```

Open the `project` the script produced with:

```bash
catapult ./Catapult
```

**GUI-based**

Open Catapult, then

`File > Run Script..`

and point it at the script.

## 4. Catapult Gantt Chart

Shows how the operators are scheduled. You use it to tune the schedule until
the design meets its targets.

This is an advanced topic; a later post will go into it properly.

## 5. Catapult Design Analyzer

Shows information across, and lets you cross-probe between, three models: the
C/C++ model, the HDL model (Verilog/VHDL), and the RTL model (schematic,
schedule).

The Design Analyzer gives exact resource figures per block for each HLS stage
from `Compile` through to `Extract`.

You use it to inspect the critical paths in the design and decide where
optimisation is worth spending effort.

## 6. RTL co-simulation

To cover the situations a design will actually meet, SCVerify lets the tester
insert `STALL`s on inputs and outputs and check how the system behaves.

A `STALL` on an input means VALID = '0'.

A `STALL` on an output means READY = '0'.

Inserting a `STALL` takes two steps:

* Write a C/C++ testbench that drives the `STALL` insertion on inputs and
  outputs
* Configure the compiler so it accepts the `STALL` flag from the testbench

The example below makes it concrete:

```cpp

#include "mult_add_pipeline.h"
#include "mult_add_pipeline_ref.h"
#include <stdio.h>
#include <mc_scverify.h>

CCS_MAIN(int argv, char **argc)
{
  unsigned int a_ref = 60;
  unsigned int b_ref= 30;
  unsigned int c_ref;

  unsigned int result_ref;
  int errCnt = 0;
  ac_int<11,false> a;
  ac_int<14,false> b;
  ac_int<25,false> c;
  ac_channel<ac_int<11,false> > a_chan;
  ac_channel<ac_int<14,false> > b_chan;
  ac_channel<ac_int<25,false> > c_chan;
  float gain_ref = 0.5;
  ac_fixed<10,2,false> gain = 0.5;
  bool gain_adjust = false;
  ac_channel<ac_int<30,false> > result;
  ac_int<30,false> res;
  for (int i=0; i<20; i++) {
    a = rand();
    a_ref = a;
    b = rand();
    b_ref = b;
    c = 33554431;
    c_ref = c;
#ifdef CCS_SCVERIFY
#ifdef STALL
    if (i==3) {
      testbench::a_wait_ctrl.cycles = 2;
    }
    if (i==7) {
      testbench::result_wait_ctrl.cycles = 2;
    }
#endif
#endif
    if (i==9) {
      gain_adjust = true;
    }
    a_chan.write(a);
    b_chan.write(b);
    c_chan.write(c);
    mult_add_pipeline_ref(a_ref,b_ref,c_ref,gain,gain_adjust,result_ref);
    mult_add_pipeline(a_chan,b_chan,c_chan,gain,gain_adjust,result);
    res = result.read();
    if (result_ref != res) {
      printf("ERROR MISMATCH iteration: %d a = %4d  b = %5d  result_ref = %08x  result_bit_acc = %08x \n",i,a_ref,b_ref,result_ref, res.to_uint());
      errCnt++;
    } else {
      printf("iteration: %2d a = %4d  b = %5d  result_ref = %08x  result_bit_acc = %08x \n",i,a_ref,b_ref,result_ref, res.to_uint());
    }
  }
  CCS_RETURN(errCnt);
}

```

This testbench exercises the `mult_add_pipeline` circuit. How that circuit
works does not matter here — the part to look at is this:

### 6.1 Inserting a STALL from the testbench

```cpp

#ifdef CCS_SCVERIFY
#ifdef STALL
    if (i==3) {
      testbench::a_wait_ctrl.cycles = 2;
    }
    if (i==7) {
      testbench::result_wait_ctrl.cycles = 2;
    }
#endif
#endif

```

This tells SCVerify to stall the input `a` at `i = 3` and the output `result`
at `i = 7`. Each `STALL` lasts 2 clock cycles.

**One important caveat**

For a `STALL` to be possible, the input and output must be constrained to a
`ccs_io_*_wait` form, so that the synthesized RTL carries `VALID` and `READY`
alongside `DATA`.

There is no way to insert a `STALL` on an `amba.ccs_axi4stream_in` or
`amba.ccs_axi4stream_out` interface. It fails like this:

```bash

../../src/crc_tb.cpp: In member function 'int testbench::main()':
Error: ../../src/crc_tb.cpp(73): error: 'stream_in_wait_ctrl' is not a member of 'testbench'
           testbench::stream_in_wait_ctrl.cycles = 20;
                      ^~~~~~~~~~~~~~~~~~~
Error: ../../src/crc_tb.cpp(76): error: 'stream_in_wait_ctrl' is not a member of 'testbench'
           testbench::stream_in_wait_ctrl.cycles = 20;
                      ^~~~~~~~~~~~~~~~~~~
```

**Syntax**

To stall any signal `X` for `Y` clock cycles from the testbench:

```cpp

#ifdef CCS_SCVERIFY
#ifdef STALL

    testbench::X_wait_ctrl.cycles = Y;

#endif
#endif

```

### 6.2 Enabling STALL in the compiler

The second step is setting the compiler flag so the testbench code above is
actually compiled in.

In the GUI: `Tools > Set options.. > Input > Compiler Flags`

Enter `-DSTALL`.

![](/images/blog/catapult-journey-2/1.png)

From a script, add `-args -DSTALL` when adding the testbench file `tb.cpp`:

```bash
solution file add [file join $sfd tb.cpp] -type C++ -exclude true -args -DSTALL
```

Then recompile the design (create a new branch or solution to run it in).

### 6.3 Letting SCVerify insert the STALLs

Everything above is the designer inserting stalls deliberately. SCVerify can
also insert them into the interface automatically, via
`Architecture > "Top level module" > Insert STALL flags`.

![](/images/blog/catapult-journey-2/4.png)

Done this way the system is not stalled at the input or the output as above but
inside the `STALLER`, which is of limited use for testing.

## 7. Pipeline mode

A later post will cover this properly. Here I only want to flag the symptom, so
it does not catch anyone else out.

I had designed a pipelined circuit with II = 1 (initial interval = 1), but on
real hardware it kept hanging and results always arrived later than the design
figures said they should. Probing with ILA or Signal Tap, I could see that
whenever there was no input (VALID = '0') the system stalled outright instead
of carrying on and producing the result, even though all the input it needed
was already inside.

The cause was that I had never set the pipeline mode. It defaults to `STALL`
mode, so the moment there is no input (VALID = 0) or the output is not ready to
accept data (READY = 0), the whole pipeline stalls immediately.

Co-simulation did not reproduce it, and there is a reason: SCVerify keeps
pushing dummy data through to flush the pipeline chain at the end of each run,
as in the figure.

![](/images/blog/catapult-journey-2/5.png)

This is how to tell SCVerify to stop pushing dummy data:

```bash
options set Flows/SCVerify/DISABLE_EMPTY_INPUTS true
flow run /SCVerify/regenerate rtl v rtl.v
flow run /SCVerify/regenerate rtl vhdl rtl.vhdl
flow run /SCVerify/regenerate rtl vhdl concat_sim_rtl.vhdl
flow run /SCVerify/regenerate rtl v concat_sim_rtl.v

```

Note: the last four commands regenerate the makefile for all four kinds of
co-simulation (VHDL, concat-VHDL, Verilog, concat-Verilog). You only need the
one you actually use. Regenerating the makefile is mandatory for SCVerify to
behave correctly.

After that, the result looks like this:

![](/images/blog/catapult-journey-2/6.png)

The input goes INVALID as soon as there is no more data to feed in.

Back to the original problem: the setting above only makes the simulation
faithful to hardware. The fix itself is to set the pipeline mode to `Flush` or
`Bubble`, so that Catapult generates a controller that manages flushing when
the input goes invalid in a pipelined architecture. That is a topic for another
post.

![](/images/blog/catapult-journey-2/7.png)
