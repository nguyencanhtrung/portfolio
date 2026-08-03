---
title: 'VHDL - Kiểu dữ liệu composite'
description: 'Phần 3 của series VHDL: kiểu composite. std_logic_vector so với signed và unsigned, array và array slice, record, cùng cách viết aggregate để gán cho chúng.'
date: 2023-02-25
lang: vi
key: vhdl_training_3
tags: ['vhdl']
series: 'VHDL training'
seriesOrder: 3
---
## 1. Kiểu dữ liệu composite

### 1.1 Mục tiêu của phần này

* Hiểu kiểu dữ liệu composite là gì
* Tạo được kiểu composite (array và record)
* Khai báo được mảng một chiều và hai chiều

### 1.2 Kiểu composite là gì?

Đối tượng kiểu composite chứa một nhóm phần tử.

Có hai loại composite:
* `Array`
* `Record`

Khác nhau giữa Array và Record:
* Array là nhóm các phần tử **cùng kiểu**
* Record là nhóm các phần tử cùng kiểu hoặc khác kiểu

Cách dùng:
* Array dùng để mô hình hoá bộ nhớ
* Record dùng để mô hình hoá packet, interface protocol

`bit_vector`, `std_logic_vector` và `string` đều là kiểu composite định nghĩa
sẵn (chúng là array).

* bit_vector là mảng của kiểu scalar 'bit'
* std_logic_vector là mảng của kiểu scalar 'std_logic'
* string là mảng của kiểu scalar 'character'

Ví dụ:
```vhdl
signal A_WORD: std_logic_vector (3 downto 0) := "0011";
```
Tín hiệu A_WORD ở đây có kiểu composite.
* Nó là mảng bốn phần tử, mỗi phần tử kiểu `std_logic`.
* **Không có quy ước LSB hay MSB nào được định sẵn**
* Do đó trình biên dịch không tự động đọc giá trị này là 3.
* Lưu ý dấu nháy kép được dùng cho mọi đối tượng `bit_vector`,
  `std_logic_vector` hay `string`.
* Ở đây VHDL không suy ra rằng index lớn hơn là MSB (số 3 trong ví dụ), mà chỉ
  đơn giản đánh index vector từ trái sang phải.
* Chọn một cách đánh index rồi dùng nhất quán là thói quen thiết kế tốt. Phổ
  biến nhất là kiểu `(3 downto 0)`.

## 2. std_logic_vector, signed và unsigned

### 2.1 std_logic_vector
* Là mảng của kiểu `std_logic`.
* Định nghĩa trong package `std_logic_1164`, thuộc thư viện IEEE.
* Không mang ý nghĩa vị trí — không có sign bit, và cũng không có cách hiểu số
  học nào cả.
* `"0110"` trong `std_logic_vector` chỉ là một mẫu bốn bit. Nó không phải số 6;
  không có gì trong ngôn ngữ đọc nó ra thành số. Đưa mẫu đó cho `unsigned` thì
  nó là 6, đưa cho `signed` thì vẫn là 6, nhưng khi còn là `std_logic_vector`
  thì câu hỏi "nó bằng mấy" không có câu trả lời.

### 2.2 signed và unsigned
* Cũng là mảng của kiểu `std_logic`
* Có mang ý nghĩa vị trí
* Bit ngoài cùng bên trái là sign bit
* Vì vậy signed "1110" và unsigned "1110" không cùng một giá trị
    * signed "1110" được hiểu là -2
    * unsigned "1110" được hiểu là 14
* Dùng kiểu `unsigned` khi vector cần tính toán, ví dụ cộng hai chữ số BCD.
* Dùng `std_logic_vector` khi chỉ cần một mẫu bit, ví dụ lái các segment của
  LED, nơi giá trị số không có ý nghĩa gì.

```vhdl
entity bcd_add_and_display is
    port(
        clk         : in std_logic;
        bcd_a_in    : in unsigned (3 downto 0);
        bcd_b_in    : in unsigned (3 downto 0);
        led_7seg_out: out std_logic_vector (6 downto 0)

    );
end entity;
```

### 2.3 Làm được gì và không làm được gì với std_logic?

