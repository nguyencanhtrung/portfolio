---
title: 'VHDL - Procedure'
description: 'Procedure trong VHDL: mode và class của tham số, khai báo ở đâu để đúng phần code nhìn thấy được, cùng hai ví dụ thực tế — một routine truy cập bus cho testbench và một procedure ghi register field tổng hợp được.'
date: 2022-11-28
lang: vi
key: vhdl-procedures
tags: ['vhdl']
series: 'VHDL training'
seriesOrder: 5
---

## 1. Procedure trong VHDL

Trong một thiết kế lớn, có những đoạn code bị lặp lại hoặc được gọi nhiều lần.

Một khối chung đóng gói một chức năng nào đó trong thiết kế được gọi là
sub-program.

Procedure là một dạng sub-program, có thể gọi nhiều lần ở khắp thiết kế.

**Lợi ích của việc dùng procedure**

* Tránh lặp code
* Khai báo được với hoặc không có tham số
* Có được cổng input, output và inout
* Có thể có hoặc không có timing delay, vì procedure được phép thực thi trong
  khoảng thời gian mô phỏng khác 0

## 2. Những điểm cần nhớ về procedure

* Không trả về giá trị như function
* Khác function, procedure chứa được câu lệnh `wait`
* Không cần chỉ định độ dài của kiểu dữ liệu như khi khai báo port. Chỉ cần ghi
  kiểu, ví dụ `std_logic_vector`, là đủ.
* Procedure khai báo được có hoặc không có tham số
  * Procedure không tham số dùng để chạy một chuỗi sự kiện — chủ yếu gặp trong
    testbench, nơi procedure được dùng để lái một số tín hiệu cụ thể
  * Tham số (input/output/inout) của procedure có thể là signal, variable hoặc
    constant
* Procedure được khai báo trong vùng declarative của architecture, hoặc trong
  package

## 3. Cấu trúc của procedure

**Cú pháp**

```vhdl
procedure PROC1 ( <class> <arg1> : <mode|direction> <type>;
                  <class> <arg2> : <mode|direction> <type> ) is

variable VAR1;
<declarations_for_use_within_the_procedure>
begin
  <sequential statements ...>
end procedure PROC1;

```

Danh sách tham số của procedure định nghĩa đầu vào và đầu ra của nó, gần giống
một module thu nhỏ. Tham số có thể là signal hoặc constant, nhưng khác module ở
chỗ nó còn có thể là variable. Giữa hai từ khoá `is` và `begin`, bạn khai báo
được những đối tượng chỉ có hiệu lực bên trong procedure: constant, variable,
type, subtype và alias — nhưng không có signal.

Khác function, procedure chứa được câu lệnh `wait`. Vì vậy nó hay được dùng
trong testbench như một BFM đơn giản để mô phỏng interface, hoặc để kiểm tra
đầu ra của DUT.

### 3.1 Tham số của procedure

Tham số của procedure tương tự như khai báo port.

Có thể là:

* Mode IN
* Mode OUT
* Mode INOUT

Bên trong procedure, tham số với mode tương ứng bị ràng buộc như bảng sau:

| Mode  | Đọc được | Thay đổi được |
| :-:   | :-:      | :-:  |
| IN    | Có       | Không   |
| OUT   | Không    | Gán ngược về nơi gọi |
| INOUT | Có       | Gán ngược về nơi gọi |

Quy tắc "mode OUT không đọc được" là ràng buộc của VHDL-93. VHDL-2008 đã bỏ
ràng buộc này, nên tham số OUT đọc lại được bên trong procedure — nhưng chỉ khi
tool thực sự chạy ở chế độ 2008, điều mà nhiều flow tổng hợp không bật.

**Ví dụ**

```vhdl
procedure SLV_REVERSE   ( SLV_IN  : IN  std_logic_vector;
                          SLV_OUT : OUT std_logic_vector
                        ) is
  -- Đưa cả hai tham số về cùng một range downto đánh số từ 0, để procedure
  -- chạy đúng bất kể nơi gọi khai báo vector kiểu gì.
  alias a : std_logic_vector(SLV_IN'length-1 downto 0)  is SLV_IN;
  alias b : std_logic_vector(SLV_OUT'length-1 downto 0) is SLV_OUT;
begin
  for i in a'range loop
    b(a'length-1 - i) := a(i);
  end loop;
end procedure SLV_REVERSE;

```

