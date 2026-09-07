import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function choose(page: Page, name: string) {
  await page.getByRole('button', { name: /^רשימת מעקב:/ }).click()
  await page.getByRole('menuitemradio', { name, exact: true }).click()
}
async function action(page: Page, name: string) {
  await page.getByRole('button', { name: 'פעולות רשימה', exact: true }).click()
  await page.getByRole('menuitem', { name, exact: true }).click()
}

test('retry recovers loading while preserving filters and sort', async ({
  page,
}, info) => {
  await page.goto('/?live=0&scenario=load-error')
  await expect(page.getByRole('alert')).toContainText('לא ניתן לטעון')
  await expect(
    page.getByRole('button', { name: 'הוסף נייר', exact: true }),
  ).toBeDisabled()
  await page
    .getByRole('button', { name: 'סינון רשימת מעקב', exact: true })
    .click()
  await page
    .getByRole('combobox', { name: 'שוק', exact: true })
    .selectOption('US')
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(result.violations).toEqual([])
  await page.screenshot({ path: info.outputPath('load-error.png') })
  await page.getByRole('button', { name: 'נסה שוב', exact: true }).click()
  await expect(page.getByRole('alert')).not.toBeVisible()
  await expect(page.locator('tbody tr')).toHaveCount(6)
  await expect(
    page.getByRole('combobox', { name: 'שוק', exact: true }),
  ).toHaveValue('US')
  await expect(page.locator('#watchlist')).toBeFocused()
  await page
    .getByRole('button', { name: 'מיון לפי שער אחרון', exact: true })
    .click()
  await choose(page, 'כללי')
  await expect(page.locator('tbody tr')).toHaveCount(7)
  await expect(
    page
      .getByRole('columnheader')
      .filter({
        has: page.getByRole('button', {
          name: 'מיון לפי שער אחרון',
          exact: true,
        }),
      }),
  ).toHaveAttribute('aria-sort', 'ascending')
})

test('add, edit, rename, default and delete compose across lists', async ({
  page,
}, info) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/?live=0')
  await choose(page, 'רשימה חדשה')
  await page.getByRole('button', { name: 'הוסף נייר ראשון' }).click()
  let dialog = page.getByRole('dialog')
  for (const symbol of ['MSFT', 'NVDA']) {
    await dialog.getByRole('searchbox').fill(symbol)
    await dialog
      .getByRole('button', { name: `מעקב אחר ${symbol}`, exact: true })
      .click()
  }
  await page.keyboard.press('Escape')
  await expect(page.locator('tbody tr')).toHaveCount(2)
  await action(page, 'עריכת רשימה')
  dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: 'הסר MSFT', exact: true }).click()
  await dialog.getByRole('button', { name: 'שמירה', exact: true }).click()
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await expect(page.locator('tbody')).toContainText('NVDA')
  await action(page, 'שינוי שם')
  await page
    .getByRole('textbox', { name: 'שם הרשימה', exact: true })
    .fill('תיק משולב')
  await page.getByRole('button', { name: 'שמירה', exact: true }).click()
  await action(page, 'קבע כברירת מחדל')
  await choose(page, 'כללי')
  await expect(page.locator('tbody tr')).toHaveCount(7)
  await action(page, 'מחיקת רשימה')
  await page.getByRole('button', { name: 'מחיקה', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'רשימת מעקב: תיק משולב', exact: true }),
  ).toBeVisible()
  await expect(page.locator('tbody')).toContainText('NVDA')
  await page.screenshot({ path: info.outputPath('integrated-workflow.png') })
  expect(errors).toEqual([])
})

test('offline runtime keeps local assets and live updates working', async ({
  page,
  context,
}, info) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.clock.install()
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('tbody tr')).toHaveCount(11)
  const before = await page.locator('tbody').innerText()
  await context.setOffline(true)
  await page.clock.runFor(3000)
  await expect(page.locator('tbody')).not.toHaveText(before)
  await page.getByRole('button', { name: 'הוסף נייר', exact: true }).click()
  await page
    .getByRole('searchbox', { name: 'חיפוש ניירות ערך', exact: true })
    .fill('NVDA')
  await page.getByRole('button', { name: 'מעקב אחר NVDA', exact: true }).click()
  await page.keyboard.press('Escape')
  await expect(page.locator('tbody tr')).toHaveCount(12)
  await page.screenshot({ path: info.outputPath('offline-live.png') })
  expect(errors).toEqual([])
})
