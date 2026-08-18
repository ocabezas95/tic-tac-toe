export const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

export function createGame(mode = 'local') {
  return {
    mode,
    board: Array(9).fill(''),
    currentPlayer: 'X',
    outcome: null
  };
}

export function getLegalMoves(board) {
  return board.flatMap((cell, index) => cell === '' ? [index] : []);
}

export function getOutcome(board) {
  for (const line of WINNING_LINES) {
    const [first, second, third] = line;

    if (
      board[first] &&
      board[first] === board[second] &&
      board[first] === board[third]
    ) {
      return {
        type: 'win',
        winner: board[first],
        line
      };
    }
  }

  return board.every(Boolean) ? { type: 'draw' } : null;
}

export function makeMove(game, index) {
  const isInvalidIndex = !Number.isInteger(index) || index < 0 || index > 8;

  if (game.outcome || isInvalidIndex || game.board[index]) {
    return false;
  }

  game.board[index] = game.currentPlayer;
  game.outcome = getOutcome(game.board);

  if (!game.outcome) {
    game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
  }

  return true;
}

export function chooseComputerMove(board, random = Math.random) {
  const legalMoves = getLegalMoves(board);

  if (legalMoves.length === 0) {
    return null;
  }

  return legalMoves[Math.floor(random() * legalMoves.length)];
}

if (typeof document !== 'undefined') {
  const modeSelection = document.querySelector('#mode-selection');
  const gameScreen = document.querySelector('#game');
  const modeLabel = document.querySelector('#mode-label');
  const status = document.querySelector('#status');
  const cells = [...document.querySelectorAll('[data-cell-index]')];
  const restartButton = document.querySelector('#restart');
  let game = null;

  function statusMessage() {
    if (game.outcome?.type === 'win') {
      return `${game.outcome.winner} wins!`;
    }

    if (game.outcome?.type === 'draw') {
      return 'Draw!';
    }

    if (game.mode === 'computer') {
      return game.currentPlayer === 'X' ? 'Your turn (X)' : "Computer's turn (O)";
    }

    return `${game.currentPlayer}'s turn`;
  }

  function render() {
    status.textContent = statusMessage();

    cells.forEach((cell, index) => {
      const mark = game.board[index];
      cell.textContent = mark;
      cell.setAttribute('aria-label', mark ? `Cell ${index + 1}: ${mark}` : `Cell ${index + 1}`);
      cell.disabled = Boolean(mark || game.outcome || (
        game.mode === 'computer' && game.currentPlayer === 'O'
      ));
    });
  }

  function playComputerTurn() {
    if (game.mode !== 'computer' || game.outcome || game.currentPlayer !== 'O') {
      return;
    }

    const computerMove = chooseComputerMove(game.board);

    if (computerMove !== null) {
      makeMove(game, computerMove);
    }
  }

  function handleCellClick(event) {
    if (!game || (game.mode === 'computer' && game.currentPlayer === 'O')) {
      return;
    }

    const index = Number(event.currentTarget.dataset.cellIndex);

    if (!makeMove(game, index)) {
      return;
    }

    render();
    playComputerTurn();
    render();
  }

  function startGame(mode) {
    game = createGame(mode);
    modeSelection.hidden = true;
    gameScreen.hidden = false;
    modeLabel.textContent = mode === 'computer' ? 'You are X · Computer is O' : 'Local Two Player';
    render();
  }

  document.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => startGame(button.dataset.mode));
  });

  cells.forEach((cell) => cell.addEventListener('click', handleCellClick));

  restartButton.addEventListener('click', () => {
    game = createGame(game.mode);
    render();
  });
}
