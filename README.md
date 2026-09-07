# Watchlist

A standalone React application for a Hebrew RTL Watchlist take-home assignment.
All market data will be simulated locally; no external market API is required.

## Current checkpoint

Step 9: integration checks and error recovery. A retryable loading-error scenario
and rendering error boundary now complement the loading and empty states. The
combined list workflow, retry recovery and offline live simulation are verified
in Chromium, Firefox and WebKit. Changes currently reset on refresh.

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

Unit/component tests cover domain consistency, chart edge cases, deterministic
store replay, timer cleanup under Strict Mode, hidden-tab suspension, isolated
quote subscriptions, price-flash cleanup, every sort key, tie/missing-value rules, combined filters,
membership changes, catalogue search, stale loading/toast timers, and empty-state recovery. Playwright
checks the static page at 1440px and 1664px, mobile table scrolling at 390px, logo
loading, numeric text direction, browser errors, and the keyboard skip link. It
also verifies live updates, pause/resume, frozen mode, and reduced-motion
behavior, list switching, dialog keyboard focus, heart toggles, and mobile dialog scrolling. It saves review screenshots under the ignored `test-results/` folder.

Before the first browser test run, run `npx playwright install chromium firefox webkit`.

## Structure

- `src/App.tsx`: application entry component.
- `src/components/ui/`: shared accessible modal primitive.
- `src/components/layout/`: sidebar, top bar, market ticker, and application shell.
- `src/features/watchlist/components/`: table, toolbar, price feedback, playback control, logos, and SVG/CSS visuals.
- `src/features/watchlist/state/`: instance-scoped Zustand store, selectors, and feed lifecycle.
- `src/styles/tokens.css`: shared reference colors and type sizes.
- `src/index.css`: minimal global styles and focus treatment.
- `src/test/setup.ts`: DOM matchers and component-test cleanup.
- `vitest.config.ts`: unit/component test configuration.
- `playwright.config.ts`: browser-test configuration.

- `src/features/watchlist/domain/`: readonly models, calculations, formatters, and tests.
- `src/features/watchlist/mock/`: instrument fixtures, seeded generation, pure tick function, and tests.

The shared modal wraps Radix Dialog; list selection and catalogue categories use
Radix Dropdown Menu and Tabs for keyboard and focus behavior.

## Foundation decisions

- React with strict TypeScript and Vite for a client-only application.
- CSS Modules and CSS variables for precise, scoped styling.
- Hebrew language and RTL direction at the document root. English/numeric content
  can opt into LTR locally.
- React Strict Mode stays enabled to expose effect lifecycle problems early.
- Oxlint is the linter supplied by the current Vite template.
- Zustand provides quote-level subscriptions; each app instance owns its store.
- dnd-kit supplies pointer and keyboard sorting in the draft list editor.

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
`Math.random()`/`Date.now()` dependency. The store advances the seed and logical timestamp per tick. Fixed inputs provide a frozen/replayable mode for tests and visual checks.

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
with a sticky security identity column. Mobile navigation uses a drawer below 761px; the toolbar stacks on the narrowest
screens and the ticker scrolls independently.

The PDF requires absolute change, so the table includes a separate change column
in addition to percentage change. Amot was added to the mock catalogue to match
the reference's eleven visible rows. Chart paths and returns come from seeded
mock data and will not equal the recording's market values. The index ticker uses a separate illustrative fixture updated by the same feed
cycle; it is not calculated as a weighted index of the visible securities.

Apple, Meta, and Shopify marks are bundled SVG assets. The remaining company
marks and the platform wordmark are approximations with local fallbacks; exact
original artwork was not supplied. No external image/font request is needed at
runtime. See `THIRD_PARTY_NOTICES.md` for asset sources and licenses.

## Live playback and repeatable review

- Open `/` for live simulation. One interval runs every 1,500 ms, selecting about
  35% of securities each cycle. Rows subscribe only to their own quote; stable
  catalogue/list references do not change on price ticks.
- Open `/?live=0` for a frozen initial snapshot. This is the URL used by the visual
  tests. The playback button can explicitly resume it.
- Pausing stops the interval, and hidden tabs suspend it automatically. Resuming
  advances from the current logical tick without replaying a backlog.
- Provider cleanup removes the interval and visibility listener, including React
  Strict Mode's development mount/unmount cycle.
- Price feedback lasts 650 ms. Its direction compares successive prices, while
  daily-change color compares against previous close. New/unchanged rows do not
  flash. An arrow and accessible text supplement the color, and reduced-motion
  preferences disable flash animation.
- Quotes use a deterministic simulated session clock, not the real wall clock.
  Refreshing resets the session. List state is currently in-memory only.

## Sorting and filtering rules

All data columns are sortable; the actions column is not. Header buttons support
keyboard activation and expose `aria-sort`. Clicking a new column starts ascending;
a third click restores the saved manual order. Sorting and filtering derive visible
IDs without mutating the list, and missing metrics remain last in either direction.
Equal values retain manual order. Quote rows are memoized and selected IDs use
shallow equality so unaffected rows do not rerender unnecessarily.

| Column                       | Sort value                                                    |
| ---------------------------- | ------------------------------------------------------------- |
| Security identity            | Symbol, using a Hebrew-aware collator with numeric comparison |
| Last price                   | Raw quoted price in the instrument's declared unit            |
| Absolute / percentage change | Difference / return from previous close                       |
| Volume                       | Numeric traded-unit count                                     |
| Daily range                  | Price position within the daily low/high range                |
| Intraday chart               | Percentage return from day open                               |
| Trend bar                    | Up segments minus down segments                               |
| 30-day return                | Percentage return from the oldest of 30 prior daily closes    |

