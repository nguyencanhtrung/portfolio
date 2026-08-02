---
title: 'Catapult Journey - Untimed C++ - lab 1'
description: 'Compiling, debugging and executing design using AC data-types'
date: 2022-11-02
lang: vi
key: catapult-journey-1
tags: ['catapult']
---

## 1. Mục đích

* Sử dụng g++ đi kèm với Catapult để biên dịch C/C++ model
* Biết đường dẫn của thư viện C/C++ của Catapult cũng như cách thêm thư viện vào khi biên dịch
* Debug lỗi data types
* Hiểu về cách hoạt động của phép dịch trái với AC data types

## 2. Makefile

Makefile bao gồm những thành phần sau để thực hiện được việc compiling C/C++ model

| Thư viện  | `IDIR =$(MGC_HOME)/shared/include`  |
| g++       | `CC=$(MGC_HOME)/bin/g++`            |
| C flag    | `CFLAGS=-g`                         |
| Debugger  | `$(MGC_HOME)/bin/gdb`               |


Makefile example:

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


### 2.1 Compiling cmd

```bash
$(CC) -o $(TDIR)/tb tb.cpp tb.cpp test_chan_assert.cpp -I$(IDIR) $(CFLAGS)
```
* `-o $(TDIR)/tb` : compile and put output file named `tb` at `$(TDIR)`
* `test_chan_assert.cpp`: source files
* `-I$(IDIR)` : include library which stores in `IDIR` variable
* `$CFLAGS` : C flag

### 2.2 Debuging cmd

```bash
$(MGC_HOME)/bin/gdb $(TDIR)/tb
```

## 3. Section 1

#### Understand makefile and simple errors

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

Compiling status

```bash
[administrator@centos lab1]$ make tb0
/opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/bin/g++ -o /opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/tmp/tb tb_pod_err.cpp test.cpp -I/opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/shared/include -g
tb_pod_err.cpp: In function ‘int main()’:
tb_pod_err.cpp:31:47: error: cannot pass objects of non-trivially-copyable type ‘class ac_fixed<3, 3, false, (ac_q_mode)1u, (ac_o_mode)1u>’ through ‘...’
     printf("sat_behavior = %3d, ",sat_behavior);
                                               ^
make: *** [tb0] Error 1
```

`sat_behavior` là kiểu `ac_fixed` do đó nó cần gọi method để convert về dạng unsigned integer.

```bash
 printf("sat_behavior = %3d, ",sat_behavior.to_uint());
 ```

## 4. Section 2
#### Working with debugger (dbg) to trace back the error cause in source code

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

Compiling status

```bash
make tb1
/opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/bin/g++ -o /opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/tmp/tb tb.cpp test_chan_assert.cpp -I/opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/shared/include -g
/opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/tmp/tb
Assert in file /opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/shared/include/ac_channel.h:229 Read from empty channel
tb: /opt/tools/Mentor/Catapult_2022.1_1/Mgc_home/shared/include/ac_channel.h:175: static void ac_channel<T>::ac_assert(bool, const char*, int, const ac_channel_exception::code&) [with T = ac_int<4, false>]: Assertion `0' failed.
make: *** [tb1] Aborted (core dumped)
[administrator@centos lab1]$ 

```

Lỗi này xảy ra khi xảy ra trường hợp đọc data từ empty channel. Ở error message, ta chỉ có thể nhìn thấy đoạn thông tin assert trong thư viện `ac_channel`. Để backtrack tới đoạn code lỗi, dbg được sử dụng như sau:


```bash
$(MGC_HOME)/bin/gdb $(TDIR)/tb
```

Chạy debugger (gdb)

```bash
(gdb) run
```

Gõ `up` để kiểm tra theo thứ tự từ trong ra ngoài của hierarchy, để phát hiện lỗi ở user source code.

Sau đó, gõ `quit` để thoát.


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

Ta thấy rằng dòng code `chan_in.read()` gây ra lỗi "read empty channel"

Giải pháp: Thực hiện kiểm tra channel có dữ liệu hay không trước khi thực hiện đọc như phần dưới đây

```cpp
// test_chan_assert

//....
 if (chan_in.available(1)) {          // Only read if channel not empty
    chan_out.write(chan_in.read());
 }
```

## 5. Section 3
#### Understand behaviour of shifting in AC data types

Khi thực hiện dịch trái một vector ac_* phải cast vector đó với một kích thước đủ lớn để đảm bảo giá trị của kết quả thu được phản ánh đúng toán tử dịch trái.

