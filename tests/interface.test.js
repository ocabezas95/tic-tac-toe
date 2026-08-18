import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('offers local and computer game modes', () => {
  assert.match(html, /data-mode="local"/);
  assert.match(html, /data-mode="computer"/);
});

test('offers a hidden Easy, Medium, and Hard computer difficulty step', () => {
  assert.match(html, /id="difficulty-selection"[^>]*hidden/);

  const difficulties = [...html.matchAll(/data-difficulty="([a-z]+)"/g)]
    .map((match) => match[1]);

  assert.deepEqual(difficulties, ['easy', 'medium', 'hard']);
});

test('offers a hidden X or O mark-selection step', () => {
  assert.match(html, /id="mark-selection"[^>]*hidden/);

  const marks = [...html.matchAll(/data-mark="([XO])"/g)]
    .map((match) => match[1]);

  assert.deepEqual(marks, ['X', 'O']);
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

test('provides a persistent score display during play', () => {
  assert.match(html, /class="scoreboard"/);
  assert.match(html, /id="score-x"/);
  assert.match(html, /id="score-o"/);
});

test('provides hidden Continue and New Game actions for finished rounds', () => {
  assert.match(html, /id="round-actions"[^>]*hidden/);
  assert.match(html, /id="continue"/);
  assert.match(html, /id="new-game"/);
});

test('provides a semantic CRT arcade shell', () => {
  assert.match(html, /<main[^>]*class="[^"]*arcade-cabinet[^"]*"/);
  assert.match(html, /<header[^>]*class="cabinet-header"/);
  assert.match(html, /class="crt-screen"/);
});

test('groups score, status, board, and game controls into labeled panels', () => {
  for (const panel of ['score', 'status', 'board', 'control']) {
    assert.match(
      html,
      new RegExp(`<section[^>]*class="${panel}-panel"[^>]*aria-label="[^"]+"`)
    );
  }
});

test('provides an accessible sound toggle with its enabled state exposed', () => {
  assert.match(html, /<button[^>]*id="sound-toggle"/);
  assert.match(html, /id="sound-toggle"[^>]*aria-pressed="true"/);
  assert.match(html, /id="sound-toggle"[^>]*aria-label="Mute sound"/);
  assert.match(html, /id="sound-toggle"[^>]*data-sound-enabled="true"/);
  assert.match(html, /id="sound-toggle"[^>]*>Sound: On<\/button>/);
});
