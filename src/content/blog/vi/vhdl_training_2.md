---
title: 'VHDL - Kiểu dữ liệu scalar'
description: 'Phần 2 của series VHDL: các kiểu scalar từ bit và boolean tới std_ulogic và std_logic, integer và real, casting so với conversion function, cùng subtype, character, physical type và enumerated type dựng trên chúng.'
date: 2023-02-25
lang: vi
key: vhdl_training_2
tags: ['vhdl']
series: 'VHDL training'
seriesOrder: 2
---

## 1. Kiểu dữ liệu scalar

Mục tiêu:
* Dùng đúng kiểu dữ liệu khi khai báo port và signal
* Liệt kê được các giá trị hợp lệ của kiểu std_logic
* Tạo được kiểu dữ liệu scalar

### 1.1 Kiểu dữ liệu

* Kiểu dữ liệu trong VHDL là một cái tên gắn với một tập giá trị và một tập
  phép toán.
* Dải kiểu dữ liệu phong phú cho phép mô hình hoá phần cứng linh hoạt, đồng
  thời tự kiểm tra để đảm bảo các tín hiệu tương thích với nhau trong những mô
  hình lớn và phức tạp.
* Mỗi đối tượng (`signal`, `variable`, `constant` hay `port`) đều phải xác định
  kiểu ngay khi khai báo.
* Một kiểu dữ liệu chỉ nhận những giá trị nằm trong dải của nó.
* Vì VHDL là ngôn ngữ định kiểu chặt (strongly typed), các data object nối với
  nhau phải cùng kiểu. Ví dụ, signal kiểu `bit` chỉ nối được với signal cũng
  kiểu `bit`.

VHDL có sẵn không nhiều kiểu dữ liệu "built-in", nhưng các thư viện mở rộng con
số đó lên đáng kể.

### 1.2 Các kiểu scalar

Kiểu scalar trong VHDL biểu diễn một giá trị đơn, gồm:
* bit
* boolean
* std_logic
* integer
* real
* character
* các đại lượng vật lý (physical type)
* enumerated type, để đọc ra là hiểu ngay

### 1.3 bit và boolean

**bit**

* Kiểu dữ liệu built-in
* Nhận giá trị 0 và 1
* Chạy mô phỏng nhanh vì chỉ có hai trạng thái
* Gọn gàng để mô hình hoá logic, nhưng không mô tả đủ sát phần cứng thật
* Gần như không dùng cho tổng hợp và đã bị `std_logic` thay thế

```vhdl
architecture Behavioral of mux is
signal A, B, SEL, Z : bit;
begin
    Z <= A when (SEL = '1') else B;
end Behavioral;
```

`A`, `B`, `SEL` và `Z` khai báo kiểu bit, mô tả hành vi của một multiplexer đơn
giản.

**boolean**

* Hay dùng trong mô hình hoá hành vi
* Nhận giá trị True hoặc False
* Hữu ích khi mô tả ở mức trừu tượng cao hơn
* Tổng hợp được; xuất hiện nhiều trong testbench

Cả hai kiểu này đều lấy từ library `STD`, package `Standard`. Chúng được định
nghĩa sẵn và ngầm định cho mọi mô hình VHDL, nên không bao giờ phải khai báo
library một cách tường minh.

### 1.4 std_ulogic và std_logic

**std_ulogic**

`std_ulogic` phát triển từ hệ Multi-Value Logic (MVL), cho phép mô hình hoá
phần cứng chi tiết.

Chữ `u` trong `std_ulogic` nghĩa là unresolved.

Nó cho biết sẽ có một hàm, tại một thời điểm nào đó sau khi biên dịch ban đầu,
đưa tín hiệu về trạng thái đã resolve.

`std_ulogic` nhận các giá trị:
* `U` chưa khởi tạo
* `X` unknown mức mạnh
* `0` mức 0 mạnh
* `1` mức 1 mạnh
* `Z` trở kháng cao
* `W` unknown mức yếu
* `L` mức 0 yếu
* `H` mức 1 yếu
* `-` don't care

Nó hỗ trợ các mức tín hiệu mạnh yếu khác nhau, điều kiện don't care, và tristate
driver.

Kiểu này được định nghĩa trong package `std_logic_1164` của `IEEE`.

**std_logic**

`std_logic` là dạng đã resolve của `std_ulogic` và được dùng phổ biến hơn.

Nó nhận đúng chín giá trị như `std_ulogic`.

Bảng đi kèm kiểu `std_logic` gọi là resolution table. Bảng này trả lời câu hỏi:
khi nhiều giá trị cùng được gán vào một signal thì giá trị nào sẽ được lấy.

