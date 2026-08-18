import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../style.css', import.meta.url), 'utf8');
const script = await readFile(new URL('../script.js', import.meta.url), 'utf8');

test('defines the approved dark neon palette and monospace type', () => {
  assert.match(css, /color-scheme:\s*dark/);
  assert.match(css, /--neon-cyan:\s*#[0-9a-f]{6}/i);
  assert.match(css, /--neon-magenta:\s*#[0-9a-f]{6}/i);
  assert.match(css, /--neon-violet:\s*#[0-9a-f]{6}/i);
  assert.match(css, /font-family:[^;]*(?:monospace|Courier)/i);
});

test('styles the arcade cabinet, CRT screen, and scanline overlay', () => {
  assert.match(css, /\.arcade-cabinet\s*{/);
  assert.match(css, /\.crt-screen\s*{/);
  assert.match(css, /(?:body|\.crt-screen)::(?:before|after)\s*{/);
  assert.match(css, /repeating-linear-gradient/);
});

test('renders X and O with distinct neon hooks and colors', () => {
  assert.match(script, /cell\.dataset\.mark\s*=\s*mark/);
  assert.match(css, /\.cell\[data-mark="X"\]/);
  assert.match(css, /\.cell\[data-mark="O"\]/);
  assert.match(css, /\.cell\[data-mark="X"\][^{]*{[^}]*var\(--neon-cyan\)/s);
  assert.match(css, /\.cell\[data-mark="O"\][^{]*{[^}]*var\(--neon-magenta\)/s);
  assert.match(css, /\.cell\.winning-cell\[data-mark="X"\][^{]*{[^}]*var\(--neon-cyan\)/s);
  assert.match(css, /\.cell\.winning-cell\[data-mark="O"\][^{]*{[^}]*var\(--neon-magenta\)/s);
});

test('provides neon keyboard focus and responsive phone styling', () => {
  assert.match(css, /button:focus-visible\s*{/);
  assert.match(css, /outline:[^;]*var\(--neon-cyan\)/);
  assert.match(css, /@media\s*\(max-width:\s*30rem\)/);
  assert.match(css, /\.game-board\s*{[^}]*width:\s*min\(/s);
});
