---
title: 'VHDL - Procedures'
description: 'Working with procedures'
date: 2022-11-28
lang: en
key: vhdl-procedures
tags: ['vhdl']
---

## 1. VHDL Procedures

In a large design, there are some portions of code which might be repeated or called multiple times.

A common block that encapsulates some functionality within the design, it is called sub-program.

Procedure is a type of subprogram that can be called multiple times throughout the design

<strong><ins>Advantages of using procedure</ins></strong>

* Avoids code repetition
* Can be declared with or without any arguments
* Can have input, output and inout ports
* May/may not include timing delays as procedures can be executed in non-zero simulation time

## 2. Highlights for procedure

* No return as the function
* Unlike functions, procedures can contain wait-statements
* Do not have to specify the length of data type like port declaration. Just need to specify type `std_logic_vector`, for example, is enough.
* Procedure can be declared with or without arguments
  * Procedures without arguments are used to run sequences of events - mostly used in testbench where procedure is used to drive specific signals
  * Parameters (inputs/outputs/inout) to a procedure can be signals, variables, or constants
* Procedure is declared within the architecture's declarative region or in the package


## 3. Procedure structure

<strong><ins> Syntax </ins></strong>

```vhdl
procedure PROC1 ( <class> <arg1> : <mode|direction> <type>;
                  <class> <arg2> : <mode|direction> <type> ) is

variable VAR1;
<declarations_for_use_within_the_procedure>
begin
  <sequential statements ...>
end procedure PROC1;

```

A procedure’s parameter list defines its inputs and outputs, kind of like a mini-module. It can be a signal or a constant, but unlike a module, it can also be a variable. You can declare objects between the “is” and “begin” keywords that are only valid inside the procedure. These may include constants, variables, types, subtypes, and aliases, but not signals.

Unlike functions, procedures may contain wait-statements. Therefore, they are often used in testbenches like simple BFM’s for simulating interfaces, or for checking output from the device under test (DUT).

### a. Procedure parameters

Procedure parameters are similar to port declartions.

It can be:

* Mode IN
* Mode OUT
* Mode INOUT

Inside a procedure, parameters with specified mode or direction is restricted as following table. 

| Mode  | Readable | Changed |
| :-:   | :-:      | :-:  |
| IN    | OK       | NO   |
| OUT   | NO       | Assign back to caller |
| INOUT | OK       | Assign back to caller |


<strong>Example</strong>

```vhdl
procedure SLV_REVERSE   ( SLV_IN : IN std_logic_vector;
                          SLV_OUT : OUT std_logic_vector
                        ) is
begin
  for i in SLV_IN`length-1 downto 0 loop
    SLV_OUT(i)  <= SLV_IN (SLV_IN'length-1);
  end loop;
end procedure SLV_REVERSE;

```


Want to call the above procedure?

```vhdl
SLV_REVERSE   ( SLV_IN      => D_IN, 
                SLV_OUT     => D_OUT
              );
```

To make the mapping valid, the `formal` and `actual` must be of same `data type`, `class` and `mode`


### b. Parameters classes

VHDL supports four classes of objects

* Constant
* Variable 
* Signal
* File

If classes are not specified in the argument list. The default class will be selected

| Mode  | Default classes|
| :-:   | :-:   |
| IN    | constant |
| OUT   | variable |
| INOUT | variable |


### c. Explicitly specify class of procedure parameters

Explicitly specify class of input and output parameters declared in a procedure is oftern helpful. It simplifies usage and expands capabilities of a procedure.

Here is an example when not specified class in the argument list

![](/images/blog/vhdl-procedures/3.png)

We need a variable `TEMP_BUS` to pass value to a signal `OUT_BUS`.


And explicitly specified class for parameters

![](/images/blog/vhdl-procedures/4.png)

We can see, with explicited declaration, there is no need of variable `TEMP_BUS` to pass value to signal `OUT_BUS`.


## 4. Where to declare a procedure?

<strong><ins>In the declarative region of architecture</ins></strong>

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

<strong><ins>In the package</ins></strong>

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


In the testbench

```vhdl
library work;
  use work.soc_sim.all;
```

## 5. Practical examples

### BUS access (testbench)

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

### Synthesized procedure