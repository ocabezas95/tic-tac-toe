import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../style.css', import.meta.url), 'utf8');
const script = await readFile(new URL('../script.js', import.meta.url), 'utf8');

test('marks only newly rendered moves for the glitch-pop animation', () => {
  assert.match(script, /const isNewMark\s*=\s*Boolean\(/);
  assert.match(script, /cell\.classList\.add\('mark-enter'\)/);
  assert.match(script, /cell\.classList\.remove\('mark-enter'\)/);
  assert.match(css, /\.cell\.mark-enter\s*{[^}]*animation:[^;]*mark-glitch-pop/s);
  assert.match(css, /@keyframes\s+mark-glitch-pop/);
});

test('assigns winning cells an order for a sequenced pulse', () => {
  assert.match(script, /--win-order/);
  assert.match(script, /game\.outcome\.line\.indexOf\(index\)/);
  assert.match(css, /\.cell\.winning-cell\s*{[^}]*animation:[^;]*win-sequence-pulse/s);
  assert.match(css, /animation-delay:\s*calc\(var\(--win-order\)\s*\*\s*120ms\)/);
});

test('emphasizes completed-round status without replacing its live text', () => {
  assert.match(script, /status\.classList\.toggle\('round-result',\s*Boolean\(game\.outcome\)\)/);
  assert.match(css, /\.round-result\s*{[^}]*animation:[^;]*result-signal/s);
  assert.match(css, /@keyframes\s+result-signal/);
});

test('disables decorative motion when reduced motion is requested', () => {
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /\.cell\.mark-enter[\s\S]*\.cell\.winning-cell[\s\S]*\.round-result[^{]*{[^}]*animation:\s*none/s);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.cell\.mark-enter\.winning-cell[^{]*{[^}]*animation:\s*none/s);
});
