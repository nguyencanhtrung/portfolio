---
title: 'Kiến trúc UltraScale - phần 1: tài nguyên CLB'
description: 'Những gì thay đổi trong CLB của UltraScale so với dòng 7 series: ranh giới slice biến mất, carry chain tăng lên 8 bit, mọi output flip-flop đều tới được router — và "granularity 8 flip-flop" thực chất nói về điều gì.'
date: 2023-03-31
lang: vi
key: ultrascale_architecture_1
tags: ['xilinx']
---

## 1. Bố cục CLB

### 1.1 Khác gì so với 7 series?

- **Ranh giới slice biến mất.** Ở 7 series, một CLB chứa hai slice độc lập.
  UltraScale bỏ bức tường đó và thêm một mux bắc qua, nên một hàm logic có thể
  trải rộng qua phần vốn là hai slice riêng biệt. Hàm rộng giờ đặt vừa mà không
  phải trả thêm một chặng routing.
- **Carry chain tăng gấp đôi**, từ 4 bit lên 8 bit mỗi CLB. Bộ cộng và bộ đếm
  leo hết chuỗi với số chặng giảm một nửa.
- **Mọi output của flip-flop đều tới được routing fabric.** Ở 7 series, một số
  output flip-flop chỉ đi ra qua đường dùng chung, khiến packer buộc phải bỏ
  trống thanh ghi. Gỡ ràng buộc này chính là thứ cho phép tool xếp chặt hơn.

![](/images/blog/ultrascale_architecture_1/1.png)

So sánh giữa 7 series và UltraScale:

![](/images/blog/ultrascale_architecture_1/2.png)

### 1.2 Một CLB có 16 flip-flop, vậy sao lại nói granularity 8 flip-flop?

Hai con số đang đếm hai thứ khác nhau. Mười sáu là số flip-flop mà CLB **chứa**;
tám là kích thước của nhóm phải **dùng chung tín hiệu điều khiển**.

Một flip-flop không đứng một mình. Nó đi kèm clock, clock enable và set/reset —
và những đường điều khiển này không được route riêng cho từng flip-flop mà route
theo nhóm. Trong CLB của UltraScale, 16 flip-flop được tổ chức thành hai nhóm 8;
trong cùng một nhóm, mọi flip-flop thấy chung một clock enable và chung một
set/reset. Riêng clock thì dùng chung cho cả CLB.

Hệ quả thực tế lộ ra ở bước packing. Hai thanh ghi chỉ nằm chung một nhóm 8 khi
chúng khớp nhau về control set:

- cùng clock,
- cùng clock enable (hoặc cùng không có),
- cùng tín hiệu reset, cùng cực tính, và cùng loại đồng bộ hay bất đồng bộ.

Nếu thiết kế dùng quá nhiều control set khác nhau — chẳng hạn mỗi bank thanh ghi
nhỏ một enable riêng — thì mỗi control set chiếm trọn một nhóm 8, và một CLB chứa
được 16 flip-flop có thể chỉ dùng thật hai ba cái. Báo cáo tài nguyên khi đó cho
thấy CLB dùng rất nhiều trong khi flip-flop dùng rất ít; đó là dấu hiệu đặc trưng
của việc phân mảnh control set.

Nói cách khác, "granularity 8 flip-flop" là phát biểu về **cách đặt chỗ**, không
phải về dung lượng: thanh ghi được cấp phát theo lô 8, vì 8 là số phải đi cùng
nhau.

### 1.3 Xử lý thế nào

- Giữ số lượng tín hiệu clock enable và reset khác nhau ở mức ít. Một enable
  điều khiển một bank rộng tốt hơn tám enable điều khiển tám bank hẹp.
- Ưu tiên reset đồng bộ, và chỉ reset những gì thật sự cần. Một thanh ghi luôn
  được ghi trước khi được đọc thì không cần reset — bỏ reset đi là để packer tự
  do xếp nó vào bất kỳ nhóm nào.
- Khi thấy số CLB dùng không tương xứng với số flip-flop, chạy
  `report_control_sets` trong Vivado. Lệnh này liệt kê từng control set và số
  flip-flop mà nó giữ; những control set chỉ giữ vài flip-flop chính là chỗ đang
  ngốn diện tích.
