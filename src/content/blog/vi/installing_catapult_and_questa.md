---
title: 'Cài đặt Catapult và Questasim'
description: 'Cài Catapult HLS và QuestaSim trên Linux, hai back end Quartus/Vivado mà chúng gọi sang để tổng hợp, và mấy dòng .bashrc để khởi động cả toolchain bằng một lệnh.'
date: 2022-12-17
lang: vi
key: installing_catapult_and_questa
tags: ['catapult']
---

## 1. Cài Catapult và Questasim

Phần này cứ theo hướng dẫn của trình cài đặt đồ hoạ là xong.

Trong trường hợp của tôi, hai tool được cài vào:

```bash
/opt/Siemens/Catapult
/opt/Siemens/Questa
```

## 2. Cài Quartus

Nếu đích đến là FPGA của Intel, phải cài thêm Quartus để tổng hợp thiết kế.
Catapult không tự tổng hợp RTL — nó gọi sang synthesizer của vendor. Theo hướng
dẫn cài đặt của Quartus để thực hiện.

## 3. Cài Vivado

Tương tự, nếu đích đến là FPGA của Xilinx thì cần Vivado.

## 4. Thêm các dòng sau vào `.bashrc`

Để khởi động được `Catapult`, cần ba thứ:

* `MGC_HOME` — trỏ tới thư mục cài đặt Catapult.
* `LM_LICENSE_FILE` — license server hoặc file license.
* Đưa thư mục thực thi vào `PATH` để gọi tool từ dòng lệnh:
  `export PATH=/opt/Siemens/Catapult/2022.1_1/Mgc_home/bin:$PATH`

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

Khai báo environment của Quartus để Catapult gọi được synthesizer ở giai đoạn
`RTL stage`. Khai báo environment của Questasim để chạy RTL co-simulation.

Về phiên bản, tổ hợp tôi dùng là:

* Catapult 2022.1.1
* Questasim 21.3.2
* Quartus 22.2

Tổ hợp này chạy trơn tru. Nhưng khi nâng Quartus lên 22.3 thì không gọi được
synthesizer nữa, lỗi ngay từ bước đầu. Đây là điểm cần lưu ý: các tool này ràng
buộc phiên bản với nhau khá chặt, và lỗi không nói rõ nguyên nhân là do lệch
phiên bản. Nên tra bảng tương thích trong tài liệu cài đặt của Catapult để chọn
tổ hợp phù hợp thay vì cứ cài bản mới nhất.

## 5. Khởi động Catapult

```bash
$ catapult
```
