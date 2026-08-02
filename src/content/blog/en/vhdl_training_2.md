---
title: 'VHDL - Scalar data types'
description: 'Part 2 of a VHDL series: scalar types from bit and boolean to std_ulogic and std_logic, integer and real, casting versus conversion functions, and the subtypes, characters, physical and enumerated types that build on them.'
date: 2023-02-25
lang: en
key: vhdl_training_2
tags: ['vhdl']
series: 'VHDL training'
seriesOrder: 2
---

## 1. Scalar data types

Objectives:
* Use approriate data types when declaring ports and signals
* List legal values of std_logic data types
* Create scalar data types

### 1.1 Data types

* A data type in VHDL is a name that has been associated with a set of values and a set of operations.
* A wide range of available data types provides flexibility in hardware modeling and built-in error checking to ensure signal compatibility in large, complex models.
* Each object (`signal`, `variable`, `constant`, or `port`) must have its type defined when it is declared. 
* A given data type allows only values within its range to be applied
* Since VHDL is a strongly typed language, the connected data objects must be of the same type. For example, a signal with the ‘bit’ data type must be connected to another signal with the same `bit` type.

Though VHDL has a limited number of "buld-in" data types, libraries in VHDL extend this number.


### 1.2 Scalar data types

Scalar data types in VHDL represent single values. These includes:
* bit
* boolean
* std_logic
* integer
* real
* character
* Physical concepts and amounts
* Enumerated types for immediate recognition

### 1.3 Bit & boolean
 
<strong>BIT</strong>

* Built-in data type 
* Takes values 0 and 1. 
* It executes quickly in simulation as there are only two states.
* This data type is concise for modeling logic, but it does not adequately model hardware. 
* Hardly used for synthesis and has been essentially replaced by `std_logic`

```vhdl
architecture Behavioral of mux is
signal A, B, SEL, Z : bit;
begin
    Z <= A when (SEL = '1') else B;
end Behavioral;
```

`A`,`B`, `SEL`, and `Z` declared with the bit data type. It executes a simple multiplexer behavior.


<strong>Boolean</strong>

* Frequently used in behavioral modeling. 
* Takes the values True or False. 
* It is useful for modeling at a more abstract level.
* Synthesizable; it is frequently seen in testbenches

Both the data type declarations are taken from library `STD` and the package `Standard`. These are predefined and implicit for every VHDL model and, therefore, no explicit library declaration is ever required.


### 1.4 std_ulogic & std_logic
 
<strong> std_ulogic </strong>

`std_ulogic` was developed from the Multi-Value Logic (MVD) system. It provides a detailed hardware modeling option

The `u` in `std_ulogic` means unresolved. 

This indicates that a function, at some point after the initial compilation, returns to a resolve state.


`std_ulogic` takes values as shown in the example here:
* `U` means uninitialized
* `X` means forcing Unknown
* `0` means forcing Zero
* `1` means forcing One
* `Z` means high impedance
* `W` weak unknown
* `L` weak zero
* `H` weak one
* `-` don't care condition

It supports different signal strengths, don't care conditions, and tristate drivers.

It is defined in the package `std_logic_1164` of `IEEE`.

<strong> std_ulogic </strong>

`std_logic` is the resolved form of `std_ulogic` and is more commonly used. 

It takes the same nine values as `std_ulogic`.

The table shown here is called the resolution table used for the `std_logic` data type. 
This table resolves the question of which value is to be assigned when multiple values are assigned to the same signal.

Both the `std_logic` and `std_ulogic` types are actually enumerated types and their values must always be capitalized


#### std_ulogic vs std_logic


Both the `std_logic` and `std_ulogic` data types have same set of values. The difference is implementation.

If a user wants to drive two or more signals to a common output

* if this common output has the `std_ulogic` data type, then this issue throws an error and will not be
resolved. `std_ulogic` does provide a built-in means of error checking for inadvertent multiple drivers.

* in the case of the `std_logic` type, it provides some form of a resolution function for the multiple drivers issue.

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

For example, the OUT_1 signal will give an error here, whereas the RES_OUT signal with the `std_logic` type will make it through compile but will not often make it through implementation due to multiple drivers.

#### Signal resolution

How do we resolve the multiple drivers issue?

It can be resolved by using the tristate buffer modeling technique.

* First, the RES_OUT signal should have the `std logic` type
* Then the tristate buffer is implemented using a conditional signal statement.

Atthe board level, these signals are combined via open-drain or open-collector outputs-in which case, `std_logic` weak high (H) and weak low (1) could be used to model

