---
title: 'Floating license server for Quartus'
description: 'How to setup floating license server'
date: 2022-12-14
lang: en
key: installing_floating_lic_quartus
tags: ['intel']
---

## 1. Steps to setup floating license server

* Modifying license file
* Setup `FLEXlm` folder
* Create scripting file and start license deamon

## 2. Modifying license file

```bash
#SERVER <hostname> 00ABCXYZ <port number>
#VENDOR alterad <path to daemon executable>
#VENDOR mgcld <path to daemon executable>
 
SERVER ubuntu18 00ABCXYZ 1234
VENDOR alterad /home/administrator/license/quartusld/alterad port=1235
VENDOR mgcld /home/administrator/license/quartusld/mgcld port=1236

```

The license is delivered along with MAC Address of server which is `00ABCXYZ`

### Setup `hostname`

```bash
vi /etc/hosts
```

Adding the following lines in to the file

```bash
127.0.1.1 ubuntu18
1.1.1.1 ubuntu18
```

### Open 3 ports for license server `1234`, `1235` and `1236`

[Ubuntu](https://www.cyberciti.biz/faq/how-to-open-firewall-port-on-ubuntu-linux-12-04-14-04-lts/)

[Centos](https://vinasupport.com/huong-dan-mo-cong-port-tren-centos-7/)

## 3. Setup `FLEXlm` folder

Copy following executable files from `<Quartus_installation_path>/linux64` into the `FLEXlm` folder

* `lmgrd`
* `lmutil`
* `alterad`

## 4. Create scripting file

Creating script file named `start.sh` to start deamon

```bash
 # Start licenser
 export LM_LICENSE_FILE=/home/administrator/license/lic.dat
 export PATH="/home/administrator/license/FLEXlm":$PATH
 lmgrd
```

The first command is the pointer to license file.

The second command is `PATH` to executable files which contains the program in the third command.

The third command is to run license deamon.

Then, running

```bash
source start.sh
```

Another way, to start license server deamon directly without scripting

```bash
<FLEXlm location>/lmgrd -c <path to license file>/license.dat \[-l <log file name>]
```

## 5. Important commands

### Stop license server

```bash
lmutil lmdown -q -force
```

### Restart license server

```bash
lmgrd -c lic.dat -l debug.log
```

## 6. Checking status of license server after setting up

### Having only one licence server running

```bash
lmutil lmstat -a -c
```

### Having multiple license server running

```bash
lmutil lmstat -a -c <port>@<hostname or host IPvi ~>
```

Example

```bash
lmutil lmstat -a -c 1234@ubuntu18
```


The following log is ok.

```bash
administrator@ubuntu18:~/license$ lmutil lmstat -a -c
lmutil - Copyright (c) 1989-2021 Flexera. All Rights Reserved.
Flexible License Manager status on Tue 12/13/2022 12:59

License server status: 1234@ubuntu18
    License file(s) on ubuntu18: /home/administrator/license/licenses/LR-102624_License.dat:

  ubuntu18: license server UP (MASTER) v11.18.2

Vendor daemon status (on ubuntu18):

   alterad: UP v11.18.2
Feature usage info:

Users of 6AF8_D036:  (Total of 1 license issued;  Total of 0 licenses in use)

Users of 6AF7_D036:  (Total of 1 license issued;  Total of 0 licenses in use)

Users of ip_base:  (Total of 3 licenses issued;  Total of 0 licenses in use)

Users of ip_embedded:  (Total of 3 licenses issued;  Total of 0 licenses in use)

Users of maxplus2verilog:  (Total of 3 licenses issued;  Total of 0 licenses in use)

Users of maxplus2vhdl:  (Total of 3 licenses issued;  Total of 0 licenses in use)

Users of quartus_nonvolatile_encryption:  (Total of 6 licenses issued;  Total of 0 licenses in use)

Users of sw_pe:  (Total of 3 licenses issued;  Total of 0 licenses in use)

Users of maxplus2:  (Total of 3 licenses issued;  Total of 0 licenses in use)

Users of quartus_pro:  (Total of 6 licenses issued;  Total of 0 licenses in use)

Users of quartus:  (Total of 3 licenses issued;  Total of 0 licenses in use)

Users of 6AF7_00A2:  (Total of 3 licenses issued;  Total of 0 licenses in use)

Users of 6AF7_00BE:  (Total of 3 licenses issued;  Total of 0 licenses in use)

Users of 6AF7_00BF:  (Total of 3 licenses issued;  Total of 0 licenses in use)

Users of 6AF7_00BD:  (Total of 3 licenses issued;  Total of 0 licenses in use)

Users of 6AF7_010C:  (Total of 3 licenses issued;  Total of 0 licenses in use)

Users of 6AF7_0034:  (Total of 3 licenses issued;  Total of 0 licenses in use)

Users of 6AF7_00D8:  (Total of 3 licenses issued;  Total of 0 licenses in use)

Users of 6AF7_0014:  (Total of 3 licenses issued;  Total of 0 licenses in use)

12:59:48 (mgcld) TCP_NODELAY NOT enabled
     mgcld: UP v11.16.4
Feature usage info:

Users of mgcvipae:  (Total of 3 licenses issued;  Total of 0 licenses in use)

Users of mgcvipaeaxi:  (Total of 6 licenses issued;  Total of 0 licenses in use)

Users of mgcvipaeaxi4:  (Total of 3 licenses issued;  Total of 0 licenses in use)

Users of alteramtivsim:  (Total of 3 licenses issued;  Total of 0 licenses in use)

Users of intelqsim:  (Total of 3 licenses issued;  Total of 0 licenses in use)
```