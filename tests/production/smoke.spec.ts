import { expect, test } from '@playwright/test'

test('production loads local assets and supports catalogue membership', async ({
  page,
}) => {
  const errors: string[] = []
  const failedAssets: string[] = []
  const externalRequests: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('response', (response) => {
    if (response.status() >= 400) failedAssets.push(response.url())
  })
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173')
      externalRequests.push(request.url())
  })
  await page.goto('/?live=0')
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('tbody tr')).toHaveCount(11)
  expect(
    await page
      .locator('img')
      .evaluateAll((images) =>
        images.every((image) => image.complete && image.naturalWidth > 0),
      ),
  ).toBe(true)
  await page.getByRole('button', { name: 'הוסף נייר', exact: true }).click()
  await page
    .getByRole('searchbox', { name: 'חיפוש ניירות ערך', exact: true })
    .fill('NVDA')
  await page.getByRole('button', { name: 'מעקב אחר NVDA', exact: true }).click()
  await page.keyboard.press('Escape')
  await expect(page.locator('tbody tr')).toHaveCount(12)
  expect(errors).toEqual([])
  expect(failedAssets).toEqual([])
  expect(externalRequests).toEqual([])
})

test('production query-string error scenario recovers', async ({ page }) => {
  await page.goto('/?live=0&scenario=load-error')
  await expect(page.getByRole('alert')).toContainText('לא ניתן לטעון')
  await page.getByRole('button', { name: 'נסה שוב', exact: true }).click()
  await expect(page.locator('tbody tr')).toHaveCount(11)
  await expect(page.getByRole('alert')).not.toBeVisible()
})
