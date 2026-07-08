# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`use-time-hooks` is a published npm library (`use-time-hooks`) of TypeScript-first React hooks for time-based operations. React is a **peer** dependency (`>=16.8.0`); the library ships as dual ESM/CJS with generated `.d.ts` types. Only `dist/` is published.

## Commands

Run from the repo root unless noted:

- The root development toolchain requires Node `>=22.22.1`, matching [package.json](package.json). The separate [demos/](demos/) app requires Node `>=20.19.0`.
- `npm run build` — bundle `src/index.ts` to CJS + ESM + types via tsup (output in `dist/`)
- `npm run test` / `npm run test:run` — Vitest (watch / single run)
- `npm run test:run -- tests/useInterval.test.ts` — run a single test file
- `npm run test:run -- -t "should stop"` — run tests matching a name
- `npm run test:coverage` — Vitest with v8 coverage; enforces the `thresholds` in [vitest.config.ts](vitest.config.ts) (fails if coverage drops below them)
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` / `npm run lint:fix` — ESLint (zero-warnings enforced via `--max-warnings 0`)
- `npm run validate` — typecheck + lint + test:run; this is the gate `prepublishOnly` runs before publish
- `*:all` variants (`typecheck:all`, `lint:fix:all`, `format:all`) also cover the `demos/` sub-project

The Husky pre-commit hook runs `npm run precommit` (typecheck + lint-staged) **and** the full test suite, so commits fail on any type error, lint warning, or failing test.

## Architecture

- **One hook per file** in [src/](src/), each self-contained: it exports the hook function plus its own TypeScript interfaces (return type, options, and any domain types like `LapTime`, `ExecutionStep`, `RetryState`). There is no shared utility layer — hooks do not import each other.
- **[src/index.ts](src/index.ts) is the only public surface.** Every hook and its public types are re-exported here. Note imports use `.js` extensions (e.g. `from './useInterval.js'`) — required by the `node16` module resolution in [tsconfig.json](tsconfig.json) even though the sources are `.ts`. When adding a hook: create `src/useX.ts`, then add both the value export and a `export type { ... }` line in `index.ts`.
- **Tests** live in [tests/](tests/), one `*.test.ts` per hook, run under Vitest with the `happy-dom` environment and `@testing-library/react`. `tests/setupTests.ts` is the global setup. Tests rely on fake timers to drive time-based behavior — follow the existing files' patterns when testing a new hook.

### Hook conventions

The hooks follow a consistent internal pattern worth matching:

- A `useRef` holds the latest callback, refreshed in a `useEffect` keyed on the callback, so the timer always calls the current closure without resetting on every render (see [src/useInterval.ts](src/useInterval.ts)).
- Timer IDs are stored in refs and cleared imperatively on stop/reset. The effect that _creates_ a timer also clears it in its cleanup, which covers unmount — so no separate unmount effect is needed for timers owned by an effect (a few hooks that create timers outside an effect keep a dedicated cleanup effect).
- Effects that drive timers depend only on the state that should (re)start them (e.g. `isRunning`/`delay`), never on per-tick counters — otherwise the timer is torn down and recreated on every tick.
- Control hooks expose a uniform imperative API (`start`, `stop`/`pause`, `reset`, `toggle`) alongside reactive state (`isRunning`, counts, `timeRemaining`, etc.).

## demos/

[demos/](demos/) is a **separate Vite + React 19 + Tailwind v4 app** with its own `package.json`, `node_modules`, ESLint config, and tsconfig — it is excluded from the root tsconfig, vitest, and eslint runs. It consumes `use-time-hooks` as a dependency to showcase each hook. Run it with `cd demos && npm install && npm run dev`. It is not part of the published package.

## Toolchain constraints

These constraints are deliberate. Before bumping them, verify the current peer/engine ranges and run the full validation set:

- **`eslint` / `@eslint/js` stay on 9.x** while `eslint-plugin-react@7.37.5` is still in the lint stack and its peer range does not include ESLint 10. Moving to ESLint 10 requires first dropping or replacing `eslint-plugin-react`.
- **`typescript` stays on 6.0.x** because `typescript-eslint@8.63.0` requires `typescript >=4.8.4 <6.1.0`. TypeScript 6.1+ or 7.x breaks the type-checked lint config.
- **`overrides.esbuild` in [package.json](package.json)** forces esbuild to `^0.28.1` to close a low-severity advisory. `tsup@8.5.1` depends on `esbuild@^0.27.0`, so `npm audit fix` alone can't resolve it — the override is required. Remove it only once tsup ships a build on esbuild ≥0.28.1.
- **`ignoreDeprecations: "6.0"` in [tsconfig.json](tsconfig.json)** silences TS5101: tsup injects the deprecated `baseUrl` option during its `.d.ts` build, which TS 6.x treats as an error. Without it, `npm run build` fails at the DTS step (the JS bundles still succeed).

## Also

- Runnable per-hook usage examples (TS + JS) live in [examples/](examples/); these are excluded from build/test/typecheck.
- Formatting is Prettier-enforced; lint-staged formats/lints staged files on commit.
