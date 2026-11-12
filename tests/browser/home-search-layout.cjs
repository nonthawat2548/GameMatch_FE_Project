// Read-only regression: verify that opening the homepage search does not change layout.
const path = require('path');
const assert = require('assert/strict');
const root = path.resolve(__dirname, '../..');
process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(root, '.cache/playwright');
const { chromium } = require(path.join(root, '.tools/frontend-qa/node_modules/playwright'));
const origin = process.env.GM_QA_WEB_URL || 'https://gamematch-projectweb-befe.vercel.app';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of [{ width: 1366, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 720 }]) {
      const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto(origin);
      await page.locator('.hero-stats').waitFor();
      const search = page.getByRole('searchbox');
      for (const theme of ['dark', 'light']) {
        if (await page.locator('html').getAttribute('data-theme') !== theme)
          await page.getByRole('button', { name: theme === 'light' ? 'สลับเป็นธีมสว่าง' : 'สลับเป็นธีมมืด' }).click();
        const measure = () => page.evaluate(() => {
          const bounds = (selector) => {
            const b = document.querySelector(selector).getBoundingClientRect();
            return [b.x, b.y + window.scrollY, b.width, b.height];
          };
          return {
            hero: bounds('.cinematic-hero'),
            actions: bounds('.home-actions'),
            visual: bounds('.hero-visual'),
            paths: bounds('.home-paths'),
          };
        });
        await search.fill('');
        const before = await measure();
        for (const term of ['a', 'Counter-Strike', 'zz_no_such_game_zz']) {
          await search.fill(term);
          const results = page.locator('#home-search-results');
          await results.waitFor();
          assert.equal(await results.evaluate((el) => getComputedStyle(el).position), 'absolute');
          assert.deepEqual(await measure(), before, 'search must not resize or shift the homepage');
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
        }
        await search.press('Escape');
        assert.equal(await page.locator('#home-search-results').count(), 0);
        assert.deepEqual(await measure(), before);
        await search.fill('');
        console.log('PASS search layout ' + viewport.width + 'px ' + theme);
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }
})().catch((err) => { console.error(err); process.exitCode = 1; });
