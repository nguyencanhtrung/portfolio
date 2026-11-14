import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getSafeStorage,
  readStoredTheme,
  resolveTheme,
  toggleTheme,
  writeStoredTheme,
  type ThemeStorage,
} from '../src/lib/theme.ts';

test('resolveTheme accepts only light/dark and falls back to the system preference', () => {
  assert.equal(resolveTheme('dark', false), 'dark');
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('system', true), 'dark');
  assert.equal(resolveTheme(undefined, false), 'light');
});

test('blocked storage reads fall back without throwing', () => {
  const blocked: ThemeStorage = {
    getItem() {
      throw new Error('storage blocked');
    },
    setItem() {
      throw new Error('storage blocked');
    },
  };

  assert.equal(readStoredTheme(blocked), null);
  assert.doesNotThrow(() => writeStoredTheme(blocked, 'dark'));
  assert.equal(resolveTheme(readStoredTheme(blocked), true), 'dark');
});

test('toggleTheme derives the next value from a valid current or system value', () => {
  assert.equal(toggleTheme('dark', false), 'light');
  assert.equal(toggleTheme('light', true), 'dark');
  assert.equal(toggleTheme('invalid', true), 'light');
});

test('getSafeStorage returns null outside a browser context', () => {
  assert.equal(getSafeStorage(), null);
});
