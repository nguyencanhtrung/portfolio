import assert from 'node:assert/strict';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { buildThemeBootstrap } from '../scripts/theme-bootstrap.mjs';

const script = buildThemeBootstrap();
function beforeBody({ stored = null, dark = false, blocked = false } = {}) {
  const document = {
    documentElement: { dataset: {} }, readyState: 'loading',
    addEventListener(type) { assert.equal(type, 'DOMContentLoaded'); },
    getElementById() { throw new Error('Body has not been parsed yet'); },
  };
  const window = {
    matchMedia: () => ({ matches: dark }),
    get localStorage() {
      if (blocked) throw new Error('Storage unavailable');
      return { getItem: () => stored, setItem() {} };
    },
  };
  runInNewContext(script, { document, window });
  return document.documentElement.dataset.theme;
}

test('stored dark theme applies synchronously before the body is parsed', () => {
  assert.equal(beforeBody({ stored: 'dark' }), 'dark');
});
test('system dark preference applies before the body without a saved preference', () => {
  assert.equal(beforeBody({ dark: true }), 'dark');
});
test('blocked storage and invalid values keep early fallback safe', () => {
  assert.equal(beforeBody({ blocked: true, dark: true }), 'dark');
  assert.equal(beforeBody({ stored: 'invalid', dark: false }), 'light');
});
