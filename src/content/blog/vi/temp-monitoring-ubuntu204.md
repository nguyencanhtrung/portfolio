---
title: 'Theo dõi nhiệt độ máy trên Ubuntu'
description: 'Hai cách xem nhiệt độ CPU và GPU trên Ubuntu: lm-sensors để đọc nhanh từ dòng lệnh, và Glances khi cần theo dõi một máy từ xa qua trình duyệt.'
date: 2022-10-23
lang: vi
key: temp-monitoring-ubuntu204
tags: ['ubuntu']
---

## 1. Sensors

`lm-sensors` là tiện ích dòng lệnh đọc nhiệt độ CPU và GPU trên Linux. Nó đọc
trực tiếp từ các chip cảm biến trên mainboard, nên ngoài nhiệt độ còn xem được
cả tốc độ quạt. Cài đặt:

```bash
sudo apt-get install lm-sensors
```

Dò các cảm biến có trên máy:

```bash
sudo sensors-detect
```

Bước này hỏi khá nhiều câu; trả lời mặc định là an toàn. Sau khi dò xong, xem
nhiệt độ bằng:

```bash
sensors
```

## 2. Glances

`Glances` là công cụ theo dõi hệ thống thời gian thực, chạy được trên nhiều nền
tảng và quan trọng nhất là truy cập được qua trình duyệt — tiện khi cần theo dõi
một server ở xa mà không muốn giữ phiên SSH. Nó được viết bằng Python, giao diện
dạng curses.

Cài đặt:

```bash
curl -L https://bit.ly/glances | /bin/bash
OR
wget -O- https://bit.ly/glances | /bin/bash
```

Chạy Glances rồi nhấn phím `f` để xem thông tin cảm biến:

```bash
glances
```
