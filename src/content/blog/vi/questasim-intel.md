---
title: 'Mô phỏng RTL với Questasim'
description: 'Mô phỏng RTL bằng QuestaSim trong flow của Intel: những lệnh cần thuộc, bộ script dùng lại được, và khác biệt giữa mô phỏng thiết kế không có IP bên thứ ba với thiết kế gọi Intel IP core cùng thư viện mô phỏng của chúng.'
date: 2022-11-23
lang: vi
key: questasim-intel
tags: ['sim']
---

## 1. Bắt đầu nhanh

Khác với EDA tool của Xilinx, Quartus không có simulator riêng; người dùng phải
dùng phần mềm bên thứ ba.

Gói cài Quartus có kèm sẵn simulator của Mentor Graphics:

* Modelsim-Intel SE (bản 21.3 trở về trước) hoặc Questasim-Intel FE (bản 22.1
  trở đi) — dùng được bằng license Quartus
* Modelsim-Intel PE (bản 21.3 trở về trước) hoặc Questasim-Intel FSE (bản 22.1
  trở đi) — cần license riêng

Các phần dưới đây mô tả từng bước cách dùng modelsim/questasim.

Ở đây tôi dùng bản Questasim-Intel FE.

### 1.1 Cài đặt

Để chạy modelsim hoặc questasim ở chế độ batch, chương trình phải nằm trong
`PATH` của shell. Sau khi cài Quartus, thêm hai dòng sau vào `~/.bashrc`, thay
`/opt/Intel/22.3/` bằng đường dẫn cài đặt của bạn:

```bash
export LD_LIBRARY_PATH=/opt/Intel/22.3/quartus/linux64:$LD_LIBRARY_PATH
export PATH=/opt/Intel/22.3/quartus/bin:/opt/Intel/22.3/questa_fe/bin:$PATH
```

### 1.2 Những lệnh cần thuộc