Với `std_logic`, bạn dùng được:

* Phép logic: `NOT`, `AND`, `NAND`, `OR`, `NOR`, `XOR`, `XNOR`
* So sánh bằng (`=`) và khác (`/=`), nhưng không dùng được (`>`, `<`…) —
  giải thích ở (*)
* Không thực hiện được phép toán số học trên `std_logic`/`std_logic_vector`, vì
  `std_logic_vector` chỉ giữ mẫu bit mà vị trí không mang ý nghĩa.

(*) `std_logic` có chín giá trị khác nhau, nên so sánh `std_logic` thực chất là
so sánh vị trí của nó trong enumerated type với vị trí của giá trị kia. Kết quả
gần như chắc chắn không phải cái bạn mong đợi. Vì vậy chỉ nên kiểm tra bằng và
khác.

Thư viện `NUMERIC_STD` chứa các hàm overload phù hợp để hỗ trợ nhiều phép so
sánh và phép dịch. Nó cũng chứa các trường hợp đặc biệt của kiểu `std_logic` là
`signed` và `unsigned`.

## 3. Array

### 3.1 Array

Array là nhóm các phần tử, tất cả **cùng một kiểu**. Cú pháp khai báo:

```vhdl
type <new type name> is array ( <range> ) of <data_type>
```
Trong đó:
* `<new type name>` là identifier hợp lệ bất kỳ.
* `<range>` chỉ định giá trị nhỏ nhất và lớn nhất của index bằng ký hiệu "to"
  hoặc "downto". Thông thường array khai báo theo chiều tăng (to), còn range
  của std_logic_vector thì khai báo theo chiều giảm.
* `<data_type>` có thể là kiểu "intrinsic" như integer hay bit, cũng có thể là
  phần mở rộng từ thư viện như `std_logic`, hoặc kiểu do người dùng định nghĩa.

```vhdl
type WORD is array (0 to 3) of std_logic;
signal B_BUS : WORD;
```

Ở ví dụ này, `WORD` là mảng bốn phần tử kiểu `std_logic`.

Nếu signal B_BUS có kiểu WORD thì nó trở thành một mảng std_logic. Vậy mỗi phần
tử nhận được các giá trị 'U', 'X', '0', '1', 'Z', 'W', 'L', 'H' hoặc '-'. Tức
là có 9^4 (6561) khả năng, so với 16 nếu kiểu là "bit".

```vhdl
type DATA is array (0 to 3) of integer range 0 to 9;
signal B_BUS : DATA;
```

Ở ví dụ này, `DATA` là mảng bốn phần tử kiểu integer, với range integer thu hẹp
còn 0 tới 9. Điều này quan trọng để tránh việc mặc định hiện thực bằng 32 bit.
Nếu signal `B_BUS` có kiểu `DATA` thì nó trở thành một mảng integer.

### 3.2 Gán array

Khi muốn gán mảng này cho mảng kia, phải đảm bảo hai mảng:

* cùng kiểu
* cùng độ dài
* và phép gán là theo vị trí, từ trái sang phải

```vhdl
signal BUS_A, BUS_B :   std_logic_vector (3 downto 0);
signal BUS_C:           std_logic_vector (0 to 3);
```
Gán theo vị trí nghĩa là hai mảng được xếp thẳng hàng đúng như lúc khai báo, dù
là `(3 downto 0)` hay `(0 to 3)`. Các vị trí trong mảng được ghép với nhau rồi
mới gán.

![](/images/blog/vhdl_training_3/1.png)
    Gán theo vị trí

Ở ví dụ thứ nhất, BUS_A và BUS_B đều là `std_logic_vector` bốn phần tử. Phép
gán theo vị trí diễn ra như hình, vì cả hai đều xếp theo chiều giảm.

Ở ví dụ thứ hai, mảng BUS_A xếp theo chiều giảm còn mảng BUS_C xếp theo chiều
tăng. Vì vậy xảy ra hiện tượng đảo bit như hình.

### 3.3 Cách viết giá trị khi gán array

Để phép gán mảng gọn và dễ đọc hơn:
* có thể chỉ định cơ số hexa hoặc bát phân
* và dùng dấu gạch dưới để dễ đọc hơn nữa, như ví dụ dưới đây

