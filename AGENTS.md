# Repository Guidelines

## Project Structure & Module Organization

This repository is a small, dependency-free browser game with a flat structure:

- `index.html` defines the page, game board, controls, and accessible labels.
- `style.css` contains layout, responsive behavior, and visual states.
- `script.js` owns game state, win detection, turn handling, and DOM updates.

Keep files focused on those responsibilities. Place tests in `tests/` with matching names, such as `tests/script.test.js`, and future media in `assets/`.

## Build, Test, and Development Commands

No package manager, build step, or test runner is configured. Run the site through a local HTTP server:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Record any future tooling commands here and in its manifest.

## Coding Style & Naming Conventions

Use simple vanilla JavaScript by default; do not add dependencies when browser APIs suffice. Extract reusable functions or modules when they reduce duplication or clarify responsibilities, but avoid premature abstraction. Use two-space indentation in HTML, CSS, and JavaScript. Prefer semantic HTML and kebab-case CSS classes (`game-board`). Use camelCase for JavaScript names (`currentPlayer`) and `UPPER_SNAKE_CASE` for constants. Favor `const`, use `let` only for reassignment, and separate UI rendering from game rules. No formatter or linter is configured; match surrounding code.

## Testing Guidelines

Use both automated tests and manual browser checks; neither replaces the other. There is no test runner configured yet, so introduce a minimal setup when adding testable game logic and document its command. Prioritize pure logic such as win detection, draws, invalid moves, and state resets; name test files `*.test.js`. Manually verify player turns, every winning line, draws, restart behavior, keyboard interaction, and narrow and wide viewport layouts.

## Communication & Explanations

Explain work step by step. Describe what changed, why each meaningful decision was made, and how the result was tested. Include relevant commands and file paths so another contributor can reproduce the work. Call out assumptions, tradeoffs, and any verification that could not be completed.

## Commit & Pull Request Guidelines

No Git history is available, so no commit convention is established. Use short, imperative subjects such as `Add draw-state handling`. Pull requests should explain behavior changes, list checks, link related issues, and include screenshots or recordings for visual changes.
