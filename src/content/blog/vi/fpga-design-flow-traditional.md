---
title: 'FPGA design flow – Traditional flow'
description: 'Chu trình thiết kế IP core theo traditional flow, đi từ informal specification qua floating-point và fixed-point model, RTL design, synthesis, implementation, tới bitstream — kèm việc mỗi bước simulation thực sự bảo đảm được điều gì.'
date: 2017-10-16
lang: vi
key: fpga-design-flow-traditional
tags: ['rtl']
---

> Bài này lấy về từ blog cá nhân cũ của tôi, [unicornsnippets](https://unicornsnippets.wordpress.com/2017/10/16/fpga-note-design-flow/) (2017-10-16).

**Design flow – các bước thiết kế một IP core** là kiến thức vô cùng quan trọng
và cần được nắm vững bởi bất kỳ FPGA developer nào. Bài viết này lần lượt phân
tích các design flow đang được sử dụng, cũng như giải thích về sự ra đời của
chúng.

Chúng ta bắt đầu từ "traditional design flow" — chu trình thiết kế thông dụng
nhất và được áp dụng phổ biến.

## 1. Specification

Khi khách hàng A đặt công ty B thiết kế một IP core C, họ phải liệt kê những
đặc tính của IP core đó và trao thông tin này cho công ty thiết kế. Những thông
tin như vậy được gọi là "**informal specification**".

Lấy một ví dụ: công ty A muốn đặt một IP core tính diện tích hình tròn. IP core
đó có những đặc tính sau:

* IP core hỗ trợ tính toán cho số single precision floating point
* Tuân theo chuẩn làm tròn của IEEE
* Sai số của phép tính không quá 0.1%
* Throughput < 500 ps
* Latency < 10 ns

Những gạch đầu dòng trên chính là informal specification dùng để thiết kế IP
core.

## 2. Modeling

Từ "**informal specification**", một mô hình (model) sẽ được xây dựng nhanh
nhất có thể bằng high-level language (ví dụ MATLAB, Python…) để đánh giá chức
năng của IP core: *chỉ kiểm tra functional behaviour*, *không quan tâm đến dạng
biểu diễn của dữ liệu*, *không quan tâm tới timing*. Bước này gọi là
"**functional modeling**", sản phẩm của nó là "**floating-point model**".

Sau khi chức năng của IP core đã được kiểm tra, một model khác nên được xây
dựng nhằm mục đích *kiểm tra dạng biểu diễn của dữ liệu*. Nói cách khác, model
này dùng để mô phỏng dữ liệu vào–ra của IP core (chỉ quan tâm đến INPUT và
OUTPUT). Mục đích là tạo ra stimulus và golden result cho quá trình
verification sau này. Sản phẩm của bước này là "**fixed-point/bit true
model**", cũng viết bằng high-level language (ví dụ C/C++).

## 3. RTL design

Khi chức năng của IP core và dạng biểu diễn dữ liệu đã được xác nhận, bước tiếp
theo là dịch high-level model (bit true, floating point) ra RTL-level model.
Trong design flow này, quá trình dịch **hoàn toàn thủ công**; ngôn ngữ để mô tả
model là HDL (VHDL hoặc Verilog). Bước này có nhiều tên gọi, một trong số đó là
"**RTL design**".

Để xác nhận chức năng của model này có khớp với high-level model hay không,
developer phải thực hiện behaviour simulation ở bước này, với VHDL model +
testbench + stimulus.

Chú ý: timing ở giai đoạn simulation này không được bảo đảm. Việc IP core có
thực sự chạy được trên phần cứng hay không cũng chưa được bảo đảm.

## 4. Synthesize

Bước tiếp theo, VHDL code được compile và synthesize. Kết quả cuối cùng là
**gate netlist**; quá trình này hoàn toàn tự động, do compiler và synthesis
tool đảm nhiệm. Quá trình này gọi là RTL synthesis (hay logic synthesis).
Chúng ta sẽ tìm hiểu sâu về logic synthesis ở một bài viết khác.

Sau bước này, developer có thể thực hiện **post-synthesis simulation** (còn gọi
là gate-level simulation), lúc này stimulus được test trên gate netlist. Nếu
bước này pass thì chức năng của IP core sau khi tổng hợp đã được bảo đảm.

## 5. Implementation

### 5.1 Translate

Sau khi gate netlist (`*.NGC` – Native Generic Circuit) được tạo ra, tool tiếp
tục lấy thông tin từ file `*.NGC` + UCF + NCF để tạo ra một file gọi là NGD
(Native Generic Database).

### 5.2 Map

Thông tin về IP core lúc này nằm trong database, tiếp theo nó được map xuống
FPGA architecture (LUT architecture) để program các gate array. Sản phẩm cuối
cùng của bước này là NCD (Native Circuit Description).

### 5.3 Place & Route

Bước "place" và "route" sắp xếp các LUT vào các CLB ở vị trí phù hợp sao cho
thoả mãn timing constraint.

### 5.4 Simulation ở giai đoạn implementation

* Post-translate simulation: chạy static timing analysis với gate delay ước
  lượng
* Post place & route simulation: chạy static timing analysis với delay chính
  xác

Static timing analysis chỉ quan tâm đến timing, không quan tâm đến chức năng.

## 6. Generate bitstream

Routed NCD được dịch sang mã nhị phân — file bitstream (`*.BIT`) — để program
xuống FPGA board.

## 7. In-circuit simulation

Test trực tiếp trên phần cứng đã được program. Dùng ILA core để thu nhận
physical signal trên board, và ChipScope để hiển thị waveform lên host
computer.
