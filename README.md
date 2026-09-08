# Watchlist

A standalone React clone of the Hebrew RTL Watchlist screen supplied for the
TradeOne frontend take-home assignment. All prices, lists, and chart data are
simulated locally; no backend, API key, or environment file is required.

[Source repository](https://github.com/ShaharMaaravi/TradeOne-take-home-assignment)

**Live demo:** [https://shahar-tradeone-watchlist.netlify.app](https://shahar-tradeone-watchlist.netlify.app)

## Run locally

Use Node.js 24 (`.nvmrc`) and npm:

```sh
nvm use
npm ci
npm run dev
```

If you do not use nvm, install Node.js 24 directly and omit `nvm use`.
Open the URL printed by Vite. To check the production build:

```sh
npm run build
npm run preview
```

## Review the app

| URL / action                     | What to review                                               |
| -------------------------------- | ------------------------------------------------------------ |
| `/`                              | Live mock prices, charts, daily ranges and market ticker     |
| `/?live=0`                       | Frozen data for visual comparison; playback can be resumed   |
| `/?live=0&scenario=load-error`   | Loading failure followed by a successful Retry               |
| List dropdown → רשימה חדשה       | Empty-list state and adding its first security               |
| הוסף נייר                        | Catalogue search, category tabs and heart membership toggles |
| Column headings / sliders button | Three-state sorting and combined filters                     |
| List Actions → עריכת רשימה       | Draft removal/reorder with Save and Cancel                   |
| List Actions                     | Rename, set default, and confirmed deletion                  |

Keyboard reordering: focus a drag handle, press Space, use arrow keys, then Space
to drop. Escape cancels a drag before closing the editor. On mobile, the table
and ticker scroll horizontally and navigation opens in a drawer. The list panel
fills the available viewport width and height, with internal table scrolling and
smooth chart/range transitions between quote updates.

## Stack and structure

React 19, TypeScript, and Vite provide a small client-only application. CSS Modules
and shared design tokens allow precise RTL styling. Zustand keeps domain state
and quote-level subscriptions; modal drafts stay local to their components.
Radix handles dialog/menu/tab focus behavior, and dnd-kit handles pointer and
keyboard sorting. Charts use lightweight SVG/CSS rather than a charting framework.

```text
src/
  components/layout/       Application shell, navigation, ticker
  components/ui/           Shared modal and recovery UI
  features/watchlist/
    domain/                Types, calculations, formatting, search/sort/filter
    mock/                  Fixtures and deterministic market simulation
    state/                 Instance-owned store and timer lifecycle
    components/            Watchlist table, controls and dialogs
  styles/                  Shared design tokens
  test/                    Component-test setup
 tests/e2e/                Interaction, visual, accessibility and workflow checks
 tests/production/         Production-bundle smoke checks
```

Detailed state rules, calculation conventions and design decisions are in
[Architecture and behavior](docs/ARCHITECTURE.md).

## Validation

```sh
npm run check
npx playwright install chromium firefox webkit
npm run test:e2e
npm run test:production
```

`check` runs lint, unit/component tests, type checking and the production build.
The full browser suite runs in Chromium; integrated recovery, cross-list workflow
and offline-live scenarios also run in Firefox and WebKit. Production smoke tests
serve `dist/` on port 4173 and check local assets, main interactions and recovery.
Use `npm run test:e2e -- --project=chromium` for a Chromium-only run.

| Command                             | Purpose                                    |
| ----------------------------------- | ------------------------------------------ |
| `npm run dev`                       | Development server                         |
| `npm run typecheck`                 | Strict TypeScript checks                   |
| `npm run lint`                      | Oxlint, including React Hooks rules        |
| `npm test` / `npm run test:watch`   | Unit/component tests, once / watch mode    |
| `npm run build` / `npm run preview` | Build / serve production output            |
| `npm run test:e2e`                  | Browser tests and axe accessibility checks |
| `npm run test:production`           | Build and test the production bundle       |

Screenshots and failure traces are saved in ignored `test-results/` directories.
See [submission review](docs/SUBMISSION.md) for a short walkthrough.

## Scope and known differences

- List changes and playback state reset on refresh. There is no backend or
  persistence; quotes represent one illustrative trading session.
- Charts and values are deterministic mock data, not the recording's real values.
  Israeli prices use agorot explicitly; sorting prices does not convert currencies.
- The PDF's absolute-change requirement adds a column beyond the video layout.
  Assistant is a close font match; several logos and the platform mark are
  approximations. Text and price colors are darker to improve contrast.
- The catalogue contains 17 securities across Stocks and ETFs. It does not invent
  unsupported instrument categories or recent-search history.
- Global/account/navigation destinations outside Watchlist and row trading menus
  are visual placeholders and disabled. Removal is available through the catalogue
  and list editor.
- Automated accessibility checks cover the page and dialogs; manual screen-reader
  certification and native-device testing have not been performed.
- Offline interaction works after initial loading. Offline installation/reloading
  is not provided.

## Deployment

Netlify configuration is included in `netlify.toml`: Node 24, `npm run build`,
and `dist/`. No runtime secrets or server functions are needed. Follow
[Netlify deployment](docs/DEPLOYMENT.md). The repository is currently private;
reviewer access must be arranged separately from the public demo.

Asset attribution is recorded in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
