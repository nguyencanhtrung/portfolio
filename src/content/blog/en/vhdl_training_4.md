---
title: 'VHDL-4--VHDL operators'
description: 'Learn VHDL syntax'
date: 2023-02-25
lang: en
key: vhdl_training_4
tags: ['vhdl']
---
## VHDL operators
 
### Objectives of this section

* Describe what composite data types are
* Create composite data types (array and record)
* Declare one-dimensional and two-dimensional arrays

### What is composite data types?

The composite type object has a group of elements. 

Composite types are of two types: 
* `Array`
* `Record`

The differences between Array and Record are
* Array is group of only same-type elements
* Record is group of same or different-type elements

Their usages
* Array is used to model memory
* Record is used to model packet, interface protocol

`bit_vector`, `std_logic_vector` and `string` are all pre-defined composite types (they are array type)

* bit_vector is array of scalar type 'bit'
* std_logic_vector is array of scalar type 'std_logic'
* string is array of scalar type 'character`

Example:
```vhdl
signal A_WORD: std_logic_vector (3 downto 0) := "0011";
```
The A_WORD signal shown here has a composite data type. 
* It's an array of four elements, each with the `std_logic` type. 
* There is <strong>no pre-defined LSB or MSB interpretation</strong>
* Therefore, the compiler does not automatically read this value as 3.
* Note that the double quotes are used for any `bit_vector`, `std_logic_vector`, or `string` object.
* In this case, VHDL does not infer that the higher index is MSB (3 in this example) but simply indexes the vector from left to right.
* Choosing and using one indexing method consistently is good design practice. The most popular is the `(3 downto 0)` method

## 1. std logic vector and signed, unsigned

### a. std logic vector
* An array of type `std_logic`.
* Defined in the `std_logic_1164` package, which is part of the IEEE library.
* Have no positional meaning (signed bit)
* "0110" in `std_logic_vector` is always interpreted as 6.

### b. signed and unsigned 
* Arrays of type `std_logic`
* Have positional meanings
* The left-most bit is the sign bit.
* Thus, signed and unsigned "1110" do not represent the same value
    * Signed "1110" is interpreted as -2
    * unsigned "1110" is interpreted as 14
* Use `unsigned` type when the vector needs math, like adding two BCD digits.
* Use `std_logic_vector` when only a pattern is needed, such as driving the LED segments where the value means nothing.

```vhdl
entity bcd_add_and_display is
    port(
        clk         : in std_logic;
        bcd_a_in    : in unsigned (3 odwnto 0);
        bcd_b_in    : in unsigned (3 downto 0);
        led_7seg_out: out std_logic_vector (6 downto 0)

    );
end entity;
```

### c. What can and cannot be done with std_logic?

You can use `std_logic` with:

* Logical operations:  `NOT`, `AND`, `NAND`, `OR`, `NOR`, `XOR`, and `XNOR`
* Comparisons of equality (`=`) and inequalities (`/=`) but not (`>`, `<`, etc.) (explain (*))
* Cannot perform math operations on `std_logic/std_logic_vectors` as `std_logic_vectors` hold patterns with irrelevant positions.

(*) Considering that `std_logic` has nine different potential values, comparing `std_logic` will compare its position of an enumerated type against the position of the other item's enumerated type. Most likely, this expected outcome will not be realized. Therefore, it only makes sense to test for equality and inequality.

The `NUMERIC_STD` library contains appropriate overloading functions to support various comparisons and shifting functions. It also contains special cases of the `std_logic` type like `signed` and `unsigned` types.

## 2. Arrays

### a. Arrays

Arrays are groups of elements, all of the <strong>same type</strong>. The syntax of an array declaration is shown here.

```vhdl
type <new type name> is array ( <range> ) of <data_type>
```
In this:
* `<new type name>` is any valid identifier.
* `<range>` specifies the minimum and maximum values of indices via the “to” or “downto” notation. Typically, you specify arrays in an upward (to) direction, whereas you usually specify ranges for std logic vectors in a downward direction.
* `<data type>` may be an “intrinsic” data type, such as integer or bit. It can also be an extension provided by a library such as `std_logic`, or a user-defined type.

```vhdl
type WORD is array (0 to 3) of std_logic;
signal B_BUS : WORD;
```

In this example, `WORD` is an array of four elements of the type `std_logic`.