Có hai chi tiết trong đoạn trên đáng dừng lại, vì cả hai đều rất dễ sai:

- `SLV_OUT` không khai báo class, nên theo bảng ở mục 3.2 nó là **variable**, và
  variable thì gán bằng `:=`. Viết `<=` ở đây sẽ không biên dịch được. Muốn
  dùng `<=` thì phải khai báo `signal SLV_OUT : out std_logic_vector`.
- Đừng bao giờ đánh index một tham số unconstrained bằng range cứng. Nơi gọi
  mới là chỗ quyết định vector của họ là `downto` hay `to`, và bắt đầu từ đâu.
  Hai dòng alias ghim cả hai tham số về cùng một range `downto` đánh số từ 0,
  và vòng lặp làm việc trên đó.

Gọi procedure trên như sau:

```vhdl
SLV_REVERSE   ( SLV_IN      => D_IN, 
                SLV_OUT     => D_OUT
              );
```

Để ánh xạ hợp lệ, `formal` và `actual` phải trùng nhau về `data type`, `class`
và `mode`.

### 3.2 Class của tham số

VHDL hỗ trợ bốn class đối tượng:

* Constant
* Variable
* Signal
* File

Nếu không chỉ định class trong danh sách tham số, class mặc định sẽ được dùng:

| Mode  | Class mặc định |
| :-:   | :-:   |
| IN    | constant |
| OUT   | variable |
| INOUT | variable |

### 3.3 Chỉ định tường minh class của tham số

Chỉ định tường minh class cho tham số input và output của procedure thường rất
có ích. Nó làm việc sử dụng đơn giản hơn và mở rộng khả năng của procedure.

Đây là ví dụ khi không chỉ định class trong danh sách tham số:

![](/images/blog/vhdl-procedures/3.png)

Ta cần một variable `TEMP_BUS` để chuyển giá trị sang signal `OUT_BUS`.

Còn đây là khi chỉ định tường minh class:

![](/images/blog/vhdl-procedures/4.png)

Có thể thấy, với khai báo tường minh thì không cần variable `TEMP_BUS` để
chuyển giá trị sang signal `OUT_BUS` nữa.

## 4. Khai báo procedure ở đâu?

**Trong vùng declarative của architecture**

```vhdl
library ieee;
  use IEEE.std_logic_1164.all;
  use IEEE.numeric_std.all;

entity tb is
end entity tb;

architecture behavior of tb is
  ...

  procedure AXIS_SEND (
              signal clk      : in std_logic;
              constant value    : in std_logic_vector;
              constant nBeats   : in integer;
              signal bCounter   : inout integer;
              signal tready   : in std_logic;
              signal tdata    : out std_logic_vector;
              signal tvalid   : out std_logic;
              signal tstrb    : out std_logic_vector(DATA_WIDTH/8-1 downto 0);
              signal tkeep    : out std_logic_vector(DATA_WIDTH/8-1 downto 0);
              signal tuser    : out std_logic;
              signal tlast    : out std_logic
    ) is
  begin
    wait until rising_edge(clk) and tready = '1';
    tdata   <= value;
    tvalid  <= '1';
    tstrb   <= (OTHERS => '1');
    tkeep   <= (OTHERS => '1');
    tuser   <= '0';
    if (bCounter = nBeats) then
      tlast   <= '1';
      bCounter <= 1;
    else
      tlast   <= '0';
      bCounter <= bCounter + 1;
    end if;
  end procedure AXIS_SEND;

  ...


begin

...

rx_test_proc: process
...
begin
  ...

    
    for ii in 1 to NUM_FRAMES loop
      for jj in 1 to (NUN_BYTES_PER_FRAME/16) loop
        ...

        AXIS_SEND (
                clk     => clk,
                value   => send_value,
                nBeats  => NUN_BYTES_PER_FRAME/16,
                bCounter=> bCounter,
                tready  => din_tready,
                tdata   => din_tdata,
                tvalid  => din_tvalid,
                tstrb   => din_tstrb,
                tkeep   => din_tkeep,
                tuser   => din_tuser,
                tlast   => din_tlast
      );

      end loop;
      ...
    end loop;
    ...
  end loop;

  wait;
end process rx_test_proc;

...

end architecture;
```

**Trong package**

