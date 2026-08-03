---
title: 'Dựng license server cho Catapult (Mentor HLS)'
description: 'Dựng FLEXlm license server cho Catapult HLS: cần tải những gì, làm sao để MAC address và hostname của máy khớp với thông tin license được cấp, và bộ lệnh vận hành hằng ngày.'
date: 2022-12-16
lang: vi
key: installing_lic_server_for_catapult
tags: ['catapult']
---

## 1. Chuẩn bị

Cần 3 thứ để dựng license server:

* License server
* File license
* Phần mềm đổi MAC address, trong trường hợp máy chạy license server có MAC
  khác với MAC ghi trong file license

### 1.1 License server

Catapult dùng FLEXlm daemon để chạy license server. Trước hết tải
`License Server` từ [website](https://account.mentor.com/licenses/download) của
Mentor.

Gói FlexNet gồm daemon `lmgrd`, `lmutil` và một số tiện ích khác.

Nếu đã cài sẵn Catapult thì chỉ cần vào
`<path_to_installation>/Mgc_home/pkgs/` là có đủ các chương trình trên.

### 1.2 MAC changer

Cài `macchanger` để đổi MAC address:

```bash
$ sudo apt install macchanger
```

Chi tiết thêm xem
[ở đây](https://linuxconfig.org/change-mac-address-with-macchanger-linux-command).

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

Tìm MAC address của interface ethernet. Ở đây là `eno2` với MAC
`00:20:00:04:10:AC`. Nhớ lấy tên interface `eno2`.

### 1.3 Đặt tên host

Mở `etc/hosts`, thêm dòng dưới đây rồi lưu lại. `<hostname>` là tên muốn đặt
cho máy.

```bash
127.0.1.1       <hostname>
```

Ở đây là:

```bash
127.0.1.1    tesla
```

### 1.4 Mở cổng TCP

Nếu firewall đang tắt như máy này thì không cần mở gì cả.

```bash
$ sudo ufw status verbose
Status: inactive
```

Nếu firewall đang bật, làm theo
[hướng dẫn này](https://www.cyberciti.biz/faq/how-to-open-firewall-port-on-ubuntu-linux-12-04-14-04-lts/)
để mở một cổng riêng cho license server.

## 2. Sửa file license

Sau khi xong phần 1, mở file license ra sửa:

```bash
SERVER <hostname> <MAC ADDRESS> <port>
DAEMON mgcld <PATH to mgcld inside license server package>
```

Cấu hình thực tế:

```bash
SERVER tesla 0020000410AC 1718
DAEMON mgcld /home/tesla/license/catapult/mgls_v9-23_5-6-0.aol/lib/mgcld
```

**Catapult từ bản 2023.1 trở đi dùng `SALTD` thay cho `MGCLD`, nên chỉ cần thay
`mgcld` bằng `saltd`:**

```bash
SERVER tesla 0020000410AC 1718
DAEMON saltd /opt/Siemens/Catapult/2023.1/Mgc_home/pkgs/FlexNet-11-19-0/Lnx64_x86-64/saltd
```

## 3. Tạo script khởi động

Tạo file `start.sh` để chạy daemon với nội dung sau:

```bash
# Change MAC
macchanger -s eno2
sudo macchanger -m 00:20:00:04:10:AC eno2 
# Start licenser
export LM_LICENSE_FILE=/home/tesla/license/catapult/catapult.txt
export PATH="/home/tesla/license/catapult/mgls_v9-23_5-6-0.aol/bin":$PATH
/home/tesla/license/catapult/mgls_v9-23_5-6-0.aol/bin/lmgrd
```

Lệnh `sudo macchanger -m 00:20:00:04:10:AC eno2` đổi MAC address cho khớp với
MAC ghi trong file license.

Lệnh thứ ba trỏ tới file license.

Lệnh thứ tư đưa thư mục chứa các file thực thi vào `PATH`, tức là nơi có chương
trình được gọi ở lệnh cuối.

Lệnh cuối khởi động license daemon.

Lưu ý: có thể lấy `lmgrd` ngay từ thư mục cài đặt Catapult:

```bash
# Change MAC
macchanger -s eno2
sudo macchanger -m 00:20:00:04:10:AC eno2 
# Start licenser
export LM_LICENSE_FILE=/home/tesla/license/catapult/catapult.txt
export PATH="/opt/Siemens/Catapult/2023.1/Mgc_home/bin":$PATH
/opt/Siemens/Catapult/2023.1/Mgc_home/bin/lmgrd
```

Sau đó chạy:

```bash
source start.sh
```

Cách khác, khởi động license daemon trực tiếp không cần script:

```bash
<FLEXlm location>/lmgrd -c <path to license file>/license.txt \[-l <log file name>]
```

## 4. Các lệnh cần nhớ

### 4.1 Dừng license server

```bash
lmutil lmdown -q -force
```

### 4.2 Khởi động lại license server

```bash
lmgrd -c lic.dat -l debug.log
```

## 5. Kiểm tra trạng thái license

### 5.1 Khi chỉ chạy một license server

```bash
lmutil lmstat -a -c
```

### 5.2 Khi chạy nhiều license server

```bash
lmutil lmstat -a -c <port>@<hostname hoặc IP của host>
```

Ví dụ:

```bash
lmutil lmstat -a -c 1718@tesla
```

Log như dưới đây là đạt.

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

### 5.3 Lỗi có thể gặp

```bash
lmgrd: No such file or directory
```

**Nguyên nhân**

Một khả năng là thiếu các thành phần Linux Standard Base (LSB) mà `lmgrd` cần.
Kiểm tra bằng các lệnh sau:

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

Ở đây thiếu `/lib64/ld-lsb-x86-64.so.3`.

**Cách xử lý**

```bash
$ sudo apt-get install lsb
```
