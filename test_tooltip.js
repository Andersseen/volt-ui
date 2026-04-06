const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto('http://localhost:4200/docs/tooltip', { waitUntil: 'load' });
  console.log('Page loaded. Waiting a bit...');
  await page.waitForTimeout(2000);

  console.log('Hovering over the button...');
  // Find the button inside the tooltip demo
  const btn = await page.$('button[voltTooltip]');
  if (!btn) {
    console.log('Button not found!');
  } else {
    await btn.hover();
    console.log('Hovered. Waiting for tooltip to appear...');
    await page.waitForTimeout(1000); // adjust based on showDelay

    // Dump the body HTML at the end to see the overlays
    const overlaysHtml = await page.evaluate(() => {
      // ng-primitives appends to the body by default
      // Tooltips usually have role="tooltip" or some overlay container wrapper
      const tooltips = Array.from(
        document.querySelectorAll(
          'volt-tooltip-content, [role="tooltip"], .ngp-overlay-container, [data-overlay]'
        )
      );
      return tooltips.map(t => t.outerHTML).join('\n---\n');
    });

    console.log('Overlay HTML:\n', overlaysHtml);
  }

  await browser.close();
  console.log('Done.');
})();
