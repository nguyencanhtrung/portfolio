# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Bốn nhóm audience, user xác nhận đều là chính (2026-08-05):

- **Employer / recruiter** — đánh giá năng lực khi user tìm cơ hội mới hoặc thăng tiến; success = được liên hệ, qua vòng screening.
- **Đồng nghiệp / cộng đồng kỹ thuật** — đọc blog FPGA / 5G / simulation; success = được đọc, chia sẻ, trích dẫn.
- **Khách hàng / đối tác tiềm năng** — đánh giá chuyên môn ở mức công ty (SoC.one); success = tạo niềm tin chuyên môn.
- **Hội thảo / speaking** — trang làm hồ sơ diễn giả trong lĩnh vực digital twin / O-RAN.

## Product Purpose

Portfolio + blog kỹ thuật cá nhân của Canh-Trung Nguyen tại **bibo.id.vn**. Trọng tâm dài hạn: **cân bằng 50/50** giữa hồ sơ tĩnh (journey + projects) và dòng bài viết kỹ thuật sống. Trang chủ giữ journey.

## Positioning

"From logic gates to digital twins" — một thập kỷ làm radio systems trong silicon (5G PHY, O-RAN RU/DU bring-up), nay dẫn dắt group xây digital twins để test chính những hệ thống đó. Edge nằm ở giao điểm: simulation engineers hiếm khi build hardware, hardware engineers hiếm khi build simulators. Trục kể chuyện journey: **gate → block → box → system → world**.

## Operating Context

- Song ngữ: EN mặc định `/`, VI ở `/vi/`. Portfolio pages mirror đủ 2 bản (nội dung trong `src/data/journey.ts`, `src/data/projects.ts`, dict `src/i18n/ui.ts`); blog mỗi bài tùy ngôn ngữ, pair bằng frontmatter `key`.
- Host GitHub Pages qua Actions, domain qua Cloudflare.
- Blog: Markdown/MDX, KaTeX, Mermaid (client-side, theme-aware), Shiki dual theme, Pagefind search (chỉ chạy sau `npm run build`), series, pagination 10 bài/trang.
- Vai trò hiện tại của user: **Manager & Tech Lead, Verticals Group — SoC.one** (robotics, automotive, drones, 5G/6G).

## Capabilities and Constraints

**Ranh giới bảo mật nội dung (bắt buộc, user đặt):**

- Nêu tên employer SoC.one; **KHÔNG** tên/codename customer, **KHÔNG** mã spec nội bộ, tên repo nội bộ, KPI/kiến trúc nội bộ, mốc giao hàng, số issue/MR.
- Chỉ ở mức "nói được ở hội thảo": chuẩn công khai (3GPP, SAE, O-RAN, ETSI), công nghệ công khai (Sionna RT, OAI, CARLA, SUMO, Isaac Sim, LeRobot…), quy mô đội của chính user, phương pháp luận do user thiết kế.
- Web công khai không đăng SĐT / ngày sinh (khác CV).
- Test khi nghi ngờ: "câu này đăng lên slide hội thảo có sao không?"

**Ngôn ngữ:** nội dung tiếng Việt giữ nguyên thuật ngữ kỹ thuật tiếng Anh, không dịch.

**Kỹ thuật:** Astro 5 static site; search không chạy ở `npm run dev` (cần build + preview).

## Brand Commitments

- Tên hiển thị: **Canh-Trung Nguyen**; domain **bibo.id.vn**.
- **Voice (cam kết giữ, user xác nhận 2026-08-05):** giọng kể chuyện kỹ sư — narrative, chính xác kỹ thuật nhưng có chất văn ("From logic gates to digital twins", "Learned to read a specification as an executable contract").
- Hình minh họa: không dùng ảnh công ty; SVG line-art tự vẽ kiểu datasheet (ProjectArt, ChapterIcon), theme-aware qua CSS vars. Ảnh thật user tự cung cấp vào `public/images/`.
- Fonts: Newsreader (serif), Inter, JetBrains Mono — đủ subset Vietnamese.

## Evidence on Hand

- Journey 5 chương với metrics thật đã confirm (68× speedup, PUSCH @ 250 MHz, 8T8R macrocell, ACLR 50 dB…) trong `src/data/journey.ts`.
- 4 project pages: connected-driving, v2x-protocol-stack, digital-twin-channel-sim, robotics-sim2real (`src/data/projects.ts`).
- ~30 bài blog EN + bài VI (import từ WordPress cũ) trong `src/content/blog/`.
- Timeline đã user xác nhận: SoC.one từ 05/2021 part-time, full-time ~10/2021, tech lead ~10/2024, hiện là Manager Verticals Group.
- **Không có**: testimonial, số liệu customer, ảnh dự án thực tế — không được bịa.

## Product Principles

1. **Bằng chứng thật, mức hội thảo** — mọi claim neo vào chuẩn/công nghệ công khai và metrics đã xác nhận; không lộ engagement cụ thể, không bịa evidence.
2. **Giao điểm là selling point** — hardware × simulation là vị thế không ai chép được; mọi surface mới phải củng cố trục gate → world.
3. **Hai ngôn ngữ ngang hàng** — EN/VI mirror cho portfolio, blog tùy bài; VI giữ thuật ngữ EN.
4. **Hồ sơ và blog cùng trọng lượng** — không để blog thành phụ lục, không để portfolio thành trang bìa.
5. **Giọng kể chuyện kỹ sư** — narrative có chất văn nhưng mọi con số kiểm chứng được.
