---
title: 'VHDL - Toán tử'
description: 'Phần 4 của series VHDL: toàn bộ tập toán tử và bốn chỗ dễ sập bẫy — toán tử logic nằm cuối bảng độ ưu tiên, so sánh mảng theo thứ tự từ điển chứ không theo giá trị, srl vứt mất dấu, và mod khác rem.'
date: 2023-02-25
lang: vi
key: vhdl_training_4
tags: ['vhdl']
series: 'VHDL training'
seriesOrder: 4
---

Toán tử trông như phần dễ nhất của một ngôn ngữ. Trong VHDL nó lại là nơi sinh
ra rất nhiều bug im lặng, vì ba điều không giống thói quen từ C hay Python: toán
tử logic nằm ở *đáy* bảng độ ưu tiên, so sánh mảng theo thứ tự từ điển chứ không
theo giá trị số, và các toán tử dịch không quan tâm tới dấu. Phần này đi qua
toàn bộ tập toán tử và dừng lại ở từng cái bẫy đó.

## 1. Độ ưu tiên

VHDL có bảy mức ưu tiên. Mức cao nhất kết hợp trước:

| Mức | Toán tử | Nhóm |
| --- | ------- | ---- |
| 1 (cao nhất) | `**` `abs` `not` | miscellaneous |
| 2 | `*` `/` `mod` `rem` | nhân |
| 3 | `+` `-` (một ngôi) | dấu |
| 4 | `+` `-` `&` | cộng và ghép chuỗi |
| 5 | `sll` `srl` `sla` `sra` `rol` `ror` | dịch |
| 6 | `=` `/=` `<` `<=` `>` `>=` | so sánh |
| 7 (thấp nhất) | `and` `or` `nand` `nor` `xor` `xnor` | logic |

### 1.1 Hệ quả hay làm người ta vấp

Vì toán tử logic ở mức thấp nhất nên phép so sánh kết hợp chặt hơn `and`. Chỗ
đó thì trực giác. Chỗ không trực giác là VHDL **từ chối đoán** khi bạn trộn hai
toán tử logic khác nhau:

```vhdl
-- Sai: ngôn ngữ sẽ không tự chọn giữa (a and b) or c
--      và a and (b or c) thay cho bạn.
z <= a and b or c;

-- Đúng, và ý định đã nằm rõ trên trang giấy.
z <= (a and b) or c;
```

Lặp lại **cùng một** toán tử thì không sao, vì nó có tính kết hợp:

```vhdl
z <= a and b and c;    -- hợp lệ
z <= a nand b nand c;  -- SAI: nand và nor không có tính kết hợp
```

`nand` và `nor` là ngoại lệ. Kể cả khi lặp lại, chúng vẫn cần ngoặc, vì
`(a nand b) nand c` và `a nand (b nand c)` thực sự cho kết quả khác nhau.

## 2. Toán tử logic

`and`, `or`, `nand`, `nor`, `xor`, `xnor` và `not` được định nghĩa cho `bit` và
`boolean`, và thông qua `std_logic_1164` thì có thêm cho `std_ulogic` và
`std_logic`. Chúng cũng được định nghĩa theo từng phần tử trên mảng của các kiểu
đó:

```vhdl
signal a, b, z : std_logic_vector(7 downto 0);

z <= a and b;   -- bit 7 với bit 7, bit 6 với bit 6, và cứ thế
z <= not a;
```

Hai quy tắc cho dạng mảng:

- Hai toán hạng phải **cùng độ dài**. Ở nhiều tool, lệch độ dài là lỗi runtime
  chứ không phải lỗi biên dịch — nghĩa là thông báo chỉ xuất hiện lúc mô phỏng.
- Kết quả lấy index range của toán hạng bên trái. Chiều (`to` hay `downto`)
  không được kiểm tra, nên một toán hạng khai báo `0 to 7` trộn với một toán
  hạng khai báo `7 downto 0` sẽ khiến bit 0 ghép với bit 7 mà không báo gì cả.

`xnor` xuất hiện từ VHDL-93; code viết theo VHDL-87 phải dùng `not (a xor b)`.

## 3. Toán tử so sánh

`=`, `/=`, `<`, `<=`, `>` và `>=` trả về kiểu `boolean`, không bao giờ trả về
bit. Đó là lý do một phép so sánh không thể gán thẳng cho tín hiệu:

```vhdl
signal eq : std_logic;

eq <= (a = b);                   -- sai: gán boolean cho std_logic
eq <= '1' when a = b else '0';   -- đúng
```

### 3.1 So sánh mảng theo thứ tự từ điển, không theo giá trị

Với `std_logic_vector` và `bit_vector`, thứ tự được định nghĩa theo từng phần tử
tính từ bên trái, đúng như cách sắp xếp chuỗi ký tự. Độ dài chỉ dùng để phân
định khi mọi phần tử đã bằng nhau:

```text
"0100" so với "011"
  vị trí 1: '0' với '0'  -> bằng nhau
  vị trí 2: '1' với '1'  -> bằng nhau
  vị trí 3: '0' với '1'  -> toán hạng trái nhỏ hơn

nên "0100" < "011", dù xét giá trị số thì 4 > 3
```

Đây là thói quen mang từ phần mềm sang và trả giá đắt nhất. Khi bạn muốn so sánh
**giá trị số**, toán hạng phải mang kiểu số:

```vhdl
use ieee.numeric_std.all;

signal a, b : unsigned(7 downto 0);

if a > b then ...             -- so sánh số; toán hạng ngắn hơn được zero-extend
if signed(a) > signed(b) then -- so sánh số có sign extension
```

`numeric_std` nạp chồng các toán tử so sánh cho `signed` và `unsigned`, và xử lý
đúng cả khi hai toán hạng khác độ dài. `std_logic_vector` không mang ý nghĩa số
nào nên không được hưởng điều đó.

