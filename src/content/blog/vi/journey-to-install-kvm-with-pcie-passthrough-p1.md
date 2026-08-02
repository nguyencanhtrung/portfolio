---
title: 'Series - Setup KVM with PCIe passthrough - p1'
description: 'Setup KVM with PCIe passthrough that allows guests working in a virtual machine and still interact with PCIe card. This model can be used in firmware development.'
date: 2023-09-28
lang: vi
key: journey-to-install-kvm-with-pcie-passthrough-p1
tags: ['kvm']
series: 'Setup KVM with PCIe passthrough'
seriesOrder: 1
---
## 1. Giới thiệu

Vào một ngày đẹp trời, một người em đồng nghiệp cũ liên hệ với tôi với mong muốn được truy cập vào card Xilinx Alveo AU200 để làm project với `XDMA`, `QDMA`. Vì máy của tôi có nhiều tài liệu cá nhân nên không thể cho truy cập trực tiếp vào máy vật lý được. Sau một lúc tìm hiểu, tôi quyết định cài đặt một máy ảo (VM) và cho card PCIe passthrough vào máy ảo này. Khi đó, em ấy có thể cài đặt driver trực tiếp trên máy ảo, program FPGA thông qua hardware client kết nối với hardware server cài đặt trên máy vật lý. 

Những tưởng việc cài đặt sẽ mất khoảng 1 buổi chiều là xong, nhưng thực tế tôi mất hơn 2 ngày (18h) để có thể cài đặt xong. Series này sẽ mô tả chi tiết các bước tôi đã trải qua để hoàn thiện việc cài đặt. 

## 2. Cấu hình và thông số host

* Mainboard: Z390 Gigabyte Aorus Wifi Pro
* CPU: Core i9 9900K
* RAM: 64GB DDR4
* SSD: 2TB
* OS: Ubuntu 20.04 - kernel: 5.15.06

## 3. Máy ảo (VM)

Giải pháp mà tôi lựa chọn cho việc ảo hóa là KVM. **KVM (Kernel-based Virtual Machine)** là một công nghệ ảo hóa dựa trên kernel Linux, cho phép tạo và quản lý máy ảo trên một hệ thống Linux. 

KVM được tích hợp trực tiếp vào kernel Linux, điều này đồng nghĩa với việc nó sử dụng những lợi ích và tính ổn định của kernel Linux. Ngoài ra, việc nó được tích hợp vào kernel Linux và sử dụng trực tiếp tài nguyên phần cứng của hệ thống, nên nó có hiệu suất cao và độ trễ thấp.

**KVM hỗ trợ nhiều kiến trúc phần cứng (ISA)** bao gồm x86, ARM và một số kiến trúc khác. Điều này làm cho nó trở thành một lựa chọn linh hoạt cho nhiều loại hệ thống và ứng dụng.

**KVM hỗ trợ hệ điều hành đa dạng (Guest OS)** bao gồm Linux, Windows, BSD, và nhiều distro Linux khác nhau. Điều này giúp chạy các ứng dụng và máy ảo đa dạng trên cùng một hệ thống.

**KVM hỗ trợ ảo hóa đầy đủ** bao gồm ảo hóa CPU và I/O. Điều này cho phép chạy các máy ảo có hiệu suất cao và sử dụng đa dạng tài nguyên.

**Bảo Mật:** KVM được tích hợp sâu vào kernel Linux, điều này giúp cải thiện bảo mật bằng cách sử dụng các tính năng bảo mật của kernel.

**Quản Lý Tài Nguyên:** KVM có khả năng quản lý tài nguyên linh hoạt, cho phép bạn cấp phát tài nguyên (CPU, RAM, ổ cứng) cho các máy ảo một cách tùy chỉnh.

**Hỗ Trợ Cộng Đồng Mạnh Mẽ:** KVM được phát triển và duy trì bởi một cộng đồng lớn của các nhà phát triển và người dùng. Điều này đồng nghĩa với việc có nhiều tài liệu và hỗ trợ trực tuyến.