If a signal B_BUS is of type WORD, then it becomes an array of std_logic. Thus, the possible values for each element are 'U', 'X', '0', '1', 'Z', 'W, 'U, 'H', or '-'. Therefore, there are 9^4 (6561) possibilities versus 16 if the type were "bit".

```vhdl
type DATA is array (0 to 3) of integer range 0 to 9;
signal B_BUS : DATA;
```

In this example, `DATA` is an array of four elements of type integer. Here, the integer range is reduced to 0 to 9. This is important to avoid the default (minimum) 32-bit implementation. If the signal `B_BUS` is of type `DATA`, then it becomes an array of integers

### b. Array assignments

When you want to assign one array to another?

Make sure that the arrays are of

* The same type
* The same length 
* The assignment is positional, from left to right.

```vhdl
signal BUS_A, BUS_B :   std_logic_vector (3 downto 0);
signal BUS_C:           std_logic_vector (0 to 3);
```
Positional assignment means that the arrays are lined up as they were declared either `(3 downto 0)` or `(0 to 3)`. Positions in the array are then matched and the assignment is made.

![](/images/blog/vhdl_training_4/1.png)
    Positional assignment

In the first example, BUS_A and BUS B are arrays of `std_logic_vector` with four elements each. The positional assignment happens as shown as the elements are arranged in a downward direction.

In the second example, the array BUS_A is arranged in a downward direction and the array BUS_C is arranged in an upward direction. Hence, bit swapping happens as shown


### c. Array assignment notation

To simplify array assignments and enhance readability:
* you can designate a hexadecimal or octal base. 
* Also, you can use underscores to further enhance readability as shown in example here.

```vhdl
signal DATA_WORD : std_logic_vector(11 downto 0);

DATA_WORD <= X"A6F";
DATA_WORD <= "101001101111";
DATA_WORD <= O"5157";
DATA_WORD <= B"1010_0110_1111";
```

Vivado synthesis <strong>only allows underscores</strong> when the base is explicitly defined via <strong>hex, octal, or binary</strong> notation.

```vhdl
signal DATA_WORD : std_logic_vector(10 downto 0);
DATA_WORD <= B"100_0110_1111";
DATA_WORD <= X"46F";
```
Example 2 illustrates that the size of the vector must be an integer multiple of the base. That is, to use the binary base, the length of the vector must be divisible by two. This is not the case here as the length of the DATA WORD is eleven. Similarly, for hexadecimal base, the length of the vector must be divisible by sixteen, but it is twelve in this case. Hence, both the assignments show an error. [Note: I think the first assignment of binary base is correct]

### d. Array slices

You can reference any group of contiguous elements within an array as a slice. 

A slice is a sub-array of a one-dimensional array, from a single element up to a complete array. 
* The prefix used for a slice is the name of the parent array 
* The index of a slice must fall in the range of the indexes of the parent array.

The example has A, B, and Z as arrays, where A and B have eight elements and Z has 16 elements.

```vhdl
signal A_VEC,B_VEC  : std logic vector (7 downto 0);
signal Z_VEC        : std _logic_vector (15 downto 0);
signal A_BIT, C_BIT, D_BIT: std_logic;

Z_VEC(15 downto 8) <= A VEC;
B_VEC <= Z_VEC (12 downto 5);
A_VEC (1 downto 0) <= C_BIT & D_BIT;
Z_VEC (5 downto 1) <= B_VEC(1 to 5);
```

Out of the four array assignments:
* The first one assigns `A` to the last eight bits of `Z (15 downto 8)`, which is a valid assignment as both A and a slice of Z here are of 8 bits.
* The second one assigns a slice of the `Z` array (12 downto 5) to `B`, which is also a valid assignment, as the size of the 2 matches.
* The third one assigns `C` and `D`, which are 1-bit values to a slice of `A(1 downto 0)`
* The fourth assignment is invalid
    * Though it assigns a slice of the B array to a slice of Z, which are of the same length
    * However, the direction (ascending or descending) of slice B is not consistent with the direction of the array B. Array B was originally declared with a downward direction (7 downto 0), but it has been used with an upward direction here (1 to 5).

#### Array slices example

