---
title: 'Setup KVM với PCIe passthrough - phần 5: gắn card vào máy ảo'
description: 'Phần 5: gắn card PCIe vào máy ảo. Xác định thiết bị, tách khỏi host, chuyển địa chỉ domain/bus/slot/function sang hex và khai báo hostdev trong file XML của máy ảo.'
date: 2023-09-28
lang: vi
key: journey-to-install-kvm-with-pcie-passthrough-p5
tags: ['kvm']
series: 'Setup KVM với PCIe passthrough'
seriesOrder: 5
---

Có hai cách gắn hoặc gỡ card PCIe khỏi máy ảo KVM:

* qua giao diện đồ hoạ (virt-manager)
* qua dòng lệnh


Bài này đi theo cách dòng lệnh vì nó cho thấy rõ từng bước thực sự diễn ra. Cả
hai cách đều được mô tả trong [tài liệu của SUSE](https://documentation.suse.com/smart/virtualization-cloud/html/task-assign-pci-device-libvirt/index.html).

## 1. Gắn card PCIe vào máy ảo bằng dòng lệnh

### 1.1 Xác định thiết bị PCI trên host

```bash
lspci -nn | grep "Xilinx"

```

Kết quả:

```console
tesla@tesla:~/kvm$ sudo lspci -nn | grep "Xilinx"
01:00.0 Processing accelerators [1200]: Xilinx Corporation Device [10ee:5000]
01:00.1 Processing accelerators [1200]: Xilinx Corporation Device [10ee:5001]
```

Card Xilinx hiện ra thành hai function: `01:00.0` (management) và `01:00.1`
(user). Cả hai đều phải được xử lý cùng nhau.

### 1.2 Lấy thông tin chi tiết của thiết bị


```console
$ virsh nodedev-dumpxml pci_0000_01_00_0

<device>
  <name>pci_0000_01_00_0</name>
  <path>/sys/devices/pci0000:00/0000:00:01.0/0000:01:00.0</path>
  <parent>pci_0000_00_01_0</parent>
  <driver>
    <name>vfio-pci</name>
  </driver>
  <capability type='pci'>
    <class>0x120000</class>
    <domain>0</domain>
    <bus>1</bus>
    <slot>0</slot>
    <function>0</function>
    <product id='0x5000'/>
    <vendor id='0x10ee'>Xilinx Corporation</vendor>
    <iommuGroup number='12'>
      <address domain='0x0000' bus='0x01' slot='0x00' function='0x0'/>
    </iommuGroup>
    <pci-express>
      <link validity='cap' port='0' speed='8' width='16'/>
      <link validity='sta' speed='8' width='8'/>
    </pci-express>
  </capability>
</device>

```


và làm tương tự với function còn lại:

```console
$ virsh nodedev-dumpxml pci_0000_01_00_1
```

Ghi lại bốn giá trị `domain`, `bus`, `slot` và `function` — bước sau sẽ cần.

### 1.3 Tách thiết bị khỏi host

```bash
virsh nodedev-detach pci_0000_01_00_0
```

**Với thiết bị nhiều function**

Nếu thiết bị có nhiều function mà không hỗ trợ FLR (function level reset) hoặc
PM reset, phải tách **tất cả** các function khỏi host. Lý do là vì phần cứng chỉ
reset được ở mức toàn thiết bị, nên để sót một function đang được host dùng là
để hở một đường truy cập. libvirt sẽ từ chối gán thiết bị nếu còn function nào
đang bị host hoặc một máy ảo khác chiếm.

**Lưu ý:** trong cấu hình của loạt bài này, `detach` và `reattach` gần như không
còn ý nghĩa, vì card đã được ghim cứng vào `vfio-pci` ngay từ dòng lệnh grub ở
phần 3 — host chưa bao giờ thực sự chiếm nó.

Nếu muốn dùng card ở cả host lẫn máy ảo tuỳ lúc, thì làm ngược lại: bỏ tham số
`vfio-pci.ids` khỏi grub, để host bind driver bình thường, rồi dùng
`virsh nodedev-detach` mỗi lần cần chuyển card sang máy ảo và
`virsh nodedev-reattach` khi muốn trả về host.

### 1.4 Chuyển domain, bus, slot, function từ thập phân sang hex

```bash
printf "<address domain='0x%x' bus='0x%x' slot='0x%x' function='0x%x'/>\n" 0 1 0 0
printf "<address domain='0x%x' bus='0x%x' slot='0x%x' function='0x%x'/>\n" 0 1 0 1
```

Kết quả:

```console
tesla@tesla:~/kvm$ printf "<address domain='0x%x' bus='0x%x' slot='0x%x' function='0x%x'/>\n" 0 1 0 0
<address domain='0x0' bus='0x1' slot='0x0' function='0x0'/>
tesla@tesla:~/kvm$ printf "<address domain='0x%x' bus='0x%x' slot='0x%x' function='0x%x'/>\n" 0 1 0 1
<address domain='0x0' bus='0x1' slot='0x0' function='0x1'/>

```

### 1.5 Sửa file XML của máy ảo

```bash
virsh edit ukvm2004
```

Thêm khối thiết bị sau vào trong phần `<devices>`, dùng đúng các giá trị hex vừa
tính được ở bước trên:

```xml
<hostdev mode='subsystem' type='pci' managed='yes'>
  <source>
    <address domain='0x0' bus='0x1' slot='0x0' function='0x0'/>
  </source>
</hostdev>
```

and,

```xml
<hostdev mode='subsystem' type='pci' managed='yes'>
  <source>
    <address domain='0x0' bus='0x1' slot='0x0' function='0x1'/>
  </source>
</hostdev>
```

Then, start the VM

```bash
virsh start ukvm2004
```


**Notes:**

managed compared to unmanaged

libvirt recognizes two modes for handling PCI devices: managed or unmanaged.

If the device is managed, libvirt handles all of the details of adding or removing the device. Before starting the domain, libvirt unbinds the device from the existing driver if needed, resets the device, and binds it to vfio-pci. When the domain is terminated or the device is removed from the domain, libvirt unbinds the device from vfio-pci and rebinds it to the original driver.

If the device is unmanaged, you must manually manage these tasks before assigning the device to a domain, and after the device is no longer used by the domain.

In the example above, the managed='yes' option means that the device is managed. To switch the device mode to unmanaged, set managed='no'. If you do so, you need to take care of the related driver with the virsh nodedev-detach and virsh nodedev-reattach commands. Prior to starting the VM Guest you need to detach the device from the host by running

```bash
virsh nodedev-detach pci_0000_01_00_0
```

When the VM Guest is not running, you can make the device available for the host by running

```bash
virsh nodedev-reattach pci_0000_01_00_0
```

Sẽ test flow này sau ... Nếu có thể flexible attach với VM và Host thì ngon quá.


## 2. Một cách khác để gắn card PCIe

Tạo file `pass-user.xml` với nội dung sau:


```xml
<hostdev mode="subsystem" type="pci" managed="yes">
  <source>
    <address domain="0x0000" bus="0x01" slot="0x00" function="0x1"/>
  </source>
  <address type="pci" domain="0x0000" bus="0x07" slot="0x00" function="0x0"/>
</hostdev>

```

Tạo tiếp file `pass-mgmt.xml`:

```xml
<hostdev mode="subsystem" type="pci" managed="yes">
  <source>
    <address domain="0x0000" bus="0x01" slot="0x00" function="0x0"/>
  </source>
  <address type="pci" domain="0x0000" bus="0x06" slot="0x00" function="0x0"/>
</hostdev>
```

`<address domain ..>` trong thẻ `<source>`: địa chỉ của card trên **host**.

`<address type ..>` ngoài thẻ `<source>`: địa chỉ card sẽ xuất hiện **trong máy
ảo** — không bắt buộc, bỏ trống thì libvirt tự chọn.


Chỉ gắn hoặc gỡ card khi máy ảo đang tắt. Thao tác lúc máy ảo đang chạy sẽ bị
libvirt từ chối, hoặc tệ hơn là làm treo guest.

```shell
 virsh attach-device ukvm2004 --file pass-user.xml --config
 virsh attach-device ukvm2004 --file pass-mgmt.xml --config
```


```shell
 virsh detach-device ukvm2004 --file pass-user.xml --config
 virsh detach-device ukvm2004 --file pass-mgmt.xml --config
```

Sau đó khởi động máy ảo:

```shell
virsh start ukvm2004
```

Vào trong máy ảo, kiểm tra card đã xuất hiện chưa:

```bash
lspci -nn
```


## 3. Tham khảo

Visit [the instruction](https://documentation.suse.com/smart/virtualization-cloud/html/task-assign-pci-device-libvirt/index.html) and [Xilinx instruction](https://www.xilinx.com/developer/articles/using-alveo-data-center-accelerator-cards-in-a-kvm-environment.html)