---
title: 'Quartus - Nạp bitstream cho FPGA'
description: 'Nạp FPGA từ dòng lệnh bằng quartus_pgm và jtagconfig, kể cả JTAG daemon, cùng hai lỗi từng ngốn khá nhiều thời gian: nhiều programming cable cùng cắm, và kit Cyclone 10 GX đổi USB ID ngay giữa lúc nạp.'
date: 2022-10-01
lang: vi
key: quartus-program-fpga
tags: ['intel']
---

## 1. Dòng lệnh

Các chương trình như `quartus_pgm`, `jtagconfig`… nằm trong thư mục cài Quartus
hoặc trong thư mục FPGA programmer bản standalone.

```bash
export LD_LIBRARY_PATH=/home/administrator/data/intelFPGA_pro/21.3/qprogrammer/quartus/linux64:$LD_LIBRARY_PATH
export PATH=/home/administrator/data/intelFPGA_pro/21.3/qprogrammer/quartus/bin:$PATH
```

Export thư viện và chương trình để dùng cho các phần sau.

### 1.1 Quét JTAG

Liệt kê toàn bộ device tìm thấy (cable được tự động nhận diện):

```bash
quartus_pgm --auto
```

Lưu ý là bước liệt kê này không bắt buộc để nạp bitstream. Nó hữu ích để biết
vị trí của FPGA trong JTAG chain — kiểu việc làm một lần cho biết board có gì.

Trường hợp máy có nhiều hơn một programming cable, chương trình sẽ không xác
định được vị trí FPGA trong JTAG chain:

```bash
$ quartus_pgm --auto
Error (213043): More than one programming cable found in available hardware list 
    -- use --list option to display available hardware list and specify correct 
    programming cable
```

Dùng lệnh sau:

```bash
quartus_pgm --list
```

```bash
$ quartus_pgm --list
Info: *******************************************************************
Info: Running Quartus Prime Programmer
    Info: Version 21.3.0 Build 170 09/23/2021 SC Pro Edition
    Info: Copyright (C) 2021  Intel Corporation. All rights reserved.
    Info: Your use of Intel Corporation's design tools, logic functions 
    Info: and other software and tools, and any partner logic 
    Info: functions, and any output files from any of the foregoing 
    Info: (including device programming or simulation files), and any 
    Info: associated documentation or information are expressly subject 
    Info: to the terms and conditions of the Intel Program License 
    Info: Subscription Agreement, the Intel Quartus Prime License Agreement,
    Info: the Intel FPGA IP License Agreement, or other applicable license
    Info: agreement, including, without limitation, that your use is for
    Info: the sole purpose of programming logic devices manufactured by
    Info: Intel and sold by Intel or its authorized distributors.  Please
    Info: refer to the applicable agreement for further details, at
    Info: https://fpgasoftware.intel.com/eula.
    Info: Processing started: Fri Apr  6 15:03:43 2018
    Info: System process ID: 3834
Info: Command: quartus_pgm --list
1) USB-Blaster [3-5.3]
2) USB-BlasterII [3-5.4]
3) USB-Blaster on jtagsrv.local [3-5.3]
4) USB-BlasterII on jtagsrv.local [3-5.4]
5) Remote server jtagsrv.local:1310: Unable to connect
Info: Quartus Prime Programmer was successful. 0 errors, 0 warnings
    Info: Peak virtual memory: 714 megabytes
    Info: Processing ended: Fri Apr  6 15:03:44 2018
    Info: Elapsed time: 00:00:01
    Info: System process ID: 3834
```

Có 2 cable JTAG là USB-Blaster và USB-BlasterII. Giờ kiểm tra xem device nào
nối với cable nào:

```bash
jtagconfig -n
```

hoặc

```bash
jtagconfig -d
```

```bash
$ jtagconfig -n
1) USB-Blaster [3-5.3]
  Unable to read device chain - JTAG chain broken

2) USB-BlasterII [3-5.4]
  C32150DD   1SG280HH(1S2|2S2|3S2)/..
    Design hash    61CD1EC1369D1744384D
    + Node 19104600  Nios II #0
    + Node 30006E00  Signal Tap #0
    + Node 0C006E00  JTAG UART #0

3) USB-Blaster on jtagsrv.local [3-5.3]
  Unable to read device chain - JTAG chain broken

4) USB-BlasterII on jtagsrv.local [3-5.4]
  C32150DD   1SG280HH(1S2|2S2|3S2)/..
    Design hash    61CD1EC1369D1744384D
    + Node 19104600  Nios II #0
    + Node 30006E00  Signal Tap #0
    + Node 0C006E00  JTAG UART #0

5) Remote server jtagsrv.local:1310: Unable to connect
```