```vhdl
signal DATA_WORD : std_logic_vector(11 downto 0);

DATA_WORD <= X"A6F";
DATA_WORD <= "101001101111";
DATA_WORD <= O"5157";
DATA_WORD <= B"1010_0110_1111";
```

Bộ tổng hợp của Vivado **chỉ chấp nhận dấu gạch dưới** khi cơ số được ghi rõ
bằng ký hiệu **hex, octal hoặc binary**.

```vhdl
signal DATA_WORD : std_logic_vector(10 downto 0);
DATA_WORD <= B"100_0110_1111";
DATA_WORD <= X"46F";
```

Ví dụ 2 nói về độ dài mà mỗi cơ số kéo theo. Một literal có cơ số mang số bit
cố định trên mỗi chữ số: 1 bit cho binary, 3 bit cho octal, 4 bit cho
hexa. Vậy nên tổng bề rộng của literal phải khớp với tín hiệu được gán.

`DATA_WORD` rộng mười một bit. `B"100_0110_1111"` là mười một chữ số nhị phân,
nên dòng này hợp lệ — binary biểu diễn được mọi bề rộng. Còn `X"46F"` là ba chữ
số hexa, tức mười hai bit, và mười hai thì không nhét vào mười một được: đây
mới là dòng lỗi. Octal cũng bị ràng buộc tương tự ở mức 3 bit mỗi chữ số, nên
một vector mười một bit không viết được bằng octal lẫn hexa.

### 3.4 Array slice

Bạn tham chiếu được tới bất kỳ nhóm phần tử liền kề nào trong một mảng, gọi là
slice.

Slice là một mảng con của mảng một chiều, từ một phần tử cho tới trọn cả mảng.
* Tiền tố của slice là tên mảng cha
* Index của slice phải nằm trong range index của mảng cha

Ví dụ dưới đây có A, B và Z là các mảng, trong đó A và B có tám phần tử còn Z
có 16 phần tử.

```vhdl
signal A_VEC,B_VEC  : std_logic_vector (7 downto 0);
signal Z_VEC        : std_logic_vector (15 downto 0);
signal A_BIT, C_BIT, D_BIT: std_logic;

Z_VEC(15 downto 8) <= A_VEC;
B_VEC <= Z_VEC (12 downto 5);
A_VEC (1 downto 0) <= C_BIT & D_BIT;
Z_VEC (5 downto 1) <= B_VEC(1 to 5);
```

Trong bốn phép gán trên:
* Phép thứ nhất gán `A` vào tám bit cao của `Z (15 downto 8)`, hợp lệ vì cả A
  lẫn slice của Z đều 8 bit.
* Phép thứ hai gán một slice của mảng `Z` (12 downto 5) cho `B`, cũng hợp lệ vì
  kích thước khớp.
* Phép thứ ba gán `C` và `D` — hai giá trị 1 bit — vào slice `A(1 downto 0)`.
* Phép thứ tư không hợp lệ
    * Dù nó gán một slice của mảng B cho một slice của Z, và hai slice cùng độ
      dài
    * Nhưng chiều (tăng hay giảm) của slice B không nhất quán với chiều của
      mảng B. Mảng B khai báo ban đầu theo chiều giảm (7 downto 0), mà ở đây
      lại dùng theo chiều tăng (1 to 5).

#### Ví dụ về array slice

```vhdl
entity REG_4 is
port (
        reset   : in std_logic;
        clk     : in std_logic;
        d_in    : in std_logic_vector (3 downto 0);
        cntrl   : in std_logic_vector (1 downto 0);
        q       : out std_logic_vector (3 downto 0)
    );
end entity REG_4;
signal A : std_logic;
signal B : bit;
signal C : std_logic;
signal D : integer;
signal E : std_logic_vector (3 downto 0);

```

| Phép gán      | Kết luận  |
| :-:           | :-:       |
| A <= C        | ĐƯỢC      |
| A <= cntrl(1) | ĐƯỢC      |
| E <= d_in+1   | Tuỳ       |
| A <= B        | LỖI       |
| D <= E        | LỖI       |
| B <= D        | LỖI       |
| q <= cntrl    | LỖI       |

