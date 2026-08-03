---
title: 'VHDL - Keyword và identifier'
description: 'Phần 1 của series VHDL: keyword và quy tắc đặt identifier, expression và literal, cùng ba loại data object — constant, variable và signal — với điểm khác nhau then chốt về ngữ nghĩa phép gán.'
date: 2023-02-25
lang: vi
key: vhdl_training_1
tags: ['vhdl']
series: 'VHDL training'
seriesOrder: 1
---

## 1. Keyword trong VHDL là gì?

Keyword là những từ khoá được ngôn ngữ dành riêng cho các cấu trúc cú pháp, dùng
để báo cho tool tổng hợp hoặc trình biên dịch biết một chức năng cụ thể.

Ví dụ: `signal`, `variable`, `function` đều là keyword.

## 2. Identifier trong VHDL là gì?

Identifier là những "danh từ" dùng để đặt tên cho các thành phần trong VHDL.

* Identifier không được trùng với keyword.
* Tên đặt cho signal, variable, function, procedure và constant đều là
  identifier.
* Ví dụ: `a`, `b`, `total`, `my_buffer`…

Phần lớn người thiết kế thích kiểu đặt tên như trong C: `C_styles_identifier`.

VHDL **không phân biệt hoa thường**, nên `IDentiFier` và `identifier` là một.

Quy tắc khi đặt identifier:

* Phải bắt đầu bằng một chữ cái.
* Được chứa chữ cái, chữ số và dấu gạch dưới.
* Không được có hai dấu gạch dưới liền nhau.
* Không được kết thúc bằng dấu gạch dưới.
* Độ dài tối đa do nhà cung cấp tool tổng hợp quy định.
* Bản thân chuẩn VHDL không giới hạn độ dài.

Lưu ý: bên trong, VHDL chuyển toàn bộ ký tự về CHỮ HOA.

## 3. Expression và literal trong VHDL

### 3.1 Expression

* Một expression gồm toán tử và toán hạng.
  * Các data object đóng vai trò toán hạng.
  * Toán tử dùng giá trị của các data object đó để thực hiện một phép tính.

Ví dụ:

* `Y <= A + B - C` là một expression đơn giản với toán hạng A, B, C và toán tử
  `+`, `-`.
* `M <= Y` cũng là expression, chỉ với một identifier.
* `sig_hold <= func_or(a,b)` — một lời gọi hàm cũng là expression.

### 3.2 Literal

Literal là toán hạng mang giá trị hằng.

Ví dụ:

* `A <= '1'` — A là literal một bit.
* `y <= "10000100"` — y là literal kiểu std_logic_vector.
* `CH <= 'A'` — CH là literal kiểu character.

Các ví dụ trên đều là phép gán tín hiệu không điều kiện, trong đó giá trị bên
phải dấu `<=` được đưa tới đối tượng bên trái.

## 4. Data object trong VHDL

Data object:

* Giữ giá trị của một kiểu dữ liệu cụ thể.
* Dùng để truyền giá trị từ điểm này sang điểm khác.
* Mỗi data object nhận một giá trị trong tập hữu hạn các giá trị hợp lệ.

VHDL có bốn lớp data object:

* Constant
* Variable
* Signal
* File

### 4.1 Constant

* Chỉ giữ đúng một giá trị của một kiểu dữ liệu, và giá trị đó không đổi được sau
  khi đã khai báo.
* Dùng constant giúp:
  * Code dễ đọc hơn.
  * Giảm khả năng mắc lỗi.

### 4.2 Variable

* Giữ được bất kỳ giá trị nào của một kiểu dữ liệu.
* Dùng để **lưu giá trị tạm** bên trong một process hoặc một function.
* Cập nhật giá trị bằng câu lệnh gán variable.
* Được khai báo bên trong **block, process, procedure hoặc function**, và cập
  nhật **ngay lập tức** khi câu lệnh gán được thực thi.

### 4.3 Signal

* Giữ một danh sách các giá trị hiện tại và tương lai sẽ xuất hiện trên tín
  hiệu. Cập nhật bằng câu lệnh gán signal.
* Mỗi signal có một hoặc nhiều "driver", quyết định giá trị và thời điểm thay
  đổi của tín hiệu.
* Mỗi driver là một hàng đợi sự kiện, cho biết khi nào và đổi sang giá trị gì.
* Mỗi phép gán signal sẽ sửa hàng đợi sự kiện tương ứng để lên lịch một sự kiện
  mới.

Đây chính là khác biệt then chốt so với variable, và cũng là chỗ người mới hay
nhầm: variable nhận giá trị **ngay**, còn signal chỉ **lên lịch** cho giá trị mới
và giá trị đó có hiệu lực ở lần chạy tiếp theo của mô phỏng. Trong một process,
đọc lại một signal vừa gán sẽ ra giá trị **cũ**.

### 4.4 File

* File trỏ tới một file thật trên hệ thống, chứa các giá trị thuộc kiểu dữ liệu
  đã khai báo.
* Đối tượng file cho phép truy cập tuần tự: giá trị được đọc ra hoặc ghi vào
  theo thứ tự.

## 5. Các lớp object trong VHDL

VHDL có bốn lớp object, mô tả tính chất của data object:

* Lớp `scalar` — object mang một giá trị đơn, có index xác định và có thứ tự.
* Lớp `composite` — object nhóm, gồm các phần tử cùng kiểu hoặc khác kiểu.
* Lớp `access` — con trỏ tới object.
* Lớp `file` — một chuỗi các object thuộc một kiểu dữ liệu.

## 6. Comment

Comment giúp code dễ đọc hơn đáng kể, đóng vai trò tài liệu, và làm rõ ý định
của người thiết kế.

### 6.1 Quy tắc viết comment

* Comment trong VHDL luôn bắt đầu bằng hai dấu gạch ngang (`--`) và kết thúc ở
  cuối dòng.
* Không có comment nhiều dòng như C/C++. (VHDL-2008 có cho phép `/* ... */`,
  nhưng thực tế ít dùng vì các synthesizer hỗ trợ không đầy đủ.)
* Có thể bắt đầu ở bất kỳ vị trí nào trong dòng.
* Kết thúc khi xuống dòng.
* Được phép chứa mọi ký tự in được.

### 6.2 Năm cấp độ comment trong VHDL

* Tài liệu bên ngoài
* Comment ở cấp file (header)
* Comment cho một nhóm code
* Comment nội dòng
* Comment ở cấp identifier

#### Tài liệu bên ngoài

Là tài liệu không nằm trong file mã nguồn nhưng được dẫn chiếu tới. Nguồn chính
là tài liệu thiết kế chi tiết; các nguồn khác có thể là website hoặc sách.

#### Comment ở cấp file (header)

* Giới thiệu module: tên file và nội dung module.
* Mô tả các đầu vào, đầu ra của module.
* Giải thích module làm gì.

#### Comment cho một nhóm code

* Giải thích mục đích của một cụm code.

#### Comment nội dòng

* Chỉ rõ mục đích của đúng một câu lệnh.

#### Comment ở cấp identifier

* Thói quen đặt tên tốt, kết hợp với loại comment này, làm code dễ đọc hơn và ít
  lỗi hơn.