Cable số 2 (USB-BlasterII) đang nối với board Stratix 10 GX (1SG280HH).

### 1.2 JTAGD daemon

Daemon này lắng nghe ở cổng TCP/IP 1309. Nó chịu trách nhiệm nói chuyện với
JTAG adapter qua USB, nên cả GUI programmer lẫn công cụ dòng lệnh đều phụ thuộc
vào nó. Nếu chưa có daemon nào chạy, cả hai đều tự khởi động nó.

Nhưng nếu máy cài nhiều phiên bản Quartus thì đây là nguồn gây rối, đặc biệt
khi bạn thử nạp FPGA bằng bản cũ trước rồi mới chuyển sang bản mới. Lý do là
bản Quartus mới vẫn tiếp tục dùng `jtagd` của bản cũ, mà `jtagd` cũ có thể
không hỗ trợ những dòng FPGA mà bản Quartus mới hỗ trợ. Kết luận: khi thấy hiện
tượng lạ, lệnh này thường chữa được và không gây hại gì:

```bash
killall jtagd
```

### 1.3 Nạp FPGA

`quartus_pgm` in phần lớn output bằng chữ màu xanh lá. Nói chung, không có chữ
đỏ là mọi thứ ổn.

```bash
quartus_pgm -m jtag -o "p;path/to/file.sof"
```

Hoặc chỉ định rõ vị trí của FPGA trong JTAG chain (nhất là khi nó không phải
device đầu tiên). Ở đây là `@1`, tức device đầu tiên trong chain. Nếu là device
thứ hai thì dùng `@2`, v.v.

```bash
$ quartus_pgm -m jtag -o "p;path/to/file.sof@1"
Info: *******************************************************************
Info: Running Quartus Prime Programmer
    Info: Version 15.1.0 Build 185 10/21/2015 SJ Lite Edition
    Info: Copyright (C) 1991-2015 Altera Corporation. All rights reserved.
    Info: Your use of Altera Corporation's design tools, logic functions
    Info: and other software and tools, and its AMPP partner logic
    Info: functions, and any output files from any of the foregoing
    Info: (including device programming or simulation files), and any
    Info: associated documentation or information are expressly subject
    Info: to the terms and conditions of the Altera Program License
    Info: Subscription Agreement, the Altera Quartus Prime License Agreement,
    Info: the Altera MegaCore Function License Agreement, or other
    Info: applicable license agreement, including, without limitation,
    Info: that your use is for the sole purpose of programming logic
    Info: devices manufactured by Altera and sold by Altera or its
    Info: authorized distributors.  Please refer to the applicable
    Info: agreement for further details.
    Info: Processing started: Sun May 27 15:35:02 2018
Info: Command: quartus_pgm -m jtag -o p;path/to/file.sof@1
Info (213045): Using programming cable "USB-BlasterII [2-5.1]"
Info (213011): Using programming file p;path/to/file.sof@1 with checksum 
               0x061958E1 for device 5CGTFD9E5F35@1
Info (209060): Started Programmer operation at Sun May 27 15:35:05 2018
Info (209016): Configuring device index 1
Info (209017): Device 1 contains JTAG ID code 0x02B040DD
Info (209007): Configuration succeeded -- 1 device(s) configured
Info (209011): Successfully performed operation(s)
Info (209061): Ended Programmer operation at Sun May 27 15:35:09 2018
Info: Quartus Prime Programmer was successful. 0 errors, 0 warnings
    Info: Peak virtual memory: 432 megabytes
    Info: Processing ended: Sun May 27 15:35:09 2018
    Info: Elapsed time: 00:00:07
    Info: Total CPU time (on all processors): 00:00:03
```

Nếu có gì đó sai — device không khớp, quét JTAG chain thất bại hay bất cứ lỗi
nào khác — thì không thể bỏ sót được, vì lỗi in ra màu đỏ. Điểm hay của giao
diện dòng lệnh là mỗi lần chạy đều bắt đầu lại từ đầu, nên chỉ cần bật lại
board rồi thử tiếp.

**Khi cắm nhiều cable JTAG cùng lúc, bắt buộc phải chỉ rõ nạp qua cable nào.**

```bash
quartus_pgm -c $1 -m JTAG -o p\;$BITSTREAM@$2
```

`$BITSTREAM` đường dẫn tới bitstream

`$1` vị trí của cable JTAG

`$2` vị trí của FPGA trong JTAG chain

