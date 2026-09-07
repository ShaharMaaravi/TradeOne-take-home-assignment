# Watchlist

A standalone React application for a Hebrew RTL Watchlist take-home assignment.
All market data will be simulated locally; no external market API is required.

## Current checkpoint

Step 3: static visual baseline. The RTL shell, toolbar, eleven-row watchlist table,
frozen charts, and bottom ticker are now visible. Prices stay fixed. Search, menu,
list-selection, and action buttons are intentionally disabled at this checkpoint;
live updates and interactions will arrive in subsequent reviewed steps.

## Run locally

Use Node.js 24 LTS and npm. The lockfile pins the dependency tree.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite.

## Commands

| Command              | Purpose                                   |
| -------------------- | ----------------------------------------- |
| `npm run dev`        | Start Vite with hot reload                |
| `npm run typecheck`  | Check application and configuration types |
| `npm run lint`       | Run Oxlint, including React Hooks rules   |
| `npm run build`      | Type-check and produce `dist/`            |
| `npm run preview`    | Serve the production build locally        |
| `npm test`           | Run unit/component tests once             |
| `npm run test:watch` | Run unit/component tests in watch mode    |
| `npm run test:e2e`   | Run Playwright browser tests              |

Unit/component tests cover domain consistency and chart edge cases. Playwright
checks the static page at 1440px and 1664px, mobile table scrolling at 390px, logo
loading, numeric text direction, browser errors, and the keyboard skip link. It
saves review screenshots under the ignored `test-results/` folder.

Before the first browser test run, run `npx playwright install chromium`.

## Structure

- `src/App.tsx`: application entry component.
- `src/components/layout/`: sidebar, top bar, market ticker, and application shell.
- `src/features/watchlist/components/`: table, toolbar, logos, and frozen SVG/CSS visuals.
- `src/styles/tokens.css`: shared reference colors and type sizes.
- `src/index.css`: minimal global styles and focus treatment.
- `src/test/setup.ts`: DOM matchers and component-test cleanup.
- `vitest.config.ts`: unit/component test configuration.
- `playwright.config.ts`: browser-test configuration.

- `src/features/watchlist/domain/`: readonly models, calculations, formatters, and tests.
- `src/features/watchlist/mock/`: instrument fixtures, seeded generation, pure tick function, and tests.

Shared UI primitives will be extracted when they have a real use case.

## Foundation decisions

- React with strict TypeScript and Vite for a client-only application.
- CSS Modules and CSS variables for precise, scoped styling.
- Hebrew language and RTL direction at the document root. English/numeric content
  can opt into LTR locally.
- React Strict Mode stays enabled to expose effect lifecycle problems early.
- Oxlint is the linter supplied by the current Vite template.
- Zustand and dnd-kit will be added when their corresponding features are built.

Repository: https://github.com/ShaharMaaravi/TradeOne-take-home-assignment

No deployment is configured yet.

## Mock-data contract

`createMockMarket(seed?, timestamp?)` returns a fresh catalogue of 17 US/Israeli
instruments, quotes, and four example lists (including an empty list). Default
seed 42 and a fixed UTC timestamp make repeated calls reproducible. Names and
prices are illustrative fixtures inspired by the video, not live or historical
market data. Logo URLs are optional; actual assets belong to the visual work.

`advanceMockMarket(market, { seed, timestamp, updateProbability? })` returns an
immutable update. The timestamp must be newer than existing quotes. A tick
selects about 35% of instruments by default, moves prices by up to 0.2% before
rounding, increases traded-unit volume, and retains at most 60 intraday points.
The caller supplies each tick's seed and clock; there is no internal timer or
`Math.random()`/`Date.now()` dependency. A future timer will advance the seed per
tick. Fixed inputs provide a frozen/replayable mode for tests and visual checks.

All quote prices use the instrument's declared unit: USD, ILS, or ILA (agorot).
The Israeli fixtures use whole agorot. Do not display them as shekels without
explicit conversion. Volume is traded units, not turnover. These are deliberately
simple demo market rules, not exchange-specific tick-size rules.

Daily change compares with previous close; tick direction compares with the last
price. Thirty prior daily closes support the 30-day return and 13 trend segments
(the final segment compares today's price with previous close). Missing 30-day
history yields an unavailable return; flat ranges yield a centered marker. Daily
extremes survive intraday-history trimming. The simulator models one session;
session rollover is outside this assignment's current scope.

Number formatting uses consistent Latin digits for mixed Hebrew/English rows.
Wrap rendered numeric values in LTR/bidi-isolated elements when building the table.
Missing/non-finite values display an em dash, while zero remains a valid value.

## Visual baseline and known differences

The desktop proportions follow the supplied 832×464 recording, reviewed at a
1664×928 viewport. Assistant is bundled locally as a close Hebrew font match;
the recording does not identify the original font. Spacing scales within bounded
sizes. The table keeps all columns in a horizontal scroller on narrow screens,
with a sticky security identity column. More extensive mobile navigation and
accessibility refinement remains planned for step 8.

The PDF requires absolute change, so the table includes a separate change column
in addition to percentage change. Amot was added to the mock catalogue to match
the reference's eleven visible rows. Chart paths and returns come from seeded
mock data and will not equal the recording's market values. The index ticker is
also a static illustrative fixture at this stage.

Apple, Meta, and Shopify marks are bundled SVG assets. The remaining company
marks and the platform wordmark are approximations with local fallbacks; exact
original artwork was not supplied. No external image/font request is needed at
runtime. See `THIRD_PARTY_NOTICES.md` for asset sources and licenses.
