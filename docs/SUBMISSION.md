# Submission review

## Five-minute walkthrough

1. Open `/?live=0` and compare the RTL layout with the supplied video.
2. Resume playback; watch price arrows/flashes, ranges, charts and the ticker.
3. Sort a numeric column through ascending, descending and saved manual order.
   Combine search with market/type/performance filters, then clear filters.
4. Switch to the empty list and add NVDA. Search another name in Hebrew and
   toggle its heart; close the dialog and verify membership.
5. Open List Actions → Edit. Reorder with a handle and remove a row. Cancel to
   discard, then repeat and Save. Try keyboard sorting with Space and arrows.
6. Rename the list, set it as default, and inspect the deletion confirmation.
7. Open `/?live=0&scenario=load-error` and retry. Check the mobile drawer and table
   scrolling at a narrow viewport.

## Technical discussion points

- Pure seeded market functions make quote updates reproducible and testable.
- Each provider owns its Zustand store and timer lifecycle; rows subscribe to
  individual quotes instead of rerendering the entire table on every tick.
- Filtering and sorting derive visible IDs without changing saved manual order.
- Editor drafts commit only membership/order, so live quotes are not overwritten.
- Radix and dnd-kit provide focus/keyboard primitives; the app adds RTL labels,
  focus recovery, contrast adjustments and reduced-motion behavior.
- The README explicitly records the mock-data assumptions and scope differences.

## Before sending

- Complete the step 10 review, commit and push.
- Deploy to Netlify and verify the resulting public URL.
- Add that verified URL to README and the submission message.
- Give the reviewer access to the private GitHub repository, or deliberately change
  its visibility yourself if that is your preference.

## Submission message draft

Hi,

Here is my Watchlist take-home assignment:

- Source: https://github.com/ShaharMaaravi/TradeOne-take-home-assignment
- Live demo: [insert the verified Netlify URL]
- Local setup and technical notes are included in README.

The application uses React and TypeScript with locally simulated market data.
It includes live quote feedback, sorting/filtering, list management, responsive
RTL layouts, and automated interaction/accessibility tests.

Thank you,
Shahar