Ví dụ:

```bash
$ jtagconfig -n
1) USB-Blaster [3-5.3]
  Unable to read device chain - JTAG chain broken

2) USB-BlasterII [3-5.4]
  C32150DD   1SG280HH(1S2|2S2|3S2)/..
    Design hash    61CD1EC1369D1744384D
    + Node 19104600  Nios II #0
    + Node 30006E00  Signal Tap #0
    + Node 0C006E00  JTAG UART #0

3) USB-Blaster on jtagsrv.local [3-5.3]
  Unable to read device chain - JTAG chain broken

4) USB-BlasterII on jtagsrv.local [3-5.4]
  C32150DD   1SG280HH(1S2|2S2|3S2)/..
    Design hash    61CD1EC1369D1744384D
    + Node 19104600  Nios II #0
    + Node 30006E00  Signal Tap #0
    + Node 0C006E00  JTAG UART #0

5) Remote server jtagsrv.local:1310: Unable to connect
```

Nạp qua cable thứ 2 (USB-BlasterII) — FPGA (Stratix 10 GX) nằm ở vị trí đầu
tiên của JTAG chain:

```bash
quartus_pgm -c 2 -m JTAG -o p\;$BITSTREAM@1
```

## 2. Các lỗi gặp phải

### 2.1 Cyclone 10 GX FPGA development kit

Board này gây khá nhiều rắc rối nên xin nói kỹ. Khi cắm vào máy tính, nó xuất
hiện với ID `09fb:6810`; nhưng sau khi thử nạp FPGA (chú ý `@2` ở cuối lệnh):

```bash
$ quartus_pgm -m jtag -o "p;thecode.sof@2"
Error (213019): Can't scan JTAG chain. Error code 86.
```

thì ID của thiết bị đổi thành `09fb:6010`. Rõ ràng có một quá trình nạp lại
firmware ở đây (system log ghi nhận thiết bị ngắt kết nối rồi kết nối lại với
ID mới). Board được GUI Programming Tool của Quartus nhận là GX0000406, nhưng
bấm "Auto Detect" thì báo "Unable to scan device chain. Hardware is not
connected".

Thử quét xem sao:

```bash
$ quartus_pgm --auto
[ ... ]
Info (213045): Using programming cable "10CGX0000406 [1-5.1.2]"
1) 10CGX0000406 [1-5.1.2]
  Unable to read device chain - Hardware not attached
```

Vấn đề trong trường hợp của tôi hoá ra là `jtagd` đang chạy được khởi động bởi
một bản Quartus cũ, và bản đó không nhận biết dòng Cyclone 10. Vậy nên làm theo
lời khuyên ở trên: kill nó đi. Sau đó nạp bằng lệnh trên chạy ngon với Quartus
Pro 17.1:

```bash
$ quartus_pgm --auto
[...]
Info (213045): Using programming cable "USB-BlasterII [1-5.1.2]"
1) USB-BlasterII [1-5.1.2]
  031820DD   10M08SA(.|ES)/10M08SC
  02E120DD   10CX220Y
```

### 2.2 Sai JTAG ID

Thiết kế chạy trên Stratix 10 GX development kit, chip FPGA là
"1SG280HU2F50E2VG". Tuy nhiên khi đặt đúng device đó, sinh bitstream rồi nạp
xuống board thì báo lỗi sau:

