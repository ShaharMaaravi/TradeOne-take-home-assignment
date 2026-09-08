import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.use({ hasTouch: true })

for (const width of [320, 390, 768]) {
  test(`cards expose all metrics without sideways scrolling at ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/?live=0')
    await expect(page.getByRole('article')).toHaveCount(11)
    await expect(page.getByRole('table')).toHaveCount(0)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width)
    const card = page.getByRole('article', { name: 'MSFT', exact: true })
    await card.locator('summary').tap()
    for (const label of [
      'שינוי בערך',
      'מחזור',
      'גבוה/נמוך יומי',
      'בר מגמה',
      'תשואת 30 ימים',
    ])
      await expect(card.getByText(label, { exact: true })).toBeVisible()
    await expect(
      card.getByRole('img', { name: 'גרף יומי MSFT', exact: true }),
    ).toBeVisible()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width)
    await page.screenshot({ path: info.outputPath(`cards-${width}.png`) })
    const last = page.getByRole('article').last()
    await last.locator('summary').tap()
    const lastBounds = (await last.boundingBox())!
    const footer = (await page.getByRole('contentinfo').boundingBox())!
    // The last card is reachable above the fixed ticker through normal page scrolling.
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    )
    expect((await last.boundingBox())!.y + lastBounds.height).toBeLessThan(
      footer.y,
    )
  })
}

test('touch workflow supports filtering, sorting, add/remove and desktop resize', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/?live=0')
  await page.getByRole('button', { name: 'הוסף נייר', exact: true }).tap()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('searchbox').fill('NVDA')
  await dialog.getByRole('button', { name: 'מעקב אחר NVDA', exact: true }).tap()
  await dialog.getByRole('button', { name: 'סגירה', exact: true }).tap()
  await expect(page.getByRole('article')).toHaveCount(12)
  await page
    .getByRole('button', { name: 'סינון רשימת מעקב', exact: true })
    .tap()
  await page
    .getByRole('combobox', { name: 'שוק', exact: true })
    .selectOption('US')
  await expect(page.getByRole('article')).toHaveCount(7)
  await page
    .getByRole('combobox', { name: 'מיון לפי', exact: true })
    .selectOption('identity')
  await expect(page.getByRole('article').first()).toHaveAccessibleName('A')
  await page
    .getByRole('button', { name: 'סדר עולה — שנה לסדר יורד', exact: true })
    .tap()
  await expect(page.getByRole('article').first()).toHaveAccessibleName('SHOP')
  await page.getByRole('button', { name: 'פעולות רשימה', exact: true }).tap()
  await page.getByRole('menuitem', { name: 'עריכת רשימה', exact: true }).tap()
  await page.getByRole('button', { name: 'הסר NVDA', exact: true }).tap()
  await page.getByRole('button', { name: 'שמירה', exact: true }).tap()
  await expect(page.getByRole('article')).toHaveCount(6)
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(page.getByRole('table')).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(0)
  await expect(page.locator('tbody tr')).toHaveCount(6)
  await expect(
    page.getByRole('combobox', { name: 'שוק', exact: true }),
  ).toHaveValue('US')
})

test('expanded mobile cards pass accessibility checks and update live', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.clock.install()
  await page.goto('/')
  const card = page.getByRole('article', { name: 'MSFT', exact: true })
  await card.locator('summary').tap()
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(result.violations).toEqual([])
  const before = await page
    .getByRole('region', { name: 'ניירות ברשימת המעקב', exact: true })
    .innerText()
  await page.clock.runFor(3000)
  expect(
    await page
      .getByRole('region', { name: 'ניירות ברשימת המעקב', exact: true })
      .innerText(),
  ).not.toBe(before)
  await expect(card.locator('details')).toHaveAttribute('open', '')
})

test('three layout modes switch at 640 and 1200px; table headings and values align right', async ({
  page,
}) => {
  await page.goto('/?live=0')
  for (const width of [639, 640, 1199, 1200]) {
    await page.setViewportSize({ width, height: 900 })
    if (width < 1200) {
      await expect(page.getByRole('article')).toHaveCount(11)
      const first = (await page.getByRole('article').nth(0).boundingBox())!
      const second = (await page.getByRole('article').nth(1).boundingBox())!
      if (width < 640) expect(second.y).toBeGreaterThan(first.y)
      else expect(second.y).toBeCloseTo(first.y, 0)
      await expect(
        page.getByRole('button', { name: 'פתיחת תפריט ניווט' }),
      ).toBeVisible()
    } else {
      await expect(page.getByRole('table')).toBeVisible()
      await expect(page.getByRole('article')).toHaveCount(0)
      for (const cell of await page
        .locator('tbody tr:first-child td')
        .all())
        await expect(cell).toHaveCSS('text-align', 'right')
      await expect(page.locator('thead th').first()).toHaveCSS('text-align', 'right')
      for (const heading of await page.locator('thead th:not(:first-child)').all())
        await expect(heading).toHaveCSS('text-align', 'right')
      await expect(
        page.locator('tbody tr:first-child td').nth(2).locator('bdi'),
      ).toHaveCSS('direction', 'ltr')
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width)
  }
})
