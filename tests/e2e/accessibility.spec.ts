import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const surface of [
  'page',
  'add',
  'edit',
  'rename',
  'delete',
  'navigation',
] as const) {
  test(`accessibility audit: ${surface}`, async ({ page }) => {
    if (surface === 'navigation')
      await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/?live=0')
    if (surface === 'add')
      await page.getByRole('button', { name: 'הוסף נייר', exact: true }).click()
    if (surface === 'edit' || surface === 'rename' || surface === 'delete') {
      await page
        .getByRole('button', { name: 'פעולות רשימה', exact: true })
        .click()
      await page
        .getByRole('menuitem', {
          name: {
            edit: 'עריכת רשימה',
            rename: 'שינוי שם',
            delete: 'מחיקת רשימה',
          }[surface],
          exact: true,
        })
        .click()
    }
    if (surface === 'navigation')
      await page.getByRole('button', { name: 'פתיחת תפריט ניווט' }).click()
    if (surface !== 'page') await expect(page.getByRole('dialog')).toBeVisible()
    let builder = new AxeBuilder({ page }).withTags([
      'wcag2a',
      'wcag2aa',
      'wcag21aa',
    ])
    if (surface !== 'page') builder = builder.include('[role="dialog"]')
    const result = await builder.analyze()
    expect(result.violations).toEqual([])
  })
}

test('mobile navigation traps focus, closes, and responds to desktop resize', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto('/?live=0')
  const trigger = page.getByRole('button', { name: 'פתיחת תפריט ניווט' })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'תפריט ניווט', exact: true })
  await expect(dialog).toBeVisible()
  const close = dialog.getByRole('button', { name: 'סגירת תפריט ניווט' })
  await close.focus()
  await page.keyboard.press('Shift+Tab')
  await expect(
    dialog.getByRole('link', { name: 'רשימות מעקב', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  await page.screenshot({ path: info.outputPath('mobile-navigation.png') })
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await trigger.click()
  await dialog.getByRole('link', { name: 'רשימות מעקב', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await trigger.click()
  await page.setViewportSize({ width: 1280, height: 800 })
  await expect(dialog).not.toBeVisible()
  await expect(page.locator('#watchlist')).toBeFocused()
})

for (const width of [320, 390, 768]) {
  test(`responsive controls and scroll regions at ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 740 })
    await page.goto('/?live=0')
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width)
    await page
      .getByRole('button', { name: 'סינון רשימת מעקב', exact: true })
      .click()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width)
    await page.screenshot({ path: info.outputPath(`responsive-${width}.png`) })
    const ticker = page.getByRole('region', { name: 'גלילת מדדי שוק' })
    if (await ticker.evaluate((el) => el.scrollWidth > el.clientWidth)) {
      await ticker.focus()
      await page.keyboard.press('ArrowLeft')
      await expect
        .poll(() => ticker.evaluate((element) => element.scrollLeft))
        .toBeLessThan(0)
    }
    await page.getByRole('button', { name: 'הוסף נייר', exact: true }).click()
    const dialog = page.getByRole('dialog')
    const box = (await dialog.boundingBox())!
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(width)
  })
}

test('removing draft rows keeps focus on the next row and then Save', async ({
  page,
}) => {
  await page.goto('/?live=0')
  await page.getByRole('button', { name: 'פעולות רשימה', exact: true }).click()
  await page.getByRole('menuitem', { name: 'עריכת רשימה', exact: true }).click()
  const dialog = page.getByRole('dialog')
  for (let remaining = 11; remaining > 0; remaining--) {
    const remove = dialog.getByRole('button', { name: /^הסר / }).first()
    await remove.focus()
    await page.keyboard.press('Enter')
    if (remaining > 1)
      await expect(
        dialog.getByRole('button', { name: /^הסר / }).first(),
      ).toBeFocused()
  }
  await expect(
    dialog.getByRole('button', { name: 'שמירה', exact: true }),
  ).toBeFocused()
  await expect(
    dialog.getByRole('status', { name: 'עדכון טיוטה' }),
  ).toContainText('הוסר מהטיוטה')
})

test('short viewport keeps dialog actions reachable', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 320 })
  await page.goto('/?live=0')
  await page.getByRole('button', { name: 'פעולות רשימה', exact: true }).click()
  await page.getByRole('menuitem', { name: 'עריכת רשימה', exact: true }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'ביטול', exact: true })
    .click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
})
