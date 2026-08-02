---
title: 'Quartus - Program FPGA'
description: 'Describe how to program FPGA with Quartus'
date: 2022-10-01
lang: en
key: quartus-program-fpga
tags: ['intel']
---

## 1. Command-line

All programs such as `quartus_pgm`, `jtagconfig`, etc. locate in the Quartus installation folder or in the standard alone FPGA programmer folder.

```bash
export LD_LIBRARY_PATH=/home/administrator/data/intelFPGA_pro/21.3/qprogrammer/quartus/linux64:$LD_LIBRARY_PATH
export PATH=/home/administrator/data/intelFPGA_pro/21.3/qprogrammer/quartus/bin:$PATH
```
Exporting the library and programs to use in the latter sections.


### 1.1 JTAG scanning

To list all devices that are found (the cable is auto-detected)

```bash
quartus_pgm --auto
```

Note that listing the devices as shown above is not necessary for loading the bitstream. It might be useful to tell the position of the FPGA in the JTAG chain, maybe. Really something that is done once to explore the board.

In case, the server has more than one programming cable, the program could not enumerate position of FPGA in the JTAG chain.

<d-code block language="bash">
$ quartus_pgm --auto
Error (213043): More than one programming cable found in available hardware list 
    -- use --list option to display available hardware list and specify correct 
    programming cable
</d-code>

Lets use following command

```bash
quartus_pgm --list
```

<d-code block language="bash">
$ quartus_pgm --list
Info: *******************************************************************
Info: Running Quartus Prime Programmer
    Info: Version 21.3.0 Build 170 09/23/2021 SC Pro Edition
    Info: Copyright (C) 2021  Intel Corporation. All rights reserved.
    Info: Your use of Intel Corporation's design tools, logic functions 
    Info: and other software and tools, and any partner logic 
    Info: functions, and any output files from any of the foregoing 
    Info: (including device programming or simulation files), and any 
    Info: associated documentation or information are expressly subject 
    Info: to the terms and conditions of the Intel Program License 
    Info: Subscription Agreement, the Intel Quartus Prime License Agreement,
    Info: the Intel FPGA IP License Agreement, or other applicable license
    Info: agreement, including, without limitation, that your use is for
    Info: the sole purpose of programming logic devices manufactured by
    Info: Intel and sold by Intel or its authorized distributors.  Please
    Info: refer to the applicable agreement for further details, at
    Info: https://fpgasoftware.intel.com/eula.
    Info: Processing started: Fri Apr  6 15:03:43 2018
    Info: System process ID: 3834
Info: Command: quartus_pgm --list
1) USB-Blaster [3-5.3]
2) USB-BlasterII [3-5.4]
3) USB-Blaster on dash.soc.one [3-5.3]
4) USB-BlasterII on dash.soc.one [3-5.4]
5) Remote server dash.soc.one:1310: Unable to connect
Info: Quartus Prime Programmer was successful. 0 errors, 0 warnings
    Info: Peak virtual memory: 714 megabytes
    Info: Processing ended: Fri Apr  6 15:03:44 2018
    Info: Elapsed time: 00:00:01
    Info: System process ID: 3834
</d-code>

There are 2 JTAG cables USB-Blaster and USB-BlasterII. Now we can check which devices connect with each JTAG cable

```bash
jtagconfig -n
```

OR

```bash
jtagconfig -d
```

<d-code block language="bash">
$ jtagconfig -n
1) USB-Blaster [3-5.3]
  Unable to read device chain - JTAG chain broken

2) USB-BlasterII [3-5.4]
  C32150DD   1SG280HH(1S2|2S2|3S2)/..
    Design hash    61CD1EC1369D1744384D
    + Node 19104600  Nios II #0
    + Node 30006E00  Signal Tap #0
    + Node 0C006E00  JTAG UART #0

3) USB-Blaster on dash.soc.one [3-5.3]
  Unable to read device chain - JTAG chain broken

4) USB-BlasterII on dash.soc.one [3-5.4]
  C32150DD   1SG280HH(1S2|2S2|3S2)/..
    Design hash    61CD1EC1369D1744384D
    + Node 19104600  Nios II #0
    + Node 30006E00  Signal Tap #0
    + Node 0C006E00  JTAG UART #0

