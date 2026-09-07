# Watchlist

A standalone React application for a Hebrew RTL Watchlist take-home assignment.
All market data will be simulated locally; no external market API is required.

## Current checkpoint

Step 1: project foundations. The screen is a temporary placeholder, not the final
Watchlist UI. Mock data, charts, watchlist interactions, and responsive application
layout will be added in subsequent reviewed steps.

## Run locally

Use Node.js 24 LTS and npm. The lockfile pins the dependency tree.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite with hot reload |
| `npm run typecheck` | Check application and configuration types |
| `npm run lint` | Run Oxlint, including React Hooks rules |
| `npm run build` | Type-check and produce `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run unit/component tests once |
| `npm run test:watch` | Run unit/component tests in watch mode |
| `npm run test:e2e` | Run Playwright browser tests |

The test harnesses are configured, but this foundation checkpoint has no test
cases yet. Vitest reports no tests until the domain behavior is introduced in
step 2. Before running future browser tests, run `npx playwright install chromium`.

## Structure

- `src/App.tsx`: application entry component.
- `src/App.module.css`: scoped component styles.
- `src/styles/tokens.css`: provisional shared color tokens.
- `src/index.css`: minimal global styles and focus treatment.
- `src/test/setup.ts`: DOM matchers and component-test cleanup.
- `vitest.config.ts`: unit/component test configuration.
- `playwright.config.ts`: browser-test configuration.

Feature code will live under `src/features/watchlist/` as it is introduced;
shared UI primitives will be extracted when they have a real use case.

## Foundation decisions

- React with strict TypeScript and Vite for a client-only application.
- CSS Modules and CSS variables for precise, scoped styling.
- Hebrew language and RTL direction at the document root. English/numeric content
  can opt into LTR locally.
- React Strict Mode stays enabled to expose effect lifecycle problems early.
- Oxlint is the linter supplied by the current Vite template.
- Zustand and dnd-kit will be added when their corresponding features are built.

The Hebrew font and color tokens are provisional until reference matching in
step 3. Repository: https://github.com/ShaharMaaravi/TradeOne-take-home-assignment

No deployment is configured yet.
