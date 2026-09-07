import { expect, test } from '@playwright/test'

const symbols = (page: import('@playwright/test').Page) =>
  page.locator('tbody th bdi').filter({ hasText: /./ }).allTextContents()
const prices = (page: import('@playwright/test').Page) =>
  page
    .locator('tbody tr td:first-of-type bdi')
    .evaluateAll((cells) =>
      cells.map((cell) => Number(cell.textContent!.replaceAll(',', ''))),
    )

test('header clicks cycle numeric sorting and restore manual order', async ({
  page,
}) => {
  await page.goto('/?live=0')
  const original = await symbols(page)
  const sort = page.getByRole('button', {
    name: 'מיון לפי שער אחרון',
    exact: true,
  })
  await sort.click()
  await expect(sort.locator('..')).toHaveAttribute('aria-sort', 'ascending')
  expect(await prices(page)).toEqual(
    [...(await prices(page))].sort((a, b) => a - b),
  )
  await sort.click()
  expect(await prices(page)).toEqual(
    [...(await prices(page))].sort((a, b) => b - a),
  )
  await sort.click()
  expect(await symbols(page)).toEqual(original)
  await expect(sort.locator('..')).toHaveAttribute('aria-sort', 'none')
})

test('filters combine, survive collapsing, and recover from no results', async ({
  page,
}, testInfo) => {
  await page.goto('/?live=0')
  await page
    .getByRole('button', { name: 'סינון רשימת מעקב', exact: true })
    .click()
  await page
    .getByRole('combobox', { name: 'שוק', exact: true })
    .selectOption('US')
  await page
    .getByRole('combobox', { name: 'שינוי יומי', exact: true })
    .selectOption('gainers')
  await expect(page.locator('tbody tr')).toHaveCount(3)
  await page.getByRole('searchbox', { name: 'חיפוש ברשימה' }).fill(' aApL ')
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await expect(page.locator('tbody')).toContainText('AAPL')
  await page
    .getByRole('button', { name: 'סינון רשימת מעקב', exact: true })
    .click()
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await page
    .getByRole('button', { name: 'סינון רשימת מעקב', exact: true })
    .click()
  await page
    .getByRole('searchbox', { name: 'חיפוש ברשימה' })
    .fill('does-not-exist')
  await expect(
    page.getByRole('heading', { name: 'לא נמצאו ניירות ערך' }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'נקה סינון', exact: true })
    .first()
    .click()
  await expect(page.locator('tbody tr')).toHaveCount(11)
  await page.screenshot({
    path: testInfo.outputPath('filters.png'),
    fullPage: true,
  })
})

test('active numeric sorting remains correct while quotes update', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('/')
  await page
    .getByRole('button', { name: 'מיון לפי שער אחרון', exact: true })
    .click()
  const before = await prices(page)
  await page.clock.runFor(9000)
  const after = await prices(page)
  expect(after).not.toEqual(before)
  expect(after).toEqual([...after].sort((a, b) => a - b))
})

test('filter controls fit a narrow viewport', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/?live=0')
  await page
    .getByRole('button', { name: 'סינון רשימת מעקב', exact: true })
    .click()
  await expect(
    page.getByRole('combobox', { name: 'סוג נייר', exact: true }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({
    path: testInfo.outputPath('mobile-filters.png'),
    fullPage: true,
  })
})
