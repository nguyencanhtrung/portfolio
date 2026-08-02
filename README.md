# Portfolio & Blog

Portfolio cá nhân được build với Astro 5, song ngữ EN (`/`) / VI (`/vi/`),
host trên GitHub Pages, domain qua Cloudflare.

## Yêu cầu

- Node.js ≥ 20 (đang dev trên v24)
- `npm install` lần đầu

## Lệnh hằng ngày

| Lệnh               | Làm gì                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`     | Dev server (mặc định`localhost:4321`), hot-reload khi sửa file. **Search không chạy ở chế độ này** — ô search tự ẩn. |
| `npm run build`   | Build production vào`dist/` **và** sinh index Pagefind cho search.                                                                |
| `npm run preview` | Phục vụ`dist/` đã build — đây là cách xem search chạy trên máy.                                                               |

Quy trình xem đúng bản production trên máy:

```bash
npm run build
npm run preview   # mở http://localhost:4321
```

Lưu ý: `preview` phục vụ file tĩnh từ `dist/` — sửa code xong phải `npm run build`
lại thì preview mới thấy thay đổi (dev server thì thấy ngay).

## Search (Pagefind)

Index full-text được sinh **lúc build** (`pagefind --site dist`), tách riêng theo
ngôn ngữ. Vì vậy:

- `npm run dev` → không có `/pagefind/*` → 2 dòng 404 trong log là bình thường, ô search tự ẩn.
- Muốn thử search: `npm run build && npm run preview`.

## Viết blog

Bài viết nằm ở `src/content/blog/<en|vi>/<slug>.md` (hoặc `.mdx`). Frontmatter:

```yaml
---
title: "Tiêu đề"
description: "Một câu mô tả"
date: 2026-08-01
lang: vi            # en | vi
key: my-post        # cùng key ở 2 ngôn ngữ → hiện nút chuyển bản dịch
tags: [fpga, 5g]
draft: false        # true = không publish
---
```

- Math: KaTeX (`$...$`, `$$...$$`). Diagram: code fence ` ```mermaid `. Code: Shiki, theme sáng/tối tự đổi.
- Series: thêm `series: 'Tên series'` + `seriesOrder: 1` vào frontmatter các bài cùng series
  (cùng ngôn ngữ, tên series phải giống hệt nhau). Bài viết sẽ hiện nhãn "phần n/m" dưới tiêu đề
  và nút Phần trước / Phần tiếp theo ở cuối bài. Bài không có `series` thì giữ nguyên như cũ.
- Ảnh đặt ở `public/images/blog/<slug>/`, nhúng bằng đường dẫn tuyệt đối `/images/blog/<slug>/ten-anh.png`.
- Bài có ≥ 2 heading `##` sẽ tự có table of contents (sidebar trái trên desktop, khối gập được trên mobile).
- Blog list phân trang 10 bài/trang (`/blog/page/2/`…).

## Sửa nội dung portfolio

| File                                | Nội dung                                   |
| ----------------------------------- | ------------------------------------------- |
| `src/data/journey.ts`             | Hero + 5 chương timeline (cả EN lẫn VI) |
| `src/data/projects.ts`            | 4 trang dự án (cả EN lẫn VI)            |
| `src/i18n/ui.ts`                  | Nhãn giao diện (nav, nút, placeholder…) |
| `src/components/HeroScene.astro`  | Bức panorama SVG ở hero                   |
| `src/components/ChapterArt.astro` | 5 hình minh hoạ chương Journey          |
| `src/components/ProjectArt.astro` | 4 hình minh hoạ trang dự án             |
| `src/styles/global.css`           | Token màu/chữ (light + dark), style chung |

Quy tắc nội dung: không tên customer, không codename/KPI nội bộ — mô tả ở mức
nói được ở hội thảo. Bản VI giữ nguyên thuật ngữ kỹ thuật tiếng Anh.

## Deploy

Push lên `main` → GitHub Actions (`.github/workflows/deploy.yml`) tự build và
deploy lên GitHub Pages → https://bibo.id.vn (DNS + proxy qua Cloudflare).
Không cần build tay trước khi push.
