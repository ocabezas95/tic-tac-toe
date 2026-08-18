import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('offers local and computer game modes', () => {
  assert.match(html, /data-mode="local"/);
  assert.match(html, /data-mode="computer"/);
});

test('provides a status region and nine distinct board cells', () => {
  assert.match(html, /id="status"[^>]*role="status"/);

  const cellIndexes = [...html.matchAll(/data-cell-index="(\d)"/g)]
    .map((match) => Number(match[1]));

  assert.deepEqual(cellIndexes, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
});

test('provides restart and loads the game controller as a module', () => {
  assert.match(html, /id="restart"/);
  assert.match(html, /<script[^>]*type="module"[^>]*src="script\.js"/);
});
