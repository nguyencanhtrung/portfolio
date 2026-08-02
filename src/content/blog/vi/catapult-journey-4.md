---
title: 'Catapult Journey - Untimed C++ - lab 4'
description: 'Khi nào một mảng C++ trở thành memory interface thay vì thanh ghi, và vì sao vòng lặp truy cập mảng đó không unroll được — qua ví dụ FIR 4-tap với bảng hệ số 32x4.'
date: 2022-11-06
lang: vi
key: catapult-journey-4
tags: ['catapult']
---

Ba lab trước làm việc với `ac_channel` — dữ liệu chảy qua thiết kế theo dạng
stream. Lab này chuyển sang loại giao diện thứ hai: **mảng ánh xạ thành bộ nhớ**.
Điểm mấu chốt là cùng một khai báo mảng trong C++ có thể ra thanh ghi hoặc ra
RAM, và quyết định đó thay đổi hẳn cấu trúc pipeline mà Catapult sinh ra.

## 1. Map C++ arrays to memories

Thiết kế dưới đây là một FIR 4-tap với bảng hệ số chọn được: `coeff_addr` chỉ
ra hàng nào trong bảng 32x4 sẽ được dùng cho mẫu hiện tại.

```cpp
#include "test.h"
#include <mc_scverify.h>

#pragma hls_design top
void CCS_BLOCK(test)(ac_channel<ac_int<10> >      &data_in,
                     ac_int<7>                    coeffs[32][4], // array is mem interface not ac_channel
                     ac_channel<ac_int<5,false> > &coeff_addr,
                     ac_channel<ac_int<19> >      &result)
{
  static ac_int<10> regs[4]; // shift register
  ac_int<19> acc = 0;
  ac_int<5,false> addr = coeff_addr.read();
#pragma unroll yes
  SHIFT:for (int i=3; i>=0; i--) {
    if (i==0) {
      regs[i] = data_in.read();
    } else {
      regs[i] = regs[i-1];
    }
  }

  MAC:for (int i=0; i<4; i++) {
    acc += regs[i] * coeffs[addr][i];
  }

  result.write(acc);
}
```

### 1.1 Hai loại mảng trong cùng một hàm

Đoạn code trên có đúng hai mảng, và chúng được tổng hợp theo hai cách hoàn toàn
khác nhau:

| Mảng | Khai báo | Catapult sinh ra |
| ---- | -------- | ---------------- |
| `coeffs[32][4]` | tham số của hàm top | **memory interface** — một cổng RAM ra ngoài block |
| `regs[4]` | `static` cục bộ | 4 thanh ghi bên trong block |

Khác biệt nằm ở vị trí khai báo, không phải ở kiểu dữ liệu. Mảng nằm trong danh
sách tham số của hàm top là thứ tồn tại **bên ngoài** thiết kế, nên Catapult
phải sinh ra chân địa chỉ, chân dữ liệu và tín hiệu enable để đi đọc nó. Mảng
`static` cục bộ thì nằm trong thiết kế, giữ giá trị qua các lần gọi hàm, và với
kích thước nhỏ như 4 phần tử thì tool ánh xạ thẳng thành flip-flop.

Đây cũng là lý do comment trong code nhấn mạnh *"array is mem interface not
ac_channel"*: `ac_channel` mô tả một dòng dữ liệu tuần tự có handshake, còn mảng
mô tả một vùng nhớ truy cập ngẫu nhiên theo địa chỉ. Chọn nhầm loại giao diện là
chọn nhầm luôn kiến trúc.

### 1.2 Vì sao SHIFT unroll được mà MAC thì không

Vòng `SHIFT` có `#pragma unroll yes` và nó unroll thoải mái: mọi phần tử `regs`
đều là thanh ghi, nên 4 phép gán xảy ra song song trong một chu kỳ — đúng bản
chất của một shift register.

Vòng `MAC` thì khác. Mỗi vòng lặp đọc `coeffs[addr][i]`, tức là truy cập vào bộ
nhớ ngoài. Một RAM một cổng chỉ phục vụ được **một phép đọc mỗi chu kỳ**, nên dù
có ép unroll thì scheduler vẫn phải trải bốn phép đọc ra bốn chu kỳ. Kết quả là
thân vòng lặp không hề rút ngắn, chỉ tốn thêm phần cứng ghép nối.

Muốn `MAC` thực sự chạy song song thì phải giải quyết ở phía bộ nhớ, không phải
ở phía vòng lặp:

- **Chia bảng hệ số thành 4 memory riêng** (mỗi tap một bảng 32x1), khi đó bốn
  phép đọc rơi vào bốn RAM khác nhau và diễn ra đồng thời.
- **Dùng RAM hai cổng** để đọc được 2 hệ số mỗi chu kỳ, giảm còn 2 chu kỳ.
- **Đổi tổ chức bảng** thành `coeffs[32]` với mỗi phần tử rộng 28 bit (4 hệ số
  ghép lại), đọc một lần lấy đủ cả hàng, rồi tách bằng bit-slice.

Phương án thứ ba thường thắng khi số tap nhỏ và cố định: một chu kỳ đọc, không
nhân bản RAM, phần tách bit chỉ là dây nối.

### 1.3 Kiểm tra trong Design Analyzer

Sau khi tổng hợp, mở Design Analyzer và nhìn vào vòng `MAC`. Nếu thấy bốn phép
đọc xếp nối tiếp nhau trên trục thời gian với cùng một tài nguyên RAM thì đó
chính là điểm nghẽn — và nó sẽ không biến mất bằng cách thêm pragma. Gantt Chart
cho thấy điều tương tự ở mức vòng lặp: initiation interval của `MAC` bị chặn bởi
số cổng nhớ chứ không phải bởi phép nhân.

## 2. Tóm lại

- Mảng nằm ở tham số hàm top thành memory interface; mảng `static` cục bộ nhỏ
  thành thanh ghi. Vị trí khai báo quyết định kiến trúc.
- Unroll chỉ giúp khi tài nguyên bên dưới cho phép song song. Với truy cập bộ
  nhớ, giới hạn thật là số cổng RAM.
- Muốn tăng throughput của một vòng lặp đọc bảng thì sửa cách tổ chức bảng —
  chia nhỏ, dùng hai cổng, hoặc ghép cả hàng vào một từ nhớ.
