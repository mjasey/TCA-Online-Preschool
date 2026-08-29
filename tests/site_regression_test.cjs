const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4174';

async function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
    await assert(await page.locator('link[rel="canonical"]').getAttribute('href') === 'https://enroll.tcaarts.org/', 'Homepage canonical is missing');
    await assert((await page.locator('body').innerText()).includes('Monday–Friday · 45-minute sessions available'), 'Homepage session availability is incorrect');
    await assert((await page.locator('.stats-bar').innerText()).includes('Mon – Fri'), 'Homepage availability days are incorrect');
    await assert((await page.locator('.stats-bar').innerText()).includes('45 minute sessions'), 'Homepage session length is incorrect');

    await page.setViewportSize({ width: 390, height: 844 });
    await assert(await page.locator('.nav-toggle').isVisible(), 'Homepage mobile navigation toggle is not visible');
    await page.locator('.nav-toggle').click();
    await assert(await page.locator('#primary-nav a[href="donate.html"]').isVisible(), 'Homepage mobile navigation does not expose Give');

    await page.goto(`${baseUrl}/enroll.html`, { waitUntil: 'domcontentloaded' });
    const scheduleCards = page.locator('.schedule-card');
    await assert((await scheduleCards.nth(0).locator('.day').innerText()) === 'Tuesday & Thursday', 'Enrollment morning days are incorrect');
    await assert((await scheduleCards.nth(0).locator('.time').innerText()) === '10:00–10:45 AM', 'Enrollment morning slot is incorrect');
    await assert((await scheduleCards.nth(1).locator('.time').innerText()) === '12:00–12:45 PM', 'Enrollment noon slot is incorrect');
    await assert((await scheduleCards.nth(2).locator('.time').innerText()) === '5:30–6:15 PM', 'Enrollment evening slot is incorrect');
    await assert(await page.locator('a[href="index.html#story"]').count() === 0, 'Broken story link remains');
    await assert(await page.locator('a[href="index.html#foundation"]').count() > 0, 'Foundation link is missing');

    await page.goto(`${baseUrl}/manage/`, { waitUntil: 'domcontentloaded' });
    await assert(await page.locator('#password-login').count() === 1, 'Password sign-in form is missing');
    await assert(await page.locator('#magic-login').count() === 0, 'Magic-link sign-in form remains');

    console.log(`PASS: ${baseUrl}`);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