```vhdl
library ieee;
  use IEEE.std_logic_1164.all;
  use IEEE.numeric_std.all;


-- Package declaration section
package soc_sim is
  -- constants
  constant AXI_LITE_ADDR_WIDTH : integer := 8;
  constant AXI_LITE_DATA_WIDTH : integer := 64;
  constant DATA_WIDTH          : integer := 128;

  -- types


  -- components


  -- function prototypes


  -- procedure prototypes

  procedure AXIS_SEND (
              signal clk      : in std_logic;
              constant value    : in std_logic_vector;
              constant nBeats   : in integer;
              signal bCounter   : inout integer;
              signal tready   : in std_logic;
              signal tdata    : out std_logic_vector;
              signal tvalid   : out std_logic;
              signal tstrb    : out std_logic_vector(DATA_WIDTH/8-1 downto 0);
              signal tkeep    : out std_logic_vector(DATA_WIDTH/8-1 downto 0);
              signal tuser    : out std_logic;
              signal tlast    : out std_logic
  );

end package soc_sim;

package body soc_sim is

  -- function detail

  -- procedure detail

  --
  -- AXIS SEND
  --
  procedure AXIS_SEND (
              signal clk      : in std_logic;
              constant value    : in std_logic_vector;
              constant nBeats   : in integer;
              signal bCounter   : inout integer;
              signal tready   : in std_logic;
              signal tdata    : out std_logic_vector;
              signal tvalid   : out std_logic;
              signal tstrb    : out std_logic_vector(DATA_WIDTH/8-1 downto 0);
              signal tkeep    : out std_logic_vector(DATA_WIDTH/8-1 downto 0);
              signal tuser    : out std_logic;
              signal tlast    : out std_logic
    ) is
  begin
    
    wait until rising_edge(clk) and tready = '1';

    tdata   <= value;
    tvalid  <= '1';
    tstrb   <= (OTHERS => '1');
    tkeep   <= (OTHERS => '1');
    tuser   <= '0';

    if (bCounter = nBeats) then
      tlast   <= '1';
      bCounter <= 1;
    else
      tlast   <= '0';
      bCounter <= bCounter + 1;
    end if;

  end procedure AXIS_SEND;

end package body soc_sim;

```

Trong testbench:

```vhdl
library work;
  use work.soc_sim.all;
```

## 5. Ví dụ thực tế

### 5.1 Truy cập BUS (testbench)

```vhdl
p_control : process
  procedure wait_clk(signal i_clk : in std_logic; val : in integer) is
  begin
    for i in 1 to val loop
      wait until rising_edge(i_clk);
    end loop;
  end procedure wait_clk;

  procedure bus_write(
    i_addr             : in  std_logic_vector(31 downto 0);
    i_data             : in  std_logic_vector(31 downto 0);
    signal i_clk       : in  std_logic;
    signal o_csb       : out std_logic;
    signal o_wrb       : out std_logic;
    signal o_rdb       : out std_logic;
    signal o_addr      : out std_logic_vector(31 downto 0);
    signal o_data      : out std_logic_vector(31 downto 0);
    log_on             : in  boolean ) is
  variable L : line;
  variable t : time;
  begin
    wait_clk(i_clk, 1);
    t := now;
    
    o_csb       <= '0';
    o_wrb       <= '1';
    o_rdb       <= '1';
    o_addr      <= i_addr;
    o_data      <= i_data;
    
    wait_clk(i_clk, 1);
    o_csb       <= '0';
    o_wrb       <= '0';
    o_rdb       <= '1';
    wait_clk(i_clk, 3);
    o_csb       <= '0';
    o_wrb       <= '1';
    wait_clk(i_clk, 1);
    o_csb       <= '1';
    o_wrb       <= '1';
    write(L,now, justified => right, field=>20,unit=>ns);
    write(L, string'(" << WRITE BUS  "));
    write(L,now, justified => right, field=>10,unit=>ns);
    write(L, string'("  ADDR 0x"));
    hwrite(L,i_addr, justified => left, field=>8);
    write(L, string'("  DATA 0x"));
    hwrite(L,i_data, justified => left, field=>8);
    write(L, string'("  @  "));
    write(L,now, justified => right, field=>10,unit=>ns);
    write(L, string'("  >>"));
    if(log_on) then writeline(output,L); end if;
    wait_clk(i_clk, 2);
  end procedure bus_write;

  procedure bus_read(
    i_addr             : in  std_logic_vector(31 downto 0);
    signal i_clk       : in  std_logic;
    signal o_csb       : out std_logic;
    signal o_wrb       : out std_logic;
    signal o_rdb       : out std_logic;
    signal o_addr      : out std_logic_vector(31 downto 0);
    signal i_data      : in  std_logic_vector(31 downto 0);
    log_on             : in  boolean ) is
  variable L : line;
  variable t : time;
  variable v_data      :  std_logic_vector(31 downto 0);
  begin
    wait_clk(i_clk, 1);
    t := now;
    
    o_csb       <= '0';
    o_wrb       <= '1';
    o_rdb       <= '0';
    o_addr      <= i_addr;
    
    wait_clk(i_clk, 9);
    o_csb       <= '1';
    o_wrb       <= '1';
    o_rdb       <= '1';
    v_data      := i_data;
    write(L,now, justified => right, field=>20,unit=>ns);
    write(L, string'(" << READ BUS  "));
    write(L,now, justified => right, field=>10,unit=>ns);
    write(L, string'("  ADDR 0x"));
    hwrite(L,i_addr, justified => left, field=>8);
    write(L, string'("  DATA 0x"));
    hwrite(L,v_data, justified => left, field=>8);
    write(L, string'("  @  "));
    write(L,now, justified => right, field=>10,unit=>ns);
    write(L, string'("  >>"));
    if(log_on) then writeline(output,L); end if;
    wait_clk(i_clk, 2);
  end procedure bus_read;

begin

bus_write(
    X"11223344",
    X"AABBCCDD",
    clk      ,
    csb      ,
    wrb      ,
    rdb      ,
    addr     ,
    data     ,
    true );
bus_read(
    X"55667788",
    clk      ,
    csb      ,
    wrb      ,
    rdb      ,
    addr     ,
    data_out ,
    true );
    
wait;
end process p_control;
```

