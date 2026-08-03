---
title: 'Setup KVM với PCIe passthrough - phần 4: tách IOMMU group'
description: 'Phần 4: khi mainboard không hỗ trợ ACS, cả nhóm thiết bị dính chung một IOMMU group và không tách ra được. Cách vá kernel bằng ACS override, build và cài kernel đã vá.'
date: 2023-09-28
lang: vi
key: journey-to-install-kvm-with-pcie-passthrough-p4
tags: ['kvm']
series: 'Setup KVM với PCIe passthrough'
seriesOrder: 4
---
## 1. Tách IOMMU group

Cuối phần 3, card Xilinx nằm chung IOMMU group với card đồ hoạ NVIDIA. Vì mọi
thiết bị trong cùng group phải đi cùng nhau vào một máy ảo, tôi không thể đưa
card Xilinx vào máy ảo mà vẫn giữ GPU cho host. Phần này tách nhóm đó ra.

### 1.1 PCIe ACS override là gì

ACS (Access Control Services) là một phần của chuẩn PCIe. Nó cho phép một PCIe
switch hoặc root port khẳng định rằng các thiết bị phía dưới **không** nói
chuyện trực tiếp với nhau mà mọi giao dịch đều phải đi ngược lên trên. Chỉ khi
có bảo đảm đó, kernel mới dám xếp mỗi thiết bị vào một IOMMU group riêng.

Khi mainboard không khai báo ACS — rất phổ biến với board desktop — kernel buộc
phải giả định các thiết bị có thể nói chuyện trực tiếp với nhau, nên gộp tất cả
vào chung một group. Đó chính xác là tình huống ở phần 3.

`pcie_acs_override` là một patch cho phép ép kernel bỏ qua giả định thận trọng
đó và tách group ra như thể phần cứng có hỗ trợ ACS.

Cần nói rõ đây là đánh đổi về bảo mật, không phải bản vá miễn phí. Sự cô lập mà
ACS đảm bảo vốn nằm ở phần cứng; ép override nghĩa là ta tự cam kết rằng các
thiết bị trong nhóm không tấn công lẫn nhau qua đường peer-to-peer. Với một máy
lab do mình toàn quyền kiểm soát thì chấp nhận được. Với máy chủ chạy khối lượng
công việc của người khác thì không nên.

### 1.2 Bật PCIe ACS override

Mở file cấu hình grub:

```shell
sudo nano /etc/default/grub
```

Thêm cờ `pcie_acs_override=downstream,multifunction` vào biến
`GRUB_CMDLINE_LINUX_DEFAULT`:

```shell
GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on pcie_acs_override=downstream,multifunction vfio-pci.ids=10ee:5000,10ee:5001"
```

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

BOOT_IMAGE=/boot/vmlinuz-5.15.0-acso root=UUID=2006ace4-1a9a-4d7f-aa7c-685cae3abe4c ro quiet intel_iommu=on pcie_acs_override=downstream,multifunction vfio-pci.ids=10ee:5000,10ee:5001
```

Sau đó reboot host:

```shell
sudo reboot now
```

Reboot xong, kiểm tra lại IOMMU group:

```shell
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

Và nhóm vẫn y nguyên. Lý do: kernel Ubuntu tiêu chuẩn **không có** patch
`pcie_acs_override` — tham số đó chỉ tồn tại nếu kernel đã được vá. Thêm cờ vào
grub trên một kernel chưa vá thì kernel đơn giản là bỏ qua nó, không báo lỗi gì
cả. Máy tôi dùng mainboard Z390 Gigabyte Wifi Pro với CPU 9900K, và đây chính là
tình huống đó.

Vậy nên phương án còn lại là tự build một kernel có patch ACS rồi boot bằng
kernel đó.

## 2. Build kernel đã vá ACS

### 2.1 Tải patch ACS và mã nguồn kernel

Trên máy host:

```shell
sudo apt update && sudo apt upgrade
sudo reboot now
sudo apt install build-essential libncurses5-dev fakeroot xz-utils libelf-dev liblz4-tool unzip flex bison bc debhelper rsync libssl-dev:native 
mkdir ~/kernel
cd ~/kernel
wget https://github.com/nguyencanhtrung/kvm-pcie/blob/main/acso.patch
wget https://github.com/torvalds/linux/archive/refs/tags/v5.15.zip
unzip v5.15.zip
```

### 2.2 Sửa file config để tránh lỗi build


```shell
cd linux-5.15
sudo find /boot/ \( -iname "*config*" -a -iname "*`uname -r`*" \) -exec cp -i -t ./ {} \;
mv *`uname -r`* .config
ls /boot | grep config
sudo nano .config
```