```vhdl
entity REG_4 is
port (
        reset   : in std logic.
        clk     : in std logic;
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

| :-:           | :-:       |
| A <= C        | GOOD      |
| A <= cntrl(1) | GOOD      |
| E <= d_in+1   | Depends   |
| A <= B        | ERROR     |
| D <= E        | ERROR     |
| B <= D        | ERROR     |
| Q <= cntrl    | ERROR     |

The VHDL code here has reset and clock inputs with the `std_logic` type, and the `d_in` and `cntrl` inputs as 4-bit and
2-bit arrays, respectively. q is an output array of 4 bits. The code also defines A, B, C, D, and E as signals.

* `A <= C` is avalid assignment since both A and C are of type `std_logic`.
* `A <= cntrl(1)` is a valid assignement as it pulls out a single bit (second from the right) from cntrl and assigns it to A. Here, cntrl is an array of std logic types, and one element from this array is a `std_logic`.
* `E <= d_in+1` is an error as d_in is a std_logic type and 1 is an integer. This is valid if the conversion function `E <= d_in+ std_logic_vector(to_unsigned(1, 4));` is used.
* In `A <= B`, A can represent all the information specified in B (and 7 more values on top of that). But as they are
not equal, this is an invalid assignment.
* In `D <= E`, although E may contain a pattern which represents an integer, it is a pattern without meaning. E must be converted to an integer in order to be assigned to an integer.
* In `B <= D`, a conversion function is required to make this assignment, because an integer is being assigned to a bit.
* In `Q <= cntrl`, even though Q and CNTRL are both of type std_logic_vector, Q is 4-bits wide and CNTRL is only 2-bits wide; therefore, the error is in size, and not type.

### e. String

String is a user-defined <strong>array</strong> of characters. 
* Its range is always positive and non-zero and it is less than the largest
integer. 
* Once you define a string, its size is fixed and cannot be changed.
* Helpful during simulation and debugging to display user-defined text, messages, warnings, or errors and are often used with the assert statement.
* Concatenate strings and characters by using the '&' operator.

```vhdl
constant WARNING1: string (1 to 27) := "Unexpected Outputs Detected";
write(output, WARNING1 & '!');
```
* WARNING1 is a constant of the string type with a range equal to 27. It has been assigned a value equal to “Unexpected Outputs Detected".
* You can use this string to display a warning message in VHDL code as shown here.

### f. Memory as Pseudo 2D arrays

A convenient way of modeling memory structures is to create a pseudo two-dimensional array structure; that is, create an array of arrays.

```vhdl
type MEM_ARRAY is array (0 to 3) of std_logic_vector (7 downto 0);
signal MY_MEM : MEM_ARRAY;
```

In the example here, a `MEM_ARRAY` is an array of four elements and each element itself is an array of the `std_logic` type. 

Once this array is declared, a signal `MY_MEM` is created of the `MEM_ARRAY` type. 

Synthesis tools understand this construct as a way to represent memory.

![](/images/blog/vhdl_training_4/4.png)
    Memory modeling


### g. Assigning values to arrays

```vhdl
type MEM_ARRAY is array (0 to 3) of std_logic_vector (7 downto 0);
signal MY_MEM : MEM_ARRAY;
signal R_ADDR, W_ADDR : std_logic_vector (1 downto 0);
```
The `MEM_ARRAY` here is an array of arrays and MY_MEM is a signal of that type. 

R_ADDR and W_ADDR are arrays used for read addresses and write addresses.

In order to assign a value to an array, first the read and write address vector is converted to an integer and ther references a row within an array.

Thus, the reading of data happens through the first line of the code shown here, and the writing of data happens through the second.

```vhdl
D_OUT <= MY_MEM (to_integer(unsigned(R_ADDR)));
...
MY_MEM (to_integer(unsigned(W_ADDR))) <= DATA_IN;
```

### h. Higher order arrays

You can construct true multi-dimensional arrays by creating a user-defined type of the desired size.

The example here creates a two-dimensional array MATRIX A of the std_logic type and a three-dimensional array MATRIX_B of integers.

```vhdl
type MATRIX_A is array (1 to 3, 1 to 16) of std_logic;
type MATRIX_B is array (1 to 3, 1 to 3, 1 to 3) of integer range -1024 to 1023;

