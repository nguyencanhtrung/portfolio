---
title: 'Thiết kế ROM generic bằng SystemVerilog'
description: 'Một module ROM tham số hoá, nạp nội dung từ file, không phụ thuộc vendor — kèm những điều kiện bắt buộc để tool suy diễn ra block RAM thay vì đốt hàng nghìn LUT.'
date: 2023-09-13
lang: vi
key: a-generic-systemverilog-rom
tags: ['core', 'rtl']
---

Gần như dự án RTL nào cũng cần một bảng tra cứu: hệ số filter, bảng sin/cos,
ma trận cơ sở LDPC, bảng CRC. Cách nhanh nhất là gọi IP core của vendor — và
cũng là cách nhanh nhất để khoá thiết kế vào một hãng. Bài này viết một ROM
generic bằng SystemVerilog: tham số hoá độ rộng và độ sâu, nạp nội dung từ file
text, và quan trọng nhất là viết sao cho synthesis tool **suy diễn ra block
RAM** thay vì trải nội dung thành hàng nghìn LUT.

## 1. Vì sao không dùng IP core của vendor

Ba lý do thực dụng:

- **Tính khả chuyển.** Cùng một file `.sv` chạy được trên Xilinx, Intel và cả
  simulator, không cần regenerate IP mỗi lần đổi đích.
- **Kiểm soát phiên bản.** IP core sinh ra hàng chục file phái sinh; một module
  RTL thì diff được, review được trong merge request.
- **Tốc độ vòng lặp.** Đổi nội dung bảng chỉ là sửa file `.mem`, không phải mở
  GUI và regenerate.

Đánh đổi: bạn phải tự chịu trách nhiệm viết đúng khuôn mẫu (coding template) để
tool nhận ra ý định của mình. Đó chính là phần còn lại của bài.

## 2. Module ROM

```systemverilog
module rom_generic #(
    parameter int          DATA_WIDTH = 16,
    parameter int          DEPTH      = 1024,
    parameter string       INIT_FILE  = "",     // "" = ROM khởi tạo toàn 0
    parameter bit          INIT_HEX   = 1'b1    // 1: $readmemh, 0: $readmemb
) (
    input  logic                         clk,
    input  logic                         en,
    input  logic [$clog2(DEPTH)-1:0]     addr,
    output logic [DATA_WIDTH-1:0]        dout
);

    // Mảng lưu nội dung. Không khai báo `const`: tool cần thấy đây là bộ nhớ.
    logic [DATA_WIDTH-1:0] mem [0:DEPTH-1];

    initial begin
        if (INIT_FILE != "") begin
            if (INIT_HEX) $readmemh(INIT_FILE, mem);
            else          $readmemb(INIT_FILE, mem);
        end else begin
            for (int i = 0; i < DEPTH; i++) mem[i] = '0;
        end
    end

    // Đọc đồng bộ, có output register — điều kiện để suy diễn block RAM.
    always_ff @(posedge clk) begin
        if (en) dout <= mem[addr];
    end

endmodule
```

`$clog2(DEPTH)` tự tính độ rộng địa chỉ, nên khi đổi `DEPTH` không phải sửa
thêm chỗ nào. Với `DEPTH` không phải luỹ thừa của 2, các địa chỉ dư ra sẽ đọc
ra giá trị không xác định — nếu điều đó quan trọng thì phải chặn ở tầng trên.

## 3. Bốn điều kiện để tool suy diễn ra block RAM

Đây là phần quyết định giữa một ROM tốn 1 block RAM và một ROM tốn 3000 LUT.
Cùng một nội dung, chỉ khác cách viết.

### 3.1 Đọc phải đồng bộ

Block RAM trên FPGA **không có** cổng đọc bất đồng bộ. Viết như dưới đây là ép
tool trải toàn bộ bảng thành logic tổ hợp:

```systemverilog
assign dout = mem[addr];   // đọc bất đồng bộ -> LUT, không phải block RAM
```

Phải luôn cho địa chỉ đi qua một thanh ghi, tức là đọc trong `always_ff` như
module ở trên. Cái giá là độ trễ 1 chu kỳ — đây là độ trễ có thật của phần
cứng, không phải thứ mình tự thêm vào.

### 3.2 Không reset mảng nhớ

Đây là lỗi phổ biến nhất:

```systemverilog
always_ff @(posedge clk or posedge rst) begin
    if (rst) dout <= '0;          // reset thanh ghi output: chấp nhận được
    else if (en) dout <= mem[addr];
end
```