Dùng `Ctrl+w` trong nano để tìm `CONFIG_SYSTEM_TRUSTED_KEYS`, rồi comment dòng
đó lại:

`#CONFIG_SYSTEM_TRUSTED_KEYS`

`Ctrl+x` để lưu và thoát.

Bước này là bắt buộc: file config sao chép từ kernel Ubuntu đang chạy có trỏ tới
khoá ký của Canonical, mà máy mình không có khoá đó nên quá trình build sẽ dừng
giữa chừng.


### 2.3 Áp patch ACS

```shell
patch -p1 < ../acso.patch
```

Kết quả mong đợi:


```shell
patching file Documentation/admin-guide/kernel-parameters.txt
Hunk #1 succeeded at 3892 (offset 383 lines).
patching file drivers/pci/quirks.c
Hunk #1 succeeded at 3515 with fuzz 2 (offset -29 lines).
Hunk #2 succeeded at 5049 with fuzz 1 (offset 153 lines).
```

`fuzz` và `offset` ở đây là bình thường: patch được viết cho một phiên bản
kernel khác nên vị trí các dòng bị lệch, và `patch` tự dò ra chỗ đúng. Chỉ cần
không có dòng nào báo `FAILED` là ổn.

Tiếp theo là build kernel:

### 2.4 Build kernel

```shell
sudo make -j `getconf _NPROCESSORS_ONLN` bindeb-pkg LOCALVERSION=-acso KDEB_PKGVERSION=$(make kernelversion)-1
```

Cứ nhấn `Enter` cho mọi câu hỏi cấu hình. Quá trình này mất khá lâu — trên máy
tôi khoảng một tiếng.

**Lưu ý:** nếu build lỗi, bỏ phần ``-j `getconf _NPROCESSORS_ONLN` `` khỏi lệnh
`make` rồi chạy lại. Build tuần tự sẽ cho thông báo lỗi rõ ràng thay vì bị trộn
lẫn giữa nhiều tiến trình song song.


### 2.5 Cài kernel đã vá

Build xong thì cài kernel mới:

```shell
ls ../linux-*.deb
sudo dpkg -i ../linux-*.deb
```

```shell
sudo -i
echo "vfio" >> /etc/modules
echo "vfio_iommu_type1" >> /etc/modules
echo "vfio_pci" >> /etc/modules
echo "kvm" >> /etc/modules
echo "kvm_intel" >> /etc/modules
```

```shell
update-initramfs -u
reboot
```

Khi máy khởi động lại, giữ `SHIFT` để vào menu grub rồi chọn kernel đã vá:
`Advanced Ubuntu` > `5.15.0-acso`.

### 2.6 Nếu máy treo khi boot (tuỳ trường hợp)

Khởi động lại, giữ `SHIFT` để vào kernel đã vá `Advanced Ubuntu` > `5.15.0-acso`.

Nhấn `e` để sửa dòng lệnh grub.

Thêm `nomodeset` vào cuối dòng lệnh. Tham số này bảo kernel đừng nạp driver đồ
hoạ ở giai đoạn sớm — chính driver đó gây treo khi GPU vừa bị tách IOMMU group:

```
linux     /boot/vmlinuz ....    .... downstream nomodeset ...
```

Nhấn `F10` để lưu và boot tiếp.


Boot xong, kiểm tra lại IOMMU group:

