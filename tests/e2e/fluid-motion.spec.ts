import { expect, test } from '@playwright/test'

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
]) {
  test(`table and ticker fill available space at ${viewport.width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize(viewport)
    await page.goto('/?live=0')
    const table = page.getByRole('region', { name: 'טבלת רשימת מעקב' })
    const bounds = (await table.boundingBox())!
    const status = (await page
      .getByRole('button', { name: 'המשך עדכוני מחירים' })
      .locator('..')
      .boundingBox())!
    expect(bounds.x).toBeCloseTo(
      Math.min(150, Math.max(24, viewport.width * 0.175 - 186)),
      0,
    )
    expect(Math.abs(bounds.y + bounds.height - status.y)).toBeLessThanOrEqual(
      10,
    )
    const footer = (await page.getByRole('contentinfo').boundingBox())!
    expect(footer.x).toBe(0)
    expect(footer.width).toBe(viewport.width)
    expect(footer.y + footer.height).toBe(viewport.height)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(viewport.width)
    if (viewport.width >= 1440) {
      expect(
        await table.evaluate((el) => el.scrollHeight - el.clientHeight),
      ).toBeLessThanOrEqual(1)
      expect(
        await page.evaluate(() => document.documentElement.scrollHeight),
      ).toBe(viewport.height)
    }
    await page.screenshot({ path: info.outputPath('fluid-layout.png') })
  })
}

test('table scrolls internally and retains headings when filters reduce available height', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 700 })
  await page.goto('/?live=0')
  await page
    .getByRole('button', { name: 'סינון רשימת מעקב', exact: true })
    .click()
  const table = page.getByRole('region', { name: 'טבלת רשימת מעקב' })
  expect(await table.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(
    true,
  )
  const heading = page.getByRole('columnheader').first()
  const before = (await heading.boundingBox())!.y
  await table.evaluate((el) => {
    el.scrollTop = 250
  })
  expect(Math.abs((await heading.boundingBox())!.y - before)).toBeLessThan(1)
})

test('sparklines interpolate between ticks and stop requesting visual changes once settled', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('/')
  const line = page.getByRole('contentinfo').locator('polyline').first()
  await page.clock.runFor(1500)
  const start = await line.getAttribute('points')
  await page.clock.runFor(100)
  const middle = await line.getAttribute('points')
  expect(middle).not.toBe(start)
  await page.clock.runFor(250)
  const end = await line.getAttribute('points')
  expect(end).not.toBe(middle)
  await page.clock.runFor(300)
  expect(await line.getAttribute('points')).toBe(end)
})

test('reduced motion applies chart updates immediately without interpolation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.clock.install()
  await page.goto('/')
  const line = page.getByRole('contentinfo').locator('polyline').first()
  const before = await line.getAttribute('points')
  await page.clock.runFor(1500)
  const updated = await line.getAttribute('points')
  expect(updated).not.toBe(before)
  await page.clock.runFor(350)
  expect(await line.getAttribute('points')).toBe(updated)
})