**Chi Phí Thấp:** KVM là mã nguồn mở và miễn phí, giúp giảm đi các chi phí liên quan đến giấy phép và phần mềm.

**Khả Năng Ảo Hóa GPU:** KVM hỗ trợ ảo hóa GPU, cho phép bạn chạy ứng dụng đòi hỏi đồ họa cao cấp trong máy ảo.

**Mạnh Mẽ Cho Ảo Hóa Đám Mây:** KVM thường được sử dụng trong các mô hình ảo hóa đám mây với các công cụ quản lý như OpenStack.

Hướng dẫn cài đặt máy ảo sẽ được mô tả kỹ ở phần 2 của series.


## 4. VFIO

Để máy ảo (KVM) có thể truy cập trực tiếp được vào card PCIe, card đó phải được ảo hóa. Phần này giới thiệu framework hỗ trợ việc này. 

VFIO (Virtual Function I/O) là một framework trong hệ thống Linux cho phép ảo hóa các thiết bị I/O (Input-Output) như card đồ họa, card mạng, hoặc các thiết bị PCIe khác để chúng có thể được sử dụng trực tiếp bởi các máy ảo. VFIO cho phép ảo hóa PCIe Passthrough, một công nghệ mạnh mẽ cho phép máy ảo truy cập trực tiếp vào thiết bị vật lý, cải thiện hiệu suất và khả năng sử dụng các thiết bị đặc biệt.

Dưới đây là một số điểm quan trọng về VFIO:

**PCIe Passthrough:** VFIO cho phép bạn cấu hình máy ảo để truy cập trực tiếp vào một thiết bị PCIe vật lý, chẳng hạn như card đồ họa hoặc card mạng. Điều này có nghĩa là máy ảo có thể sử dụng thiết bị này như một máy tính vật lý thay vì thông qua một lớp trung gian.

**Hiệu Suất Cao:** PCIe Passthrough sử dụng trực tiếp tài nguyên phần cứng và loại bỏ độ trễ của máy ảo, giúp cải thiện hiệu suất, đặc biệt là cho các ứng dụng đòi hỏi nhiều tài nguyên đồ họa.

**Hỗ Trợ Ảo Hóa Đầy Đủ:** VFIO hỗ trợ ảo hóa đầy đủ, bao gồm ảo hóa CPU và I/O, đảm bảo rằng máy ảo có thể chạy các hệ điều hành khách đa dạng và sử dụng tài nguyên một cách hiệu quả.

**Bảo Mật:** VFIO cung cấp lớp bảo mật cho các thiết bị được ảo hóa, ngăn chặn việc truy cập trái phép từ máy ảo khác hoặc từ hệ thống máy chủ.

**Ảo Hóa GPU:** VFIO cho phép ảo hóa GPU, cho phép bạn chạy các ứng dụng đòi hỏi đồ họa cao cấp trong máy ảo, chẳng hạn như chơi game hoặc tính toán GPU.

**Cộng Đồng Hỗ Trợ:** VFIO được hỗ trợ bởi một cộng đồng đông đảo và có nhiều tài liệu, hướng dẫn và diễn đàn để giúp người dùng cấu hình và sử dụng VFIO.

VFIO là một công nghệ quan trọng trong các mô hình ảo hóa đòi hỏi hiệu suất cao và sử dụng các thiết bị I/O đặc biệt. Nó giúp tối ưu hóa tài nguyên và cải thiện khả năng sử dụng của hệ thống máy chủ ảo.


## 5. IOMMU

Để có thể passthrough PCIe thành công vào máy ảo, chức năng IOMMU phải được `enable` ở host. Phần này giới thiệu tổng quan về IOMMU.