Đoạn code trên có input reset và clock kiểu `std_logic`, input `d_in` và
`cntrl` là mảng 4 bit và 2 bit. `q` là output 4 bit. Code cũng khai báo các
signal A, B, C, D và E.

* `A <= C` hợp lệ vì cả A và C đều kiểu `std_logic`.
* `A <= cntrl(1)` hợp lệ vì nó lấy ra một bit đơn (bit thứ hai từ phải sang)
  của cntrl rồi gán cho A. Ở đây cntrl là mảng std_logic, và một phần tử của
  mảng đó chính là một `std_logic`.
* `E <= d_in+1` là lỗi, vì `d_in` là `std_logic_vector` còn `1` là integer:
  `numeric_std` định nghĩa `+` cho `signed` và `unsigned`, chưa bao giờ cho
  `std_logic_vector`. Viết thành `E <= std_logic_vector(unsigned(d_in) + 1);`
  thì hợp lệ — cast sang kiểu có số học, cộng, rồi cast ngược lại.
* Với `A <= B`, A biểu diễn được toàn bộ thông tin của B (và còn thêm 7 giá trị
  nữa). Nhưng vì hai kiểu không bằng nhau nên phép gán này không hợp lệ.
* Với `D <= E`, dù E có thể chứa một mẫu bit biểu diễn một số nguyên, đó vẫn
  chỉ là mẫu bit không mang ý nghĩa. Phải chuyển E sang integer mới gán được
  cho integer.
* Với `B <= D`, cần một conversion function mới gán được, vì đây là gán một
  integer cho một bit.
* Với `q <= cntrl`, dù `q` và `cntrl` đều là `std_logic_vector`, `q` rộng 4 bit
  còn `cntrl` chỉ 2 bit; lỗi ở đây là kích thước chứ không phải kiểu.

### 3.5 String

String là **mảng** các character do người dùng định nghĩa.
* Range của nó luôn dương, khác 0, và nhỏ hơn số integer lớn nhất.
* Một khi đã định nghĩa, kích thước string là cố định, không đổi được.
* Hữu ích khi mô phỏng và debug để in ra text, message, warning hay error do
  người dùng đặt, và thường đi cùng câu lệnh assert.
* Nối string và character bằng toán tử '&'.

```vhdl
constant WARNING1: string (1 to 27) := "Unexpected Outputs Detected";
write(output, WARNING1 & '!');
```
* WARNING1 là hằng kiểu string với range bằng 27, được gán giá trị
  "Unexpected Outputs Detected".
* Dùng string này để in ra một warning trong code VHDL như trên.

### 3.6 Mô hình bộ nhớ bằng mảng giả hai chiều

Một cách tiện lợi để mô hình hoá cấu trúc bộ nhớ là tạo mảng giả hai chiều, tức
là mảng của mảng.

```vhdl
type MEM_ARRAY is array (0 to 3) of std_logic_vector (7 downto 0);
signal MY_MEM : MEM_ARRAY;
```

Ở ví dụ này, `MEM_ARRAY` là mảng bốn phần tử, và mỗi phần tử lại là một mảng
kiểu `std_logic`.

Sau khi khai báo mảng này, tạo tiếp signal `MY_MEM` kiểu `MEM_ARRAY`.

Các tool tổng hợp hiểu cấu trúc này là cách biểu diễn bộ nhớ.

![](/images/blog/vhdl_training_3/4.png)
    Mô hình bộ nhớ

### 3.7 Gán giá trị cho mảng

```vhdl
type MEM_ARRAY is array (0 to 3) of std_logic_vector (7 downto 0);
signal MY_MEM : MEM_ARRAY;
signal R_ADDR, W_ADDR : std_logic_vector (1 downto 0);
```
`MEM_ARRAY` ở đây là mảng của mảng, còn MY_MEM là signal kiểu đó.

R_ADDR và W_ADDR là các mảng dùng làm địa chỉ đọc và địa chỉ ghi.

Để gán giá trị cho mảng, trước hết vector địa chỉ đọc/ghi được chuyển sang
integer, rồi integer đó tham chiếu tới một hàng trong mảng.

