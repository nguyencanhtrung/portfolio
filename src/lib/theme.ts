export type Theme = 'light' | 'dark';

export interface ThemeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const THEME_STORAGE_KEY = 'theme';

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

export function normalizeTheme(value: unknown): Theme | null {
  return isTheme(value) ? value : null;
}

export function systemTheme(prefersDark: boolean): Theme {
  return prefersDark ? 'dark' : 'light';
}

export function resolveTheme(stored: unknown, prefersDark: boolean): Theme {
  return normalizeTheme(stored) ?? systemTheme(prefersDark);
}

export function toggleTheme(current: unknown, prefersDark: boolean): Theme {
  return resolveTheme(current, prefersDark) === 'dark' ? 'light' : 'dark';
}

export function getSafeStorage(): ThemeStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readStoredTheme(
  storage: ThemeStorage | null | undefined,
  key = THEME_STORAGE_KEY,
): Theme | null {
  try {
    return normalizeTheme(storage?.getItem(key));
  } catch {
    return null;
  }
}

export function writeStoredTheme(
  storage: ThemeStorage | null | undefined,
  theme: Theme,
  key = THEME_STORAGE_KEY,
): void {
  try {
    storage?.setItem(key, theme);
  } catch {
    // Privacy settings and blocked storage must not break the theme toggle.
  }
}
