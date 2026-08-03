---
title: 'Catapult Journey - Untimed C++ - lab 2'
description: 'Lab 2 của loạt bài Catapult HLS: chạy một project bằng GUI rồi bằng script, đọc Gantt Chart và Design Analyzer để tìm điểm nghẽn, và cách chèn STALL trong RTL co-simulation để kiểm tra thiết kế dưới áp lực backpressure.'
date: 2022-11-04
lang: vi
key: catapult-journey-2
tags: ['catapult']
---

## 1. Mục đích

* Tổng hợp một thiết kế script-based và GUI-based
* Sử dựng Catapult Gantt Chart và Catapult Design Analyzer
* Setup và sử dụng simulation

## 2. Thiết kế với GUI
  
Một project sẽ được thực hiện theo thứ tự sau

![](/images/blog/catapult-journey-2/2.png)
![](/images/blog/catapult-journey-2/3.png)


**1. Thêm input files**
  * Thêm file testbench nhưng exclude khỏi quá trình biên dịch 
  * Chỉ cần thêm các file `*.cpp`, file header `*.h` sẽ được tự động thêm

**2. Cấu hình hierarchy**
  * Lựa chọn `top-level` module để tool biên dịch

**3. Cấu hình library**
  * Lựa chọn devices, part number, công nghệ và enable các thư viên về RAM, ROM ... tương ứng của mỗi vendor

**4. Cấu hình mapping**
  * clocking, reset (asynchronous hay synchronous; active high or active low)

**5. Cấu hình architecture**
  * Interface/ IOs
  * Memories
  * Loops

Quá trình phát triển sẽ sử dụng các thông tin từ `Gantt Chart` (chạy tab `Schedule`) và `Design Analyzer` để quan sát quá trình chuyển đổi từ high level model xuống RTL model. Từ đó, có thể lựa chọn được thiết kế tối ưu nhất với yêu cầu đề ra.

## 3. Thiết kế với script

Script-based thực hiện đúng theo quy trình của GUI-based ở trên. Dưới đây là một ví dụ

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

Có 2 cách khởi chạy script

**Script-based**


```bash
catapult -shell -file script.tcl
```

Mở `project` tạo ra từ script bằng cách 

```bash
catapult ./Catapult
```

**GUI-based**

Mở Catapult,

`File > Run Script..`

Trỏ đến script.


## 4. Catapult Gantt Chart

Cung cấp thông tin lập lịch của các operator. Người thiết kế có thể dựa vào thông tin này để tinh chỉnh việc lập lịch từ đó đạt được các yêu cầu đã đặt ra. 

Đây là một chủ đề nâng cao, chúng ta sẽ cùng tìm hiểu và làm rõ ở các dự án sắp tới.

## 5. Catapult Desing Analyzer

Cung cấp thông tin và cho phép cross-probed giữa 3 model: C/C++ model, HDL model (Verilog/VHDL), RTL model (Schematic, Schedule).

Design Analyzer cung cấp thông tin chính xác về tài nguyên của từng khối tương ứng với các giai đoạn của HLS từ `Compile` tới `Extract`

Người thiết kế có thể sử dụng thông tin này để kiểm tra các critical path trong thiết kế từ đó có những giải pháp tối ưu phù hợp.


## 6. RTL co-simulation

Để có thể mô phỏng được nhiều trường hợp có thể xảy ra trong thực tế, SCVerify cho phép người test chèn `STALL` vào input và output để kiểm tra trạng thái của hệ thống trong các trường hợp đó.

`STALL` tại input tương ứng với VALID = '0'

`STALL` tại output tương ứng với READY = '0'

Chèn `STALL` vào input hoặc output bao gồm hai công đoạn:

* Viết C/C++ testbench điều khiển quá trình chèn `STALL` vào input và output
* Cấu hình tool Compile tool để cho phép nhận flag `STALL` từ testbench

Hãy cùng tìm hiểu ví dụ sau đây để hiểu rõ hơn:

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


Đây là một testbench, nó được sử dụng để kiểm tra trạng thái của mạch `mult_add_pipeline`. Cách mạch này hoạt động không quan trọng trong vấn đề đang thảo luận ở đây. Hãy chú ý vào đoạn code:

### 6.1 Chèn STALL trong testbench

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

Đoạn code này sẽ thực hiện báo cho SCVERIFY thực hiện chèn `STALL` vào tín hiệu input `a` khi `i = 3` và chèn vào tín hiệu output `result` khi `i = 7`. Mỗi một `STALL` kéo dài 2 chu kỳ clock.

**Chú ý quan trọng** 

Để có thể chèn được `STALL` thì input và output phải được constraint về dạng `ccs_io_*_wait` để đảm bảo ngoài `DATA`, tín hiệu đó khi tổng hợp xuống RTL có đủ tín hiệu `VALID` và `READY`.

Chưa có giải pháp chèn `STALL` cho interface dạng `amba.ccs_axi4stream_in` hoặc `amba.ccs_axi4stream_out`. Xảy ra lỗi như sau:

```bash

../../src/crc_tb.cpp: In member function 'int testbench::main()':
Error: ../../src/crc_tb.cpp(73): error: 'stream_in_wait_ctrl' is not a member of 'testbench'
           testbench::stream_in_wait_ctrl.cycles = 20;
                      ^~~~~~~~~~~~~~~~~~~
Error: ../../src/crc_tb.cpp(76): error: 'stream_in_wait_ctrl' is not a member of 'testbench'
           testbench::stream_in_wait_ctrl.cycles = 20;
                      ^~~~~~~~~~~~~~~~~~~
```

**Cú pháp** 

Chèn `STALL` có độ dài `Y` chu kỳ clock cho một tín hiệu bất kỳ `X` trong testbench.

```cpp

#ifdef CCS_SCVERIFY
#ifdef STALL

    testbench::X_wait_ctrl.cycles = Y;

#endif
#endif

```

### 6.2 Cấu hình Compiler để enable STALL

Giai đoạn thứ 2 là cấu hình compiler flag để tổng hợp được đoạn code testbench trên.

Với GUI, truy cập `Tools > Set options.. > Input > Compiler Flags` 

Điền `-DSTALL` 

![](/images/blog/catapult-journey-2/1.png)

Với script-based, chèn `-args -DSTALL` khi thêm file testbench `tb.cpp`

```bash
solution file add [file join $sfd tb.cpp] -type C++ -exclude true -args -DSTALL
```
Sau đó, recompile lại thiết kế (tạo branch hoặc solution mới để chạy)

### 6.3 Tự động chèn `STALL` bởi SCVerify

Phần trên là hướng dẫn chèn `STALL` vào input và output bởi người thiết kế, SCVerify cho phép chèn STALL vào
interface một cách tự động. Bằng cách truy cập `Architecture > "Top level module" > Insert STALL flags`  

![](/images/blog/catapult-journey-2/4.png)

Cách này hệ thống không bị STALL ở input hay output như cách trên, mà được stall ở `STALLER`, không có ý nghĩa nhiều trong việc test.

## 7. Pipeline mode

Chúng ta sẽ tìm hiểu kỹ phần này ở những phần sau. Ở đây, tôi chỉ muốn giới thiệu thoáng quá về hiện tượng để người thiết kế chú ý hơn. 

Ở trường hợp của tôi, tôi đã thiết kế một mạch pipeline với II = 1 (Initial Interval = 1), tuy nhiên khi chạy trên mạch thật, nó liên tục bị treo và kết quả luôn được nhận chậm hơn so với thông số thiết kế. Khi probe ILA hay Signal Tap, tôi thấy rằng khi không có input (VALID = '0'), hệ thống sẽ `STALL` luôn mà không tiếp tục tính toán để đưa ra kết quả, mặc dù đã có đầy đủ Input.

Sau đó tôi nhận ra rằng, mình đã chưa cấu hình pipeline mode cho thiết kế. Nó được cấu hình mặc định ở `STALL` mode, nên khi ko có input (VALID = 0) hay output không sẵn sàng nhận dữ liệu (READY = 0), hệ thống sẽ bị STALL ngay lập tức. 

Tuy nhiên, khi mô phỏng co-simulation tôi lại không thấy được hiện tượng ấy. Lý do là SCVerify liên tục đẩy dummy data để flush toàn bộ data trong pipeline chain sau mỗi lần chạy như trong hình.

![](/images/blog/catapult-journey-2/5.png)

Dưới đây là cách cấu hình SCVerify để không tiếp tục đẩy dummy data.

```bash
options set Flows/SCVerify/DISABLE_EMPTY_INPUTS true
flow run /SCVerify/regenerate rtl v rtl.v
flow run /SCVerify/regenerate rtl vhdl rtl.vhdl
flow run /SCVerify/regenerate rtl vhdl concat_sim_rtl.vhdl
flow run /SCVerify/regenerate rtl v concat_sim_rtl.v

```
Chú ý: 4 commands dưới để regenerate lại makefile cho cả 4 loại cosimulation (VHDL, concat-VHDL, Verilog, concat-Verilog). Bạn chỉ cần dùng một loại trong đó. Việc Regenerate Makefile là bắt buộc để đảm bảo SCVerify chạy chính xác.

Sau command trên ta sẽ thấy kế quả như sau:

![](/images/blog/catapult-journey-2/6.png)

Input đã được INVALID ngay khi không còn dữ liệu được đưa vào.

Quay lại vấn đề trên, việc cấu hình trên đảm bảo việc mô phỏng chính xác như khi chạy thực tế, còn cách giải quyết vấn đề sẽ là: cấu hình pipeline mode ở dạng `Flush` hoặc `Bubble` để Catapult tự động tạo controller kiểm soát việc flushing dữ liệu khi Input invalid trong các kiến trúc pipeline. Chúng ta sẽ phân tích chủ đề này ở một bài khác.

![](/images/blog/catapult-journey-2/7.png)