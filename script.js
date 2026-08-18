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

export const SOUND_PATTERNS = {
  X: [
    { frequency: 660, offset: 0, duration: 0.08, type: 'square', volume: 0.035 }
  ],
  O: [
    { frequency: 420, offset: 0, duration: 0.1, type: 'sine', volume: 0.05 }
  ],
  win: [
    { frequency: 523.25, offset: 0.08, duration: 0.12, type: 'square', volume: 0.035 },
    { frequency: 659.25, offset: 0.2, duration: 0.12, type: 'square', volume: 0.035 },
    { frequency: 783.99, offset: 0.32, duration: 0.18, type: 'square', volume: 0.04 }
  ],
  draw: [
    { frequency: 220, offset: 0.08, duration: 0.15, type: 'sawtooth', volume: 0.035 },
    { frequency: 174.61, offset: 0.23, duration: 0.2, type: 'sawtooth', volume: 0.03 }
  ]
};

export function createSoundController(
  AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext
) {
  let audioContext = null;
  let enabled = true;

  function getAudioContext() {
    if (!AudioContextClass) {
      return null;
    }

    audioContext ??= new AudioContextClass();

    if (audioContext.state === 'suspended') {
      void audioContext.resume();
    }

    return audioContext;
  }

  function playPattern(pattern) {
    if (!enabled) {
      return;
    }

    const context = getAudioContext();

    if (!context) {
      return;
    }

    for (const note of pattern) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startTime = context.currentTime + note.offset;
      const peakTime = startTime + Math.min(0.01, note.duration / 3);
      const stopTime = startTime + note.duration;

      oscillator.type = note.type;
      oscillator.frequency.setValueAtTime(note.frequency, startTime);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(note.volume, peakTime);
      gain.gain.linearRampToValueAtTime(0.0001, stopTime);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startTime);
      oscillator.stop(stopTime + 0.02);
    }
  }

  return {
    isEnabled() {
      return enabled;
    },
    setEnabled(nextEnabled) {
      enabled = Boolean(nextEnabled);
      return enabled;
    },
    toggle() {
      enabled = !enabled;
      return enabled;
    },
    playMove(mark) {
      playPattern(SOUND_PATTERNS[mark] ?? []);
    },
    playResult(outcome) {
      if (outcome?.type === 'win' || outcome?.type === 'draw') {
        playPattern(SOUND_PATTERNS[outcome.type]);
      }
    }
  };
}

export function updateSoundButton(button, enabled) {
  button.dataset.soundEnabled = String(enabled);
  button.textContent = `Sound: ${enabled ? 'On' : 'Off'}`;
  button.setAttribute('aria-pressed', String(enabled));
  button.setAttribute('aria-label', enabled ? 'Mute sound' : 'Enable sound');
}

export function createGame(mode = 'local', difficulty = null, humanMark = 'X') {
  const isComputerGame = mode === 'computer';
  const selectedHumanMark = isComputerGame ? humanMark : null;

  return {
    mode,
    difficulty,
    humanMark: selectedHumanMark,
    computerMark: isComputerGame
      ? (selectedHumanMark === 'X' ? 'O' : 'X')
      : null,
    board: Array(9).fill(''),
    currentPlayer: 'X',
    outcome: null,
    scores: { X: 0, O: 0 }
  };
}

export function getParticipantLabel(game, mark) {
  if (game.mode === 'computer' && mark === game.computerMark) {
    return 'Computer';
  }

  return `Player ${mark}`;
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

  if (game.outcome?.type === 'win') {
    game.scores[game.outcome.winner] += 1;
  } else if (!game.outcome) {
    game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
  }

  return true;
}

export function resetRound(game) {
  game.board = Array(9).fill('');
  game.currentPlayer = 'X';
  game.outcome = null;
  return game;
}

function findImmediateMove(board, mark) {
  for (const index of getLegalMoves(board)) {
    const candidate = [...board];
    candidate[index] = mark;

    if (getOutcome(candidate)?.winner === mark) {
      return index;
    }
  }

  return null;
}

