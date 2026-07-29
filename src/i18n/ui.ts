export type Locale = 'en' | 'vi';

export const ui = {
  en: {
    'nav.journey': 'Journey',
    'nav.projects': 'Projects',
    'nav.blog': 'Blog',
    'nav.about': 'About',
    'footer.rights': 'Canh-Trung Nguyen',
    'footer.builtwith': 'Built with Astro · hosted on GitHub Pages',
    'blog.title': 'Writing',
    'blog.description':
      'Perspectives on connected driving, robotics, AI and the systems behind them.',
    'blog.readInOther': 'Đọc bài này bằng tiếng Việt →',
    'blog.backToList': '← All posts',
    'blog.toc': 'Contents',
    'blog.searchPlaceholder': 'Search posts — titles and full content…',
    'blog.searchZero': 'No posts match',
    'blog.newer': '← Newer posts',
    'blog.older': 'Older posts →',
    'projects.title': 'Projects',
    'projects.description':
      'Selected work — described at the level I can talk about publicly.',
    'project.role': 'Role',
    'project.period': 'Period',
    'project.stack': 'Stack & standards',
    'project.back': '← All projects',
    'notfound.title': 'Page not found',
    'notfound.body': 'Nothing lives at this address.',
    'notfound.home': 'Back to home',
  },
  vi: {
    'nav.journey': 'Hành trình',
    'nav.projects': 'Dự án',
    'nav.blog': 'Blog',
    'nav.about': 'Giới thiệu',
    'footer.rights': 'Nguyễn Cảnh Trung',
    'footer.builtwith': 'Dựng bằng Astro · host trên GitHub Pages',
    'blog.title': 'Bài viết',
    'blog.description':
      'Góc nhìn về connected driving, robotics, AI và những hệ thống phía sau chúng.',
    'blog.readInOther': 'Read this post in English →',
    'blog.backToList': '← Tất cả bài viết',
    'blog.toc': 'Mục lục',
    'blog.searchPlaceholder': 'Tìm bài viết — theo tiêu đề và cả nội dung…',
    'blog.searchZero': 'Không có bài nào khớp',
    'blog.newer': '← Bài mới hơn',
    'blog.older': 'Bài cũ hơn →',
    'projects.title': 'Dự án',
    'projects.description':
      'Các dự án tiêu biểu — mô tả ở mức có thể chia sẻ công khai.',
    'project.role': 'Vai trò',
    'project.period': 'Thời gian',
    'project.stack': 'Công nghệ & chuẩn',
    'project.back': '← Tất cả dự án',
    'notfound.title': 'Không tìm thấy trang',
    'notfound.body': 'Không có gì ở địa chỉ này cả.',
    'notfound.home': 'Về trang chủ',
  },
} as const;

export type UiKey = keyof (typeof ui)['en'];

export function t(locale: Locale, key: UiKey): string {
  return ui[locale][key];
}

/** Prefix a root-relative path with the locale segment when needed. */
export function localePath(locale: Locale, path: string): string {
  return locale === 'en' ? path : `/vi${path === '/' ? '' : path}`;
}