Cả `std_logic` và `std_ulogic` thực chất đều là enumerated type, và giá trị của
chúng luôn phải viết hoa.

#### std_ulogic so với std_logic

Hai kiểu này có cùng tập giá trị. Khác nhau nằm ở cách hiện thực.

Nếu người dùng lái hai tín hiệu trở lên vào một output chung:

* nếu output chung đó kiểu `std_ulogic` thì báo lỗi và không được resolve.
  `std_ulogic` chính là cơ chế kiểm tra sẵn có để bắt lỗi vô tình tạo nhiều
  driver.
* còn với kiểu `std_logic` thì có sẵn một resolution function xử lý tình huống
  nhiều driver.

```vhdl
architecture rtl of example is
signal OUT_1: std_ulogic;
signal A, B, C, RES_OUT: std_logic;

begin
    OUT_1 <= A;
    OUT_1 <= B;
    OUT_1 <= C;
    
    RES_OUT <= A;
    RES_OUT <= B;
    RES_OUT <= C;
end architecture;
```

Ở đây, tín hiệu `OUT_1` sẽ báo lỗi, còn `RES_OUT` kiểu `std_logic` thì qua được
bước biên dịch nhưng thường không qua nổi bước implementation vì có nhiều
driver.

#### Resolve tín hiệu

Xử lý vấn đề nhiều driver thế nào?

Dùng kỹ thuật mô hình hoá tristate buffer.

* Trước hết, tín hiệu `RES_OUT` phải có kiểu `std_logic`
* Sau đó, tristate buffer được hiện thực bằng câu lệnh gán tín hiệu có điều
  kiện

Ở mức board, các tín hiệu này được ghép qua output open-drain hoặc
open-collector — trong trường hợp đó, mức 1 yếu (`H`) và mức 0 yếu (`L`) của
`std_logic` mô tả được tình huống này.

```vhdl
signal A, B, C, RES_OUT: std_logic;
RES_OUT <= A when EN0 = '1' else 'Z';
RES_OUT <= B when EN1 = '1' else 'Z';
RES_OUT <= C when EN2 = '1' else 'Z';
```

## 2. Integer và real

### 2.1 Integer

* Cho phép biểu diễn số lượng một cách linh hoạt và trực quan
* Việc chỉ định range của integer có ảnh hưởng lớn khi tổng hợp
* Không chỉ định range thì trình biên dịch mặc định lấy range lớn nhất
* Tổng range của kiểu integer phụ thuộc phần nào vào trình biên dịch
* Tuy nhiên mặc định là từ -2^31+1 tới 2^31-1, tức một giá trị 32 bit

**Cú pháp**
```vhdl
type integer is range ...
```

**Ví dụ**
```vhdl
signal A: integer range 0 to 7;
signal B: integer range 15 downto 0;
```

### 2.2 Real

* Cho phép dùng số dấu phẩy động trong dải +1e38 tới -1e38
* Dùng để scale và offset các kiểu dữ liệu vật lý
* Dùng cho các mục đích thuần toán học
* Dùng với hằng số vật lý (như Time hay Voltage) trong môi trường mô phỏng
* Kiểu real cũng dùng được trong code tổng hợp được, miễn là kết quả nó tạo ra
  giải được ngay tại thời điểm tổng hợp

**Cú pháp**
```vhdl
type real is range ...
```

**Ví dụ**
```vhdl
type CAPACITY is range -25.0 to 25.0;
signal SIG_1: CAPACITY := 3.0;
```

### 2.3 Làm được gì và không làm được gì với integer và real

* Nói chung, mọi dạng so sánh (>, <, >=, <=, =, /=) đều hợp lệ với integer và
  real
* Cần thận trọng khi kiểm tra bằng nhau với số real, vì phép kiểm tra này không
  đáng tin
* Chỉ nên so sánh
    * integer với integer
    * real với real
* Có thể dùng type conversion hoặc cast để đưa về cùng "type"
* Các phép toán cơ bản (`+, -, *, /, mod, rem`) đều thực hiện được trên
  `integer` và `real`
* Cần cẩn thận vì một số phép trong đó gây vấn đề khi tổng hợp dù mô phỏng vẫn
  chạy bình thường

## 3. Chuyển đổi kiểu dữ liệu

Vì bản chất VHDL là ngôn ngữ định kiểu chặt, gán kiểu này sang kiểu kia là bất
hợp lệ. Muốn đổi thì phải qua một cơ chế chuyển đổi.

VHDL có hai cơ chế:

* Casting
* Conversion function

### 3.1 Type casting

