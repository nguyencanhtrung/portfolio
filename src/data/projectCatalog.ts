import { localePath, t, type Locale } from '../i18n/ui';
import { projects, type Project } from './projects';

export type ProjectCatalogIconName = 'professional' | 'independent';

export interface ProjectCatalogLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface IndependentProject {
  id: string;
  kind: string;
  name: string;
  logoSrc: string;
  logoAlt: string;
  summary: string;
  description: string;
  features: string[];
  links: ProjectCatalogLink[];
  license: string;
}

export interface ProfessionalCatalogEntry {
  type: 'professional';
  project: Project;
}

export interface IndependentCatalogEntry {
  type: 'independent';
  project: IndependentProject;
}

export type ProjectCatalogEntry = ProfessionalCatalogEntry | IndependentCatalogEntry;

export interface ProjectCatalogCategory {
  id: 'professional' | 'independent';
  title: string;
  description: string;
  icon: ProjectCatalogIconName;
  entries: ProjectCatalogEntry[];
}

export interface ProjectCatalogLabels {
  viewProject: string;
  viewSource: string;
  featuresAndSetup: string;
  website: string;
}

export interface ProjectCatalog {
  title: string;
  description: string;
  labels: ProjectCatalogLabels;
  categories: ProjectCatalogCategory[];
}

const independentProjects: Record<Locale, IndependentProject[]> = {
  en: [
    {
      id: 'asr-studio',
    kind: 'Self-hosted · English / Vietnamese',
    name: 'ASR Studio',
    logoSrc: '/images/projects/asr-studio-logo.svg',
    logoAlt: 'ASR Studio',
    summary: 'From meeting recordings to transcripts and notes you can trace back to the source.',
    description:
      'A self-hosted web app for English and Vietnamese meetings. Transcription and speaker diarization run on your machine; the transcript goes to your chosen provider for meeting notes.',
    features: [
      'English–Vietnamese transcription, including mixed speech',
      'Speaker diarization; editable text and speaker names',
      'Meeting notes with decisions, questions and action items',
      'Timestamp citations; editable Markdown export',
    ],
    links: [
      {
        label: 'View on GitHub',
        href: 'https://github.com/nguyencanhtrung/asr-studio',
        external: true,
      },
      {
        label: 'Features & setup',
        href: 'https://github.com/nguyencanhtrung/asr-studio#quickstart',
        external: true,
      },
      { label: 'Website', href: 'https://asr.bibo.id.vn', external: true },
    ],
    license: 'PolyForm Noncommercial',
    },
  ],
  vi: [
    {
      id: 'asr-studio',
    kind: 'Self-hosted · Anh / Việt',
    name: 'ASR Studio',
    logoSrc: '/images/projects/asr-studio-logo.svg',
    logoAlt: 'ASR Studio',
    summary: 'Từ bản ghi cuộc họp đến transcript và ghi chú có thể đối chiếu với nguồn.',
    description:
      'Web app self-hosted cho cuộc họp Anh–Việt. Transcription và phân biệt speaker chạy trên máy của bạn; transcript được gửi tới provider bạn chọn để tạo meeting notes.',
    features: [
      'Transcription Anh–Việt, kể cả khi nói xen kẽ',
      'Phân biệt speaker; chỉnh nội dung và tên người nói',
      'Meeting notes có quyết định, câu hỏi và action items',
      'Timestamp dẫn về recording; chỉnh và xuất Markdown',
    ],
    links: [
      {
        label: 'Xem trên GitHub',
        href: 'https://github.com/nguyencanhtrung/asr-studio',
        external: true,
      },
      {
        label: 'Tính năng & cài đặt',
        href: 'https://github.com/nguyencanhtrung/asr-studio#quickstart',
        external: true,
      },
      { label: 'Website', href: 'https://asr.bibo.id.vn', external: true },
    ],
    license: 'PolyForm Noncommercial',
    },
  ],
};

const labels: Record<Locale, ProjectCatalogLabels> = {
  en: {
    viewProject: 'View project',
    viewSource: 'View on GitHub',
    featuresAndSetup: 'Features & setup',
    website: 'Website',
  },
  vi: {
    viewProject: 'Xem dự án',
    viewSource: 'Xem trên GitHub',
    featuresAndSetup: 'Tính năng & cài đặt',
    website: 'Website',
  },
};

export function getProjectCatalog(locale: Locale): ProjectCatalog {
  const professionalEntries: ProfessionalCatalogEntry[] = projects[locale].map((project) => ({
    type: 'professional',
    project,
  }));

  return {
    title: t(locale, 'projects.title'),
    description: t(locale, 'projects.description'),
    labels: labels[locale],
    categories: [
      {
        id: 'professional',
        title: locale === 'vi' ? 'Dự án tại công ty' : 'Professional work',
        description:
          locale === 'vi'
            ? 'Các chương trình kỹ thuật tôi tham gia dẫn dắt và trực tiếp phát triển tính năng.'
            : 'Engineering programs where I lead technical work and directly develop features.',
        icon: 'professional',
        entries: professionalEntries,
      },
      {
        id: 'independent',
        title: locale === 'vi' ? 'Dự án cá nhân' : 'Independent projects',
        description:
          locale === 'vi'
            ? 'Công cụ tôi tự xây từ nhu cầu thực tế, với mã nguồn được công khai.'
            : 'Tools built from everyday needs, with publicly available source code.',
        icon: 'independent',
        entries: independentProjects[locale].map((project) => ({
          type: 'independent',
          project,
        })),
      },
    ],
  };
}

export function projectHref(locale: Locale, project: Project): string {
  return localePath(locale, `/projects/${project.slug}/`);
}
