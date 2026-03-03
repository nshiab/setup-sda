# Refactoring Plan: setup-sda

The goal is to transform the monolithic `setup-sda.mjs` into a modular,
testable, and maintainable TypeScript project while preserving its
"zero-install" capability for `npx`, `deno run`, and `bunx`.

## Phase 1: Baseline Integration Testing (CRITICAL)
Establish a "green" state by verifying the current CLI behavior across all major
runtimes.

- [x] **`tests/helpers.ts`**: Define `runCLI` and assertion logic.
- [x] **Modular Test Suites (Running on Deno, Node, Bun)**:
  - [x] `tests/base_test.ts`: Base setup, `--git`, `--env`, `--scrape`.
  - [x] `tests/agents_test.ts`: `--claude`, `--gemini`, `--copilot`.
  - [x] `tests/svelte_test.ts`: `--svelte`, `--pages`, `--example` combinations.
  - [x] `tests/combinations_test.ts`: "Kitchen sink" and edge-case flag
        combinations.
- [x] **Refinement**: Implement a lightweight verification mode in tests that
      skips heavy installations (if possible) while still checking file
      generation.

## Phase 2: Project Infrastructure & Build Pipeline
Set up the modern TypeScript structure and automated bundling.

- [x] **Directories**: Create `src/main.ts`, `src/helpers/`, `src/templates/`,
      `src/actions/`.
- [x] **Bundling Config**:
  - [x] Add `build` task to `deno.json`: `deno bundle src/main.ts -o setup-sda.mjs`.
  - [x] Create `scripts/build.ts` to wrap `deno bundle` and prepend the
        `#!/usr/bin/env node` shebang.
- [x] **Module Discovery**: Ensure all runtime-specific modules are correctly
      imported and bundled.

## Phase 3: Template Extraction & New Features
Move large template strings into dedicated files and add the new feature.

- [x] **CSS Templates**: `src/templates/css.ts` (style, highlight-theme).
- [x] **Svelte Templates**: `src/templates/svelte.ts` (components, pages,
      layouts).
- [x] **Config Templates**: `src/templates/configs.ts` (vite, tsconfig,
      deno/package.json).
- [x] **New Feature**: Add `--agent` flag support to generate `AGENTS.md`.
- [x] **Validation**: Run modular integration tests against a bundled version
      containing extracted templates and the new `--agent` flag.

## Phase 4: Logic Modularization & Final Polish
Break down the core logic into testable units.

- [x] **Action Modules**: `src/actions/` (git, env, scrape, agents, svelte).
- [x] **Refinement**: Move core setup logic into standalone functions in
      `src/actions/`.
- [x] **Cross-Runtime Check**: Final test run on Deno, Node, and Bun.
- [x] **Zero-Install Verification**: Simulate remote execution (`npx`,
      `deno run -A ./...`).
- [x] **Cleanup**: Remove legacy monolith and temporary build artifacts.
