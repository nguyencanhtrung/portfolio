import {
  getSafeStorage,
  readStoredTheme,
  resolveTheme,
  toggleTheme,
  writeStoredTheme,
} from '../lib/theme';

const root = document.documentElement;
const prefersDark =
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;
const storage = getSafeStorage();

const applyTheme = (theme: 'light' | 'dark') => {
  root.dataset.theme = theme;
};

applyTheme(resolveTheme(readStoredTheme(storage), prefersDark));

const attachToggle = () => {
  const button = document.getElementById('theme-toggle');
  if (!(button instanceof HTMLButtonElement) || button.dataset.bound === 'true') return;

  button.dataset.bound = 'true';
  button.addEventListener('click', () => {
    const next = toggleTheme(root.dataset.theme, prefersDark);
    applyTheme(next);
    writeStoredTheme(storage, next);
    window.dispatchEvent(new CustomEvent('themechange', { detail: next }));
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachToggle, { once: true });
} else {
  attachToggle();
}
