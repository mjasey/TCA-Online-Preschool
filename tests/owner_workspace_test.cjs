const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

(async () => {
  const output = path.join(__dirname, 'artifacts');
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(`PAGE ERROR: ${error.message}`));

  await page.goto('http://127.0.0.1:4174/manage/?demo=1', { waitUntil: 'networkidle' });
  await page.locator('#workspace').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#page-title').textContent(), 'Home page');
  assert.equal(await page.locator('.cms-field').count(), 26);
  await page.screenshot({ path: path.join(output, 'owner-workspace-desktop.png'), fullPage: true });

  await page.locator('[name="hero.title"]').fill('Faithful Learning Starts Here');
  const frame = page.frameLocator('#site-preview');
  await frame.locator('.hero-content h1').filter({ hasText: 'Faithful Learning Starts Here' }).waitFor();
  assert.match(await page.locator('#save-state').textContent(), /unsaved/i);
  await page.locator('#save-draft').click();
  await page.locator('#save-state').filter({ hasText: 'All changes saved' }).waitFor();

  await page.locator('[data-page="enroll"]').click();
  assert.equal(await page.locator('#page-title').textContent(), 'Enrollment page');
  await page.locator('details').filter({ hasText: 'Plan 1 · one session' }).locator('summary').click();
  await page.locator('[name="plans.one.price"]').fill('$29');
  await frame.locator('.plans-grid .amount').first().filter({ hasText: '$29' }).waitFor();
  await page.locator('#save-draft').click();

  await page.locator('[data-view="requests"]').click();
  await page.locator('#requests-view').waitFor({ state: 'visible' });
  await page.locator('[name="category"]').selectOption({ label: 'New page or section' });
  await page.locator('[name="summary"]').fill('Add a summer program page');
  await page.locator('[name="details"]').fill('Create a page explaining dates, class times, and summer registration.');
  await page.locator('#request-form button[type=submit]').click();
  await page.locator('#request-status').filter({ hasText: 'local demo' }).waitFor();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#menu-toggle').click();
  await page.locator('.sidebar').waitFor({ state: 'visible' });
  await page.screenshot({ path: path.join(output, 'owner-workspace-mobile.png'), fullPage: true });

  const unexpected = errors.filter(error => !error.includes('Failed to load resource: the server responded with a status of 404'));
  assert.deepEqual(unexpected, [], `Browser console errors: ${unexpected.join('\n')}`);
  await browser.close();
  console.log('Owner workspace browser test passed.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
