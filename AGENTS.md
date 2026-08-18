# Repository Guidelines

## Project Structure & Module Organization

This dependency-free browser game has a flat structure:

- `index.html` defines the page, game board, controls, and accessible labels.
- `style.css` contains layout, responsive behavior, and visual states.
- `script.js` owns game state, win detection, turn handling, and DOM updates.

Keep those responsibilities separate. Place matching tests in `tests/` and media in `assets/`.

## Build, Test, and Development Commands

No build or test tooling is configured. Serve the site locally with:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. Document future tooling in its manifest.

## Coding Style & Naming Conventions

Use vanilla JavaScript and browser APIs. Extract functions or modules only when they reduce duplication or clarify responsibilities. Use two-space indentation, semantic HTML, and kebab-case CSS classes (`game-board`). Use camelCase for JavaScript names (`currentPlayer`) and `UPPER_SNAKE_CASE` for constants. Favor `const`, use `let` only for reassignment, and separate UI rendering from game rules. No formatter or linter is configured; match surrounding code.

## Testing Guidelines

Use both automated tests and manual browser checks. No test runner is configured yet; introduce a minimal setup with the first testable game logic and document its command. Prioritize win detection, draws, invalid moves, and state resets; name files `*.test.js`. Manually verify turns, winning lines, draws, restarts, mouse and touch interaction, and narrow and wide layouts.

## Communication & Explanations

Explain work step by step: what changed, why decisions were made, and how results were tested. Include reproducible commands and paths. Call out assumptions, tradeoffs, and incomplete verification.

## Sequential Specification Workflow

Treat `spec.md` as an ordered implementation queue. When the user says `next`:

1. Select only the first unchecked `- [ ]` item, reading from top to bottom.
2. State the selected item and the files expected to change.
3. Implement only that item, except for strictly required prerequisites, and run relevant automated and manual checks.
4. Mark the item `- [x]` only after successful verification.
5. Report changed files, decisions, and verification results, then stop for user review.

Do not begin another item until the user says `next` again. If the item is ambiguous or blocked, leave it unchecked and ask one focused question.

## Commit & Pull Request Guidelines

The limited history establishes no firm convention. Use imperative subjects such as `Add draw-state handling`. Pull requests should explain changes and checks, link issues, and include screenshots for visual work.
