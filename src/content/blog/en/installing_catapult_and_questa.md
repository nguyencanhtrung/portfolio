---
title: 'Catapult and Questasim installation'
description: 'Installing Catapult HLS and QuestaSim on Linux, the Quartus and Vivado back ends they call out to for synthesis, and the .bashrc entries that make the whole toolchain start from one command.'
date: 2022-12-17
lang: en
key: installing_catapult_and_questa
tags: ['catapult']
---

## 1. Installing Catapult and Questasim

Just follow the GUI instruction to install your Catapult packages and Questasim packages.

In my case, I installed them into:

```bash
/opt/Siemens/Catapult
/opt/Siemens/Questa
```

## 2. Installing Quartus

If using FPGA technology from Intel, installing Quartus is required to synthesize your design. Following the Quartus installation guide to process forward.

## 3. Installing Vivado

If using FPGA technology from Xilinx, installing Vivado is required to synthesize your design. Following the Vivado installation guide to process forward.

## 4. Adding these lines into `.bashrc`

To start `Catapult`, it requires:

* `MGC_HOME` which is used to specify `Catapult location`.
* License server of license file `LM_LICENSE_FILE`
* Exporting executable file to run the tool from command line: `export PATH=/opt/Siemens/Catapult/2022.1_1/Mgc_home/bin:$PATH`


```bash
# =======================================================
# Quartus
# =======================================================
export INTELFPGAOCLSDKROOT="/opt/Intel/22.2/hld"
export QSYS_ROOTDIR="/opt/Intel/22.2/qsys/bin"
export QUARTUS_ROOTDIR_OVERRIDE="/opt/Intel/22.2/quartus"
export QUARTUS_PRO_ROOTDIR="/opt/Intel/22.2/quartus"
# QUARTUS environment
export LD_LIBRARY_PATH=/opt/Intel/22.2/quartus/linux64:$LD_LIBRARY_PATH
export PATH=/opt/Intel/22.2/quartus/bin:/opt/Intel/22.3/questa_fe/bin:$PATH

# =======================================================
# Catapult - Questasim
# =======================================================
export LM_LICENSE_FILE=1234@ubuntu18
export MGC_HOME="/opt/Siemens/Catapult/2022.1_1/Mgc_home"
export PATH=/opt/Siemens/Catapult/2022.1_1/Mgc_home/bin:$PATH

export MODEL_TECH="/opt/Siemens/Questa/21.3.2/questasim/bin"

```

Adding Quartus environment, so the Catapult can call the synthesizer when processes `RTL stage`.

Adding Questasim enviromnet for RTL co-simulation

Note that: In my case, I used a combination of:

* Catapult version: 2022.1.1
* Questasim version: 21.3.2
* Quartus version: 22.2

Then, everything worked well.

However, when moving Quartus to version of 22.3, it was impossible to run Quartus synthesizer without error. So, be carefull to check compatiable version, it is recommended to follow instruction in Catapult installation guide to find your own combination. 


## 5. Starting Catapult

```bash
$ catapult
```