```vhdl
signal A, B, C, RES_OUT: std_logic;
RES_OUT <= A when EN0 = '1' else 'Z';
RES_OUT <= B when EN1 = '1' else 'Z';
RES_OUT <= C when EN2 = '1' else 'Z';
```

## 2. Integer and Real

### 2.1 Integer

* Allows for flexible, intuitive quantities values.
* Specifying the range of any integer has significant impact during synthesis. 
* Without specifying a range, the compiler defaults to the maximum range.
* Total range of the type integer is somewhat compiler dependent; 
* However, it defaults to the range -2E31+1 to 2E31-1, which implies a 32-bit value.

The syntax and an example of the type integer is shown here

<strong>Syntax</strong>
```vhdl
type integer is range ...
```

<strong>Example</strong>
```vhdl
signal A: integer range 0 to 7;
signal B: integer range 15 downto 0;
```

### 2.2 Real

* Allows users to use floating-point values in the range of +1e38 to -1e38
* Used to scale and offset physical data types
* Used for purely Mathematical purposes
* Used with physical constants (such as Time or Voltage) within simulation environments.
* Real type can also be used in synthesizable code if the results they produce are resolvable during synthesis.

<strong>Syntax</strong>
```vhdl
type real is range ...
```

<strong>Example</strong>
```vhdl
type CAPACITY is range -25.0 to 25.0;
signal SIG_1: CAPACITY := 3.0;
```

### 2.3 What can & cannot be done with Integers & Reals

* In general, all forms of comparisons (>, <, >=, <=, =, /=) are legal in integer and real. 
* Caution needs to be taken if real numbers are tested for equality as the test is not reliable.
* Comparisons should either be done on 
    * integer against integer
    * real against real
* Users can perform type conversion or casts to make the 'type' same.
* The basic math functions (`+, -, *, /, mod, rem`) can be performed on `integer` and `real`
* Care needs to be taken as some of these operations can cause problems during synthesis but not during simulation.


## 3. Data Type Conversion

Since VHDL is a strongly typed language by its nature, assigning one type to another is illegal. Performing this change requires a conversion mechanism.

The conversion processes in VHDL are:

* Casting
* Conversion function

### 3.1 Type casting

* Used to move between the `std_logic_vector` =>  `signed` and `unsigned` types. 
* Type cast between `std_logic_vector` and `signed` or `unsigned` can be used as long as the original and destination signals have the same bit width.

For example:

```vhdl
signal ex1 : std_logic_vector(3 downto 0);
signal ex2 : signed(3 downto 0);
signal ex3 : unsigned(3 downto 0);

ex2 <= signed(ex1);
ex3 <= unsigned(ex1);
ex1 <= std_logic_vector(ex2);
```

* `ex2 <= signed(ex1)` The first example type casts a signal of `std_logic_vector` type (ex1) to `signed` type and stores it in ex2 which is of `signed` type as well.
* `ex3 <= unsigned(ex1)` Similarly, the second example type casts a signal of `std_logic_vector` type (ex1) to `unsigned` type
* `ex1 <= std_logic_vector(ex2)` Third example type casts a signal of singed type (ex2) to `std_logic_vector` type.

### 3.2 Conversion function

* Used to move between `signed` and `unsigned` => `integer`. 
* Integers do not have a set bit width, which is why the conversion function from `integer` to `signed/unsigned` includes a specification of the intended bit width.

```vhdl
signal ex1: signed(3 downto 0);
signal ex2: integer;

ex1 <= to_signed (ex2, ex1'length);
ex2 <= to_integer(ex1);
```

* `ex1 <= to_signed (ex2, ex1'length)` The first example here converts an integer (ex2) to signed type using `to_signed` conversion function, available in `numeric_std` package and stores the result in `ex1` which is of `singed` type.
* `ex2 <= to_integer(ex1)` Similarly, the `to_integer` conversion function converts a `signed` type to `integer` type in the second example.

### 3.3 std_logic_vector to/from integer

Common conversions required in VHDL are

* From `std_logic_vector` to `integer`
* From `integer` to `std_logic_vector`

To convert from std logic_vector to integer:

```vhdl
integer_value <= to_integer( unsigned(slv_value));
```

To convert from integer to std_logic_vector:

```vhdl
slv_value <= std_logic_vector(to_unsigned( integer_value, n ));
```

## 4. Types and subtypes

#### Types

* Defines a set of values. 
* STD package defines a specific collection of types such as `integer`, `real`, `bit`, etc. 
* A new type can be created using enumeration arrays, records, etc.