```bash
$ ./pgm.sh 2 1 ./bitstream/gx_board/qts_pcie.sof 
Info (19848): Regular SEU info => 105 sector(s), 8 thread(s), 31500 interval time in microsecond(s)
Info (19848): Keyed hash is 211E9227EA2B2E8AC9DACF53399D089EC8DD58B9ACDAF5778CDB73A7649CCC7E
Info (19848): Design hash is AB12DA18E7670B96A68615F35D525C4800000000000000000000000000000000
Info (19848): Keyed hash is D1646D223F62049C8AB8396FDF9647ADE0682883F8B03AFEA30C1A39D68AC4B8
Info: *******************************************************************
Info: Running Quartus Prime Programmer
    Info: Version 21.3.0 Build 170 09/23/2021 SC Pro Edition
    Info: Copyright (C) 2021  Intel Corporation. All rights reserved.
    Info: Your use of Intel Corporation's design tools, logic functions 
    Info: and other software and tools, and any partner logic 
    Info: functions, and any output files from any of the foregoing 
    Info: (including device programming or simulation files), and any 
    Info: associated documentation or information are expressly subject 
    Info: to the terms and conditions of the Intel Program License 
    Info: Subscription Agreement, the Intel Quartus Prime License Agreement,
    Info: the Intel FPGA IP License Agreement, or other applicable license
    Info: agreement, including, without limitation, that your use is for
    Info: the sole purpose of programming logic devices manufactured by
    Info: Intel and sold by Intel or its authorized distributors.  Please
    Info: refer to the applicable agreement for further details, at
    Info: https://fpgasoftware.intel.com/eula.
    Info: Processing started: Fri Apr  6 20:28:47 2018
    Info: System process ID: 18686
Info: Command: quartus_pgm -c 2 -m JTAG -o p;./bitstream/gx_board/qts_pcie.sof@1
Info (213045): Using programming cable "USB-BlasterII [3-3.4]"
Info (213011): Using programming file ./bitstream/gx_board/qts_pcie.sof with 
               checksum 0x44DFA482 for device 1SG280HU2F50@1
Info (209060): Started Programmer operation at Fri Apr  6 20:28:57 2018
Info (18942): Configuring device index 1
Error (18952): Error status: The device chain in Programmer does not match physical device chain. 
               Expected JTAG ID code 0xC32250DD for device 1, but found JTAG ID code 0xC32150DD.
Error (209012): Operation failed
Info (209061): Ended Programmer operation at Fri Apr  6 20:28:57 2018
Error: Quartus Prime Programmer was unsuccessful. 2 errors, 0 warnings
    Error: Peak virtual memory: 2237 megabytes
    Error: Processing ended: Fri Apr  6 20:28:57 2018
    Error: Elapsed time: 00:00:10
    Error: System process ID: 18686
```

#### Quy trình debug

* **Kiểm tra thứ tự các cable JTAG**
* **Kiểm tra vị trí của chip FPGA**

```bash
jtagconfig -d
1) USB-Blaster [3-3.3]
   (JTAG Server Version 21.3.0 Build 170 09/23/2021 SC Pro Edition)
  Unable to read device chain - JTAG chain broken

  Captured DR after reset = ()
  Captured IR after reset = ()
  Captured Bypass after reset = ()
  Captured Bypass chain = ()
  JTAG clock speed 6 MHz

2) USB-BlasterII [3-3.4]
   (JTAG Server Version 21.3.0 Build 170 09/23/2021 SC Pro Edition)
  C32150DD   1SG280HH(1S2|2S2|3S2)/.. (IR=10)
    Design hash    D41D8CD98F00B204E980
    + Node 08986E00  Nios V #0

  Captured DR after reset = (C32150DD) [32]
  Captured IR after reset = (001) [10]
  Captured Bypass after reset = (0) [1]
  Captured Bypass chain = (0) [1]
  JTAG clock speed auto-adjustment is enabled. To disable, set JtagClockAutoAdjust parameter to 0
  JTAG clock speed 24 MHz

3) Remote server jtagsrv.local: Unable to connect

   (JTAG Server version information not available)
4) Remote server jtagsrv.local:1310: Unable to connect

   (JTAG Server version information not available)

```

Log này có nghĩa: target được nạp qua cable thứ 2 (USB-BlasterII) và chip FPGA
nằm ở vị trí đầu tiên.
  `C32150DD   1SG280HH(1S2|2S2|3S2)/.. (IR=10)`

Nếu log hiện ra như thế này:

```bash
1) USB-BlasterII [1-2.3]
020A40DD 5M(1270ZF324|2210Z)/EPM2210
C32250DD 1SG280HH1(.|S3|AS)/1SG280HH2/..
```

thì có nghĩa chip FPGA nằm ở vị trí thứ hai, còn vị trí đầu tiên là chip
1270ZF324.

Trong lệnh nạp, tôi đã đặt đúng tham số cho thứ tự cable và vị trí chip FPGA.

* **Kiểm tra JTAG ID và chip tương ứng với nó**

Danh sách tra cứu
[ở đây](https://bsdl.info/list.htm?f=828&page=1&sort=name&sorttype=true).

Hoá ra FPGA trên board là `1SG280LU2F50E2VG`, ứng với `Jtag ID: 0xC32250DD`.
Đây là bản L-Tile của GX development kit, trong khi giả định ban đầu của chúng
tôi là bản H-Tile.

Bài học rút ra: mã part in trên development kit không phải là bằng chứng về con
chip thực sự nằm trên đó. `jtagconfig` đọc JTAG ID ra từ chính con silicon —
hãy lấy con số đó đi tra bảng BSDL rồi đặt device trong project theo kết quả
tra được, chứ đừng đặt theo nhãn của kit.
