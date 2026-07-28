---
title: 'RTL simulation with Questasim'
description: 'Introduction - how to simulate RTL design with Questa Sim'
date: 2022-11-23
lang: en
key: questasim-intel
tags: ['sim']
---

## 1. Quick Start

Unlike Xilinx EDA tool, Quartus does not provide its own version of simulator, instead users need to use third-party software to do their tasks. 

When you download Quartus package, it also contains third-party simulators (Mentor Graphic) which are

* Modelsim-Intel SE (ver 21.3 and older) or Questasim-Intel FE (version 22.1 and newer) (activated with Quartus license)
* Modelsim-Intel PE (ver 21.3 and older) or Questasim-Intel FSE (version 22.1 and newer) (extra license needed)

The following sections will describe step-by-step how to use modelsim/questasim.

In my case, I am using Questasim-Intel FE version.

### <ins><strong>INSTALLATION</strong></ins>

To run modelsim or questasim in batch mode, the program must be in the path of your shell. You can add these lines into your `~/.bashrc` after installing Quartus. Changing `/opt/Intel/22.3/` to your installation path.

```bash
export LD_LIBRARY_PATH=/opt/Intel/22.3/quartus/linux64:$LD_LIBRARY_PATH
export PATH=/opt/Intel/22.3/quartus/bin:/opt/Intel/22.3/questa_fe/bin:$PATH
```


### <ins><strong>IMPORTANT COMMANDS</strong></ins>

