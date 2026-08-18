import test from 'node:test';
import assert from 'node:assert/strict';

import {
  WINNING_LINES,
  chooseComputerMove,
  createGame,
  getLegalMoves,
  getOutcome,
  makeMove,
  resetRound
} from '../script.js';

test('creates an empty local game with X to move', () => {
  const game = createGame();

  assert.equal(game.mode, 'local');
  assert.equal(game.difficulty, null);
  assert.equal(game.humanMark, null);
  assert.equal(game.computerMark, null);
  assert.deepEqual(game.board, Array(9).fill(''));
  assert.equal(game.currentPlayer, 'X');
  assert.equal(game.outcome, null);
  assert.deepEqual(game.scores, { X: 0, O: 0 });
});

test('stores the selected difficulty for a computer game', () => {
  const game = createGame('computer', 'hard', 'O');

  assert.equal(game.mode, 'computer');
  assert.equal(game.difficulty, 'hard');
  assert.equal(game.humanMark, 'O');
  assert.equal(game.computerMark, 'X');
  assert.equal(game.currentPlayer, 'X');
});

test('uses fixed participant labels for local and computer games', async () => {
  const scriptModule = await import('../script.js');

  assert.equal(typeof scriptModule.getParticipantLabel, 'function');

  const localGame = createGame();
  const computerGame = createGame('computer', 'medium', 'O');

  assert.equal(scriptModule.getParticipantLabel(localGame, 'X'), 'Player X');
  assert.equal(scriptModule.getParticipantLabel(localGame, 'O'), 'Player O');
  assert.equal(scriptModule.getParticipantLabel(computerGame, 'X'), 'Computer');
  assert.equal(scriptModule.getParticipantLabel(computerGame, 'O'), 'Player O');
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

test('awards one point to the winner exactly once', () => {
  const game = createGame();
  for (const index of [0, 3, 1, 4, 2]) makeMove(game, index);

  assert.deepEqual(game.scores, { X: 1, O: 0 });
  assert.equal(makeMove(game, 5), false);
  assert.deepEqual(game.scores, { X: 1, O: 0 });
});

test('awards no points for a draw', () => {
  const game = createGame();
  for (const index of [0, 1, 2, 4, 3, 5, 7, 6, 8]) makeMove(game, index);

  assert.deepEqual(game.outcome, { type: 'draw' });
  assert.deepEqual(game.scores, { X: 0, O: 0 });
});

test('Continue resets the round while preserving scores and setup choices', () => {
  const game = createGame('computer', 'hard', 'O');
  for (const index of [0, 3, 1, 4, 2]) makeMove(game, index);

  const scores = game.scores;
  const resetGame = resetRound(game);

  assert.equal(resetGame, game);
  assert.equal(game.mode, 'computer');
  assert.equal(game.difficulty, 'hard');
  assert.equal(game.humanMark, 'O');
  assert.equal(game.computerMark, 'X');
  assert.equal(game.scores, scores);
  assert.deepEqual(game.scores, { X: 1, O: 0 });
  assert.deepEqual(game.board, Array(9).fill(''));
  assert.equal(game.currentPlayer, 'X');
  assert.equal(game.outcome, null);
});

test('restarting an active round awards no point', () => {
  const game = createGame();
  makeMove(game, 0);
  makeMove(game, 4);

  resetRound(game);

  assert.deepEqual(game.scores, { X: 0, O: 0 });
  assert.deepEqual(game.board, Array(9).fill(''));
  assert.equal(game.currentPlayer, 'X');
});

test('a new game resets an existing series score', () => {
  const series = createGame();
  for (const index of [0, 3, 1, 4, 2]) makeMove(series, index);

  const newGame = createGame(series.mode, series.difficulty, series.humanMark ?? 'X');

  assert.deepEqual(series.scores, { X: 1, O: 0 });
  assert.deepEqual(newGame.scores, { X: 0, O: 0 });
});

test('a new game resets the board and starts with X', () => {
  const firstGame = createGame('computer', 'medium');
  makeMove(firstGame, 0);

  const restartedGame = createGame(firstGame.mode, firstGame.difficulty);

  assert.equal(restartedGame.mode, 'computer');
  assert.equal(restartedGame.difficulty, 'medium');
  assert.deepEqual(restartedGame.board, Array(9).fill(''));
  assert.equal(restartedGame.currentPlayer, 'X');
});

test('Easy chooses a random legal move', () => {
  const board = ['X', 'O', '', 'X', 'O', '', '', '', ''];
  let move;

  assert.deepEqual(getLegalMoves(board), [2, 5, 6, 7, 8]);
  assert.doesNotThrow(() => {
    move = chooseComputerMove(board, 'easy', 'O', () => 0.4);
  });
  assert.equal(move, 6);
  assert.equal(chooseComputerMove(Array(9).fill('X'), 'easy', 'O'), null);
});

test('every difficulty chooses only an available cell', () => {
  const board = [
    'X', 'O', 'X',
    'O', '', '',
    'X', '', 'O'
  ];
  const legalMoves = getLegalMoves(board);

  for (const difficulty of ['easy', 'medium', 'hard']) {
    const move = chooseComputerMove(board, difficulty, 'X', () => 0.5);

    assert.ok(
      legalMoves.includes(move),
      `${difficulty} selected unavailable cell ${move}`
    );
  }
});

test('every difficulty stops choosing moves after the round ends', () => {
  const finishedBoard = [
    'X', 'X', 'X',
    'O', 'O', '',
    '', '', ''
  ];

  for (const difficulty of ['easy', 'medium', 'hard']) {
    assert.equal(
      chooseComputerMove(finishedBoard, difficulty, 'O', () => 0),
      null,
      `${difficulty} chose a move after the round ended`
    );
  }
});

test('Medium wins immediately before considering a block', () => {
  const board = [
    'O', 'O', '',
    'X', 'X', '',
    '', '', ''
  ];
  let move;

  assert.doesNotThrow(() => {
    move = chooseComputerMove(board, 'medium', 'O', () => 0.5);
  });
  assert.equal(move, 2);
});

test('Medium blocks an immediate loss', () => {
  const board = [
    'X', 'X', '',
    'O', '', '',
    '', '', ''
  ];
  let move;

  assert.doesNotThrow(() => {
    move = chooseComputerMove(board, 'medium', 'O', () => 0.5);
  });
  assert.equal(move, 2);
});

test('Medium otherwise chooses a random legal move', () => {
  const board = [
    'X', '', '',
    '', 'O', '',
    '', '', ''
  ];
  let move;

  assert.doesNotThrow(() => {
    move = chooseComputerMove(board, 'medium', 'O', () => 0.5);
  });
  assert.equal(move, 5);
});

function assertHardCannotLose(computerMark) {
  const humanMark = computerMark === 'X' ? 'O' : 'X';
  const visited = new Set();

  function explore(board, currentMark) {
    const outcome = getOutcome(board);

    if (outcome) {
      assert.notEqual(
        outcome.winner,
        humanMark,
        `Hard ${computerMark} lost from board ${board.join('')}`
      );
      return;
    }

    const stateKey = `${board.join('-')}:${currentMark}`;

    if (visited.has(stateKey)) {
      return;
    }

    visited.add(stateKey);

    if (currentMark === computerMark) {
      const move = chooseComputerMove(board, 'hard', computerMark, () => 0);
      assert.ok(getLegalMoves(board).includes(move));
      const nextBoard = [...board];
      nextBoard[move] = computerMark;
      explore(nextBoard, humanMark);
      return;
    }

    for (const move of getLegalMoves(board)) {
      const nextBoard = [...board];
      nextBoard[move] = humanMark;
      explore(nextBoard, computerMark);
    }
  }

  explore(Array(9).fill(''), 'X');
}

test('Hard cannot be defeated when playing X or O', () => {
  assertHardCannotLose('X');
  assertHardCannotLose('O');
});
