import { expect, test } from '../fixtures';
import { BLOCKS } from '../../apps/recipes/src/app/lib/blocks-metadata';

/**
 * Every Block under `prefers-reduced-motion: reduce`:
 *  - nothing keeps animating on its own (infinite animations, looping transitions);
 *  - nothing is left invisible or mid-transform — content must reach its final state.
 *
 * `page.emulateMedia` rather than the `reducedMotion` fixture option, see blocks.spec.ts.
 */
for (const block of BLOCKS) {
  test(`${block.slug} settles under reduced motion`, async ({ page }) => {
    await page.emulateMedia({
      reducedMotion: process.env['BLOCKS_MOTION'] === 'full' ? 'no-preference' : 'reduce',
    });
    await page.goto(block.path);
    await page.getByRole('heading', { level: 1 }).first().waitFor();
    // Past the longest entrance (counting, reveals) so a stuck state would show.
    await page.waitForTimeout(1500);

    const report = await page.evaluate(() => {
      const root = document.querySelector('app-block-showcase .overflow-clip') ?? document.body;
      const looping = root
        .getAnimations({ subtree: true })
        .filter(a => {
          const timing = a.effect?.getComputedTiming();
          return timing?.iterations === Infinity && a.playState === 'running';
        })
        .map(a => (a.effect as KeyframeEffect).target?.className?.toString().slice(0, 60));

      const hidden = [...root.querySelectorAll<HTMLElement>('*')]
        .filter(el => {
          const style = getComputedStyle(el);
          const box = el.getBoundingClientRect();
          return (
            style.opacity === '0' &&
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            box.width > 0 &&
            (el.textContent ?? '').trim().length > 0
          );
        })
        .map(el => `${el.tagName.toLowerCase()}.${el.className?.toString().slice(0, 50)}`);

      return { looping, hidden };
    });

    expect(report.looping, 'infinite animations still running').toEqual([]);
    expect(report.hidden, 'text content left at opacity 0').toEqual([]);
  });
}