Phần này lấy từ [nguồn này](https://vhdlwhiz.com/the-modelsim-commands-you-need-to-know/).

**vlib**

Lệnh `vlib` tạo một design library. Bạn hẳn đã dùng những library như `ieee`
hay `std` trong code VHDL — code VHDL bạn viết ra cũng phải nằm trong một design
library.

Library mặc định của ModelSim là `work`. Nếu tạo project VHDL mới bằng GUI thì
tool tự tạo library này.

Nếu không chỉ định vị trí khác, mỗi design library sẽ hiện ra như một thư mục
trong thư mục project. Ví dụ code đã biên dịch thuộc library `work` thường nằm
ở thư mục con `./work`.

Tạo library `work` thủ công bằng `vlib`:

```bash
vlib work
```

Và xoá nó bằng `vdel`:

```bash
vdel -all -lib work
```

**vcom**

Đây là lệnh **biên dịch VHDL** của ModelSim. Gõ `vcom` kèm đường dẫn tới file
VHDL:

```bash
vcom ./my_module.vhd
```

Gọi `vcom` không kèm tham số nào khác thì module sẽ vào library mặc định
`work`.

Muốn biên dịch vào library khác thì dùng cờ `-work`:

```bash
vlib my_lib
vcom -quiet -work my_lib ./my_module.vhd
```

(Nhưng phải tạo `my_lib` bằng `vlib` trước đã.)

`vcom` có rất nhiều tham số tuỳ chọn để điều khiển chi tiết quy tắc biên dịch.
Danh sách đầy đủ nằm trong ModelSim Reference Manual.

Một lưu ý nữa: nếu cần **biên dịch Verilog** thì lệnh là

```bash
vlog -vlog01compat -work work ./dc_fifo.v
```

**vmap**

`vmap` cho xem và sửa ánh xạ giữa tên VHDL library và đường dẫn tới code đã
biên dịch trên filesystem (thư mục tạo bằng `vlib` và biên dịch vào bằng
`vcom`).

Liệt kê toàn bộ ánh xạ bằng cách gõ `vmap` không tham số:

```bash
vmap
```

Kết quả in ra danh sách các ánh xạ library, trong đó có những cái tên quen
thuộc như `ieee` và `std`. Các library chuẩn thường nằm trong thư mục cài đặt
ModelSim vì chúng đi kèm simulator.

Những library khác như `work` thì thường trỏ vào thư mục làm việc hiện tại,
`./work`.

```bash
VSIM 2> vmap
# Questa Intel FPGA Edition-64 vmap 2022.1 Lib Mapping Utility 2022.01 Jan 29 2022
# vmap 
# Reading modelsim.ini
# "work" maps to directory ./libraries/work/.
# "work_lib" maps to directory ./libraries/work/.
# "fifo_1911" maps to directory ./libraries/fifo_1911/.
# "dc_fifo" maps to directory ./libraries/dc_fifo/.
# Reading /opt/Intel/22.3/questa_fe/linux_x86_64/../modelsim.ini
# "std" maps to directory /opt/Intel/22.3/questa_fe/linux_x86_64/../std.
# "ieee" maps to directory /opt/Intel/22.3/questa_fe/linux_x86_64/../ieee.
# "vital2000" maps to directory /opt/Intel/22.3/questa_fe/linux_x86_64/../vital2000.
# "verilog" maps to directory /opt/Intel/22.3/questa_fe/linux_x86_64/../verilog.
# "std_developerskit" maps to directory /opt/Intel/22.3/questa_fe/linux_x86_64/../std_developerskit.
# "synopsys" maps to directory /opt/Intel/22.3/questa_fe/linux_x86_64/../synopsys.
# "modelsim_lib" maps to directory /opt/Intel/22.3/questa_fe/linux_x86_64/../modelsim_lib.
```

Thêm hoặc cập nhật một ánh xạ:

```bash
vmap lib_name path/to/the/lib/folder
```

Xoá một ánh xạ:

```bash
vmap -del lib_name
```

Cuối cùng, cần biết rằng `vmap` sửa trực tiếp file `modelsim.ini`. Vị trí của
file này thay đổi tuỳ máy. Có một bản nằm trong thư mục cài đặt ModelSim, nhưng
thường không ghi được nếu không có quyền admin.

Nếu cho phép ghi vào file INI đó thì `vmap` sẽ sửa. Nhưng cách tốt hơn là lấy
`modelsim.ini` của hệ thống làm template rồi copy về thư mục làm việc bằng cờ
`-c`:

```bash
vmap -c
```

Rồi trỏ biến môi trường vào bản copy đó:

```bash
set MODELSIM=<project_dir>/modelsim.ini
```

Từ lúc này, `vmap` và mọi lệnh khác cần tới file INI đều dùng bản
`modelsim.ini` cục bộ.

**vsim**

Đây là lệnh khởi động simulator VHDL (ModelSim). Gọi `vsim` từ shell không kèm
tham số thì **giao diện ModelSim** sẽ mở lên:

```bash
vsim
```

Chạy ở **chế độ batch**:

```bash
vsim -c
```

Một cờ hữu ích khác là `-do`, *cho phép chỉ định lệnh mà ModelSim sẽ chạy ngay
khi mở lên*. Ở đây kết hợp với cờ `-c` để in "Hello World!" ra console rồi
thoát:

```bash
vsim -c -do "echo Hello World!; exit"
```

Và tất nhiên có thể mô phỏng thẳng từ dòng lệnh. Chỉ cần đưa library và entity
của testbench, kết hợp với cờ `-do` để chạy mô phỏng:

```bash
vsim -c my_lib.my_tb -do "run -all"
```

Nếu chạy mô phỏng batch từ một script hay Makefile, có thể bạn cần trả về exit
code để script bên ngoài đọc được. Lệnh `exit` của ModelSim có cờ `-code` cho
việc đó:

```bash
vcom -quiet -2008 -work counter_lib ./counter.vhd
vcom -quiet -2008 -work counter_lib ./counter_tb.vhd
vsim -c counter_lib.counter_tb -do "run -all; exit -code 0"
```

**ModelSim Reference Manual**

Muốn tìm hiểu sâu hơn về các lệnh này và những lệnh khác, xem
[ModelSim Reference Manual](https://www.microsemi.com/document-portal/doc_view/131617-modelsim-reference-manual).
Tài liệu dài 455 trang, liệt kê toàn bộ lệnh của ModelSim kèm các tham số tuỳ
chọn.

Hoặc mở ngay trong ModelSim: Help -> PDF Documentation -> Reference Manual.

## 2. Cần gì để chạy mô phỏng

Để chạy mô phỏng trên Model/Questa-sim, cần chuẩn bị 3 thứ:

* Unit Under Test (UUT): mã nguồn thiết kế
* Testbench
* Script

Hai thứ đầu không có gì phải bàn thêm. Thứ ba mới là phần cần học nếu bạn
chuyển sang từ simulator khác, chẳng hạn XSIM của Xilinx.

### 2.1 Script

Có 3 script quan trọng dùng cho mô phỏng.

| Script                | Mô tả                 |
|:-                     |:-                     |
| `msim_setup.tcl`      | Quartus sinh ra       |
| `modelsim_files.tcl`  | Quartus sinh ra       |
| `*.do`                | Người dùng tự viết    |

**`modelsim_files.tcl`**

File không phụ thuộc thiết kế. Nó khai báo:

* các **library** cụ thể
* các **file thiết kế** thuộc về từng library đó
* các **memory file**

Nếu thiết kế dùng IP từ IP Catalog thì library mà các IP đó dùng, cùng phần
thiết kế của chúng, sẽ được khai báo trong file này. Khi chạy
`"Generate Simulator Setup Script"`, file này được sinh ra kèm đầy đủ thông tin
cần thiết.

Dưới đây là ví dụ một thiết kế dùng DC_FIFO lấy từ IP Catalog.

```bash
proc get_design_libraries {} {
  set libraries [dict create]
  dict set libraries fifo_1911 1
  dict set libraries dc_fifo   1
  return $libraries
}

proc get_memory_files {QSYS_SIMDIR} {
  set memory_files [list]
  return $memory_files
}

proc get_common_design_files {USER_DEFINED_COMPILE_OPTIONS USER_DEFINED_VERILOG_COMPILE_OPTIONS USER_DEFINED_VHDL_COMPILE_OPTIONS QSYS_SIMDIR} {
  set design_files [dict create]
  return $design_files
}

proc get_design_files {USER_DEFINED_COMPILE_OPTIONS USER_DEFINED_VERILOG_COMPILE_OPTIONS USER_DEFINED_VHDL_COMPILE_OPTIONS SIM_DIR} {
  set design_files [list]
  lappend design_files "vcom $USER_DEFINED_VHDL_COMPILE_OPTIONS $USER_DEFINED_COMPILE_OPTIONS  \"[normalize_path "$SIM_DIR/02.uut/01.fw_bm/dc_fifo/fifo_1911/sim/dc_fifo_fifo_1911_nytavei.vhd"]\"  -work fifo_1911"
  lappend design_files "vcom $USER_DEFINED_VHDL_COMPILE_OPTIONS $USER_DEFINED_COMPILE_OPTIONS  \"[normalize_path "$SIM_DIR/02.uut/01.fw_bm/dc_fifo/sim/dc_fifo.vhd"]\"  -work dc_fifo"                              
  return $design_files
  return $design_files
}

proc get_elab_options {SIMULATOR_TOOL_BITNESS} {
  set ELAB_OPTIONS ""
  if ![ string match "bit_64" $SIMULATOR_TOOL_BITNESS ] {
  } else {
  }
  append ELAB_OPTIONS { -t fs}
  return $ELAB_OPTIONS
}


proc get_sim_options {SIMULATOR_TOOL_BITNESS} {
  set SIM_OPTIONS ""
  if ![ string match "bit_64" $SIMULATOR_TOOL_BITNESS ] {
  } else {
  }
  return $SIM_OPTIONS
}


proc get_env_variables {SIMULATOR_TOOL_BITNESS} {
  set ENV_VARIABLES [dict create]
  set LD_LIBRARY_PATH [dict create]
  dict set ENV_VARIABLES "LD_LIBRARY_PATH" $LD_LIBRARY_PATH
  if ![ string match "bit_64" $SIMULATOR_TOOL_BITNESS ] {
  } else {
  }
  return $ENV_VARIABLES
}


proc normalize_path {FILEPATH} {
    if {[catch { package require fileutil } err]} { 
        return $FILEPATH 
    } 
    set path [fileutil::lexnormalize [file join [pwd] $FILEPATH]]  
    if {[file pathtype $FILEPATH] eq "relative"} { 
        set path [fileutil::relative [pwd] $path] 
    } 
    return $path 
} 

```

Trong ví dụ này tôi dùng 2 library được sinh ra khi gọi FIFO IP core từ IP
Catalog: `fifo_1911` và `dc_fifo`.

Còn `get_design_files` chính là chỗ thiết kế được nạp vào hai library đó bằng
lệnh `vcom`.

Lưu ý rằng đây thuần tuý là file khai báo; nó được dùng bởi file tiếp theo,
`msim_setup.tcl`.

**`msim_setup.tcl`**

File này dựng môi trường cho lần chạy mô phỏng. Nó đọc các khai báo từ
`modelsim_files.tcl` rồi biến chúng thành hành động thật: tạo mọi library mà
`get_design_libraries` trả về bằng `vlib`, ánh xạ chúng bằng `vmap`, và định
nghĩa các alias mà bạn sẽ gọi trong file `.do` của mình:

| Alias | Làm gì |
|:- |:- |
| `dev_com` | biên dịch thư viện device và thư viện mô phỏng của Intel |
| `com` | biên dịch các file IP do Quartus sinh ra |
| `elab` / `elab_debug` | elaborate thiết kế có tên trong `TOP_LEVEL_NAME`; bản `_debug` giữ đầy đủ visibility để xem waveform |
| `ld` / `ld_debug` | hai lệnh trên, rồi load luôn mô phỏng |

Hai biến file này yêu cầu phải đặt trước khi source nó: `QSYS_SIMDIR` là đường
dẫn tới thư mục mô phỏng do Quartus sinh ra, và `TOP_LEVEL_NAME` là entity
top-level cần elaborate. Bản thân file không chạy gì cả — nó chỉ định nghĩa;
mọi thứ chỉ bắt đầu khi bạn gọi các alias.

**`*.do`**

Đây là file duy nhất bạn tự viết. Nó source `msim_setup.tcl`, gọi `dev_com` và
`com` để dựng phần IP, biên dịch mã nguồn và testbench của mình bằng
`vcom`/`vlog`, đặt `TOP_LEVEL_NAME`, elaborate rồi chạy. Ví dụ đầy đủ nằm ở
phần 4.

Nhờ vậy, để mô phỏng "stand-alone" chỉ cần copy 3 script trên cùng mã nguồn và
testbench là chạy được trên máy khác.

## 3. Thiết kế không dùng IP core bên thứ ba

Với thiết kế không dùng Intel IP, có thể tạo project, biên dịch và mô phỏng
thẳng trong ModelSim theo flow sau:

https://www.intel.com/content/www/us/en/support/programmable/support-resources/design-examples/quartus/simulation-manual-howto.html

## 4. Thiết kế có dùng Intel IP core

Nếu thiết kế dùng Intel IP thì cần chạy
**Generate Simulator Setup Script for IP** để trích ra toàn bộ library phục vụ
mô phỏng.

```bash
Tools > Generate Simulator Setup Script for IP ...
```

Một lưu ý: khi **generate HDL** từ IP Editor, phải tick tuỳ chọn "Generate
simulation model" của IP core. Bỏ sót bước này thì việc sinh script sẽ lỗi do
thiếu simulation model.

Làm theo ví dụ
[ở đây](https://www.intel.com/content/www/us/en/docs/programmable/683305/19-4/simulation-quick-start.html)
để mô phỏng một project dùng Intel IP core.

Dưới đây là một file `mentor_example.do` hoàn chỉnh:

```bash
set QSYS_SIMDIR ../
# #
# # Source the generated IP simulation script.
source $QSYS_SIMDIR/mentor/msim_setup.tcl
# #
dev_com
# #
# # Call command to compile the Quartus-generated IP simulation files.
com
# #
# # Add commands to compile all design files and testbench files, including
# # the top level. (These are all the files required for simulation other
# # than the files compiled by the Quartus-generated IP simulation script)
vcom -work work ../src/dc_fifo/sim/dc_fifo.vhd
vcom -work work ../src/axi_lite_ctrl_S_AXI_LITE.vhd
vcom -work work ../src/axi_lite_ctrl.vhd
vcom -work work ../src/axis_handler.vhd
vcom -work work ../src/adapter.vhd
vcom -work work ../src/tb.vhd

# #
# # Set the top-level simulation or testbench module/entity name, which is
# # used by the elab command to elaborate the top level.
set TOP_LEVEL_NAME tb
# #
# # Set any elaboration options you require.
elab_debug
# #
# # Run the simulation.
# run -a
add wave *

view structure
view signals
# run -all
run 1 us

```

## 5. Cách dừng simulator

https://vhdlwhiz.com/how-to-stop-testbench/

### 5.1 Mô phỏng NIOS II

https://www.youtube.com/watch?v=Jw3rr76QEIc

[1] https://community.intel.com/t5/Nios-II-Embedded-Design-Suite/update-for-AN351/m-p/1351699#M51062
[2] https://community.intel.com/t5/Nios-II-Embedded-Design-Suite/AN351-really-confused-me/m-p/1351698#M51061
[3] https://community.intel.com/t5/Nios-II-Embedded-Design-Suite/Nios-II-simulation-with-Questa/m-p/1351656#M51059
