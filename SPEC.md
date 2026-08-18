# Tic-Tac-Toe Specification

## Product Goal

- [x] Deliver a browser-based tic-tac-toe game for local two-player and player-versus-computer play.
- [x] Use vanilla HTML, CSS, and JavaScript, extracting reusable functions or modules only where they clarify game rules, AI, UI, or audio behavior.
- [x] Keep all state in memory; reloading the page resets the game and scores.

## Game Setup

- [x] Present a setup screen with Local Two Player and Play Computer modes.
- [x] In computer mode, let the human choose Easy, Medium, or Hard difficulty.
- [x] In computer mode, let the human choose X or O before play begins.
- [x] Use fixed participant labels: Player X, Player O, and Computer.

## Board and Turn Behavior

- [x] Render an interactive 3×3 grid with nine distinct cells.
- [x] Alternate turns between X and O in local two-player mode.
- [x] Prevent moves in occupied cells and prevent additional moves after a round ends.
- [x] Clearly display whose turn it is and which mark the human or computer controls.

## Computer Opponent

- [x] Easy chooses randomly from legal cells.
- [x] Medium takes an immediate winning move, blocks an immediate loss, and otherwise chooses from legal cells with some randomness.
- [x] Hard uses optimal play and cannot be defeated.
- [x] Ensure every difficulty selects only legal moves and stops acting after the round ends.

## Results and Scoring

- [x] Detect wins across all three rows, all three columns, and both diagonals.
- [x] Detect a draw when all cells are occupied without a winner.
- [x] Announce the winner or draw, visually highlight a winning line, and disable the finished board.
- [x] Award one point to the round winner and zero points for a draw.
- [x] Display the current series score throughout play.
- [x] After a round, provide Continue to clear the board, retain scores and setup choices, and start again with X.
- [x] After a round, provide New Game to reset scores and return to the setup screen.
- [x] During an active round, provide Restart to clear only the board, preserve scores and setup choices, award no point, and start again with X.

## Visual and Audio Experience

- [x] Update `index.html` with a semantic Retro CRT arcade shell, clearly grouped score, status, board, and control panels, plus an accessible sound toggle.
- [x] Update `style.css` with a dark Neon Arcade theme: cyan X, magenta O, violet interface accents, monospace typography, scanlines, square geometry, neon interaction states, and responsive sizing that keeps the full game playable on phones and larger screens.
- [x] Update `style.css` and `script.js` with Full Arcade motion: glitch-pop placed marks, sequenced winning-cell pulses, and emphasized round results that never delay state updates and respect reduced-motion preferences.
- [x] Update `index.html` and `script.js` with sound enabled by default for the current page session, a persistent and clearly indicated mute control, distinct synthesized X and O bleeps, a win jingle, and a lower draw tone.

## Verification Checklist

- [x] Add automated tests for all eight winning lines, draws, alternating turns, occupied-cell rejection, scoring, Continue, Restart, and New Game behavior.
- [x] Add automated tests that Easy makes legal moves, Medium wins or blocks when possible, and Hard remains unbeaten across reachable game states.
- [x] Manually verify both game modes, all difficulties, both human mark choices, and X-first behavior.
- [x] Manually verify mouse and touch interactions, animations, sounds, and the sound toggle.
- [x] Manually verify the complete round and scoring flow on desktop and phone-sized viewports.
- [x] Confirm that refreshing the page clears all game state and scores.
