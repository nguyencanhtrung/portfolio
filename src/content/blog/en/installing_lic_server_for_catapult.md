---
title: 'License server for Catapult (Mentor HLS)'
description: 'Standing up a FLEXlm licence server for Catapult HLS: what to download, how to make the host match the MAC address and hostname the licence was issued against, and the commands for running it day to day.'
date: 2022-12-16
lang: en
key: installing_lic_server_for_catapult
tags: ['catapult']
---

## 1. Requirements

You need 3 things to setup a license server:

* License server
* License file
* Software to change your MAC address if you running license server which has different MAC address

### 1.1 License server

Catapult uses FLEXlm daemon to run license server. Firstly, you need to download `License Server` from Mentor [website](https://account.mentor.com/licenses/download).

The FlexNet software includes `lmgrd` deamon, `lmutil` and etc.

If already installed Catapult software, just need to go to `<path_to_installation>/Mgc_home/pkgs/` to get the above software. 

### 1.2 MAC changer

You can install `macchanger` to change your MAC address.

```bash
$ sudo apt install macchanger
```
For more information, please look at this [website](https://linuxconfig.org/change-mac-address-with-macchanger-linux-command)

```bash
$ ip a
```

```bash
$ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: eno2: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc fq_codel state DOWN group default qlen 1000
    link/ether 00:20:00:04:10:AC brd ff:ff:ff:ff:ff:ff
    altname enp0s31f6
3: wlo1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether a4:00:20:00:10:AC brd ff:ff:ff:ff:ff:ff
    altname wlp0s20f3
    inet 192.168.50.85/24 brd 192.168.50.255 scope global dynamic noprefixroute wlo1
       valid_lft 59366sec preferred_lft 59366sec
    inet6 fe80::a3ca:1cf5:2f41:22b5/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever

```

Looking for MAC address of your ethernet interface. In my case, it is `eno2` and the MAC is `00:20:00:04:10:AC`. Just remember the interface name `eno2`.

### 1.3 Name your host

Open `etc/hosts` and adding the following line, then saving it. `<hostname>` is the name you want to name your host.

```bash
127.0.1.1       <hostname>
```

In my case, it is 
```bash
127.0.1.1    tesla
```

### 1.4 Openning tcp port

If your firewall is not active like mine, no need to open anything.

```bash
$ sudo ufw status verbose
Status: inactive
```

If firewall is enable, using this [instruction](https://www.cyberciti.biz/faq/how-to-open-firewall-port-on-ubuntu-linux-12-04-14-04-lts/) to open a port dedicated to license server.

## 2. Modifying license file

After finishing section 1, open the license file and edit it


```bash
SERVER <hostname> <MAC ADDRESS> <port>
DAEMON mgcld <PATH to mgcld inside license server package>
```

Here is my setting
```bash
SERVER tesla 0020000410AC 1718
DAEMON mgcld /home/tesla/license/catapult/mgls_v9-23_5-6-0.aol/lib/mgcld
```

<strong> If installing Catapult version 2023.1 or later, it uses `SALTD` instead of `MGCLD`, so just need to replace `mglcd` by `saltd` as the following</strong>

```bash
SERVER tesla 0020000410AC 1718
DAEMON saltd /opt/Siemens/Catapult/2023.1/Mgc_home/pkgs/FlexNet-11-19-0/Lnx64_x86-64/saltd
```


## 3. Create scripting file

Creating script file named `start.sh` to start deamon has following content

```bash
# Change MAC
macchanger -s eno2
sudo macchanger -m 00:20:00:04:10:AC eno2 
# Start licenser
export LM_LICENSE_FILE=/home/tesla/license/catapult/catapult.txt
export PATH="/home/tesla/license/catapult/mgls_v9-23_5-6-0.aol/bin":$PATH
/home/tesla/license/catapult/mgls_v9-23_5-6-0.aol/bin/lmgrd
```
Commands `sudo macchanger -m 00:20:00:04:10:AC eno2` is used to change MAC ADDRESS to match with the one in the license file.

The third command is the pointer to license file.

The fourth command is `PATH` to executable files which contains the program in the last command.

The last command is to run license deamon.

Note: You can get export `lmgrd` from installation path of Catapult like following:


```bash
# Change MAC
macchanger -s eno2
sudo macchanger -m 00:20:00:04:10:AC eno2 
# Start licenser
export LM_LICENSE_FILE=/home/tesla/license/catapult/catapult.txt
export PATH="/opt/Siemens/Catapult/2023.1/Mgc_home/bin":$PATH
/opt/Siemens/Catapult/2023.1/Mgc_home/bin/lmgrd
```

Then, running

```bash
source start.sh
```

Another way, to start license server deamon directly without scripting

```bash
<FLEXlm location>/lmgrd -c <path to license file>/license.txt \[-l <log file name>]
```

## 4. Important commands

### 4.1 Stop license server

```bash
lmutil lmdown -q -force
```

### 4.2 Restart license server

```bash
lmgrd -c lic.dat -l debug.log
```

## 5. Checking status of license

### 5.1 Having only one licence server running

```bash
lmutil lmstat -a -c
```

### 5.2 Having multiple license server running

```bash
lmutil lmstat -a -c <port>@<hostname or host IP ~>
```

Example

```bash
lmutil lmstat -a -c 1718@tesla
```

The message below is OK.

```bash
lmutil - Copyright (c) 1989-2018 Flexera. All Rights Reserved.
Flexible License Manager status on Fri 12/16/2022 23:34

License server status: 1718@tesla
    License file(s) on tesla: /home/tesla/license/catapult/catapult.txt:
     tesla: license server UP (MASTER) v11.16.2

Vendor daemon status (on tesla):
     mgcld: UP v11.16.2
Feature usage info:

Users of msimviewer:  (Total of 1 license issued;  Total of 0 licenses in use)
Users of qvman:  (Total of 1 license issued;  Total of 0 licenses in use)
Users of msimcompare:  (Total of 1 license issued;  Total of 0 licenses in use)
Users of txanalysis:  (Total of 1 license issued;  Total of 0 licenses in use)
Users of svverification:  (Total of 1 license issued;  Total of 0 licenses in use)
Users of qvrm:  (Total of 1 license issued;  Total of 0 licenses in use)
Users of msimcoverage:  (Total of 1 license issued;  Total of 0 licenses in use)
Users of msimhdlsim:  (Total of 1 license issued;  Total of 0 licenses in use)
Users of msimprofile:  (Total of 1 license issued;  Total of 0 licenses in use)
Users of msimhdlmix:  (Total of 1 license issued;  Total of 0 licenses in use)
Users of qdbgcoverage:  (Total of 1 license issued;  Total of 0 licenses in use)
Users of msimdataflow:  (Total of 1 license issued;  Total of 0 licenses in use)
Users of msimsystemc:  (Total of 1 license issued;  Total of 0 licenses in use)
Users of msimcdebug:  (Total of 1 license issued;  Total of 0 licenses in use)
Users of msimreguvm:  (Total of 1 license issued;  Total of 0 licenses in use)
Users of mtiverification:  (Total of 1 license issued;  Total of 0 licenses in use)
Users of zncwmbase:  (Total of 1 license issued;  Total of 0 licenses in use)
Users of CatapultUltra_c:  (Total of 1 license issued;  Total of 1 license in use)
```


### 5.3 Errors may happen

```bash
lmgrd: No such file or directory
```

<strong>Cause</strong>

A possible reason is the missing Linux Standard Base (LSB) components which are required by the lmgrd. To check, if the requirements are installed, the following commands can be executed:

```bash
$ ldd lmgrd
        linux-vdso.so.1 =>  (0x00007fffeafef000)
        libpthread.so.0 => /lib/x86_64-linux-gnu/libpthread.so.0 (0x00007f5ba86fb000)
        libm.so.6 => /lib/x86_64-linux-gnu/libm.so.6 (0x00007f5ba83f2000)
        libgcc_s.so.1 => /lib/x86_64-linux-gnu/libgcc_s.so.1 (0x00007f5ba81dc000)
        libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007f5ba7e12000)
        libdl.so.2 => /lib/x86_64-linux-gnu/libdl.so.2 (0x00007f5ba7c0e000)
        /lib64/ld-lsb-x86-64.so.3 => /lib64/ld-linux-x86-64.so.2 (0x00007f5ba8918000)
$ ls -l /lib64/ld-lsb-x86-64.so.3
ls: cannot access '/lib64/ld-lsb-x86-64.so.3': No such file or directory
```
As seen, the `/lib64/ld-lsb-x86-64.so.3` is missing.

<strong>Solution</strong>
```bash
$ sudo apt-get install lsb
```
