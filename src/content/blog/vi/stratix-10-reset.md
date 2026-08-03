---
title: 'Stratix 10 - Reset Release IP'
description: 'Stratix 10 và Agilex nạp cấu hình theo từng sector, nên một phần thiết kế thoát reset trước phần bên cạnh. Vì sao điều đó đẩy state machine vào trạng thái không hợp lệ, và Reset Release IP với INIT_DONE giải quyết ra sao.'
date: 2022-10-01
lang: vi
key: stratix-10-reset
tags: ['intel']
---

## 1. Giới thiệu

FPGA Intel Stratix 10 và Agilex được cấu hình thông qua **Secure Device Manager**
(SDM). SDM là một khối vi xử lý cung cấp cơ chế cấu hình an toàn và có xác thực
đầy đủ. Nó gửi dữ liệu cấu hình tới từng sector trong FPGA, và mỗi sector lại có
một vi xử lý riêng phụ trách việc cấu hình sector đó.

![](/images/blog/stratix-10-reset/1.png)
![](/images/blog/stratix-10-reset/2.png)

Điểm mấu chốt: các sector được cấu hình theo kiểu **giả tuần tự**
(pseudo-serial), và mỗi sector bắt đầu quá trình cấu hình **bất đồng bộ** với
nhau. Hệ quả là có những vùng của thiết kế đã bước vào user mode trong khi các
vùng khác còn chưa cấu hình xong.

Điều này biến trạng thái khởi tạo mà ta tưởng là cố định thành một trạng thái
quá độ: một phần logic đã chạy trong khi phần còn lại vẫn đóng băng.

Xét ví dụ sau. Ta có một thiết kế với state machine như hình:

![](/images/blog/stratix-10-reset/3.png)
![](/images/blog/stratix-10-reset/4.png)

State machine này dựa vào việc các thanh ghi ở đúng trạng thái ban đầu. Không có
reset đủ tốt, nó bắt đầu chạy khi mới chỉ một phần device hoạt động, còn phần
logic lân cận vẫn đang bị đóng băng.

Thanh ghi B đang ở chế độ hoạt động và đổi trạng thái sau 1 chu kỳ clock, trong
khi thanh ghi kia vẫn đứng yên. Đến lúc toàn bộ fabric vào user mode thì hệ
thống đã rơi vào trạng thái không hợp lệ hoặc không xác định.

Intel khuyến nghị giữ thiết kế trong trạng thái reset khi tín hiệu `nINIT_DONE`
đang ở mức **cao**, hay tương đương là khi chân `INIT_DONE` đang ở mức **thấp**.
Khi ta instantiate Reset Release IP trong thiết kế, chính SDM là nơi điều khiển
tín hiệu `nINIT_DONE`.

Nhờ vậy, IP này không tiêu tốn tài nguyên fabric của FPGA — nó chỉ chiếm tài
nguyên routing.

## 2. Kiến trúc reset an toàn

![](/images/blog/stratix-10-reset/8.png)

Thông thường người ta dùng tín hiệu `pll_lock` để giữ hệ thống trong reset cho
tới khi PLL phát ra tần số ổn định. Nhưng hoàn toàn có khả năng thời gian PLL
lock lại ngắn hơn thời gian fabric vào user mode — khi đó `pll_lock` nhả reset
quá sớm và ta quay lại đúng vấn đề ban đầu.

Cách tốt nhất là đưa `INIT_DONE` từ Reset Release IP vào chân reset của PLL, như
trong hình:

```vhdl
RST_REL: component reset_release
	port map (
		ninit_done => ninit_done; 	-- reset = HIGH
	);

SYS_PLL : component pll
	port map (
		rst      => ninit_done,
		refclk   => refclk,
		locked   => locked,
		outclk_0 => clk
	);

sys_rst 	<= rst_in OR (NOT(locked));
```

**Phương án thay thế** nếu bạn vẫn muốn dùng PLL lock trong chuỗi reset: gate
tín hiệu lock đó với `NINIT_DONE` từ Reset Release IP.

```vhdl
RST_REL: component reset_release
	port map (
		ninit_done => ninit_done; 	-- HIGH: fabric chưa reset xong
	);

SYS_PLL : component pll
	port map (
		rst      => rst,
		refclk   => refclk,
		locked   => locked,
		outclk_0 => clk
	);

sys_rst 	<= locked AND (NOT(ninit_done));
```

![](/images/blog/stratix-10-reset/9.png)

Lưu ý: logic `sys_rst <= locked AND (NOT(ninit_done))` không hoàn toàn khớp với
bảng chân lý — đúng ra phải là `sys_rst <= ninit_done OR (NOT(locked))`. Tuy
nhiên có hai điều xảy ra trong thực tế:

* Ở giai đoạn power-up, PLL đạt trạng thái `locked` luôn sớm hơn thời điểm toàn
  bộ fabric hoàn tất chuyển sang user mode. Nghĩa là `ninit_done` mới là tín
  hiệu đến sau, và nó quyết định.
* Khi đã vào trạng thái hoạt động, `sys_rst` chỉ còn phụ thuộc `rst_in` để reset
  user logic, tức là chỉ phụ thuộc trạng thái `locked`.

Do đó trạng thái thứ tư trong bảng chân lý không xảy ra trên phần cứng thật, và
dùng `sys_rst <= locked AND (NOT(ninit_done))` để điều khiển `sys_rst` là chấp
nhận được.

## 3. Khởi tạo thanh ghi lúc power-on

Khởi tạo lúc power-up viết trong VHDL:

```vhdl
signal s1 	: std_logic_vector(3 downto 0) := b"0001";
```

hoặc trong Verilog:

```cpp
reg q = 1'b1;
```

Khi thiết kế trên Stratix 10 hay Agilex, **không nên** dựa vào giá trị khởi tạo
của thanh ghi như hai đoạn trên. Hãy **dựa vào mạng reset** để thiết lập trạng
thái ban đầu mong muốn.

Để chắc chắn mạng reset hoạt động đúng, ta phải tắt tính năng khởi tạo lúc
power-up, nhờ đó mô phỏng mới kiểm chứng được hành vi của mạng reset — nếu để
bật, simulation sẽ thấy giá trị khởi tạo và che mất lỗi thiếu reset. Vào menu
assignments trong Quartus Prime Pro:

`Assignment > Device > Device and Pin Options > Configuration > Disable Register Power-up initialization`

## 4. Instantiate Reset Release IP

![](/images/blog/stratix-10-reset/6.png)

`ninit_done = '1'`: fabric đang trong quá trình reset. Phải giữ toàn bộ user
logic ở trạng thái reset.

`ninit_done = '0'`: fabric đã reset xong. User logic được phép chuyển sang trạng
thái hoạt động.

```vhdl
component reset_release is
		port (
			ninit_done : out std_logic
		);
end component reset_release;

....

RST_REL: component reset_release
	port map (
		ninit_done => ninit_done
	);
```

## 5. Lưu ý với Partial Reconfiguration

[Tài liệu tham khảo của Intel](https://www.intel.com/content/www/us/en/docs/programmable/683762/21-3/guidance-when-using-partial-reconfiguration.html)

## 6. Video

[![References](https://img.youtube.com/vi/qhGfZwX9jKw/0.jpg)](https://www.youtube.com/watch?v=qhGfZwX9jKw)

***

**Tài liệu tốt nhất về chủ đề này**

[Including the Reset Release in your design — Intel](https://www.intel.com/content/www/us/en/docs/programmable/683762/21-3/including-the-reset-release-in-your-design.html)
