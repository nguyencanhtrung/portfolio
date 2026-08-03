---
title: 'PCIe - Nạp lại FPGA không cần reboot'
description: 'Nạp lại FPGA qua JTAG mà không phải khởi động lại host. Khi nào remove + rescan là đủ, khi nào link rớt buộc phải hot reset từ bridge phía trên, và vì sao function-level reset hiếm khi giúp được gì.'
date: 2022-09-29
lang: vi
key: pcie-reprogram-without-reboot
tags: ['pcie']
---

## 1. Rescan

Đây là cách rẻ nhất nên thử trước. Linux cho phép gỡ một thiết bị khỏi bus rồi
enumerate lại, và cách này đủ dùng **chỉ khi** FPGA vẫn giữ được endpoint PCIe
hoạt động xuyên suốt quá trình nạp lại:

```bash
# gỡ endpoint, nạp lại FPGA, rồi đưa nó trở lại
echo 1 | sudo tee /sys/bus/pci/devices/0000:01:00.0/remove
# ... nạp bitstream qua JTAG ở đây ...
echo 1 | sudo tee /sys/bus/pci/rescan
```

Hai điều kiện quyết định cách này có chạy hay không:

- **Link phải không bị rớt.** Nếu quá trình cấu hình làm rớt link PCIe, root
  port sẽ ghi nhận sự kiện surprise-down và lệnh rescan sau đó không tìm thấy gì
  cả. Những thiết kế giữ khối PCIe cứng trong một vùng cấu hình riêng — partial
  reconfiguration của Xilinx, PR region của Intel — vượt qua được; còn nạp lại
  toàn chip thì thường không.
- **Phải gỡ driver trước.** Driver còn bind vào thiết bị đang giữ tham chiếu tới
  các BAR sắp biến mất, và thao tác remove khi đó hoặc treo, hoặc kéo sập luôn
  kernel.

Khi link đã rớt, rescan vô dụng và bước tiếp theo là hot reset.


## 2. Hot reset

Cơ chế reset trong PCI Express khá rắc rối. Có hai loại chính: conventional
reset và function-level reset. Riêng conventional reset lại chia thành
fundamental reset và non-fundamental reset. Chi tiết đầy đủ nằm trong chuẩn PCI
Express.

**Cold reset** là fundamental reset xảy ra sau khi thiết bị PCIe được cấp
nguồn. Dường như không có cách chuẩn nào để kích hoạt nó ngoài việc tắt máy rồi
bật lại. Trên các máy của tôi, thư mục `/sys/bus/pci/slots` rỗng.

**Warm reset** cũng là fundamental reset nhưng được kích hoạt mà không cắt
nguồn thiết bị. Cũng không có cách chuẩn nào để kích hoạt.

**Hot reset** là conventional reset được kích hoạt xuyên qua chính link PCIe.
Nó xảy ra khi link bị ép vào trạng thái electrical idle, hoặc khi gửi các ordered
set TS1 và TS2 với bit hot reset được bật. Phần mềm kích hoạt hot reset bằng cách
bật rồi tắt bit secondary bus reset trong thanh ghi bridge control, nằm trong
không gian cấu hình PCI của bridge port ngay phía trên thiết bị.

**Function-level reset (FLR)** chỉ tác động lên một function của thiết bị PCIe,
và theo định nghĩa thì không được reset cả thiết bị. Chuẩn PCIe **không bắt
buộc** thiết bị phải hỗ trợ FLR. Nó được kích hoạt bằng cách bật bit initiate
function-level reset trong thanh ghi device control của function đó.

Linux phơi FLR ra dưới dạng file `/sys/bus/pci/devices/$dev/reset`. Ghi `1` vào
file này sẽ kích hoạt function-level reset cho function tương ứng. Nhắc lại: nó
chỉ tác động lên đúng function đó chứ không phải cả thiết bị, và không phải thiết
bị nào cũng hỗ trợ.

Tôi không biết cách nào "sạch sẽ" để kích hoạt hot reset — sysfs không có entry
cho việc này. Nhưng có thể dùng `setpci`:

```bash
#!/bin/bash
dev=$1

if [ -z "$dev" ]; then
    echo "Error: no device specified"
    exit 1
fi

if [ ! -e "/sys/bus/pci/devices/$dev" ]; then
    dev="0000:$dev"
fi

if [ ! -e "/sys/bus/pci/devices/$dev" ]; then
    echo "Error: device $dev not found"
    exit 1
fi

port=$(basename $(dirname $(readlink "/sys/bus/pci/devices/$dev")))

if [ ! -e "/sys/bus/pci/devices/$port" ]; then
    echo "Error: device $port not found"
    exit 1
fi

echo "Removing $dev..."

echo 1 > "/sys/bus/pci/devices/$dev/remove"

echo "Performing hot reset of port $port..."

bc=$(setpci -s $port BRIDGE_CONTROL)

echo "Bridge control:" $bc

setpci -s $port BRIDGE_CONTROL=$(printf "%04x" $(("0x$bc" | 0x40)))
sleep 0.01
setpci -s $port BRIDGE_CONTROL=$bc
sleep 0.5

echo "Rescanning bus..."

echo 1 > "/sys/bus/pci/devices/$port/rescan"
```

Phải gỡ hết driver đang bind vào thiết bị trước khi chạy script này. Script sẽ
lần lượt gỡ thiết bị PCIe, ra lệnh cho switch port phía trên phát hot reset, rồi
rescan lại bus. Lưu ý script mới chỉ được thử với thiết bị một function, nên với
thiết bị nhiều function có thể phải sửa lại.

Tham khảo: [thảo luận trên Unix StackExchange](https://unix.stackexchange.com/questions/73908/how-to-reset-cycle-power-to-a-pcie-device/474378#474378)

***

## 3. Kết luận

Nạp lại FPGA mà không reboot host rốt cuộc phụ thuộc vào mức độ lan của xáo trộn:

- Nếu khối PCIe cứng sống sót qua lần nạp lại, **remove rồi rescan** là đủ, và
  đây cũng là cách duy nhất không đòi hỏi gì hơn quyền root.
- Nếu link rớt, endpoint phải được train lại, tức là cần **hot reset phát từ
  bridge phía trên** — chính là script `setpci` ở trên. Nhớ gỡ driver trước, và
  với thiết bị nhiều function thì phải làm lại cho từng function.
- **Function-level reset** qua `/sys/.../reset` trông tiện nhưng chỉ reset một
  function, lại là tính năng tuỳ chọn trong chuẩn, và hoàn toàn vô dụng với một
  link đã rớt.

Không có cách khả chuyển nào để kích hoạt cold reset hay warm reset từ phần mềm,
nên nút nguồn vẫn là phương án cuối. Trên thực tế, cấu hình đáng tin cậy nhất là
đặt khối PCIe vào vùng mà quá trình cấu hình lại không đụng tới — khi đó toàn bộ
vấn đề rút gọn về đúng một lệnh rescan.