Reset thanh ghi output thì không sao. Nhưng nếu reset **cả mảng** (`for` loop
gán `mem[i] <= '0` trong khối reset) thì tool buộc phải dùng flip-flop cho từng
ô nhớ, vì block RAM không có chân reset nội dung. Kết quả: bùng nổ tài nguyên.

### 3.3 Chỉ một tiến trình được truy cập mảng

Nếu hai khối `always_ff` khác nhau cùng đọc `mem`, tool phải nhân đôi bộ nhớ
hoặc bỏ luôn ý định suy diễn. Muốn hai cổng đọc thì khai báo rõ ROM hai cổng,
đọc cả hai trong **cùng một** `always_ff`.

### 3.4 Ép kiểu khi tool vẫn không nghe

Khi mọi thứ đã đúng mà báo cáo tổng hợp vẫn cho thấy LUT, dùng attribute để nói
thẳng ý định. Chúng là pragma riêng của từng hãng nhưng vô hại với hãng còn lại:

```systemverilog
(* rom_style = "block" *)     logic [DATA_WIDTH-1:0] mem [0:DEPTH-1];  // Xilinx
(* ramstyle = "M20K"   *)     logic [DATA_WIDTH-1:0] mem [0:DEPTH-1];  // Intel
```

Giá trị `"distributed"` (Xilinx) hoặc `"logic"` (Intel) thì ngược lại — hữu ích
cho bảng rất nhỏ, khoảng dưới 64 phần tử, khi dùng nguyên một block RAM là
lãng phí.

## 4. File nội dung

`$readmemh` đọc file text, mỗi dòng một giá trị hex, cho phép comment kiểu `//`
và dòng trắng:

```text
// sin_lut.mem — 1/4 chu kỳ sin, Q1.15
0000
0324
0648
096a
// ...
```

Vài điểm dễ vấp:

- Số giá trị trong file **ít hơn** `DEPTH` thì phần còn lại là `'x` trong mô
  phỏng, còn khi tổng hợp thường thành `0`. Sự khác biệt này khiến bug chỉ lộ
  ra trên board chứ không lộ trong simulation.
- Đường dẫn `INIT_FILE` được hiểu tương đối so với thư mục chạy tool, không phải
  so với file `.sv`. Nên truyền đường dẫn tuyệt đối từ script build.
- Sinh file bằng script (Python/MATLAB) và commit cả script lẫn file `.mem`.
  Sáu tháng sau, câu hỏi "bảng này ở đâu ra" sẽ có câu trả lời.

## 5. Sử dụng

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

## 6. Kiểm chứng

Một ROM sai thì mọi thứ phía sau nó đều sai, nên đáng bỏ ra vài phút viết
testbench đối chiếu với mô hình tham chiếu:

```systemverilog
// Đọc lại đúng file mà RTL nạp, rồi so từng phần tử.
logic [15:0] golden [0:255];
initial $readmemh("sin_lut.mem", golden);

initial begin
    for (int i = 0; i < 256; i++) begin
        @(posedge clk);
        addr <= i[7:0]; en <= 1'b1;
        @(posedge clk);                 // bù 1 chu kỳ độ trễ đọc
        assert (dout === golden[i])
            else $error("ROM sai ở địa chỉ %0d: %h thay vì %h", i, dout, golden[i]);
    end
    $display("ROM khớp toàn bộ %0d phần tử", 256);
end
```

Phép kiểm này bắt được cả hai lỗi hay gặp nhất: lệch địa chỉ một nhịp (do quên
trừ độ trễ đọc) và file `.mem` không được nạp (khi đó `dout` toàn `x`).

## 7. Tóm lại

- Đọc đồng bộ, không reset mảng, chỉ một tiến trình truy cập — ba điều kiện này
  quyết định ROM của bạn nằm trong block RAM hay trải ra LUT.
- `$readmemh` cộng với file `.mem` sinh bằng script giữ cho nội dung bảng có
  thể diff được và tái tạo được.
- Attribute `rom_style` / `ramstyle` là cách nói thẳng với tool khi khuôn mẫu
  đã đúng mà kết quả vẫn sai.
- Luôn đối chiếu ROM với chính file nội dung trong testbench: lệch một nhịp địa
  chỉ là lỗi im lặng, và nó sẽ theo bạn xuống tận board.
