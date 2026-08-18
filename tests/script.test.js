import test from 'node:test';
import assert from 'node:assert/strict';

import {
  WINNING_LINES,
  chooseComputerMove,
  createGame,
  getLegalMoves,
  getOutcome,
  makeMove
} from '../script.js';

test('creates an empty local game with X to move', () => {
  const game = createGame();

  assert.equal(game.mode, 'local');
  assert.deepEqual(game.board, Array(9).fill(''));
  assert.equal(game.currentPlayer, 'X');
  assert.equal(game.outcome, null);
});

test('places legal moves and alternates players', () => {
  const game = createGame();

  assert.equal(makeMove(game, 0), true);
  assert.equal(game.board[0], 'X');
  assert.equal(game.currentPlayer, 'O');
  assert.equal(makeMove(game, 4), true);
  assert.equal(game.board[4], 'O');
  assert.equal(game.currentPlayer, 'X');
});

test('rejects a move in an occupied cell', () => {
  const game = createGame();
  makeMove(game, 0);

  assert.equal(makeMove(game, 0), false);
  assert.equal(game.board[0], 'X');
  assert.equal(game.currentPlayer, 'O');
});

test('detects every winning line', () => {
  assert.equal(WINNING_LINES.length, 8);

  for (const line of WINNING_LINES) {
    const board = Array(9).fill('');
    for (const index of line) board[index] = 'X';

    assert.deepEqual(getOutcome(board), {
      type: 'win',
      winner: 'X',
      line
    });
  }
});

test('detects a full-board draw', () => {
  const board = [
    'X', 'O', 'X',
    'X', 'O', 'O',
    'O', 'X', 'X'
  ];

  assert.deepEqual(getOutcome(board), { type: 'draw' });
});

test('rejects moves after the round ends', () => {
  const game = createGame();
  for (const index of [0, 3, 1, 4, 2]) makeMove(game, index);

  assert.deepEqual(game.outcome, {
    type: 'win',
    winner: 'X',
    line: [0, 1, 2]
  });
  assert.equal(makeMove(game, 5), false);
  assert.equal(game.board[5], '');
});

test('a new game resets the board and starts with X', () => {
  const firstGame = createGame('computer');
  makeMove(firstGame, 0);

  const restartedGame = createGame(firstGame.mode);

  assert.equal(restartedGame.mode, 'computer');
  assert.deepEqual(restartedGame.board, Array(9).fill(''));
  assert.equal(restartedGame.currentPlayer, 'X');
});

test('lists legal moves and chooses one for the computer', () => {
  const board = ['X', 'O', '', 'X', 'O', '', '', '', ''];

  assert.deepEqual(getLegalMoves(board), [2, 5, 6, 7, 8]);
  assert.equal(chooseComputerMove(board, () => 0.4), 6);
  assert.equal(chooseComputerMove(Array(9).fill('X')), null);
});