IOMMU viết tắt của Input-Output Memory Management Unit. Đây là một thành phần phần cứng trong hệ thống máy tính, thường được tích hợp vào chipset hoặc CPU, đóng vai trò quan trọng trong việc quản lý việc địa chỉ bộ nhớ và truyền dữ liệu giữa CPU và các thiết bị ngoại vi, bao gồm các thiết bị kết nối qua PCIe (Peripheral Component Interconnect Express).

Tại sao IOMMU lại quan trọng:

**Dịch Địa Chỉ Bộ Nhớ:** Một trong những chức năng chính của IOMMU là dịch địa chỉ bộ nhớ giữa CPU và các thiết bị ngoại vi. Khi một thiết bị muốn đọc hoặc ghi vào bộ nhớ, nó chỉ định một địa chỉ bộ nhớ. IOMMU dịch địa chỉ này để đảm bảo rằng thiết bị có thể truy cập vào phần bộ nhớ hệ thống chính xác. Sự dịch này quan trọng cho việc bảo mật và bảo vệ, vì nó ngăn chặn thiết bị truy cập vào các vị trí bộ nhớ ngẫu nhiên.

**Cách Ly Bộ Nhớ:** IOMMU cung cấp cách ly bộ nhớ, có nghĩa là nó có thể cấp phát các vùng cụ thể của bộ nhớ độc quyền cho các thiết bị hoặc máy ảo cụ thể. Điều này đảm bảo rằng các thiết bị hoặc máy ảo không thể truy cập vào bộ nhớ bên ngoài các vùng được chỉ định của họ, tăng cường bảo mật và tính ổn định của hệ thống.

**PCIe Passthrough:** IOMMU là quan trọng cho công nghệ PCIe passthrough, một công nghệ cho phép máy ảo truy cập trực tiếp vào một thiết bị PCIe vật lý, chẳng hạn như card đồ họa hoặc card mạng. Nếu không có sự hỗ trợ của IOMMU, việc chia sẻ các thiết bị này an toàn và hiệu quả sẽ trở nên khó khăn.

**Ảo Hóa:** Trong môi trường ảo hóa, IOMMU cho phép ánh xạ bộ nhớ hiệu quả giữa các máy ảo và phần cứng vật lý. Nó cho phép các máy ảo có không gian địa chỉ bộ nhớ riêng của họ, giảm thiểu độ trễ và cải thiện hiệu suất.

**DMA (Direct Memory Access):** Các thiết bị như GPU và card mạng thường sử dụng DMA để truy cập bộ nhớ hệ thống trực tiếp mà không cần sự can thiệp của CPU. IOMMU đảm bảo rằng các hoạt động DMA được dịch và kiểm soát đúng cách, ngăn chặn truy cập bất hợp pháp vào bộ nhớ.

**Bảo Mật:** IOMMU tăng cường bảo mật hệ thống bằng cách ngăn chặn các thiết bị hoặc phần mềm độc hại truy cập bộ nhớ ngoài các vùng được ủy quyền. Nó giúp giảm thiểu một số loại tấn công dựa trên can thiệp vào bộ nhớ.

**Hiệu Năng:** Mặc dù IOMMU thêm một lớp dịch địa chỉ, nó được thiết kế để thực hiện điều này một cách hiệu quả, giảm thiểu độ trễ hiệu năng. Trong thực tế, đối với một số tải công việc như GPU passthrough cho việc chơi game trong máy ảo, sự hỗ trợ của IOMMU có thể cải thiện hiệu suất bằng cách cung cấp truy cập trực tiếp vào GPU.

Tóm lại, IOMMU là một thành phần quan trọng đảm bảo truyền dữ liệu an toàn và hiệu quả giữa CPU và các thiết bị ngoại vi, đặc biệt trong các tình huống ảo hóa và PCIe passthrough. Nó đóng một vai trò quan trọng trong quản lý bộ nhớ, bảo mật và cách ly trong các hệ thống máy tính hiện đại. 

Hướng dẫn về cài đặt IOMMU được mô tả ở phần 3 của series.