5) Remote server dash.soc.one:1310: Unable to connect
</d-code>

Cable 2 (USB-BlasterII) is connected to Stratix 10 GX board (1SG280HH)


### 1.2 JTAGD deamon

This deamon listens to TCP/IP port 1309. It is responsible for talking with the JTAG adapter through the USB bus, so both the GUI programmer and command line tool rely on it. If there’s no daemon running, both of these start it.

But if you use multiple versions of Quartus, this may be a source of confusion, in particular if you make a first attempt to load an FPGA with an older version, and then try a newer one. That’s because the newer version of Quartus will keep using the older version of jtagd. And this older jtagd may not support FPGAs that the newer version of Quartus does. So the conclusion is that if weird things happen, this may fix it, and won’t hurt anyhow:

```bash
killall jtagd
```
### 1.3 Programming FPGA

`quartus_pgm` displays most of its output in green text. Generally speaking, if there’s no text in red, all went fine.

```bash
quartus_pgm -m jtag -o "p;path/to/file.sof"
```

Alternatively, add the position of the JTAG in the JTAG chain explicitly (in particular if it’s not the first device). In this case it’s @1, meaning it’s the first device in the JTAG chain. If it’s the second device, pick @2 etc.

<d-code block language="bash">
$ quartus_pgm -m jtag -o "p;path/to/file.sof@1"
Info: *******************************************************************
Info: Running Quartus Prime Programmer
    Info: Version 15.1.0 Build 185 10/21/2015 SJ Lite Edition
    Info: Copyright (C) 1991-2015 Altera Corporation. All rights reserved.
    Info: Your use of Altera Corporation's design tools, logic functions
    Info: and other software and tools, and its AMPP partner logic
    Info: functions, and any output files from any of the foregoing
    Info: (including device programming or simulation files), and any
    Info: associated documentation or information are expressly subject
    Info: to the terms and conditions of the Altera Program License
    Info: Subscription Agreement, the Altera Quartus Prime License Agreement,
    Info: the Altera MegaCore Function License Agreement, or other
    Info: applicable license agreement, including, without limitation,
    Info: that your use is for the sole purpose of programming logic
    Info: devices manufactured by Altera and sold by Altera or its
    Info: authorized distributors.  Please refer to the applicable
    Info: agreement for further details.
    Info: Processing started: Sun May 27 15:35:02 2018
Info: Command: quartus_pgm -m jtag -o p;path/to/file.sof@1
Info (213045): Using programming cable "USB-BlasterII [2-5.1]"
Info (213011): Using programming file p;path/to/file.sof@1 with checksum 
               0x061958E1 for device 5CGTFD9E5F35@1
Info (209060): Started Programmer operation at Sun May 27 15:35:05 2018
Info (209016): Configuring device index 1
Info (209017): Device 1 contains JTAG ID code 0x02B040DD
Info (209007): Configuration succeeded -- 1 device(s) configured
Info (209011): Successfully performed operation(s)
Info (209061): Ended Programmer operation at Sun May 27 15:35:09 2018
Info: Quartus Prime Programmer was successful. 0 errors, 0 warnings
    Info: Peak virtual memory: 432 megabytes
    Info: Processing ended: Sun May 27 15:35:09 2018
    Info: Elapsed time: 00:00:07
    Info: Total CPU time (on all processors): 00:00:03
</d-code>

If anything goes wrong — device mismatch, a failure to scan the JTAG chain or anything else, it will be hard to miss that, because of the errors written in red. The good thing with the command line interface is that every attempt starts everything from the beginning, so just turn the board on and try again.

<b>In case, having multiple Jtag cables plugged in. It it neccessary to specify which cable to program.</b>


```bash
quartus_pgm -c $1 -m JTAG -o p\;$BITSTREAM@$2
```

`$BITSTREAM` path to bitstream

`$1` position of JTAG cable

`$2` position of FPGA device in the JTAG chain

Example:

<d-code block language="bash">
$ jtagconfig -n
1) USB-Blaster [3-5.3]
  Unable to read device chain - JTAG chain broken

2) USB-BlasterII [3-5.4]
  C32150DD   1SG280HH(1S2|2S2|3S2)/..
    Design hash    61CD1EC1369D1744384D
    + Node 19104600  Nios II #0
    + Node 30006E00  Signal Tap #0
    + Node 0C006E00  JTAG UART #0

3) USB-Blaster on dash.soc.one [3-5.3]
  Unable to read device chain - JTAG chain broken

4) USB-BlasterII on dash.soc.one [3-5.4]
  C32150DD   1SG280HH(1S2|2S2|3S2)/..
    Design hash    61CD1EC1369D1744384D
    + Node 19104600  Nios II #0
    + Node 30006E00  Signal Tap #0
    + Node 0C006E00  JTAG UART #0

5) Remote server dash.soc.one:1310: Unable to connect
</d-code>

Lets program the 2nd cable (USB-BlasterII) - the FPGA device (stratix 10 GX is at the first position of JTAG chain)

```bash
quartus_pgm -c 2 -m JTAG -o p\;$BITSTREAM@1
```


## 2. Issues

### 2.1 Cyclone 10 GX FPGA development kit

This board caused me some extra trouble, so a few words about it. When this board is connected to a computer, it appears as 09fb:6810, however after attempting to load the FPGA (note the "@2" in the end) with:

<d-code block language="bash">
$ quartus_pgm -m jtag -o "p;thecode.sof@2"
Error (213019): Can't scan JTAG chain. Error code 86.
</d-code>

The device's ID changes to 09fb:6010. So there's clearly some reprogramming of the firmware (the system log shows a disconnection and reconnection with the new ID). The board is detected as GX0000406 by Quartus' GUI Programming Tool, but clicking "Auto Detect" results in "Unable to scan device chain. Hardware is not connected".

OK, so how about trying a scan?

<d-code block language="bash">
$ quartus_pgm --auto
[ ... ]
Info (213045): Using programming cable "10CGX0000406 [1-5.1.2]"
1) 10CGX0000406 [1-5.1.2]
  Unable to read device chain - Hardware not attached
</d-code>

The problem in my case was apparently that the jtagd that was running was started by an older version of Quartus, which didn’t recognize Cyclone 10 devices. So follow the advice above, and kill it. After that, programming with the command above worked with Quartus Pro 17.1:

<d-code block language="bash">
$ quartus_pgm --auto
[...]
Info (213045): Using programming cable "USB-BlasterII [1-5.1.2]"
1) USB-BlasterII [1-5.1.2]
  031820DD   10M08SA(.|ES)/10M08SC
  02E120DD   10CX220Y
</d-code>


### 2.2 Mismatch JTAG ID

The design is deployed on Stratix 10 GX development kit which contains FPGA chip "1SG280HU2F50E2VG". However, setting the same device and generating bitstream, programing it on the device prompts following error.

<d-code block language="bash">
$ ./pgm.sh 2 1 ./workspace/trungnc/00.gitlab/bitstream/gx_board/qts_pcie.sof 
Info (19848): Regular SEU info => 105 sector(s), 8 thread(s), 31500 interval time in microsecond(s)
Info (19848): Keyed hash is 211E9227EA2B2E8AC9DACF53399D089EC8DD58B9ACDAF5778CDB73A7649CCC7E
Info (19848): Design hash is AB12DA18E7670B96A68615F35D525C4800000000000000000000000000000000
Info (19848): Keyed hash is D1646D223F62049C8AB8396FDF9647ADE0682883F8B03AFEA30C1A39D68AC4B8
Info: *******************************************************************
Info: Running Quartus Prime Programmer
    Info: Version 21.3.0 Build 170 09/23/2021 SC Pro Edition
    Info: Copyright (C) 2021  Intel Corporation. All rights reserved.
    Info: Your use of Intel Corporation's design tools, logic functions 
    Info: and other software and tools, and any partner logic 
    Info: functions, and any output files from any of the foregoing 
    Info: (including device programming or simulation files), and any 
    Info: associated documentation or information are expressly subject 
    Info: to the terms and conditions of the Intel Program License 
    Info: Subscription Agreement, the Intel Quartus Prime License Agreement,
    Info: the Intel FPGA IP License Agreement, or other applicable license
    Info: agreement, including, without limitation, that your use is for
    Info: the sole purpose of programming logic devices manufactured by
    Info: Intel and sold by Intel or its authorized distributors.  Please
    Info: refer to the applicable agreement for further details, at
    Info: https://fpgasoftware.intel.com/eula.
    Info: Processing started: Fri Apr  6 20:28:47 2018
    Info: System process ID: 18686