* Dùng để đi lại giữa `std_logic_vector` và `signed`/`unsigned`
* Cast giữa `std_logic_vector` với `signed` hoặc `unsigned` chỉ dùng được khi
  tín hiệu nguồn và đích có cùng độ rộng bit

Ví dụ:

```vhdl
signal ex1 : std_logic_vector(3 downto 0);
signal ex2 : signed(3 downto 0);
signal ex3 : unsigned(3 downto 0);

ex2 <= signed(ex1);
ex3 <= unsigned(ex1);
ex1 <= std_logic_vector(ex2);
```

* `ex2 <= signed(ex1)` cast tín hiệu kiểu `std_logic_vector` (ex1) sang kiểu
  `signed` rồi lưu vào ex2 vốn cũng kiểu `signed`.
* `ex3 <= unsigned(ex1)` tương tự, cast `std_logic_vector` (ex1) sang kiểu
  `unsigned`.
* `ex1 <= std_logic_vector(ex2)` cast tín hiệu kiểu `signed` (ex2) sang
  `std_logic_vector`.

### 3.2 Conversion function

* Dùng để đi lại giữa `signed`/`unsigned` và `integer`
* Integer không có độ rộng bit cố định, nên hàm chuyển từ `integer` sang
  `signed`/`unsigned` phải kèm theo độ rộng bit mong muốn

```vhdl
signal ex1: signed(3 downto 0);
signal ex2: integer;

ex1 <= to_signed (ex2, ex1'length);
ex2 <= to_integer(ex1);
```

* `ex1 <= to_signed (ex2, ex1'length)` chuyển một integer (ex2) sang kiểu
  signed bằng hàm `to_signed` trong package `numeric_std`, lưu kết quả vào
  `ex1` kiểu `signed`.
* `ex2 <= to_integer(ex1)` tương tự, hàm `to_integer` chuyển kiểu `signed` sang
  `integer`.

### 3.3 std_logic_vector sang/từ integer

Hai phép chuyển đổi hay cần đến nhất trong VHDL:

* Từ `std_logic_vector` sang `integer`
* Từ `integer` sang `std_logic_vector`

Từ std_logic_vector sang integer:

```vhdl
integer_value <= to_integer( unsigned(slv_value));
```

Từ integer sang std_logic_vector:

```vhdl
slv_value <= std_logic_vector(to_unsigned( integer_value, n ));
```

## 4. Type và subtype

#### Type

* Định nghĩa một tập giá trị
* Package STD định nghĩa sẵn một số type như `integer`, `real`, `bit`…
* Type mới tạo được bằng enumeration, array, record…

```vhdl
type mem_array is array (integer range 0 to 1023) of std_logic_vector(15 downto 0);
```

Ví dụ trên tạo ra type mới tên `mem_array`. Sau khi tạo, `mem_array` trở thành
một type đầy đủ, dùng để khai báo signal hay variable mới. Ở đây type được tạo
là một mảng `std_logic_vector` rộng 16 bit, gồm 1024 phần tử.

#### Subtype

* Cung cấp cơ chế giới hạn range của một type
* Dùng trong mô phỏng để kiểm tra biên
* Phần cứng thì không có khái niệm kiểm tra biên, nên subtype chỉ có tác dụng
  giảm số bit cần để mô tả một signal hay variable, và nhờ đó giảm bớt các
  warning không cần thiết

```vhdl
subtype <new subtype name> is <type or subtype name>;

subtype ROM_MEMORY_RANGE is integer range 0 to 255;
```

Cú pháp luôn dựa trên một type đã có, vì subtype chỉ tinh chỉnh cách dùng của
một type hoặc subtype đã định nghĩa trước đó bằng cách thu hẹp phạm vi.

Ví dụ trên tạo subtype `ROM_MEMORY_RANGE`, giới hạn range integer (mặc định tối
thiểu 32 bit) xuống còn 8 bit.

## 5. Character và string

#### Character

* VHDL hỗ trợ kiểu character
* Character viết trong dấu nháy đơn
* Kiểu character tổng hợp được

```vhdl
type character is (nul, sol, stx, ...);

constant MY_CHAR : character := 'Q';
```

Hằng `MY_CHAR` kiểu character, được gán giá trị 'Q'.

#### String

* String là mảng các character
* Đặt trong dấu nháy kép
* Đã định nghĩa rồi thì không đổi được nữa
    * Một khi kích thước string đã cố định, nó không đổi được, kể cả khi giá
      trị string mới ngắn hơn kích thước đã định. Phần dư sẽ còn sót lại nội
      dung của giá trị cũ.
    * Kích thước string luôn bắt đầu từ 1, vì nó là `positive range<>`