function scorePosition(board, currentMark, computerMark, depth) {
  const outcome = getOutcome(board);

  if (outcome?.type === 'win') {
    return outcome.winner === computerMark ? 10 - depth : depth - 10;
  }

  if (outcome?.type === 'draw') {
    return 0;
  }

  const nextMark = currentMark === 'X' ? 'O' : 'X';
  const scores = getLegalMoves(board).map((index) => {
    const candidate = [...board];
    candidate[index] = currentMark;
    return scorePosition(candidate, nextMark, computerMark, depth + 1);
  });

  return currentMark === computerMark
    ? Math.max(...scores)
    : Math.min(...scores);
}

function chooseOptimalMove(board, computerMark) {
  const humanMark = computerMark === 'X' ? 'O' : 'X';
  let bestMove = null;
  let bestScore = -Infinity;

  for (const index of getLegalMoves(board)) {
    const candidate = [...board];
    candidate[index] = computerMark;
    const score = scorePosition(candidate, humanMark, computerMark, 1);

    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }

  return bestMove;
}

export function chooseComputerMove(
  board,
  difficulty = 'easy',
  computerMark = 'O',
  random = Math.random
) {
  if (getOutcome(board)) {
    return null;
  }

  const legalMoves = getLegalMoves(board);

  if (legalMoves.length === 0) {
    return null;
  }

  if (difficulty === 'hard') {
    return chooseOptimalMove(board, computerMark);
  }

  if (difficulty === 'medium') {
    const winningMove = findImmediateMove(board, computerMark);

    if (winningMove !== null) {
      return winningMove;
    }

    const humanMark = computerMark === 'X' ? 'O' : 'X';
    const blockingMove = findImmediateMove(board, humanMark);

    if (blockingMove !== null) {
      return blockingMove;
    }
  }

  return legalMoves[Math.floor(random() * legalMoves.length)];
}

