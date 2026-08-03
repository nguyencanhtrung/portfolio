---
title: 'Setup KVM với PCIe passthrough - phần 3: IOMMU và VFIO'
description: 'Phần 3: IOMMU làm gì và vì sao passthrough không thể thiếu nó. Bật IOMMU trên host, bind card Xilinx AU200 vào vfio-pci, và kiểm tra card nằm trong IOMMU group nào.'
date: 2023-09-28
lang: vi
key: journey-to-install-kvm-with-pcie-passthrough-p3
tags: ['kvm']
series: 'Setup KVM với PCIe passthrough'
seriesOrder: 3
---

## 1. IOMMU là gì?

IOMMU (Input-Output Memory Management Unit) là một khối phần cứng, thường nằm
trong chipset hoặc ngay trong CPU, làm nhiệm vụ dịch địa chỉ bộ nhớ giữa CPU và
các thiết bị ngoại vi — trong đó có thiết bị gắn qua PCIe.

Nói ngắn gọn: IOMMU với thiết bị ngoại vi cũng giống như MMU với tiến trình phần
mềm. MMU khiến mỗi tiến trình nhìn thấy một không gian địa chỉ riêng và không
với sang được vùng nhớ của tiến trình khác. IOMMU làm đúng điều đó cho thiết bị.

Vì sao khối này quan trọng:

**Dịch địa chỉ.** Khi một thiết bị muốn đọc hoặc ghi bộ nhớ, nó phát ra một địa
chỉ. IOMMU dịch địa chỉ đó sang địa chỉ vật lý thật. Nhờ vậy thiết bị chỉ chạm
được đúng vùng nhớ đã được cấp cho nó.

**Cô lập bộ nhớ.** IOMMU cấp phát những vùng nhớ riêng cho từng thiết bị hoặc
từng máy ảo. Thiết bị không thể đọc ghi ra ngoài vùng của mình, kể cả khi
firmware của nó bị lỗi hay bị chèn mã độc.

**PCIe passthrough.** Đây là lý do trực tiếp của loạt bài này. Muốn máy ảo điều
khiển thẳng một card vật lý, card đó phải phát ra địa chỉ DMA nhắm vào bộ nhớ
của máy ảo chứ không phải bộ nhớ host. IOMMU là thứ thực hiện phép ánh xạ đó.
Không có IOMMU thì không có passthrough an toàn.

**DMA.** Các thiết bị như GPU hay card mạng đọc ghi bộ nhớ trực tiếp bằng DMA,
không qua CPU. IOMMU kiểm soát các giao dịch DMA này, chặn truy cập ngoài phạm
vi được phép.

**Hiệu năng.** IOMMU thêm một lớp dịch địa chỉ, nhưng lớp này được cài đặt trong
phần cứng nên chi phí rất nhỏ. Đổi lại, máy ảo được truy cập thẳng phần cứng —
với các tác vụ như GPU passthrough thì tổng thể lại nhanh hơn nhiều so với thiết
bị ảo hoá bằng phần mềm.

## 2. Cấu hình IOMMU và VFIO

### 2.1 Bật IOMMU trên host

Mở file cấu hình grub:

```shell
sudo nano /etc/default/grub
```

Thêm cờ `intel_iommu=on` (CPU Intel) hoặc `amd_iommu=on` (CPU AMD) vào biến
`GRUB_CMDLINE_LINUX_DEFAULT`:

```shell
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on"
```

Cập nhật grub:

```shell
sudo update-grub
```

hoặc:

```shell
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

Sau khi reboot, kiểm tra tham số đã vào kernel command line chưa:

```shell
cat /proc/cmdline

BOOT_IMAGE=/boot/vmlinuz-5.15.0-acso root=UUID=2006ace4-1a9a-4d7f-aa7c-685cae3abe4c ro quiet intel_iommu=on
```

### 2.2 Bind card Xilinx AU200 vào VFIO

Ý tưởng ở đây là chặn không cho driver của host chiếm card ngay từ lúc boot.
Nếu để driver `xclmgmt`/`xocl` bind vào trước thì lúc gán card cho máy ảo sẽ
phải gỡ ra, và không phải driver nào cũng nhả sạch.

Mở lại file cấu hình grub:

```shell
sudo nano /etc/default/grub
```

Thêm `vfio-pci.ids=10ee:5000,10ee:5001` vào cùng biến đó:

```shell
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on vfio-pci.ids=10ee:5000,10ee:5001"
```

Cặp số này là vendor ID và device ID của card, lấy bằng:

```shell
$ lspci -nn | grep "Xilinx"

01:00.0 Processing accelerators [1200]: Xilinx Corporation Device [10ee:5000]
01:00.1 Processing accelerators [1200]: Xilinx Corporation Device [10ee:5001]
```

Card AU200 hiện ra thành hai function: `.0` là management, `.1` là user. Cả hai
đều phải được bind vào `vfio-pci`, nên trong danh sách có hai ID.

Cập nhật grub:

```shell
sudo update-grub
```

hoặc:

```shell
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