Như vậy, đọc dữ liệu diễn ra ở dòng code thứ nhất, còn ghi dữ liệu ở dòng thứ
hai.

```vhdl
D_OUT <= MY_MEM (to_integer(unsigned(R_ADDR)));
...
MY_MEM (to_integer(unsigned(W_ADDR))) <= DATA_IN;
```

### 3.8 Mảng nhiều chiều

Bạn dựng được mảng nhiều chiều thật sự bằng cách tạo một kiểu do người dùng
định nghĩa với kích thước mong muốn.

Ví dụ dưới tạo mảng hai chiều MATRIX_A kiểu std_logic và mảng ba chiều MATRIX_B
kiểu integer.

```vhdl
type MATRIX_A is array (1 to 3, 1 to 16) of std_logic;
type MATRIX_B is array (1 to 3, 1 to 3, 1 to 3) of integer range -1024 to 1023;

type MATRIX_3x16        : MATRIX_A  := (others => (others => '0'));
type MATRIX_3x3x3       : MATRIX_B  := (others => (others => (others => '0')));
```

* Khởi tạo thực hiện giống như với record. Ký hiệu `(others=>(others=>0))` là
  dạng "đệ quy" của phép gán aggregate.

* Truy cập tới một điểm bất kỳ bằng ký hiệu sau:

```vhdl
MATRIX_3x16 (3,15) <= '1';
value <= MATRIX_3x3x3 (2,1,3);
```

Ví dụ dưới đây cho thấy cách nhân một mảng nhiều chiều với một số vô hướng:

```vhdl
mmult: process
    type tMATRIX_3x3x3 is array(1 to 3, 1 to 3, 1 to 3) of integer range -1024 to 1023;
    variable matrix3D   : tMATRIX_3x3x3 := (others=>(others=>(others=>0)));
    constant k          : integer := 7;
begin
    -- sparsely populate the matrix
    matrix3D(1,2,3) := 4;   matrix3D(1,3,1) := -10;
    matrix3D(2,2,2) := 100; matrix3D(2,3,4) := -50;

    -- Loop through the matrix and multiply each element by a scalar
    rowLoop: for row in 1 to 3 loop
        colLoop: for col in 1 to 3 loop
            dthLoop: for depth in 1 to 3 loop
                report  integer'image(row) & "," & integer'image(col) & "," &
                        integer'image(depth) & " * " & integer'image(k);
                matrix3D (row,col, depth) := k * matrix3D (row,col,depth);
                report " " & integer'image(matrix3D (row,col,depth));
            end loop dthLoop;
        end loop colLoop;
    end loop rowLoop;
wait;
end process mmult;
```

Ở ví dụ này có một mảng ba chiều, mỗi phần tử bên trong kiểu integer.

Một variable matrix3D kiểu đó được tạo ra và khởi tạo về 0.

Sau đó từng phần tử của matrix3D được nhân với một hằng vô hướng để ra kết quả.

## 4. Record

### 4.1 Record là gì?

Record là một nhóm phần tử có thể **khác kiểu** nhau. Ví dụ:

```vhdl
type PACKET is record
PARITY      : bit;
ADDRESS     : std_logic_vector (0 to 3);
DATA_BYTE   : std_logic_vector (7 downto 0);
NUM_VALUE   : integer range 0 to 6;
STOP_BITS   : bit_vector (1 downto 0);
end record;
...
signal TX_PACKET, RX_PACKET : PACKET;
```

PACKET là một record với các phần tử:

* PARITY kiểu bit
* ADDRESS là mảng bốn phần tử kiểu std_logic
* DATA_BYTE là mảng tám phần tử kiểu std_logic
* NUM_VALUE kiểu integer
* STOP_BITS là mảng hai phần tử kiểu bit

Các phần tử này nằm nối tiếp nhau như hình.

![](/images/blog/vhdl_training_3/3.png)
    Record PACKET

### 4.2 Mảng của record

Với các ứng dụng xử lý packet, mảng của record rất hữu ích. Khả năng gom nhiều
kiểu dữ liệu khác nhau lại mang tới độ linh hoạt lớn.

