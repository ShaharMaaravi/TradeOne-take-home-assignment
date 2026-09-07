import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

async function chooseList(page: Page, name: string) {
  await page.getByRole('button', { name: /^רשימת מעקב:/ }).click()
  await page.getByRole('menuitemradio', { name, exact: true }).click()
}

test('list switching shows a skeleton and preserves the filter/sort settings', async ({
  page,
}, testInfo) => {
  await page.clock.install()
  await page.goto('/?live=0')
  await page
    .getByRole('button', { name: 'סינון רשימת מעקב', exact: true })
    .click()
  await page
    .getByRole('combobox', { name: 'שוק', exact: true })
    .selectOption('US')
  await page
    .getByRole('button', { name: 'מיון לפי מחזור', exact: true })
    .click()
  await chooseList(page, 'כללי')
  await expect(
    page.getByRole('status', { name: 'טוען רשימת מעקב' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'הוסף נייר', exact: true }),
  ).toBeDisabled()
  await page.screenshot({ path: testInfo.outputPath('loading.png') })
  await page.clock.runFor(450)
  await expect(page.locator('tbody tr')).toHaveCount(7)
  await expect(
    page.getByRole('combobox', { name: 'שוק', exact: true }),
  ).toHaveValue('US')
  await expect(
    page
      .getByRole('button', { name: 'מיון לפי מחזור', exact: true })
      .locator('..'),
  ).toHaveAttribute('aria-sort', 'ascending')
})

test('empty list can receive its first security and focus returns to the surviving toolbar button', async ({
  page,
}) => {
  await page.goto('/?live=0')
  await chooseList(page, 'רשימה חדשה')
  await page.getByRole('button', { name: 'הוסף נייר ראשון' }).click()
  const dialog = page.getByRole('dialog', { name: 'הוספת נייר לרשימה' })
  await dialog.getByRole('searchbox').fill(' nvda ')
  const heart = dialog.getByRole('button', {
    name: 'מעקב אחר NVDA',
    exact: true,
  })
  await expect(heart).toHaveAttribute('aria-pressed', 'false')
  await heart.click()
  await expect(heart).toHaveAttribute('aria-pressed', 'true')
  await expect(dialog.getByRole('status')).toContainText('NVDA נוסף')
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(
    page.getByRole('button', { name: 'הוסף נייר', exact: true }),
  ).toBeFocused()
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await expect(page.locator('tbody')).toContainText('NVDA')
})

test('catalogue search and categories work; heart changes are scoped to the selected list', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1664, height: 928 })
  await page.goto('/?live=0')
  await page.getByRole('button', { name: 'הוסף נייר', exact: true }).click()
  const dialog = page.getByRole('dialog')
  const search = dialog.getByRole('searchbox')
  await expect(search).toBeFocused()
  await dialog.getByRole('tab', { name: 'קרנות סל', exact: true }).click()
  await expect(dialog.getByRole('button', { name: /^מעקב אחר/ })).toHaveCount(1)
  const heart = dialog.getByRole('button', {
    name: 'מעקב אחר IVV',
    exact: true,
  })
  await heart.click()
  await expect(heart).toHaveAttribute('aria-pressed', 'true')
  await heart.click()
  await expect(heart).toHaveAttribute('aria-pressed', 'false')
  await heart.click()
  await search.fill('no-match')
  await expect(dialog.getByText('לא נמצאו ניירות ערך לחיפוש זה')).toBeVisible()
  await dialog.getByRole('button', { name: 'נקה חיפוש' }).click()
  await search.fill('בנק')
  await expect(dialog.getByRole('button', { name: /^מעקב אחר/ })).toHaveCount(2)
  await search.clear()
  await page.screenshot({ path: testInfo.outputPath('add-dialog.png') })
  await page.keyboard.press('Escape')
  await expect(page.locator('tbody tr')).toHaveCount(12)
  await expect(page.locator('tbody tr').first()).toContainText('IVV')
  await chooseList(page, 'כללי')
  await expect(page.locator('tbody tr')).toHaveCount(7)
})

test('keyboard tabs stay in the dialog, category arrows work in RTL, and Escape restores focus', async ({
  page,
}) => {
  await page.goto('/?live=0')
  const trigger = page.getByRole('button', { name: 'הוסף נייר', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('searchbox')).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('button', { name: 'סגירה' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  expect(
    await dialog.evaluate((element) =>
      element.contains(document.activeElement),
    ),
  ).toBe(true)
  await dialog.getByRole('tab', { name: 'הכל', exact: true }).focus()
  await page.keyboard.press('ArrowLeft')
  await expect(
    dialog.getByRole('tab', { name: 'מניות', exact: true }),
  ).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
})

test('live updates continue while the catalogue is open without losing membership', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('/')
  await page.getByRole('button', { name: 'הוסף נייר', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('searchbox').fill('nvda')
  await dialog.getByRole('button', { name: 'מעקב אחר NVDA' }).click()
  const before = await page.locator('tbody').innerText()
  await page.clock.runFor(6000)
  expect(await page.locator('tbody').innerText()).not.toBe(before)
  await expect(
    dialog.getByRole('button', { name: 'מעקב אחר NVDA' }),
  ).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Escape')
  await expect(page.locator('tbody tr')).toHaveCount(12)
})

test('mobile dialog stays in the viewport and supports internal scrolling', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/?live=0')
  await page.getByRole('button', { name: /^רשימת מעקב:/ }).click()
  await page.screenshot({ path: testInfo.outputPath('list-menu.png') })
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'הוסף נייר', exact: true }).click()
  const dialog = page.getByRole('dialog')
  const bounds = (await dialog.boundingBox())!
  expect(bounds.x).toBeGreaterThanOrEqual(0)
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390)
  expect(bounds.y).toBeGreaterThanOrEqual(0)
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(844)
  await dialog
    .getByRole('button', { name: 'מעקב אחר לאומי', exact: true })
    .scrollIntoViewIfNeeded()
  await expect(
    dialog.getByRole('button', { name: 'מעקב אחר לאומי', exact: true }),
  ).toBeInViewport()
  await page.screenshot({ path: testInfo.outputPath('mobile-dialog.png') })
})
