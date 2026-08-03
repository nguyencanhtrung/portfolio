---
title: 'Dựng floating license server cho Quartus'
description: 'Dựng FLEXlm floating license server cho Quartus: khớp file license với hostname của server, mở ba cổng cho daemon, và bộ lệnh start/stop/kiểm tra trạng thái dùng đi dùng lại hằng ngày.'
date: 2022-12-14
lang: vi
key: installing_floating_lic_quartus
tags: ['intel']
---

## 1. Các bước dựng floating license server

* Sửa file license
* Chuẩn bị thư mục `FLEXlm`
* Tạo script và khởi động license daemon

## 2. Sửa file license

```bash
#SERVER <hostname> 00ABCXYZ <port number>
#VENDOR alterad <path to daemon executable>
#VENDOR mgcld <path to daemon executable>

SERVER ubuntu18 00ABCXYZ 1234
VENDOR alterad /home/administrator/license/quartusld/alterad port=1235
VENDOR mgcld /home/administrator/license/quartusld/mgcld port=1236
```

File license được cấp kèm địa chỉ MAC của server, ở đây là `00ABCXYZ`. Đây là
điểm hay bị bỏ qua: license bị ràng buộc vào đúng máy đó, nên hostname và MAC
trên máy phải khớp với nội dung file, không phải ngược lại.

### 2.1 Đặt `hostname`

```bash
vi /etc/hosts
```

Thêm các dòng sau vào file:

```bash
127.0.1.1 ubuntu18
1.1.1.1 ubuntu18
```

### 2.2 Mở ba cổng cho license server: `1234`, `1235` và `1236`

Cần đủ cả ba: một cổng cho `lmgrd` và mỗi vendor daemon một cổng. Thiếu cổng của
vendor daemon thì server vẫn báo UP nhưng client không lấy được license.

[Hướng dẫn cho Ubuntu](https://www.cyberciti.biz/faq/how-to-open-firewall-port-on-ubuntu-linux-12-04-14-04-lts/)

[Hướng dẫn cho CentOS](https://vinasupport.com/huong-dan-mo-cong-port-tren-centos-7/)

## 3. Chuẩn bị thư mục `FLEXlm`

Copy các file thực thi sau từ `<đường_dẫn_cài_Quartus>/linux64` vào thư mục
`FLEXlm`:

* `lmgrd`
* `lmutil`
* `alterad`

## 4. Tạo script khởi động

Tạo file `start.sh` để chạy daemon:

```bash
 # Start licenser
 export LM_LICENSE_FILE=/home/administrator/license/lic.dat
 export PATH="/home/administrator/license/FLEXlm":$PATH
 lmgrd
```

Dòng thứ nhất trỏ tới file license.

Dòng thứ hai đưa thư mục chứa các file thực thi vào `PATH`, để gọi được chương
trình ở dòng thứ ba.

Dòng thứ ba khởi động license daemon.

Sau đó chạy:

```bash
source start.sh
```

Cách khác, khởi động daemon trực tiếp không cần script:

```bash
<FLEXlm location>/lmgrd -c <path to license file>/license.dat \[-l <log file name>]
```

## 5. Các lệnh cần nhớ

### 5.1 Dừng license server

```bash
lmutil lmdown -q -force
```

### 5.2 Khởi động lại license server

```bash
lmgrd -c lic.dat -l debug.log
```

## 6. Kiểm tra trạng thái sau khi dựng xong

### 6.1 Khi chỉ chạy một license server

```bash
lmutil lmstat -a -c
```

### 6.2 Khi chạy nhiều license server

```bash
lmutil lmstat -a -c <port>@<hostname hoặc IP của host>
```

Ví dụ:

```bash
lmutil lmstat -a -c 1234@ubuntu18
```

Log như dưới đây là đạt. Hai dòng cần soi là `license server UP (MASTER)` và
trạng thái của từng vendor daemon (`alterad: UP`, `mgcld: UP`) — server lên
nhưng vendor daemon chết là tình huống thường gặp nhất, và khi đó client báo lỗi
không tìm thấy feature chứ không báo lỗi kết nối.

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

Users of ip_base:  (Total of 3 licenses issued;  Total of 0 licenses in use)

Users of ip_embedded:  (Total of 3 licenses issued;  Total of 0 licenses in use)

Users of quartus_nonvolatile_encryption:  (Total of 6 licenses issued;  Total of 0 licenses in use)

Users of quartus_pro:  (Total of 6 licenses issued;  Total of 0 licenses in use)

Users of quartus:  (Total of 3 licenses issued;  Total of 0 licenses in use)

12:59:48 (mgcld) TCP_NODELAY NOT enabled
     mgcld: UP v11.16.4
Feature usage info:

Users of alteramtivsim:  (Total of 3 licenses issued;  Total of 0 licenses in use)

Users of intelqsim:  (Total of 3 licenses issued;  Total of 0 licenses in use)
```