Info: Command: quartus_pgm -c 2 -m JTAG -o p;./workspace/trungnc/00.gitlab/bitstream/gx_board/qts_pcie.sof@1
Info (213045): Using programming cable "USB-BlasterII [3-3.4]"
Info (213011): Using programming file ./workspace/trungnc/00.gitlab/bitstream/gx_board/qts_pcie.sof with 
               checksum 0x44DFA482 for device 1SG280HU2F50@1
Info (209060): Started Programmer operation at Fri Apr  6 20:28:57 2018
Info (18942): Configuring device index 1
Error (18952): Error status: The device chain in Programmer does not match physical device chain. 
               Expected JTAG ID code 0xC32250DD for device 1, but found JTAG ID code 0xC32150DD.
Error (209012): Operation failed
Info (209061): Ended Programmer operation at Fri Apr  6 20:28:57 2018
Error: Quartus Prime Programmer was unsuccessful. 2 errors, 0 warnings
    Error: Peak virtual memory: 2237 megabytes
    Error: Processing ended: Fri Apr  6 20:28:57 2018
    Error: Elapsed time: 00:00:10
    Error: System process ID: 18686
</d-code>

#### Debugging flow

* <b> Check the order of Jtag cable</b>
* <b> Check the position of FPGA chip</b>

```bash
jtagconfig -d
1) USB-Blaster [3-3.3]
   (JTAG Server Version 21.3.0 Build 170 09/23/2021 SC Pro Edition)
  Unable to read device chain - JTAG chain broken

  Captured DR after reset = ()
  Captured IR after reset = ()
  Captured Bypass after reset = ()
  Captured Bypass chain = ()
  JTAG clock speed 6 MHz

2) USB-BlasterII [3-3.4]
   (JTAG Server Version 21.3.0 Build 170 09/23/2021 SC Pro Edition)
  C32150DD   1SG280HH(1S2|2S2|3S2)/.. (IR=10)
    Design hash    D41D8CD98F00B204E980
    + Node 08986E00  Nios V #0

  Captured DR after reset = (C32150DD) [32]
  Captured IR after reset = (001) [10]
  Captured Bypass after reset = (0) [1]
  Captured Bypass chain = (0) [1]
  JTAG clock speed auto-adjustment is enabled. To disable, set JtagClockAutoAdjust parameter to 0
  JTAG clock speed 24 MHz

3) Remote server dash.soc.one: Unable to connect

   (JTAG Server version information not available)
4) Remote server dash.soc.one:1310: Unable to connect

   (JTAG Server version information not available)

```

The log means: The target is programmed through 2nd cable (USB-BlasterII) and the position of FPGA chip is the first position.
  `C32150DD   1SG280HH(1S2|2S2|3S2)/.. (IR=10)`

If it shows like
```bash
1) USB-BlasterII [1-2.3]
020A40DD 5M(1270ZF324|2210Z)/EPM2210
C32250DD 1SG280HH1(.|S3|AS)/1SG280HH2/..
```
that means FPGA chip located in the second position, the first position is chip 1270ZF324

In the command, I set correct parameters for cable order and position of FPGA chip

* <b> Check the JTAG ID and its corresponding chip</b>

The reference is <a href="https://bsdl.info/list.htm?f=828&page=1&sort=name&sorttype=true">here</a>

It turns out the target FPGA is `1SG280LU2F50E2VG` that corresponds to `Jtag ID: 0xC32250DD`. This is L-Tile version of GX development kit. Our first assumption is H-Tile version.