The section is from [this source](https://vhdlwhiz.com/the-modelsim-commands-you-need-to-know/)

<strong>VLIB</strong>

The `vlib` command creates a design library. You’ve probably used libraries like `ieee` or `std` in your VHDL code before. But the VHDL code you write must also go into a design library.

The default library in ModelSim is `work`. If you create a new VHDL project in the GUI, it will automatically create it for you. 

Unless you specify a different location, each design library will appear as a folder in your project folder. For example, the compiled code belonging to the `work` library usually resides in a subfolder named <strong>./work</strong>.

Let’s create the `work` library manually using `vlib`:

```bash
vlib work
```

And delete it using the `vdel` command:

```bash
vdel -all -lib work
```

<strong>VCOM</strong>

This is the <strong>VHDL compiler</strong> command in ModelSim. It’s easy to compile; type `vcom` followed by the path to your VHDL file:

```bash
vcom ./my_module.vhd
```

Note that when you call `vcom` without other arguments, the module ends up in the default `work` library.

You can compile it into a different library by giving the `-work` switch:

```bash
vlib my_lib
vcom -quiet -work my_lib ./my_module.vhd
```

(But then you first have to create `my_lib` using the `vlib` command)

The `vcom` command has lots and lots of optional arguments that allow you to control the compilation rules in detail. Check out the ModelSim Reference Manual for a comprehensive list of all the options.

Another note: if you want to use <strong>Verilog compiler</strong>, here is the command

```bash
vlog -vlog01compat -work work ./dc_fifo.v
```

<strong>VMAP</strong>

Using the `vmap` tool, you can view and edit the mapping between the VHDL library name and the path to the compiled VHDL code in your file system (the folder you created with `vlib` and compiled into using `vcom`).

To list all mappings, type `vmap` without arguments:

```bash
vmap
```

That will print a list of library mappings from which you may recognize some names from. For example, ieee and std. The standard libs are probably located in your ModelSim installation directory as they came with the simulator.

Other libraries like `work` will probably map to the current working directory “./work”.

```bash
VSIM 2> vmap
# Questa Intel FPGA Edition-64 vmap 2022.1 Lib Mapping Utility 2022.01 Jan 29 2022
# vmap 
# Reading modelsim.ini
# "work" maps to directory ./libraries/work/.
# "work_lib" maps to directory ./libraries/work/.
# "fifo_1911" maps to directory ./libraries/fifo_1911/.
# "dc_fifo" maps to directory ./libraries/dc_fifo/.
# Reading /opt/Intel/22.3/questa_fe/linux_x86_64/../modelsim.ini
# "std" maps to directory /opt/Intel/22.3/questa_fe/linux_x86_64/../std.
# "ieee" maps to directory /opt/Intel/22.3/questa_fe/linux_x86_64/../ieee.
# "vital2000" maps to directory /opt/Intel/22.3/questa_fe/linux_x86_64/../vital2000.
# "verilog" maps to directory /opt/Intel/22.3/questa_fe/linux_x86_64/../verilog.
# "std_developerskit" maps to directory /opt/Intel/22.3/questa_fe/linux_x86_64/../std_developerskit.
# "synopsys" maps to directory /opt/Intel/22.3/questa_fe/linux_x86_64/../synopsys.
# "modelsim_lib" maps to directory /opt/Intel/22.3/questa_fe/linux_x86_64/../modelsim_lib.
```

You can add or update a mapping by typing:

```bash
vmap lib_name path/to/the/lib/folder
```

Or, you can delete a library mapping by typing:

```bash
vmap -del lib_name
```

Finally, you should know that `vmap` modifies your `modelsim.ini` file. The location of modelsim.ini may vary. There’s one in the ModelSim installation directory, but it’s often not writable without admin privileges.

If you make the INI file writable, `vmap` will happily modify it. But a better strategy is to use the system’s modelsim.ini file as a template and copy it to your local folder by using the special “-c” switch:

```bash
vmap -c
```

Then you can set an environment variable pointing to this file:

```bash
set MODELSIM=<project_dir>/modelsim.ini
```

When you now call `vmap` or any other command that relies on the INI file, it will use the local copy of `modelsim.ini`.


<strong>VSIM</strong>

This is the command that starts the VHDL simulator (ModelSim). If you call `vsim` from a shell without any arguments, the <strong>ModelSim GUI</strong> will open:

```bash
vsim
```

Running <strong>batch mode</strong>:

```bash
vsim -c
```

Another useful switch is “-do”, which <ins>lets you specify a command that ModelSim will run when it opens</ins>. Here, we combine it with the “-c” flag to print “Hello World!” to the console and exit:

```bash
vsim -c -do "echo Hello World!; exit"
```

And, of course, you can simulate from the command line. Just give the library and entity of the testbench and combine it with the “-do” switch to start the simulation like this:

```bash
vsim -c my_lib.my_tb -do "run -all"
```

If you start a batch mode simulation from a script or a Makefile, you may want to return an exit code that you can pick up in your script. The exit command in ModelSim has a `-code` switch that lets you do this.

```bash
vcom -quiet -2008 -work counter_lib ./counter.vhd
vcom -quiet -2008 -work counter_lib ./counter_tb.vhd
vsim -c counter_lib.counter_tb -do "run -all; exit -code 0"
```

<strong>MODELSIM REFERENCE MANUAL PDF</strong>

If you want to dig deeper into these and other ModelSim commands, I recommend checking out the [ModelSim Reference Manual](https://www.microsemi.com/document-portal/doc_view/131617-modelsim-reference-manual). It’s 455 pages long and lists all the possible ModelSim commands along with their optional switches.

Or you can access it from within ModelSim by clicking: Help -> PDF Documentation -> Reference Manual.

## 2. What need to run simulation

In order to run simulation on Model/Questa-sim, you need to prepare 3 things

* Unit Under Test (UUT): Includes design source codes
* Testbench
* Scripts

For 2 formers, no need to discuss more since it is straight-forward. The later is what you need to study more if you switched from other simulator such as XSIM (Xililnx).

### <ins>Scripting</ins>

There are 3 important scripts that are used for simulation.

| Scripts               | Description           |
|:-                     |:-                     |
| `msim_setup.tcl`      | Generated by Quartus  |
| `modelsim_files.tcl`  | Generated by Quartus  |
| `*.do`                | Defined by User       |

<strong>"modelsim_files.tcl"</strong>

Design-independent file. It defines:

&emsp;Specific <strong>libraries</strong>

&emsp;<strong>Design files</strong> corresponding to these specific libraries

&emsp;<strong>Memory files</strong>

If your design using IPs from IP Catalog, libraries that those IPs used and its design will be specified in this file. When `"Generate Simulator Setup Script"`, this file is generated and includes all needed information.

Here is an example of a design using DC_FIFO provided in IP catalog.

```bash
proc get_design_libraries {} {
  set libraries [dict create]
  dict set libraries fifo_1911 1
  dict set libraries dc_fifo   1
  return $libraries
}

proc get_memory_files {QSYS_SIMDIR} {
  set memory_files [list]
  return $memory_files
}

proc get_common_design_files {USER_DEFINED_COMPILE_OPTIONS USER_DEFINED_VERILOG_COMPILE_OPTIONS USER_DEFINED_VHDL_COMPILE_OPTIONS QSYS_SIMDIR} {
  set design_files [dict create]
  return $design_files
}

proc get_design_files {USER_DEFINED_COMPILE_OPTIONS USER_DEFINED_VERILOG_COMPILE_OPTIONS USER_DEFINED_VHDL_COMPILE_OPTIONS SIM_DIR} {
  set design_files [list]
  lappend design_files "vcom $USER_DEFINED_VHDL_COMPILE_OPTIONS $USER_DEFINED_COMPILE_OPTIONS  \"[normalize_path "$SIM_DIR/02.uut/01.fw_bm/dc_fifo/fifo_1911/sim/dc_fifo_fifo_1911_nytavei.vhd"]\"  -work fifo_1911"
  lappend design_files "vcom $USER_DEFINED_VHDL_COMPILE_OPTIONS $USER_DEFINED_COMPILE_OPTIONS  \"[normalize_path "$SIM_DIR/02.uut/01.fw_bm/dc_fifo/sim/dc_fifo.vhd"]\"  -work dc_fifo"                              
  return $design_files
  return $design_files
}

proc get_elab_options {SIMULATOR_TOOL_BITNESS} {
  set ELAB_OPTIONS ""
  if ![ string match "bit_64" $SIMULATOR_TOOL_BITNESS ] {
  } else {
  }
  append ELAB_OPTIONS { -t fs}
  return $ELAB_OPTIONS
}


proc get_sim_options {SIMULATOR_TOOL_BITNESS} {
  set SIM_OPTIONS ""
  if ![ string match "bit_64" $SIMULATOR_TOOL_BITNESS ] {
  } else {
  }
  return $SIM_OPTIONS
}


proc get_env_variables {SIMULATOR_TOOL_BITNESS} {
  set ENV_VARIABLES [dict create]
  set LD_LIBRARY_PATH [dict create]
  dict set ENV_VARIABLES "LD_LIBRARY_PATH" $LD_LIBRARY_PATH
  if ![ string match "bit_64" $SIMULATOR_TOOL_BITNESS ] {
  } else {
  }
  return $ENV_VARIABLES
}


proc normalize_path {FILEPATH} {
    if {[catch { package require fileutil } err]} { 
        return $FILEPATH 
    } 
    set path [fileutil::lexnormalize [file join [pwd] $FILEPATH]]  
    if {[file pathtype $FILEPATH] eq "relative"} { 
        set path [fileutil::relative [pwd] $path] 
    } 
    return $path 
} 

```

In this example, I used 2 libraries which are generated when calling FIFO IP core from IP Catalog: `fifo_1911` and `dc_fifo`

Then, you see in `get_design_files` is where design added in two libraries with `vcom` command.

Note that this file is kind of declaration file, it will be used in the later file `msim_setup.tcl`

<strong>"msim_setup.tcl"</strong>

This file sets up the enviroment for simulation run. 


<strong>"\*.do"</strong>


So to do "Standard-Alone" simulation, you just need to copy 3 scripts above along with source codes and testbenches, you will be able to run your simulation in other machine.


## 3. Design with no third party IP Cores

Đối với hệ thống không sử dụng các IP từ Intel thì có thể tạo project, biên dịch và mô phỏng trực tiếp với modelsim theo flow sau đây

https://www.intel.com/content/www/us/en/support/programmable/support-resources/design-examples/quartus/simulation-manual-howto.html


## 4. Design with Intel IP Cores

If a design using Intel IP, <strong>Generate Simulator Setup Scrupt for IP</strong> is needed to extract all libraries for simulation.

```bash
Tools > Generate Simulator Setup Script for IP ...
```

One note: If you <strong>generate HDL</strong> from IP Editor, you need to check the "Generate simulation model" option of IP cores. Missing it, script generation will be failed due to miss simulation model.

Please following the example [<ins><strong>here</strong></ins>](https://www.intel.com/content/www/us/en/docs/programmable/683305/19-4/simulation-quick-start.html) to simulate a project using Intel IP Cores


The following is a complete `mentor_example.do`

```bash
set QSYS_SIMDIR ../
# #
# # Source the generated IP simulation script.
source $QSYS_SIMDIR/mentor/msim_setup.tcl
# #
dev_com
# #
# # Call command to compile the Quartus-generated IP simulation files.
com
# #
# # Add commands to compile all design files and testbench files, including
# # the top level. (These are all the files required for simulation other
# # than the files compiled by the Quartus-generated IP simulation script)
vcom -work work ../src/dc_fifo/sim/dc_fifo.vhd
vcom -work work ../src/axi_lite_ctrl_S_AXI_LITE.vhd
vcom -work work ../src/axi_lite_ctrl.vhd
vcom -work work ../src/axis_handler.vhd
vcom -work work ../src/adapter.vhd
vcom -work work ../src/tb.vhd

# #
# # Set the top-level simulation or testbench module/entity name, which is
# # used by the elab command to elaborate the top level.
set TOP_LEVEL_NAME tb
# #
# # Set any elaboration options you require.
elab_debug
# #
# # Run the simulation.
# run -a
add wave *

view structure
view signals
# run -all
run 1 us

```


## How to stop a simulator

https://vhdlwhiz.com/how-to-stop-testbench/


### Simulating NIOS II

https://www.youtube.com/watch?v=Jw3rr76QEIc

[1] https://community.intel.com/t5/Nios-II-Embedded-Design-Suite/update-for-AN351/m-p/1351699#M51062
[2] https://community.intel.com/t5/Nios-II-Embedded-Design-Suite/AN351-really-confused-me/m-p/1351698#M51061
[3] https://community.intel.com/t5/Nios-II-Embedded-Design-Suite/Nios-II-simulation-with-Questa/m-p/1351656#M51059