### 5.2 Procedure tổng hợp được

Một procedure tổng hợp được, miễn là nó chỉ mô tả hành vi tổ hợp hoặc hành vi
theo clock — không `wait`, không `after`, không thời gian tuyệt đối. Cái làm nó
đáng dùng trong RTL là *nơi gọi* vẫn đọc được dễ dàng, còn phần logic lặp đi
lặp lại thì nằm gọn ở một chỗ.

Dưới đây là một procedure cập nhật field của register bank, được gọi từ bên
trong một process theo clock:

```vhdl
architecture rtl of csr_block is

  -- Khai báo trong architecture: mọi process bên dưới đều nhìn thấy.
  procedure set_field (
    signal   reg    : inout std_logic_vector(31 downto 0);
    constant hi     : in    natural;
    constant lo     : in    natural;
    constant value  : in    std_logic_vector) is
  begin
    reg(hi downto lo) <= value;
  end procedure set_field;

begin

  p_csr : process (clk)
  begin
    if rising_edge(clk) then
      if rst = '1' then
        ctrl_reg <= (others => '0');
      elsif wr_en = '1' then
        case wr_addr is
          when x"00"  => set_field(ctrl_reg, 3,  0, wr_data(3 downto 0));   -- mode
          when x"04"  => set_field(ctrl_reg, 15, 8, wr_data(7 downto 0));   -- gain
          when others => null;
        end case;
      end if;
    end if;
  end process p_csr;

end architecture rtl;
```

Ba quy tắc giữ cho procedure tổng hợp được:

- **Không điều khiển thời gian.** `wait`, `wait for`, và phép gán signal có
  `after` đều chỉ dành cho mô phỏng. Một procedure tổng hợp được là logic
  thuần, và nơi gọi mới là chỗ đặt nó vào trong process theo clock của mình.
- **Tham số signal phải khai báo class.** Tham số mà procedure gán vào phải
  được khai báo là `signal ... inout` (hoặc `out`). Để class ngầm định thì nó
  thành variable, và phép gán sẽ không bao giờ ra được tới bên ngoài.
- **Procedure thừa hưởng clock của nơi gọi.** Bản thân nó không có clock riêng;
  nó chỉ được trải thẳng vào đúng chỗ được gọi. Gọi cùng một procedure từ hai
  process khác clock sẽ tạo ra hai bản logic độc lập.

Khai báo ở đâu quyết định phạm vi dùng lại: trong architecture thì chỉ một
entity dùng được, trong package thì cả project dùng được. Package là chỗ đúng
một khi có hai entity cùng cần một routine — và nó cũng có nghĩa là procedure
đó được review một lần, thay vì trôi dần thành hai bản hơi khác nhau.
