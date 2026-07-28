---
title: '2. Catapult - Interfaces!'
description: 'Simple example to get familiar with Catapult HLS flow'
date: 2022-09-28
lang: en
key: 2-catapult-interfaces
tags: ['catapult']
---

## Catapult IO components

This part is a mess for me at the beginning actually at the moment also, but I will try to make more experiment. I do not really know why they have to make it so compilcated. As mentioned in the userguide, they provides 20 types of IOs (10 for Input and 10 for Output)

|<b>Input</b>           | <b>Output</b>       |
| ccs_in               | ccs_out              |    
| ccs_in_rdy           | ccs_out_prereg       |           
| ccs_in_rdy_coupled   | ccs_out_prereg_vld   |               
| ccs_in_vld           | ccs_out_rdy          |        
| ccs_in_wait          | ccs_out_vld          |        
| ccs_in_pipe          | ccs_out_wait         |         
| ccs_in_buf_wait      | ccs_out_pipe         |         
| ccs_ctrl_in_buf_wait | ccs_out_buf_wait     |             
| ccs_in_wait_coupled  | ccs_out_skidbuf_wait |                 
| ccs_in_wait_szchan   | ccs_stallbuf         |         

Based on userguide, it describes:
* Having VALID or READY signal or not. 
  * `_rdy` ready signal is available
  * `vld` valid signal is available
  * `wait` `pipe` both ready and valid is available
* Data registerd in IO component or not
* Handshaking signals registered in the IO component or not
* Process registerd in the main process ot not

What are IO component and main process?

Cai User guide nhi shit


## Wait Controller

Mỗi IO component có đuôi `_wait` handshake khi compile ra RTL sẽ sinh ra một khối `Wait Controller`. Tương ứng với IO components ta sẽ có 2 loại `Wait Controller`: Input và Output

Trong RTL, netlist, các khối `Wait Controller` sẽ được mô tả với đuôi `*:rsci` và `staller`


### Input wait controller


### Output wait controller 


## AXI4 Stream interface

In order for Catapult recognizes `_TLAST` and `_TUSER` correctly, it is required to declare `Stream_t` in the following order:

```cpp

struct Stream_t {
  uint128 TDATA;
  bool    TUSER;
  bool    TLAST;
};

```

`_TLAST` must be in the last.


Catapult <b>does not support byte positioning</b>, thereforem it requires

* `_TSTRB`, `_TKEEP` of input are all `1s`, if not it will assert `WARNING` when running RTL simulation.

On the other hand, developers cannot assign value for `_TSTRB` or `_TKEEP`, they are assigned to `1s` at output by default.


## AXI4 Lite interface