## 4. Toán tử dịch và quay

VHDL-93 định nghĩa sáu toán tử: `sll`, `srl`, `sla`, `sra`, `rol` và `ror`. Toán
hạng bên phải là `integer`, và số âm sẽ dịch theo chiều ngược lại.

| Toán tử | Tác dụng | Bit chèn vào |
| ------- | -------- | ------------ |
| `sll` | dịch trái logic | `'0'` |
| `srl` | dịch phải logic | `'0'` |
| `sla` | dịch trái số học | bản sao của bit **ngoài cùng bên phải** |
| `sra` | dịch phải số học | bản sao của bit **ngoài cùng bên trái** |
| `rol` và `ror` | quay | vòng lại |

Việc `sla` chèn từ đầu bên phải khiến hầu hết mọi người bất ngờ. Nó tồn tại để
`sla` và `sra` là phép nghịch đảo của nhau trên một giá trị signed magnitude, và
rất hiếm khi là thứ bạn thực sự cần.

### 4.1 Cái bẫy: srl không biết đến dấu

`numeric_std` nạp chồng các toán tử dịch cho `signed`, nhưng `srl` vẫn là phép
dịch **logic**. Nó chèn `'0'` kể cả trên giá trị có dấu, lặng lẽ biến một số âm
thành số dương. Hãy dùng hàm thay vì toán tử, vì hàm tôn trọng kiểu dữ liệu:

```vhdl
use ieee.numeric_std.all;

signal s : signed(7 downto 0) := "11110000";  -- -16

s srl 1             -- "01111000" = +120   <- mất dấu
shift_right(s, 1)   -- "11111000" = -8     <- dịch số học, đúng
```

Nguyên tắc: dùng `shift_left` và `shift_right` của `numeric_std`, còn toán tử
dịch thì để dành cho `bit_vector`.

## 5. Toán tử số học

`+`, `-`, `*`, `/`, `mod`, `rem`, `**` và `abs` được định nghĩa cho `integer` và
`real`, và cho `signed`, `unsigned` khi đã `use` `numeric_std`. Chúng **không**
được định nghĩa cho `std_logic_vector` — đó chính là toàn bộ lý do tồn tại của
các kiểu số.

```vhdl
use ieee.numeric_std.all;

signal a, b : unsigned(7 downto 0);
signal sum  : unsigned(8 downto 0);

sum <= ('0' & a) + ('0' & b);   -- mở rộng trước, không thì mất carry
```

`+` và `-` trả về kết quả có độ rộng bằng toán hạng rộng nhất, nên bit nhớ ra
ngoài bị bỏ đi trừ khi bạn tự mở rộng toán hạng.

### 5.1 mod khác rem thế nào

Cả hai đều cho phần dư, và chúng khác nhau khi có toán hạng âm. `rem` lấy dấu
của toán hạng **bên trái**, `mod` lấy dấu của toán hạng **bên phải**:

```text
 7 rem  3 =  1        7 mod  3 =  1
-7 rem  3 = -1       -7 mod  3 =  2
 7 rem -3 =  1        7 mod -3 = -2
-7 rem -3 = -1       -7 mod -3 = -1
```

Với giá trị không dấu thì hai toán tử cho kết quả giống nhau — đó là lý do khác
biệt này nằm im cho tới ngày có một giá trị âm lọt vào biểu thức.

### 5.2 Cái gì thực sự tổng hợp được

- `+`, `-`, `abs` và các phép so sánh: luôn luôn.
- `*`: có, và nó ánh xạ vào khối DSP khi độ rộng cùng cách pipeline phù hợp với
  device.
- `/`, `mod` và `rem`: chỉ khi toán hạng bên phải là **hằng số luỹ thừa của 2**,
  khi đó tool biến phép toán thành phép dịch hoặc phép lấy bit. Bộ chia tổng quát
  phải instantiate từ IP core.
- `**`: chỉ với cơ số 2 là hằng và số mũ là hằng, tức là nó trở thành hằng số
  tính tại thời điểm biên dịch.

## 6. Ghép chuỗi

`&` nối các mảng và phần tử thành một mảng dài hơn. Đây là công cụ chủ lực để mở
rộng, chèn thêm bit và đảo thứ tự:

```vhdl
signal byte   : std_logic_vector(7 downto 0);
signal word   : std_logic_vector(15 downto 0);
signal nibble : std_logic_vector(3 downto 0);

word   <= x"00" & byte;                           -- zero-extend
nibble <= byte(0) & byte(1) & byte(2) & byte(3);  -- đảo bit
```

Khi đã `use` `numeric_std`, hàm `resize` diễn đạt cùng ý đó rõ ràng hơn và tự xử
lý sign extension:

```vhdl
word <= std_logic_vector(resize(unsigned(byte), 16));  -- zero-extend
word <= std_logic_vector(resize(signed(byte), 16));    -- sign-extend
```

## 7. Tóm lại

- Toán tử logic kết hợp sau cùng, và trộn `and` với `or` trong một biểu thức là
  lỗi biên dịch. Hãy đặt ngoặc theo ý định, đừng theo thói quen.
- So sánh `std_logic_vector` là so sánh chuỗi ký tự, không phải so sánh số. Hãy
  ép sang `unsigned` hoặc `signed` mỗi khi thứ bạn muốn là độ lớn.
- `srl` trên giá trị `signed` vứt mất dấu; `shift_right` thì không.
- `mod` và `rem` chỉ tách nhau ra khi xuất hiện toán hạng âm.
- `+` và `-` giữ nguyên độ rộng toán hạng, nên hãy mở rộng trước khi cộng nếu
  bit nhớ có ý nghĩa.