Kiểm tra lại kernel command line:

```shell
cat /proc/cmdline

BOOT_IMAGE=/boot/vmlinuz-5.15.0-acso root=UUID=2006ace4-1a9a-4d7f-aa7c-685cae3abe4c ro quiet intel_iommu=on vfio-pci.ids=10ee:5000,10ee:5001
```

Tạo thêm file `/etc/modprobe.d/vfio.conf` với nội dung:

```shell
options vfio-pci ids=10ee:5000,10ee:5001
```

Khai báo ở hai nơi trông có vẻ thừa, nhưng cần cả hai: tham số grub áp dụng khi
`vfio-pci` được nạp sẵn trong kernel, còn file `modprobe.d` áp dụng khi nó được
nạp dưới dạng module từ initramfs.

Cập nhật `initramfs` rồi reboot host:

```shell
sudo update-initramfs -u
```

Sau khi reboot, kiểm tra card đã sẵn sàng cho passthrough chưa:

```bash
lspci -k
```

Dòng cần thấy là `Kernel driver in use: vfio-pci`:

```
01:00.0 Processing accelerators: Xilinx Corporation Device 5000
    Subsystem: Xilinx Corporation Device 000e
    Kernel driver in use: vfio-pci
    Kernel modules: xclmgmt
01:00.1 Processing accelerators: Xilinx Corporation Device 5001
    Subsystem: Xilinx Corporation Device 000e
    Kernel driver in use: vfio-pci
    Kernel modules: xocl
```

Dòng `Kernel modules` vẫn liệt kê `xclmgmt` và `xocl` — đó chỉ là các driver
*có thể* dùng cho thiết bị này. Điều quan trọng là `Kernel driver in use` đang
là `vfio-pci`.

### 2.3 Kiểm tra IOMMU group

```shell
git clone https://github.com/nguyencanhtrung/kvm-pcie.git
cd kvm-pcie
sudo chmod +x iommu_viewer.sh
./iommu_viewer.sh
```

```
...
Group:  1   0000:00:01.0 PCI bridge [0604]: Intel Corporation Xeon E3-1200 v5/E3-1500 v5/6th Gen Core Processor PCIe Controller (x16) [8086:1901] (rev 0a)   Driver: pcieport
Group:  1   0000:00:01.1 PCI bridge [0604]: Intel Corporation Xeon E3-1200 v5/E3-1500 v5/6th Gen Core Processor PCIe Controller (x8) [8086:1905] (rev 0a)   Driver: pcieport
Group:  1   0000:01:00.0 Processing accelerators [1200]: Xilinx Corporation Device [10ee:5000]   Driver: vfio-pci
Group:  1   0000:01:00.1 Processing accelerators [1200]: Xilinx Corporation Device [10ee:5001]   Driver: vfio-pci
Group:  1   0000:02:00.0 VGA compatible controller [0300]: NVIDIA Corporation Device [10de:2489] (rev a1)   Driver: nvidia
Group:  1   0000:02:00.1 Audio device [0403]: NVIDIA Corporation Device [10de:228b] (rev a1)   Driver: snd_hda_intel
Group:  2   0000:00:02.0 Display controller [0380]: Intel Corporation UHD Graphics 630 (Desktop 9 Series) [8086:3e98]   Driver: i915
Group:  3   0000:00:12.0 Signal processing controller [1180]: Intel Corporation Cannon Lake PCH Thermal Controller [8086:a379] (rev 10)   Driver: intel_pch_thermal
Group:  4   0000:00:14.0 USB controller [0c03]: Intel Corporation Cannon Lake PCH USB 3.1 xHCI Host Controller [8086:a36d] (rev 10)   Driver: xhci_hcd
...
```

Và đây là vấn đề. Card Xilinx nằm chung **Group 1** với card đồ hoạ NVIDIA.

IOMMU group là đơn vị cô lập nhỏ nhất mà phần cứng bảo đảm được: mọi thiết bị
trong cùng một group đều phải được gán cho cùng một máy ảo, và tất cả đều phải
dùng `vfio-pci`. Không thể tách card Xilinx ra khỏi nhóm để đưa vào máy ảo trong
khi vẫn giữ GPU cho host — với cấu hình hiện tại thì hoặc đưa cả hai vào máy ảo,
hoặc không đưa gì cả.

Trong trường hợp này tôi vẫn cần GPU cho host, nên phải tách IOMMU group ra.
Phần 4 sẽ làm việc đó.

## 3. Tham khảo

Để hiểu thêm về IOMMU group, xem [video này](https://www.youtube.com/watch?v=qQiMMeVNw-o)
và [bài viết này](https://medium0.com/techbeatly/virtual-machine-with-gpu-enabled-on-ubuntu-using-kvm-on-ubuntu-22-4-f0354ba74b1).