type MATRIX_3x16        : MATRIX_A  := (others => (others => '0'));
type MATRIX_3x3x3       : MATRIX_B  := (others => (others => (others => '0')));
```

* Initialization is performed in the same way as records. The (others=>(others=>0)) notation is the “recursive” form of the aggregate assignment.

* The notation show here is used to access any given point.

```vhdl
MATRIX_3x16 (3,15) <= '1';
value <= MATRIX_3x3x3 (2,1,3);
```

The example here shows how to multiply a higher order array by an integer scalar. 

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
        colLoop: for col in 1 to 3 Joop
            dthLoop: for depth in 1 to 3 Toop
                report  integer’ image (row) & & integer’ image(col) & "," &
                        integer image(depth) & " * " & integer’ image(k) &
                matrix3D (row,col, depth) := k * matrix3D (row,col,depth);
                report " " & integer'image(matrix3D (row,col,depth));
            end loop dthLoop;
        end loop colLoop;
    end loop rowLoop;
wait;
end process mult;
```

In this example, a higher order array having three dimensions is shown, where each individual element inside this array is of the integer type. 

A variable matrix3D of this type is then created and initialized to zero. 

Each element of this variable matrix3D is then multiplied by a scalar constant to get the result.

## 3. Records

### a. What is record?

A record is a group of elements that may be of <strong>different types</strong>. An example of record is given here.

```vhdl
type PACKET is record
PARITY      : bit
ADDRESS     : std_logic_vector (0 to 3);
DATA_BYTE   : std_logic_vector (7 downto 0);
NUM_VALUE   : integer range (0 to 6);
STOP_BITS   : bit_vector (1 downto 0);
end record;
...
signal TX PACKET, RX PACKET : PACKET;
```

PACKET is a record with elements like:

* PARITY element with bit type
* ADDRESS element, which is an array of four elements of the std_logic type
* DATA BYTE element, which is an array of eight elements of the std_logic type
* NUM_VALUE element with the integer type, and
* STOP_BITS element, which is an array of two elements of the bit type

These elements are stored one after the other as shown here.

![](/images/blog/vhdl_training_4/3.png)
    PACKET record

### b. Arrays of records

For packet-handling applications, an array of records can be useful. The ability to combine different data types affords great flexibility.

```vhdl
type PACKET is record
PARITY      : bit
ADDRESS     : std_logic_vector (0 to 3);
DATA_BYTE   : std_logic_vector (7 downto 0);
NUM_VALUE   : integer range (0 to 6);
STOP_BITS   : bit_vector (1 downto 0);
end record;
...
signal TX PACKET, RX PACKET : PACKET;
```
The PACKET here is a record having five elements, out of which `PARITY` is of the `bit` type and the rest are arrays of the `std_logic_vector` type, each having a different array length. 

```vhdl
type DATA_ARRAY is array (0 to 2) of PACKET;
signal MY_DATA : DATA_ARRAY;
```

Once this `PACKET` record is declared, a new type `DATA_ARRAY`, an array of record `PACKET` having three elements, is created. 

A new signal MY_DATA is then declared which is of the DATA ARRAY type. The diagram here shows a pictorial representation of MY_DATA, showing all three elements.

![](/images/blog/vhdl_training_4/5.png)


## 4. Array aggreates and record aggregates

### a. Array aggregates

Aggregates are a convenient means for grouping both scalar and composite data types for assignment. 

They are enclosed in parentheses and separated by commas. 

Only scalar data variables are allowed on the left-side aggregates.

```vhdl
signal H_BYTE, L_BYTE   : std_logic_vector (0 to 7);
signal Q_OUT            : std_logic_vector (31 downto 0);
signal A, B, C, D       : std_logic;
signal WORD             : std_logic_vector (3 downto 0);

(A, B, C, D) <= WORD;
```

An aggregate of A, B,C, and D has been assigned a WORD, which is an array of `std_logic`. This is valid since both sides have the same length and the same std logic type.

```vhdl
WORD <= (2 => '1', 3 => D, others => '0');
```
In this example, index 2 and 3 of the WORD array have been assigned specific values of '1' and D, respectively, whereas the other indexes are assigned a value of '0' using the `others` keyword.

```vhdl
Q_OUT <= (others => '0');
```
You can use the “others” keyword as a default assignment, regardless of the array size as shown in the third example.

```vhdl
WORD <= (A,B,C,D);
```
The fourth example is an exact opposite of the first one and it is valid.


```vhdl
H_BYTE <= (7|6|0|1 => '1', 2 to 5 => '0');
```
The fifth example assigns index 7,6,0, and 1 of H_BYTE to avalue of '1' and index 2, 3, 4, and 5 of H_BYTE to '0'.


### b. Record aggregates

Similar to array aggregates, record aggregates can also be used as shown here.

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
DATA WORD here is a record having H_BYTE and L BYTE arrays of the std_logic type. Record can only accept array aggregates.
