import { expect, test } from '@playwright/test'

test('quotes, chart paths and ticker update together; pause and resume work', async ({
  page,
}, testInfo) => {
  await page.clock.install()
  await page.setViewportSize({ width: 1664, height: 928 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await expect(
    page.getByRole('button', { name: 'השהה עדכוני מחירים' }),
  ).toBeVisible()
  const rows = page.locator('tbody')
  const before = await rows.innerText()
  const graphs = page.locator('tbody svg polyline')
  const beforePaths = await graphs.evaluateAll((elements) =>
    elements.map((el) => el.getAttribute('points')),
  )
  const footer = page.getByRole('contentinfo')
  const beforeTicker = await footer.innerText()
  const firstRow = page.locator('tbody tr').first()
  const bounds = await firstRow.boundingBox()
  await page.clock.runFor(4500)
  expect(await rows.innerText()).not.toBe(before)
  expect(
    await graphs.evaluateAll((elements) =>
      elements.map((el) => el.getAttribute('points')),
    ),
  ).not.toEqual(beforePaths)
  expect(await footer.innerText()).not.toBe(beforeTicker)
  expect(await firstRow.boundingBox()).toEqual(bounds)
  await page.screenshot({
    path: testInfo.outputPath('live-updates.png'),
    fullPage: true,
  })
  await page.getByRole('button', { name: 'השהה עדכוני מחירים' }).click()
  await page.clock.runFor(700)
  const pausedRows = await rows.innerText()
  const pausedTicker = await footer.innerText()
  await page.clock.runFor(6000)
  expect(await rows.innerText()).toBe(pausedRows)
  expect(await footer.innerText()).toBe(pausedTicker)
  await page.getByRole('button', { name: 'המשך עדכוני מחירים' }).click()
  await page.clock.runFor(3000)
  expect(await rows.innerText()).not.toBe(pausedRows)
})

test('frozen mode stays reproducible until playback is explicitly resumed', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('/?live=0')
  const before = await page.locator('tbody').innerText()
  await page.clock.runFor(15000)
  expect(await page.locator('tbody').innerText()).toBe(before)
  await expect(
    page.getByRole('button', { name: 'המשך עדכוני מחירים' }),
  ).toBeVisible()
})

test('reduced-motion preference disables flash animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.clock.install()
  await page.goto('/')
  await page.clock.runFor(1500)
  const changed = page
    .locator('tbody [data-direction="up"], tbody [data-direction="down"]')
    .first()
  await expect(changed).toBeVisible()
  await expect(changed.locator('span').first()).toHaveCSS(
    'animation-name',
    'none',
  )
})
