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
    await page.goto('/?live=0')
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

test('mobile uses readable stock cards and natural page scrolling', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/?live=0')
  await page.evaluate(() => document.fonts.ready)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  )
  await expect(page.getByRole('complementary')).toBeHidden()
  await expect(page.getByRole('table')).toHaveCount(0)
  await expect(page.getByRole('article')).toHaveCount(11)
  await page.getByRole('article').last().scrollIntoViewIfNeeded()
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  await expect(page.getByRole('article').last()).toContainText('SHOP')
  await page.screenshot({ path: testInfo.outputPath('mobile.png') })
})

test('keyboard skip link reaches the watchlist', async ({ page }) => {
  await page.goto('/?live=0')
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('link', { name: 'דלג לרשימת המעקב' }),
  ).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
})