```vhdl
type PACKET is record
PARITY      : bit;
ADDRESS     : std_logic_vector (0 to 3);
DATA_BYTE   : std_logic_vector (7 downto 0);
NUM_VALUE   : integer range 0 to 6;
STOP_BITS   : bit_vector (1 downto 0);
end record;
...
signal TX_PACKET, RX_PACKET : PACKET;
```
`PACKET` ở đây là record có năm phần tử, trong đó `PARITY` kiểu `bit`, còn lại
là các mảng với độ dài khác nhau.

```vhdl
type DATA_ARRAY is array (0 to 2) of PACKET;
signal MY_DATA : DATA_ARRAY;
```

Sau khi khai báo record `PACKET`, tạo tiếp kiểu mới `DATA_ARRAY` — mảng ba phần
tử kiểu record `PACKET`.

Rồi khai báo signal MY_DATA kiểu `DATA_ARRAY`. Hình dưới minh hoạ MY_DATA với
cả ba phần tử.

![](/images/blog/vhdl_training_3/5.png)

## 5. Array aggregate và record aggregate

### 5.1 Array aggregate

Aggregate là cách tiện lợi để gom cả kiểu scalar lẫn kiểu composite lại để gán.

Chúng đặt trong dấu ngoặc đơn và ngăn cách bằng dấu phẩy.

Chỉ các biến kiểu scalar mới được phép nằm trong aggregate ở vế trái.

```vhdl
signal H_BYTE, L_BYTE   : std_logic_vector (0 to 7);
signal Q_OUT            : std_logic_vector (31 downto 0);
signal A, B, C, D       : std_logic;
signal WORD             : std_logic_vector (3 downto 0);

(A, B, C, D) <= WORD;
```

Một aggregate gồm A, B, C, D được gán bằng WORD — một mảng `std_logic`. Hợp lệ,
vì hai vế cùng độ dài và cùng kiểu phần tử `std_logic`.

```vhdl
WORD <= (2 => '1', 3 => D, others => '0');
```
Ở ví dụ này, index 2 và 3 của mảng WORD được gán giá trị cụ thể là '1' và D,
còn các index khác nhận giá trị '0' nhờ từ khoá `others`.

```vhdl
Q_OUT <= (others => '0');
```
Có thể dùng từ khoá `others` như một phép gán mặc định, không phụ thuộc kích
thước mảng, như ví dụ thứ ba.

```vhdl
WORD <= (A,B,C,D);
```
Ví dụ thứ tư ngược hoàn toàn với ví dụ thứ nhất, và cũng hợp lệ.

```vhdl
H_BYTE <= (7|6|0|1 => '1', 2 to 5 => '0');
```
Ví dụ thứ năm gán giá trị '1' cho index 7, 6, 0, 1 của H_BYTE và '0' cho index
2 tới 5. Chú ý hai cách viết choice: `|` liệt kê từng index, còn `to` cho một
dải.

### 5.2 Record aggregate

Tương tự array aggregate, record cũng dùng được aggregate:

```vhdl
type D_WORD is record
    UPPER : std_logic_vector (7 downto 0);
    LOWER : std_logic_vector (7 downto 0);
end record;

signal DATA_WORD        : D_WORD;
signal H_BYTE, L_BYTE   : std_logic_vector (0 to 7);
```

 ```vhdl
 DATA_WORD <= (H_BYTE, L_BYTE);
 DATA_WORD <= (LOWER => L_BYTE, UPPER => H_BYTE);
 DATA_WORD <= (LOWER | UPPER => H_BYTE);
 DATA_WORD <= (others => H_BYTE);
 
 ```
`DATA_WORD` là một record có hai field `UPPER` và `LOWER`, đều là
`std_logic_vector` tám bit. Cả bốn cách viết trên đều hợp lệ, và chúng đúng là
bốn cách mà array cũng có: theo vị trí, gọi tên field, nhiều field dùng chung
một giá trị bằng `|`, và `others` cho phần còn lại. Điểm riêng của record là
không được trộn lẫn phần tử gọi tên với phần tử theo vị trí trong cùng một
aggregate, và `others` chỉ dùng được khi mọi field còn lại cùng kiểu.
