---
title: 'Dùng FIFO trên nền tảng Intel'
description: 'Khai báo FIFO của Intel FPGA: hai cách instantiate, parameter editor thực chất điều khiển những gì, và hai cấu hình làm đổi hành vi chứ không chỉ đổi diện tích — ngữ nghĩa của clear khi đi qua hai clock domain, và chế độ đọc normal so với show-ahead.'
date: 2022-11-23
lang: vi
key: fifo-intel
tags: ['intel']
---

## 1. Tổng quan

Có 3 loại FIFO:

* SCFIFO: FIFO một clock
* DCFIFO: FIFO hai clock (dữ liệu vào và ra cùng độ rộng)
* DCFIFO_MIXED_WIDTHS: FIFO hai clock (dữ liệu vào và ra khác độ rộng)

Đối chiếu sang Xilinx:

| Intel | Xilinx |
|:-:    |      :-:|
|SCFIFO | Synchronous FIFO|
|DCFIFO | Asynchronous FIFO|

## 2. Instantiate và cấu hình FIFO

Xilinx có 2 cách khai báo và cấu hình FIFO IP core. Intel cũng có đúng 2 cách
tương tự.

### 2.1 Megafunction

Khai báo library:

```bash
LIBRARY altera_mf;
USE altera_mf.altera_mf_components.all;
```

Phần khai báo component của VHDL nằm ở:

```bash
< Intel® Quartus® Prime installation directory>eda/fv_lib/vhdl/megafunctions/altera_mf_components.vhd
```

Khai báo của `dcfifo`:

```bash
component dcfifo
  generic (
    add_ram_output_register : string := "OFF";
    add_usedw_msb_bit : string := "OFF";
    clocks_are_synchronized : string := "FALSE";
    delay_rdusedw : integer := 1;
    delay_wrusedw : integer := 1;
    intended_device_family  : string := "unused";
    enable_ecc  : string := "FALSE";
    lpm_numwords  : integer;
    lpm_showahead : string := "OFF";
    lpm_width : integer;
    lpm_widthu  : integer := 1;
    overflow_checking : string := "ON";
    rdsync_delaypipe  : integer := 0;
    read_aclr_synch : string := "OFF";
    underflow_checking  : string := "ON";
    use_eab : string := "ON";
    write_aclr_synch  : string := "OFF";
    wrsync_delaypipe  : integer := 0;
    lpm_hint  : string := "UNUSED";
    lpm_type  : string := "dcfifo"
  );
  port(
    aclr  : in std_logic := '0';
    data  : in std_logic_vector(lpm_width-1 downto 0) := (others => '0');
    eccstatus : out std_logic_vector(2-1 downto 0);
    q : out std_logic_vector(lpm_width-1 downto 0);
    rdclk : in std_logic := '0';
    rdempty : out std_logic;
    rdfull  : out std_logic;
    rdreq : in std_logic := '0';
    rdusedw : out std_logic_vector(lpm_widthu-1 downto 0);
    wrclk : in std_logic := '0';
    wrempty : out std_logic;
    wrfull  : out std_logic;
    wrreq : in std_logic := '0';
    wrusedw : out std_logic_vector(lpm_widthu-1 downto 0)
  );
end component;
```

Lưu ý: với Stratix 10 thì bắt buộc phải đặt `use_eab = ON`.

