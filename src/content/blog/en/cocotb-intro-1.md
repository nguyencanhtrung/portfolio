---
title: 'Cocotb framework - day 1'
description: 'Learning about cocotb framework for RTL simulation'
date: 2022-10-19
lang: en
key: cocotb-intro-1
tags: ['cocotb']
---

## Overview

Want to learn
- Cocotb framework using python
- web development
- Telegram bot
- Trading bot


## Installation

The current stable version 1.7.1 of cocotb requires:
* Python 3.6+
* GNU Make 3+
* A Verilog or VHDL simulator, depending on your RTL source code


### Python installation

```bash
sudo apt-get install make python3 python3-pip
```

We can use the global python installation for `cocotb`. However, the better way is to create a separated environment for `cocotb` to prevent any corruption on main python installation.

Here, we create our own python env inside the `cocotb` working directory.

```bash
cd $PATH_TO_YOUR_COCOTB_WS
python3 -m venv venv
```

It creates the `venv` directory. Now, check the current environment

```bash
which python3
```

You will notice that it still uses the global environment `usr/bin/python3`

Lets activate the working environment

```bash
source venv/bin/active
```

Now, check the current environment

```bash
which python3
```

New environment for cocotb is activated.


### Cocotb packages installation

```bash
pip install cocotb pytest cocotb-bus cocotb-coverage
```

Make sure `pip` version `3.x`

```bash
pip -V
```

Otherwise, using `pip3` instead.

The packages are installed in `venv/lib/python3.x/site-packages`


You may need to add to `PATH` and add this line into your `.bashrc` file

```bash
export PATH=/home/tesla/.local/bin:$PATH
```

Checking whether it is successfull or not by typing `cocotb-config`


### Icarus Verilog installation

Cocotb supports the following RTL simulators: Synopsys VCS, Intel Questa and Icarus Verilog. Icarus Verilog is free and can be obtained from <a href="https://github.com/steveicarus/iverilog">https://github.com/steveicarus/iverilog</a>. To install Icarus Verilog, follow the instructions from the git repository, or simply:

```bash
sudo apt install iverilog
```

Another way to install iverilog is to recompile and install from source code by following steps. I recommend this way to get the lastest version.

```bash
git clone https://github.com/steveicarus/iverilog
cd iverilog
sh ./autoconf.sh
./configure
make
sudo make install
```

### Questasim

If using Questasim, just need to add the Questasim installation path

```bash
export MODELSIM_BIN_DIR="/opt/Intel/questa_fe/bin"
```

Need to export the `LM_LICENSE_FILE` of Quartus package before running `cocotb`

Note that: the questasim here is Intel version. I have not make `cocotb` worked with `Mentor Questasim` yet.


## My Hello World with cocotb


### Makefile


### Important concepts

* Use the `@cocotb.test()` decorator to mark the test function to be run.

* Use `.value = value` to assign a value to a signal.

* Use `.value` to get a signal’s current value.


============
Learning to write python testbenches

Concurrent Execution

- Coroutines can be scheduled for concurrent execution with fork(), start(), and start_soon()
- Su khac nhau giua start() va start_soon() la gi
- fork() se bi loai bo


## Cocotb with Questa

### Enable GUI and Waveform

Adding `GUI=1` and `WAVES=1` in the Makefiles. Or typing following command

```bash
make GUI=1 WAVES=1
```

### GUI exits after simulation done

[Reference](https://github.com/cocotb/cocotb/issues/3046)

Switching from GUI=0 to GUI=1 and vice versa requires cleaning sim_build folder by

```bash
cd $PATH_TO_TEST_DIR
make clean

make GUI=1
```

Reason: For Questa, runsim.do file is generated based on the value of the GUI parameter. But if the file has been generated once, its contents is not updated unless one deletes the file. [https://github.com/cocotb/cocotb/issues/2734](URL)


### SCRIPT_FILE

For Questa/Modelsim, the SCRIPT_FILE is currently run before the simulation is initialized using the vsim command. In the common case where SCRIPT_FILE=wave.do, a file that sets up traces in the GUI, these traces fail to initialize since the underlying signals don't exist yet.

This commit runs the SCRIPT_FILE before the vsim command, allowing traces to be set up properly.


### Adding different libraries in Questa

[URL](https://github.com/cocotb/cocotb/issues/2785)