if (typeof document !== 'undefined') {
  const modeSelection = document.querySelector('#mode-selection');
  const modeHeading = document.querySelector('#mode-heading');
  const modeActions = document.querySelector('#mode-actions');
  const difficultySelection = document.querySelector('#difficulty-selection');
  const markSelection = document.querySelector('#mark-selection');
  const gameScreen = document.querySelector('#game');
  const modeLabel = document.querySelector('#mode-label');
  const status = document.querySelector('#status');
  const scoreXLabel = document.querySelector('#score-x-label');
  const scoreOLabel = document.querySelector('#score-o-label');
  const scoreX = document.querySelector('#score-x');
  const scoreO = document.querySelector('#score-o');
  const soundToggle = document.querySelector('#sound-toggle');
  const cells = [...document.querySelectorAll('[data-cell-index]')];
  const restartButton = document.querySelector('#restart');
  const roundActions = document.querySelector('#round-actions');
  const continueButton = document.querySelector('#continue');
  const newGameButton = document.querySelector('#new-game');
  let game = null;
  let pendingDifficulty = null;
  const renderedBoard = Array(9).fill('');
  const sound = createSoundController();

  function statusMessage() {
    if (game.outcome?.type === 'win') {
      return `${getParticipantLabel(game, game.outcome.winner)} wins!`;
    }

    if (game.outcome?.type === 'draw') {
      return 'Draw!';
    }

    return `${getParticipantLabel(game, game.currentPlayer)}'s turn (${game.currentPlayer})`;
  }

  function render() {
    status.textContent = statusMessage();
    status.classList.toggle('round-result', Boolean(game.outcome));
    status.dataset.result = game.outcome?.type ?? '';
    scoreXLabel.textContent = getParticipantLabel(game, 'X');
    scoreOLabel.textContent = getParticipantLabel(game, 'O');
    scoreX.textContent = game.scores.X;
    scoreO.textContent = game.scores.O;
    restartButton.hidden = Boolean(game.outcome);
    roundActions.hidden = !game.outcome;

    cells.forEach((cell, index) => {
      const mark = game.board[index];
      const isNewMark = Boolean(mark && renderedBoard[index] !== mark);
      const isWinningCell = game.outcome?.type === 'win' &&
        game.outcome.line.includes(index);
      const winOrder = isWinningCell
        ? game.outcome.line.indexOf(index)
        : 0;

      if (!mark) {
        cell.classList.remove('mark-enter');
      } else if (isNewMark) {
        cell.classList.add('mark-enter');
      }

      cell.textContent = mark;
      cell.dataset.mark = mark;
      cell.style.setProperty('--win-order', String(winOrder));
      cell.setAttribute('aria-label', mark ? `Cell ${index + 1}: ${mark}` : `Cell ${index + 1}`);
      cell.classList.toggle('winning-cell', isWinningCell);
      cell.disabled = Boolean(mark || game.outcome || (
        game.mode === 'computer' && game.currentPlayer === game.computerMark
      ));
      renderedBoard[index] = mark;
    });
  }

  function playComputerTurn() {
    if (
      game.mode !== 'computer' ||
      game.outcome ||
      game.currentPlayer !== game.computerMark
    ) {
      return;
    }

    const computerMove = chooseComputerMove(
      game.board,
      game.difficulty,
      game.computerMark
    );

    if (computerMove !== null) {
      const mark = game.computerMark;
      makeMove(game, computerMove);
      sound.playMove(mark);

      if (game.outcome) {
        sound.playResult(game.outcome);
      }
    }
  }

  function handleCellClick(event) {
    if (!game || (
      game.mode === 'computer' && game.currentPlayer === game.computerMark
    )) {
      return;
    }

    const index = Number(event.currentTarget.dataset.cellIndex);
    const mark = game.currentPlayer;

    if (!makeMove(game, index)) {
      return;
    }

    sound.playMove(mark);

    if (game.outcome) {
      sound.playResult(game.outcome);
    }

    render();
    playComputerTurn();
    render();
  }

  function startGame(mode, difficulty = null, humanMark = 'X') {
    game = createGame(mode, difficulty, humanMark);
    modeSelection.hidden = true;
    gameScreen.hidden = false;
    modeLabel.textContent = mode === 'computer'
      ? `Player ${game.humanMark} vs Computer (${game.computerMark}) · ${difficulty[0].toUpperCase()}${difficulty.slice(1)}`
      : 'Player X vs Player O';
    render();
    playComputerTurn();
    render();
  }

  function startFreshRound() {
    resetRound(game);
    render();
    playComputerTurn();
    render();
  }

  function showSetup() {
    game = null;
    pendingDifficulty = null;
    gameScreen.hidden = true;
    modeSelection.hidden = false;
    modeHeading.textContent = 'Choose a game';
    modeActions.hidden = false;
    difficultySelection.hidden = true;
    markSelection.hidden = true;
  }

  document.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.mode === 'computer') {
        modeHeading.textContent = 'Choose difficulty';
        modeActions.hidden = true;
        difficultySelection.hidden = false;
        return;
      }

      startGame('local');
    });
  });

  document.querySelectorAll('[data-difficulty]').forEach((button) => {
    button.addEventListener('click', () => {
      pendingDifficulty = button.dataset.difficulty;
      modeHeading.textContent = 'Choose your mark';
      difficultySelection.hidden = true;
      markSelection.hidden = false;
    });
  });

  document.querySelectorAll('[data-mark]').forEach((button) => {
    button.addEventListener('click', () => {
      startGame('computer', pendingDifficulty, button.dataset.mark);
    });
  });

  cells.forEach((cell) => cell.addEventListener('click', handleCellClick));

  updateSoundButton(soundToggle, sound.isEnabled());
  soundToggle.addEventListener('click', () => {
    updateSoundButton(soundToggle, sound.toggle());
  });
  restartButton.addEventListener('click', startFreshRound);
  continueButton.addEventListener('click', startFreshRound);
  newGameButton.addEventListener('click', showSetup);
}
