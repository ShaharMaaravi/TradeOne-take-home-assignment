import { expect, test } from '@playwright/test'

for (const viewport of [
  { width: 1664, height: 928 },
  { width: 1440, height: 900 },
]) {
  test(`static RTL layout at ${viewport.width}px`, async ({
    page,
  }, testInfo) => {
    const pageErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    await page.setViewportSize(viewport)
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await expect(
      page.getByRole('heading', { name: 'רשימות מעקב', exact: true }),
    ).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    await expect(page.locator('tbody tr')).toHaveCount(11)
    await expect(page.getByRole('columnheader')).toHaveCount(10)
    await expect(
      page.locator('tbody tr').first().locator('td').nth(2).locator('bdi'),
    ).toHaveCSS('direction', 'ltr')
    const region = page.getByRole('region', { name: 'טבלת רשימת מעקב' })
    expect(
      await region.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    const sidebar = await page.getByRole('complementary').boundingBox()
    const table = await region.boundingBox()
    expect(sidebar!.x).toBeGreaterThan(table!.x + table!.width)
    const logos = await page
      .locator('tbody img')
      .evaluateAll((images) =>
        images.every((img) => (img as HTMLImageElement).naturalWidth > 0),
      )
    expect(logos).toBe(true)
    await page.screenshot({
      path: testInfo.outputPath('desktop.png'),
      fullPage: true,
    })
    expect(pageErrors).toEqual([])
  })
}

test('mobile isolates horizontal scrolling to the table and keeps identities visible', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await expect(page.getByRole('complementary')).toBeHidden()
  const region = page.getByRole('region', { name: 'טבלת רשימת מעקב' })
  expect(
    await region.evaluate(
      (element) => element.scrollWidth > element.clientWidth,
    ),
  ).toBe(true)
  const identity = page.locator('tbody th').first()
  const before = await identity.boundingBox()
  await region.evaluate((element) => {
    element.scrollLeft = -400
  })
  await expect
    .poll(async () => (await identity.boundingBox())!.x)
    .toBeCloseTo(before!.x, 0)
  await expect(identity).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath('mobile.png'),
    fullPage: true,
  })
})

test('keyboard skip link reaches the watchlist', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('link', { name: 'דלג לרשימת המעקב' }),
  ).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
})
