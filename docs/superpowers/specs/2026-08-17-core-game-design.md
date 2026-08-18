# Core Tic-Tac-Toe Game Design

## Scope

Implement the first unchecked item in `SPEC.md`: deliver a playable browser-based tic-tac-toe game supporting local two-player and player-versus-computer modes.

This increment intentionally uses a random-move computer opponent. Difficulty selection, score tracking, richer presentation, audio, and the more detailed controls listed later in `SPEC.md` remain out of scope.

## Structure

- `index.html` provides mode selection, status text, the nine-cell game board, and a restart control.
- `style.css` provides a minimal usable layout and clear interactive states without implementing the later visual-experience requirements.
- `script.js` contains in-memory game state, pure game-rule functions, and DOM event/rendering behavior.
- `tests/` contains dependency-free automated tests run with Node's built-in test runner.

The game-rule functions stay independent of the DOM where practical. This keeps win, draw, and computer-move behavior directly testable while preserving the repository's flat, dependency-free design.

## Behavior

The page initially offers Local Two Player and Play Computer modes. Starting either mode creates an empty board with X to move.

In local mode, X and O alternate after each legal move. In computer mode, the human controls X and the computer controls O. After each legal human move that does not end the round, the computer chooses one of the remaining legal cells at random.

The game detects wins across all rows, columns, and diagonals, as well as draws. Once a round ends, no additional moves are accepted. Restart clears the board, preserves the selected mode, and starts again with X.

All state is held in memory, so refreshing the page returns to the initial mode-selection state.

## Rendering and Accessibility

The board uses nine distinct buttons so it works with standard pointer and keyboard input. Status text announces the current turn, winner, or draw. Occupied cells and the completed board reject further input through both UI state and game-rule validation.

## Verification

Automated tests cover the core rule boundaries introduced by this increment: legal move placement, alternating local turns, win detection, draw detection, rejection of occupied cells, rejection after round completion, restart behavior, and legality of random computer moves.

Manual browser checks confirm that both modes can be selected and played, the computer responds only when the round remains active, status text follows the game, completed boards stop accepting moves, and Restart produces a fresh X-first round.
