---
title: 'Catapult Journey - Untimed C++ - lab 1'
description: 'Lab 1 of the Catapult HLS series: a Makefile for compiling and debugging the C++ model, how to read the errors it produces, and how shifting behaves on ac_int/ac_fixed — where bits go missing without a single warning.'
date: 2022-11-02
lang: en
key: catapult-journey-1
tags: ['catapult']
---

## 1. Goals

* Compile the C/C++ model with the g++ that ships with Catapult
* Know where Catapult's C/C++ libraries live and how to add them to the build
* Debug data-type errors
* Understand how left shift behaves on AC data types

## 2. Makefile

A Makefile needs these four pieces to compile the C/C++ model:

| Library   | `IDIR =$(MGC_HOME)/shared/include`  |
| g++       | `CC=$(MGC_HOME)/bin/g++`            |
| C flag    | `CFLAGS=-g`                         |
| Debugger  | `$(MGC_HOME)/bin/gdb`               |

An example Makefile:

```bash
IDIR =$(MGC_HOME)/shared/include
TDIR ?= $(MGC_HOME)/tmp
CC=$(MGC_HOME)/bin/g++
CFLAGS=-g

tb0: tb_pod_err.cpp test_chan_assert.cpp
  $(CC) -o $(TDIR)/tb tb_pod_err.cpp test.cpp -I$(IDIR) $(CFLAGS)
tb1: tb.cpp test_chan_assert.cpp
  $(CC) -o $(TDIR)/tb tb.cpp test_chan_assert.cpp -I$(IDIR) $(CFLAGS)
  $(TDIR)/tb
tb1_debug: tb.cpp test_chan_assert.cpp
  $(CC) -o $(TDIR)/tb tb.cpp test_chan_assert.cpp -I$(IDIR) $(CFLAGS)
  $(MGC_HOME)/bin/gdb $(TDIR)/tb
tb2: tb.cpp test_shift_loss.cpp
  $(CC) -o $(TDIR)/tb tb.cpp test_shift_loss.cpp -I$(IDIR) $(CFLAGS)
  $(TDIR)/tb
tb3: tb.cpp test.cpp
  $(CC) -o $(TDIR)/tb tb.cpp test.cpp -I$(IDIR) $(CFLAGS)
  $(TDIR)/tb

.PHONY: clean
clean:
  rm -f $(TDIR)/tb 
```

### 2.1 Compile command

```bash
$(CC) -o $(TDIR)/tb tb.cpp tb.cpp test_chan_assert.cpp -I$(IDIR) $(CFLAGS)
```

* `-o $(TDIR)/tb`: compile and put the output file named `tb` in `$(TDIR)`
* `test_chan_assert.cpp`: the source files
* `-I$(IDIR)`: include the library stored in the `IDIR` variable
* `$CFLAGS`: C flags

### 2.2 Debug command

```bash
$(MGC_HOME)/bin/gdb $(TDIR)/tb
```

## 3. Reading the Makefile and the simple errors

```cpp
//test_chan_assert.cpp

#include "test.h"

void test(ac_int<4,false>                   data0,
          ac_fixed<5,5,false>               data1,
          ac_channel<ac_int<4,false> >      &chan_in,
          ac_int<3,false>                   &wrap_behavior,
          ac_fixed<3,3,false,AC_RND,AC_SAT> &sat_behavior,
          ac_int<5,false>                   &shift_behavior,
          ac_channel<ac_int<4,false> >      &chan_out)
{
  wrap_behavior = data0;               // will wrap for values > 7
  sat_behavior = data1;                // will clamp to 7 for values > 7
  shift_behavior = data0 << 1;         // will lose MSB after shift

  chan_out.write(chan_in.read());      // will assert if read of empty 
                                       // channel is attempted
}

```

```cpp

// tb_pod_err.cpp

#include "test.h"

#include <stdio.h>
#include <fstream>
using namespace std;

int main()
{
  ac_int<4,false> data0; // 4 bit unsigned, 0 to 15
  ac_fixed<5,5,false> data1;
  ac_channel<ac_int<4,false> > chan_in;
  ac_int<3,false> wrap_behavior;
  ac_fixed<3,3,false,AC_RND,AC_SAT> sat_behavior;
  ac_int<5,false> shift_behavior;
  ac_channel<ac_int<4,false> > chan_out;

  for (int i=0; i<16; i++) {
    if (i>0) {
      chan_in.write(i);
    }
    data0 = i;
    data1 = i;

    test(data0,data1,chan_in,wrap_behavior,sat_behavior,shift_behavior,chan_out);

    printf("Input = %3d ",data0.to_uint());
    printf("wrap_behavior = %3d, ",wrap_behavior.to_uint());
    printf("sat_behavior = %3d, ",sat_behavior);
    printf("shift_behavior = %3d\n",shift_behavior.to_uint());
  }
  return 0;
}


```

The compile result:

```bash
[administrator@centos lab1]$ make tb0
/opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/bin/g++ -o /opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/tmp/tb tb_pod_err.cpp test.cpp -I/opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/shared/include -g
tb_pod_err.cpp: In function ‘int main()’:
tb_pod_err.cpp:31:47: error: cannot pass objects of non-trivially-copyable type ‘class ac_fixed<3, 3, false, (ac_q_mode)1u, (ac_o_mode)1u>’ through ‘...’
     printf("sat_behavior = %3d, ",sat_behavior);
                                               ^
make: *** [tb0] Error 1
```

`sat_behavior` is an `ac_fixed`, so it needs a method call to convert it to an
unsigned integer before it can go through `printf`'s variadic arguments.

```bash
 printf("sat_behavior = %3d, ",sat_behavior.to_uint());
 ```

