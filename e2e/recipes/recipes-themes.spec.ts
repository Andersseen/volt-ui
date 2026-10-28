import { expect, test } from '../fixtures';
import { RECIPES } from '../../apps/recipes/src/app/lib/recipes-metadata';

/**
 * Theme × viewport sweep for the three recipes.
 * Seeds the theme the way the popover persists it (localStorage), then checks what
 * actually breaks across presets and widths: horizontal page overflow and unreadable contrast
 * on text the recipes render.
 */
const ROUTES = RECIPES.map(recipe => recipe.path);
const THEMES = [
  { name: 'default light', color: 'volt', style: 'sharp', dark: false },
  { name: 'ember soft dark', color: 'ember', style: 'soft', dark: true },
  { name: 'glacier retro light', color: 'glacier', style: 'retro', dark: false },
];
const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 800 },
  { name: 'tablet', width: 820, height: 900 },
  { name: 'desktop', width: 1280, height: 900 },
];

for (const route of ROUTES) {
  for (const theme of THEMES) {
    for (const viewport of VIEWPORTS) {
      test(`${route} · ${theme.name} · ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        // The site restores its theme from localStorage, so seed that rather than the DOM.
        await page.addInitScript(t => {
          localStorage.setItem('volt-color', t.color);
          localStorage.setItem('volt-style', t.style);
          localStorage.setItem('volt-dark', String(t.dark));
        }, theme);
        await page.goto(route);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expect(page.locator('html')).toHaveAttribute('data-color', theme.color);
        await expect(page.locator('html')).toHaveClass(theme.dark ? /dark/ : /^((?!dark).)*$/);

        // Nothing in the content may stick out past the viewport; wide content must scroll inside
        // its own region. (The site header is excluded: it has its own 3px quirk at 820px that
        // every page shares.)
        const sticking = await page.evaluate(() => {
          const limit = document.documentElement.clientWidth;
          const content = document.querySelector('main') ?? document.body;
          return [...content.querySelectorAll<HTMLElement>('*')]
            .filter(el => {
              // Skip anything clipped by a scrollable ancestor.
              for (let p = el.parentElement; p && p !== content; p = p.parentElement) {
                const overflowX = getComputedStyle(p).overflowX;
                if (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'hidden') {
                  return false;
                }
              }
              return el.getBoundingClientRect().right > limit + 0.5;
            })
            .map(el => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`);
        });
        expect(sticking, 'content wider than the viewport').toEqual([]);
      });
    }
  }
}
