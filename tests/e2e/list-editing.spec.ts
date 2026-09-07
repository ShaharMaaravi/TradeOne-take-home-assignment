import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
async function action(page: Page, name: string) {
  await page.getByRole('button', { name: 'פעולות רשימה', exact: true }).click()
  await page.getByRole('menuitem', { name, exact: true }).click()
}
test('draft removal cancels, then saves without losing live quotes', async ({
  page,
}) => {
  await page.goto('/')
  await action(page, 'עריכת רשימה')
  let dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: 'הסר MSFT', exact: true }).click()
  await dialog.getByRole('button', { name: 'ביטול', exact: true }).click()
  await expect(page.locator('tbody tr')).toHaveCount(11)
  await expect(
    page.getByRole('button', { name: 'פעולות רשימה', exact: true }),
  ).toBeFocused()
  await action(page, 'עריכת רשימה')
  dialog = page.getByRole('dialog')
  await expect(
    dialog.getByRole('button', { name: 'הסר MSFT', exact: true }),
  ).toBeVisible()
  await dialog.getByRole('button', { name: 'הסר MSFT', exact: true }).click()
  await dialog.getByRole('button', { name: 'שמירה', exact: true }).click()
  await expect(page.locator('tbody tr')).toHaveCount(10)
  await expect(page.locator('tbody')).not.toContainText('MSFT')
})
test('keyboard reorder saves manual order and clears column sort', async ({
  page,
}, info) => {
  await page.goto('/?live=0')
  await page
    .getByRole('button', { name: 'מיון לפי מחזור', exact: true })
    .click()
  await action(page, 'עריכת רשימה')
  const dialog = page.getByRole('dialog')
  const handle = dialog.getByRole('button', {
    name: 'שנה מיקום MSFT',
    exact: true,
  })
  await handle.focus()
  await page.keyboard.press('Space')
  await expect(handle).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('ArrowDown')
  await expect(page.getByText('מיקום 2', { exact: true })).toBeAttached()
  await page.keyboard.press('Space')
  await expect(dialog.getByRole('listitem').first()).toContainText('דוראל')
  await page.screenshot({ path: info.outputPath('edit-list.png') })
  await dialog.getByRole('button', { name: 'שמירה', exact: true }).click()
  await expect(page.locator('tbody tr').first()).toContainText('דוראל')
})
test('pointer reorder works in a mobile dialog', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/?live=0')
  await action(page, 'עריכת רשימה')
  const dialog = page.getByRole('dialog')
  const handles = dialog.getByRole('button', { name: /^שנה מיקום/ })
  const first = (await handles.nth(0).boundingBox())!
  const second = (await handles.nth(1).boundingBox())!
  await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2)
  await page.mouse.down()
  await page.mouse.move(
    second.x + second.width / 2,
    second.y + second.height / 2,
    { steps: 12 },
  )
  await page.mouse.up()
  // dnd-kit suppresses synthetic post-drag clicks for 50 ms.
  await page.waitForTimeout(60)
  await expect(dialog.getByRole('listitem').first()).toContainText('דוראל')
  await dialog.getByRole('button', { name: 'שמירה', exact: true }).click()
  await expect(page.locator('tbody tr').first()).toContainText('דוראל')
})
test('rename validates duplicate names, default selection and confirmed delete work', async ({
  page,
}) => {
  await page.goto('/?live=0')
  await action(page, 'שינוי שם')
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('textbox').fill('ישראל')
  await dialog.getByRole('button', { name: 'שמירה', exact: true }).click()
  await expect(dialog.getByRole('alert')).toBeVisible()
  await dialog.getByRole('textbox').fill('תיק אישי')
  await dialog.getByRole('button', { name: 'שמירה', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'רשימת מעקב: תיק אישי', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: /^רשימת מעקב:/ }).click()
  await page.getByRole('menuitemradio', { name: 'ישראל', exact: true }).click()
  await action(page, 'קבע כברירת מחדל')
  await action(page, 'מחיקת רשימה')
  await expect(
    page.getByRole('button', { name: 'ביטול', exact: true }),
  ).toBeFocused()
  await page.getByRole('button', { name: 'ביטול', exact: true }).click()
  await action(page, 'מחיקת רשימה')
  await page.getByRole('button', { name: 'מחיקה', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'רשימת מעקב: כללי', exact: true }),
  ).toBeVisible()
})

test('Escape cancels a keyboard drag before closing the editor', async ({
  page,
}) => {
  await page.goto('/?live=0')
  await action(page, 'עריכת רשימה')
  const dialog = page.getByRole('dialog')
  const handle = dialog.getByRole('button', {
    name: 'שנה מיקום MSFT',
    exact: true,
  })
  await handle.focus()
  await page.keyboard.press('Space')
  await expect(handle).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeVisible()
  await expect(handle).not.toHaveAttribute('aria-pressed', 'true')
  await expect(
    dialog.getByRole('button', { name: 'שמירה', exact: true }),
  ).toBeDisabled()
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
})