## 4. Using the debugger to trace an error back to the source code

```cpp
// tb.cpp
#include "test.h"

#include <stdio.h>
#include <fstream>
using namespace std;

int main()
{
  ac_int<4,false> data0; // 4 bit unsigned, 0 to 15
  ac_fixed<5,5,false> data1;
  ac_channel<ac_int<4,false> > chan_in;
  ac_int<3,false> wrap_behavior;
  ac_fixed<3,3,false,AC_RND,AC_SAT> sat_behavior;
  ac_int<5,false> shift_behavior;
  ac_channel<ac_int<4,false> > chan_out;

  for (int i=0; i<16; i++) {
    if (i>0) {
      chan_in.write(i);
    }
    data0 = i;
    data1 = i;

    test(data0,data1,chan_in,wrap_behavior,sat_behavior,shift_behavior,chan_out);

    printf("Input = %3d ",data0.to_uint());
    printf("wrap_behavior = %3d, ",wrap_behavior.to_uint());
    printf("sat_behavior = %3d, ",sat_behavior.to_uint());
    printf("shift_behavior = %3d\n",shift_behavior.to_uint());
  }

  printf("\nChannel data = ");

  while (chan_out.available(1)) { // while data in channel, keep reading
    ac_int<4,false> data = chan_out.read();
    printf("%2d ",data.to_uint());
  }

  printf("\n\n");
  return 0;
}
```

The compile result:

```bash
make tb1
/opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/bin/g++ -o /opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/tmp/tb tb.cpp test_chan_assert.cpp -I/opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/shared/include -g
/opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/tmp/tb
Assert in file /opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/shared/include/ac_channel.h:229 Read from empty channel
tb: /opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/shared/include/ac_channel.h:175: static void ac_channel<T>::ac_assert(bool, const char*, int, const ac_channel_exception::code&) [with T = ac_int<4, false>]: Assertion `0' failed.
make: *** [tb1] Aborted (core dumped)
[administrator@centos lab1]$ 

```

This fires when something reads from an empty channel. The message alone only
points into the `ac_channel` library, never at your own code. To get back to
the offending line, run it under the debugger:

```bash
$(MGC_HOME)/bin/gdb $(TDIR)/tb
```

Start it:

```bash
(gdb) run
```

Then type `up` repeatedly to walk out of the library frames until you land in
your own source. Type `quit` to leave.

```bash
Program received signal SIGABRT, Aborted.
0x00007ffff7223387 in raise () from /lib64/libc.so.6
(gdb) up
#1  0x00007ffff7224a78 in abort () from /lib64/libc.so.6
(gdb) ip
Undefined command: "ip".  Try "help".
(gdb) up
#2  0x00007ffff721c1a6 in __assert_fail_base () from /lib64/libc.so.6
(gdb) up
#3  0x00007ffff721c252 in __assert_fail () from /lib64/libc.so.6
(gdb) up
#4  0x0000000000401b1f in ac_channel<ac_int<4, false> >::ac_assert (condition=false, 
    file=0x4039c8 "/opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/shared/include/ac_channel.h", line=229, 
    code=@0x7fffffffd88c: ac_channel_exception::read_from_empty_channel)
    at /opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/shared/include/ac_channel.h:175
175           assert(0);
(gdb) up
#5  0x00000000004026c2 in ac_channel<ac_int<4, false> >::fifo::fifo_ac_channel::read (this=0x608010)
    at /opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/shared/include/ac_channel.h:229
229           AC_CHANNEL_ASSERT(!empty(), ac_channel_exception::read_from_empty_channel);
(gdb) up
#6  0x0000000000401755 in ac_channel<ac_int<4, false> >::fifo::read (this=0x7fffffffd9e0)
    at /opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/shared/include/ac_channel.h:402
402     inline T read() { return f->read(); }
(gdb) up
#7  0x000000000040152e in ac_channel<ac_int<4, false> >::read (this=0x7fffffffd9e0)
    at /opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/shared/include/ac_channel.h:118
118   T read() { return chan.read(); }
(gdb) up
#8  0x0000000000403465 in test (data0=..., data1=..., chan_in=..., wrap_behavior=..., sat_behavior=..., 
    shift_behavior=..., chan_out=...) at test_chan_assert.cpp:18
18    chan_out.write(chan_in.read());      // will assert if read of empty channel is attempted
(gdb) 

```

Frame #8 is the answer: `chan_in.read()` is what read the empty channel.

The fix is to check that the channel has data before reading it:

```cpp
// test_chan_assert

//....
 if (chan_in.available(1)) {          // Only read if channel not empty
    chan_out.write(chan_in.read());
 }
```

## 5. How shifting behaves on AC data types

This is the quietest bug in the lab, because it neither asserts nor fails to
compile — it just produces the wrong number.

```cpp
ac_int<4,false> data0;          // 4 bits, 0..15
ac_int<5,false> shift_behavior;

shift_behavior = data0 << 1;    // MSB is gone
```

The habit from plain C is that assigning into a wider variable leaves room for
the result. AC data types do not work that way: `data0 << 1` is evaluated **in
the type of `data0`**, that is `ac_int<4,false>`, so the top bit falls off the
end before the assignment ever happens. Making `shift_behavior` 5 bits wide
does not help, because by then the bit is already lost. With `data0 = 12` the
result is 8, not 24.

Cast to a type wide enough to hold the result **before** shifting:

```cpp
shift_behavior = ac_int<5,false>(data0) << 1;
```

The general rule: an `n`-bit left shift needs an intermediate type `n` bits
wider than the operand. It is also the reason to size every node in the
datapath deliberately rather than trusting inference — HLS synthesizes exactly
what the C++ model describes, including the bits it threw away.
