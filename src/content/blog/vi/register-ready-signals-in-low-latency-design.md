---
title: 'Pipeline AXIS bus with registered ready signals'
description: 'Kỹ thuật chèn register trên đường tín hiệu READY của AXI4 Stream'
date: 2023-09-13
lang: vi
key: register-ready-signals-in-low-latency-design
tags: ['rtl']
---
## 1. Giới thiệu

Pipeline handshaking protocol giúp tối ưu throughout của hệ thống. Tuy nhiên, việc thiết kế một kiến trúc pipeline vẫn đảm bảo được đặc tính của handshaking protocol đôi khi trở lên phức tạp quá mức (ít nhất là đối với cá nhân tôi trong thời gian đầu làm việc với RTL design, tôi đã thiết kế một Moore FSM gồm 8 states chỉ để xử lý backpressure từ TREADY và cắt được critical path từ tín hiệu này). Blog này sẽ mô tả một cách chi tiết vấn đề và cách giải quyết. 

## 2. AXIS protocol và pipelining

### 2.1 Nguyên lý của AXIS

Dạng đơn giản nhất của AXIS bao gồm 3 tín hiệu `DATA` `VALID` và `READY`. Với thiết kế `single cycle data transfer`, `DATA` được lấy mẫu và chuyển tiếp ra output thành công khi và chỉ khi:

* `S_AXIS_TVALID = 1` 
* Và, `M_AXIS_TREADY = 1`

Tại thời điểm lấy mẫu của hệ thống (sườn lên hoặc sườn xuống của clock) 

Thiết kế này sẽ có hai dạng thiết kế như ở hình dưới:

![](/images/blog/register-ready-signals-in-low-latency-design/3.png)

Với thiết kế bên tay trái, hệ thống sẽ chuyển tiếp dữ liệu từ `input` sang `output` khi và chỉ khi `consumer` tại output sẵn sàng nhận dữ liệu. Với thiết kế này `invalid` `input` cũng sẽ được chuyển tiếp, trong một pipeline, việc chuyển tiếp `invalid data` vào trong pipe là hiện tượng hình thành bubble.

Thiết kế bên tay phải, giống với thiết kế tay trái, tuy nhiên nó ưu việt hơn do nó có khả năng loại bỏ bubble trong pipeline. Việc loại bỏ bubble xảy ra khi:
* Bubble trong pipe được phát hiện `m_axis_tvalid = '0'` 
* Và, `valid input` xuất hiện ở đầu vào `s_axis_tvalid = '1'`

Khi đó hệ thống cho phép dữ liệu được chuyển tiếp dù `consumer` vẫn chưa sẵn sàng nhận dữ liệu. Bubble lúc này sẽ được loại bỏ bằng `valid` data.

Tuy nhiên, hai thiết kế trên có một nhược điểm rất lớn đó là `critical path` sẽ được hình thành trên tín hiệu `m_axis_tready` làm giảm tần số hoạt động của hệ thống.

![](/images/blog/register-ready-signals-in-low-latency-design/5.png)

### 2.2 Giải pháp registering `TREADY`

Dưới đây là một phương pháp chèn `register` vào đường `TREADY`. `S_AXIS_TREADY` chậm hơn `M_AXIS_TREADY` 1 chu kỳ clock, do đó ngay tại chu kỳ `M_AXIS_TREADY = '0'`, dữ liệu đang có ở register sẽ không được lấy mấu ở output (vì `M_AXIS_TREADY = '0'`). Tuy nhiên, dữ liệu kế tiếp từ input vẫn được chuyển tiếp vào `register` và ghi đè vào giá trị chưa được lấy mẫu ở trên. Để giải quyết vấn đề trên, kiến trúc này sử dụng thêm một lớp `expansion registers` để lưu trữ giá trị chưa được lấy mẫu khi `M_AXIS_TREADY = '0'`, dữ liệu input kế tiếp sẽ vẫn tiếp tục lưu trữ vào lớp `primary registers` như cũ. 

```systemverilog
always_ff @(posedge clk) 
begin
    if (s_axis_tready == 1'b1) begin
        primary_data_reg        <= s_axis_tdata;
        primary_valid_reg       <= s_axis_tvalid;
        if (m_axis_tready == 1'b0) begin
            expansion_data_reg  <= primary_data_reg;
            expansion_valid_reg <= primary_valid_reg;
        end
    end
end
```

Tại chu kỳ `M_AXIS_TREADY = '1'`, lúc này `S_AXIS_TREADY = '0'` do chậm 1 chu kỳ, dữ liệu sẽ được `consumer` lấy từ lớp `expansion registers` trước, sau đó là từ lớp `primary registers`.

![](/images/blog/register-ready-signals-in-low-latency-design/4.png)


### 2.3 Thiết kế RTL

```systemverilog
logic [WIDTH-1:0]   expansion_data_reg;
logic               expansion_valid_reg;
logic [WIDTH-1:0]   primary_data_reg;
logic               primary_valid_reg;

always_ff @(posedge clk) 
begin
    if (s_axis_tready == 1'b1) begin
        primary_data_reg        <= s_axis_tdata;
        primary_valid_reg       <= s_axis_tvalid;
        if (m_axis_tready == 1'b0) begin
            expansion_data_reg  <= primary_data_reg;
            expansion_valid_reg <= primary_valid_reg;
        end
    end
    if (m_axis_tready == 1'b1) begin
        expansion_valid_reg     <= 1'b0;
    end
end

assign s_axis_tready = !(expansion_valid_reg); 
assign m_axis_tvalid = (expansion_valid_reg) ? 
                            expansion_valid_reg : 
                            primary_valid_reg;
assign m_axis_tdata  = (expansion_valid_reg) ? 
                            expansion_data_reg : 
                            primary_data_reg;
```

Thiết kế được viết bằng `SystemVerilog` và được mô tả cụ thể ở [`axis_reg.sv`](https://github.com/nguyencanhtrung/systemverilog_axis/blob/master/rtl/axis_reg.sv)