Mô tả chi tiết các tín hiệu xem
**[ở đây](https://www.intel.com/content/www/us/en/docs/programmable/683522/18-0/fifo-signals.html)**,
mô tả các tham số xem
**[ở đây](https://www.intel.com/content/www/us/en/docs/programmable/683522/18-0/fifo-parameter-settings.html)**.

### 2.2 FIFO parameter editor

Mở IP Catalog:

`Basic Functions > On Chip memory > FIFO intel`

Cấu hình FIFO tại đây, generate IP, rồi mở file HDL sinh ra để copy top module
làm component trong thiết kế của mình.

![](/images/blog/fifo-intel/1.png)

### 2.3 Khác nhau ở chỗ nào?

| Megafunction     | IP Catalog    |
| :-                | :-            |
| Phải tự viết timing constraint. Cách constraint cho FIFO kiểu megafunction xem [ở đây](https://community.intel.com/t5/FPGA-Wiki/DCFIFO-Timing-Constraints/ta-p/735793) và [ở đây](https://www.intel.com/content/www/us/en/docs/programmable/683082/22-3/dual-clock-fifo-timing-constraints.html) | Timing constraint được tool sinh tự động. Nếu chưa chắc tay về constraint thì nên chọn cách này. |

## 3. Những cấu hình quan trọng

### 3.1 Clear

Cả `sclr` (đồng bộ) lẫn `aclr` (bất đồng bộ) đều đưa con trỏ đọc và ghi về
trạng thái rỗng. Có hai điểm rất dễ sai:

- Với **DCFIFO**, tín hiệu clear đi qua hai clock domain. `aclr` phải được giữ
  đủ lâu để cả hai domain cùng nhìn thấy; khuyến nghị của Intel là giữ tối
  thiểu ba chu kỳ của clock **chậm hơn**. Một xung một chu kỳ phát từ phía
  clock nhanh có thể reset được con trỏ này mà không reset con trỏ kia, và FIFO
  sẽ báo một mức chiếm dụng ảo không bao giờ rút về 0.
- Clear **không** xoá nội dung bộ nhớ, chỉ xoá con trỏ. Dữ liệu ghi trước lúc
  clear vẫn nằm nguyên trong RAM, chỉ là không truy cập tới được nữa. Đừng cho
  rằng đọc sau reset thì sẽ ra toàn số 0.

Nếu điều kiện thiết kế cho phép, hãy dùng `sclr` với SCFIFO và reset toàn bộ
datapath từ một tín hiệu reset đồng bộ duy nhất — cách này loại bỏ được cả một
lớp lỗi kiểu "reset được một nửa".

### 3.2 Chế độ Normal và Show-Ahead

Cấu hình này quyết định `q` mang ý nghĩa gì, và nó làm đổi luôn cách bắt tay ở
phía đọc:

| | Normal mode | Show-ahead mode |
| --- | --- | --- |
| `q` hợp lệ khi nào? | một chu kỳ **sau** `rdreq` | ngay khi FIFO có dữ liệu |
| `rdreq` nghĩa là gì? | "lấy từ tiếp theo ra" | "tôi đã nhận từ này, đẩy tiếp đi" |
| Read latency | 1 chu kỳ | 0 chu kỳ |

Show-ahead là lựa chọn hợp lý khi FIFO nối vào một giao thức bắt tay như
AXI-Stream: `q` và `empty` cho ra thẳng `TDATA` và `TVALID`, còn `rdreq` chính
là `TREADY and TVALID`. Ở chế độ normal thì phải tự thêm một tầng register nữa
mới dựng được đúng giao diện đó.

Cái giá phải trả: show-ahead làm tăng độ trễ trên đường *từ lúc ghi tới lúc
`empty` nhả* — FIFO phải pre-fetch từ đầu tiên ra trước khi trình diện được nó
— và trên một số dòng device, nó buộc tool chọn kiểu memory implementation
khác, nên báo cáo tài nguyên có thể đổi chỉ vì bật đúng một switch này. Hãy
kiểm tra output của fitter thay vì mặc định rằng nó miễn phí.

## 4. Ví dụ thiết kế

http://blogs.plymouth.ac.uk/embedded-systems/fpga-and-vhdl/testing-understanding-the-scfifo-megafunction/

## 5. Tài liệu tham khảo

* [1] https://www.intel.com/content/www/us/en/docs/programmable/683522/18-0/vhdl-library-use-declaration.html
* [2] https://www.intel.com/content/www/us/en/docs/programmable/683522/18-0/vhdl-component-declaration.html