```vhdl
type string is array (positive range <>) of character;
constant msg: string (1 to 10) := "setup time";
```

Một hằng `msg` kiểu string với range mười ký tự, được gán giá trị "setup time".

## 6. Physical type

* Dùng để định lượng các khái niệm và đại lượng vật lý ngoài đời như `mass`,
  `length`, `time`…
* `time` là physical type duy nhất được định nghĩa sẵn
* Các physical type khác thì tự viết lấy hoặc nạp tường minh từ thư viện IEEE
* Nói chung không tổng hợp được
* Một physical type phải được định nghĩa theo đơn vị chính của nó. Mọi đơn vị
  phụ phải là bội của đơn vị chính. Lưu ý các đơn vị phải là kiểu integer chứ
  không phải real.

```vhdl
type time is range -2147483647 to 2147483647
units
fs;
ps = 1000 fs;
ns = 1000 ps;
us = 1000 ns;
ms = 1000 us;
...
end units;
```
* Trên đây là cú pháp của `time` do IEEE định nghĩa, kèm range của nó.
* Ở đây `fs` là đơn vị chính, mọi đơn vị phụ đều định nghĩa dựa trên `fs`.

```vhdl
constant TPD : time := 3 ns;
...
Z <= A after TPD;
```

Trong ví dụ này, hằng `TPD` kiểu time, được khởi tạo với giá trị 3 ns.

## 7. Enumerated type

* Liệt kê một tập tên hoặc giá trị để định nghĩa một type mới
* Dùng những giá trị đọc ra là nhận ra ngay và gắn trực tiếp với hoạt động của
  mô hình
* Làm code dễ đọc hơn hẳn, nhất là khi mô tả state machine và các hệ phức tạp

Cú pháp:

```vhdl
type <new type name> is (<list of items>);
```

* `<new type name>` là một identifier hợp lệ bất kỳ
* `<list of items>` là danh sách các mục, ngăn cách bằng dấu phẩy, mỗi mục là
  một identifier hợp lệ
* Mặc định, các giá trị enumerated được mã hoá tuần tự từ trái sang phải trong
  dấu ngoặc

```vhdl
type MY_STATE is (RST, LOAD, FETCH, STORE, SHIFT);
...
signal STATE, NEXT_STATE: MY_STATE;
...

case (STATE) is
    when LOAD =>
        if COND_A and COND_B then
            NEXT_STATE <= FETCH;
        else
            NEXT_STATE <= STORE;
        ...
```

Trong ví dụ này:
* `MY_STATE` là kiểu enumerated
* Nhận các giá trị
    * "000" = RST
    * "001" = LOAD
    * "010" = FETCH
    * "011" = STORE
    * "100" = SHIFT

* Các tool tổng hợp khác nhau có thể áp dụng sơ đồ mã hoá khác nhau, tuỳ vào
  thuật toán tối ưu riêng cho từng công nghệ hoặc các yếu tố độc quyền khác.

* Hai điểm về enumerated literal mà người mới hay vấp:
    * Chúng là identifier, nên **không** đặt trong dấu nháy. Viết `IDLE`, không
      phải `"IDLE"` và cũng không phải `'IDLE'`. Có dấu nháy là thành string
      hoặc character literal, tức một kiểu hoàn toàn khác.
    * Chúng không phân biệt hoa thường như mọi identifier khác trong VHDL, nên
      `IDLE` và `Idle` là một. Ngoại lệ là các character literal trong
      `std_logic` — ở đó `'X'` và `'x'` khác nhau thật, vì chúng là character
      chứ không phải identifier.

```vhdl
type rx_states is (IDLE, START, DATA, PARITY, STOP);
type tx_states is (IDLE, START, DATA, PARITY, STOP);

signal rx_state: rx_states := IDLE;
signal tx_state: tx_states := IDLE;
```

Xét ví dụ một UART transmitter và receiver. Ở đây `rx_states` và `tx_states`
đều là kiểu enumerated.

* Dù tên các state của `rx_states` và `tx_states` giống hệt nhau, "IDLE" định
  nghĩa trong `rx_states` không phải là "IDLE" định nghĩa trong `tx_states`.
* Các state này có thể được mã hoá khác nhau khi tổng hợp, và chúng được coi là
  hai kiểu hoàn toàn khác nhau.

Cho dễ hình dung, có thể coi danh sách state trong `rx_states` là
`rx_states.IDLE`, `rx_states.START`… và tương tự, các state trong `tx_states`
là `tx_states.IDLE`, `tx_states.START`…