```shell
tesla@tesla:~/kvm$ ./iommu_viewer.sh 
Please be patient. This may take a couple seconds.
Group:  0   0000:00:00.0 Host bridge [0600]: Intel Corporation 8th Gen Core 8-core Desktop Processor Host Bridge/DRAM Registers [Coffee Lake S] [8086:3e30] (rev 0a)   Driver: skl_uncore
Group:  1   0000:00:01.0 PCI bridge [0604]: Intel Corporation Xeon E3-1200 v5/E3-1500 v5/6th Gen Core Processor PCIe Controller (x16) [8086:1901] (rev 0a)   Driver: pcieport
Group:  2   0000:00:01.1 PCI bridge [0604]: Intel Corporation Xeon E3-1200 v5/E3-1500 v5/6th Gen Core Processor PCIe Controller (x8) [8086:1905] (rev 0a)   Driver: pcieport
Group:  3   0000:00:12.0 Signal processing controller [1180]: Intel Corporation Cannon Lake PCH Thermal Controller [8086:a379] (rev 10)   Driver: intel_pch_thermal
Group:  4   0000:00:14.0 USB controller [0c03]: Intel Corporation Cannon Lake PCH USB 3.1 xHCI Host Controller [8086:a36d] (rev 10)   Driver: xhci_hcd
Group:  4   0000:00:14.2 RAM memory [0500]: Intel Corporation Cannon Lake PCH Shared SRAM [8086:a36f] (rev 10)
Group:  5   0000:00:14.3 Network controller [0280]: Intel Corporation Wireless-AC 9560 [Jefferson Peak] [8086:a370] (rev 10)   Driver: iwlwifi
Group:  6   0000:00:16.0 Communication controller [0780]: Intel Corporation Cannon Lake PCH HECI Controller [8086:a360] (rev 10)   Driver: mei_me
Group:  7   0000:00:17.0 SATA controller [0106]: Intel Corporation Cannon Lake PCH SATA AHCI Controller [8086:a352] (rev 10)   Driver: ahci
Group:  8   0000:00:1b.0 PCI bridge [0604]: Intel Corporation Cannon Lake PCH PCI Express Root Port #17 [8086:a340] (rev f0)   Driver: pcieport
Group:  9   0000:00:1c.0 PCI bridge [0604]: Intel Corporation Cannon Lake PCH PCI Express Root Port #1 [8086:a338] (rev f0)   Driver: pcieport
Group:  10  0000:00:1d.0 PCI bridge [0604]: Intel Corporation Cannon Lake PCH PCI Express Root Port #9 [8086:a330] (rev f0)   Driver: pcieport
Group:  11  0000:00:1f.0 ISA bridge [0601]: Intel Corporation Z390 Chipset LPC/eSPI Controller [8086:a305] (rev 10)
Group:  11  0000:00:1f.3 Audio device [0403]: Intel Corporation Cannon Lake PCH cAVS [8086:a348] (rev 10)   Driver: snd_hda_intel
Group:  11  0000:00:1f.4 SMBus [0c05]: Intel Corporation Cannon Lake PCH SMBus Controller [8086:a323] (rev 10)   Driver: i801_smbus
Group:  11  0000:00:1f.5 Serial bus controller [0c80]: Intel Corporation Cannon Lake PCH SPI Controller [8086:a324] (rev 10)
Group:  11  0000:00:1f.6 Ethernet controller [0200]: Intel Corporation Ethernet Connection (7) I219-V [8086:15bc] (rev 10)   Driver: e1000e
Group:  12  0000:01:00.0 Processing accelerators [1200]: Xilinx Corporation Device [10ee:5000]   Driver: vfio-pci
Group:  13  0000:01:00.1 Processing accelerators [1200]: Xilinx Corporation Device [10ee:5001]   Driver: vfio-pci
Group:  14  0000:02:00.0 VGA compatible controller [0300]: NVIDIA Corporation Device [10de:2489] (rev a1)   Driver: nvidia
Group:  15  0000:02:00.1 Audio device [0403]: NVIDIA Corporation Device [10de:228b] (rev a1)   Driver: snd_hda_intel
Group:  16  0000:03:00.0 Non-Volatile memory controller [0108]: Samsung Electronics Co Ltd NVMe SSD Controller SM981/PM981/PM983 [144d:a808]   Driver: nvme
Group:  17  0000:05:00.0 Non-Volatile memory controller [0108]: Samsung Electronics Co Ltd NVMe SSD Controller SM981/PM981/PM983 [144d:a808]   Driver: nvme
```

Đến đây card Xilinx và card NVIDIA đã nằm ở hai IOMMU group khác nhau — đúng
thứ cần đạt được. Giờ có thể đưa riêng card Xilinx vào máy ảo mà vẫn giữ GPU
cho host.

### 2.7 Đặt grub tự boot vào kernel đã vá

```shell
sudo nano /etc/default/grub
```

Sửa dòng sau trong `/etc/default/grub`:

```shell
GRUB_DEFAULT="1>4"

```

Rồi cập nhật lại grub:

```bash
sudo update-grub
reboot
```

**Lưu ý:** chỉ số `1` và `4` được đếm theo đúng thứ tự các mục trong menu grub
(giữ `SHIFT` khi khởi động để xem). Đếm sai một nấc là boot nhầm kernel.

```
Ubuntu              (index = 0)
Advanced Ubuntu     (index = 1)
    ubuntu-kernel-xxx           (index = 0)
    ubuntu-kernel-xxx-recovery  (index = 1)
    ubuntu-kernel-xxx           (index = 2)
    ubuntu-kernel-xxx-recovery  (index = 3)
    ubuntu-kernel-xxx           (index = 4)
...
```

## 3. Tham khảo

Visit [video](https://www.youtube.com/watch?v=JBEzshbGPhQ)

[Patched ACS](https://queuecumber.gitlab.io/linux-acs-override/)

[Original script - scroll to the end of page](https://gitlab.com/Queuecumber/linux-acs-override/-/issues/12)

[Repo](https://github.com/benbaker76/linux-acs-override)