```vhdl
type mem_array is array (integer range 0 to 1023) of std_logic_vector(15 downto 0);
```
The example shown here creates a new type called `mem_array`. Once created, this mem array becomes a full-blown type that a new signal or variable may be defined as. In this example, the created type is an array of `std_logic_vector` with length of 16 bits. The array has 1024 elements.

#### Subtypes

* Provide a mechanism for limiting the range of a type. 
* Used in simulation to do boundary checking.
* Boundary checking in hardware does not exist and hence subtypes only reduce the number of bits required to describe a signal or variable, which consequently reduces the number of unescessary warnings.

```vhdl
subtype <new subtype name> is <type or subtype name>;

subtype ROM_MEMORY_RANGE is integer range 0 to 255;
```

The syntax always has a pre-defined type as subtype only refines the use of a previously defined type or subtype by further limiting its scope.

The example shown here creats a subtype `ROM_MEMORY_RANGE` that limits the integer range (by default, a minimum of 32 bits) to 8 bits.


## 5. Characters and strings

#### Characters

* VHDL supports character type. 
* Characters are written in single quotes. 
* Character types are synthesizable.

```vhdl
type character is (nul, sol, stx, ...);

constant MY_CHAR : character := 'Q';
```

The constant `MY_CHAR` is of the character type and has been assigned a value equal to ‘Q.

#### Strings

* Strings are arrays of characters
* Enclosed within double quotes
* Once defined, cannot be changed
    * Once the string size is fixed or defined, it cannot be changed, even if a new string value is smaller than the defined size. The remaining space will contain remnants of the previous value.
    * String size always starts from 1. Since it is `postive range<>`

```vhdl
type string is array (positive range <>) of character;
constant msg: string (1 to 10) := "setup time";
```

A constant `msg` of string type with the range equal to ten characters. It has been assigned a value of “setup time".


## 6. Physical types

* Used to quantify real-world physical concepts and amounts, such as `mass`, `length`, `time` etc.
* `time` is the only pre-defined physical type
* Other physical types my be hand rolled or explicitly loaded from IEEE libraries
* Generally not synthesizable.
* A physical type must be defined in terms of its primary unit. Any secondary unit must be in multiples of the primary unit. * It is to noted that the units must be of the integer type and not real

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
* A syntax for `time`, defined in IEEE, is shown onscreen with its range. 
* Here, fs is the primary unit, and all secondary units are defined using fs.

```vhdl
constant TPD : time := 3 ns;
...
Z <= A after TPD;
```

In the example here, a constant `TPD` is of the type time and has been initialized with a 3ns value.


## 7. Enumerated types

* Lists a set of names or values defining a new type.
* Use values immediately recognizable and intuitively relevant to the operation of the model. 
* Make the code more readable, especially when describing state machines and complex systems.

The syntax for this enumerated type is for this enumerated type is given onscreen:

```vhdl
type <new type name> is (<list of items>);
```

* Where a <new type name> is any legal identifier
* <list of items> is a list of items, separated by commas that have the form of any legal identifier.
* By default, enumerated values are sequentially encoded from left to right within the parentheses.

```vhdl
type MY STATE is (RST, LOAD, FETCH, STORE, SHIFT);
...
signal STATE, NEXT STATE: MY STATE;
...

case (STATE) is
    when LOAD =>
        if COND_A and COND B then
            NEXT STATE <= FETCH;
        else
            NEXT_STATE <= STORE;
        ...
```
In this example, 
* `MY_STATE` is of the enumerated type 
* Takes values 
    * “000" = RST
    * "001" = LOAD 
    * “010" = FETCH
    * "011" = STORE
    * “100" = SHIFT


* Different synthesis tools may apply a different encoding scheme based on technology-specific optimization algorithms or other proprietary factors.

* Caution needs to be taken while handling enumerated types
    * Although VHDL is a case-insensitive language, enumerated types are case sensitive
    * Enumerated types enclosed in single quotes

```vhdl
type rx_states is (IDLE, START, DATA, PARITY, STOP);
type tx_states is (IDLE, START, DATA, PARITY, STOP);

signal rx_states: rx states := IDLE;
signal tx_states: tx states := IDLE;
```

Consider an example of a UART transmitter and receiver. Here, `rx_states` and `tx_states` are of the enumerated type.

* Even though the state names of rx_states and tx_states are identical, “IDLE” as defined in rx_states is not the same as the “IDLE" defined in tx_states. 
* These states may be coded differently during synthesis, but they are considered to be completely different types.

For ease of understanding, the states list in `rx_states` can be considered as rx_states.IDLE, rx_States.START etc. Similarly, the states in `tx_states` can be considered as tx_states.IDLE, tx_states.START, etc