Price sorting does not imply FX conversion between US dollars and Israeli agorot.
Filters use AND semantics. Text search is case-insensitive, trims whitespace, and
matches all search terms across symbol and description, including Hebrew names.
Gainers/losers compare price with previous close; flat quotes are a separate option.
A quote that crosses the baseline can enter or leave a filtered view on the next tick.
Filters and sorting are currently in-memory and reset on refresh.

## List selection and catalogue membership

Switching lists shows a simulated 450 ms loading skeleton and preserves filters
and sort. Rapid switches cancel stale completion timers. The feed keeps updating
while loading or while the add dialog is open.

The catalogue searches symbols and descriptions using the same normalized query
matching as table filters. Its All, Stocks, and ETFs tabs reflect the types present
in the fixtures. It shows available securities rather than inventing recent-search
history from the reference video. Search and category reset when the dialog reopens.

Heart buttons immediately add or remove a security from the selected list, without
a separate Save action. Additions prepend to saved manual order; an active sort can
place them elsewhere. Duplicate additions are ignored, other lists are unaffected,
and quotes remain in the catalogue after removal. A confirmation toast lasts four
seconds; newer messages replace it and restart the timer.

The modal traps keyboard focus, closes with Escape, and restores focus to its
opener. If the empty-list action disappears after adding, focus returns to the
main Add Security button. The result list scrolls inside the mobile viewport.
Membership, list selection, sorting, and filters are in-memory only.

## List editing and management

The editor always opens in saved manual order, including securities hidden by
filters. Drag the handle with a pointer, or focus it and press Space, use arrow
keys, then press Space to drop. Escape cancels an active drag; a subsequent Escape
closes the editor. Remove buttons affect only the draft. Save applies the new
membership/order and clears column sorting so the saved order is visible; filters
remain active. Cancel, closing, or clicking outside discards unsaved edits. Quote
updates continue independently and are never replaced by a saved draft.

Names are trimmed, limited to 40 characters, and must be nonempty and unique
(case-insensitive). Setting the default updates the session's default list. Deleting
the active list selects the surviving default; deleting the default assigns the
first remaining list. The final list cannot be deleted. Deletion requires an
in-app confirmation, initially focused on Cancel. All of this state is local to
the current session; there is no persistence across reloads yet.

Tests cover draft cancellation, removal, pointer/keyboard sorting, Escape during
a drag, name validation, default/deletion fallback, and protection of the last list.

## Responsive layout and accessibility

The desktop sidebar becomes a modal navigation drawer below 761px. Escape closes
it and restores focus; resizing to desktop closes it and focuses the watchlist.
Only the watchlist destination is active in this standalone clone. The 320px
layout stacks toolbar groups, and long list names truncate within their control.
Mobile add/filter/list controls and catalogue hearts have larger touch targets.
Dialogs can scroll in short viewports, including landscape/keyboard-sized views.
The table retains all columns in its own horizontal scroller with sticky identity
cells; the market ticker has a separate keyboard-focusable scroll region.

Secondary text and financial colors are deliberately darker than the video to
improve contrast. Positive/negative values retain explicit signs. Existing focus
outlines, RTL labels, reduced-motion support and skip navigation remain enabled.
Removing an editor row focuses the next removal button (or previous at the end);
removing the last row focuses Save. A polite status message announces the removal.

Playwright runs axe WCAG A/AA checks on the page, add/edit/rename/delete dialogs,
and mobile navigation. Additional tests cover 320/390/768px layouts, a short
landscape viewport, drawer focus wrapping and resize cleanup, ticker keyboard
scrolling, and focus after removing all draft rows. Automated checks do not replace
manual assistive-technology testing; no screen-reader compatibility certification
is claimed.

## Error recovery and integration verification

Open `/?live=0&scenario=load-error` to review a deterministic loading failure.
The first simulated load fails after the same 450 ms delay used for list switching.
Retry starts a new load and succeeds; switching lists also allows recovery. This
is an explicit mock scenario, not a network request or random failure. Reloading
this URL repeats the scenario. The regular `/` and `/?live=0` routes are unaffected.

Retry preserves lists, quotes, filters and sorting. Stale completion callbacks are
ignored, and the provider cleans up loading timers under Strict Mode. Adding and
list-editing actions are disabled while loading or showing a loading error. A
Hebrew alert explains the failure, with a keyboard-accessible Retry button; focus
moves to the watchlist while the retry button is replaced by the skeleton.

A rendering error boundary catches unexpected errors in the view tree and offers
a retry without recreating the store. It cannot fix a persistent programming bug
or catch asynchronous/event-handler errors. Loading failures use explicit store
state rather than being thrown through this boundary.

The full browser suite runs in Chromium. Three integrated scenarios also run in
Firefox and WebKit: recovery with retained filters and subsequent sorting; adding,
editing, renaming, setting a default and deleting across lists; and live updates
plus membership changes after going offline. Offline testing begins after the app
and local fonts load; this does not imply offline installation or reload support.
Use `npm run test:e2e -- --project=chromium` for Chromium-only checks.

Visual review compared the 1664×928 desktop screenshot against the supplied
recording and inspected the recovery state. The deliberate visual differences
listed above remain. No deployment or cross-session persistence is configured.
