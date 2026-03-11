const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[Browser ${msg.type()}] ${msg.text()}`);
    }
  });
  
  await page.goto('http://localhost:4200/docs/tooltip');
  
  // Wait to make sure page is fully loaded and Angular bounds
  await page.waitForTimeout(1000);
  
  await page.hover('button:has-text("Hover me")');
  
  // Wait for tooltip delay + animation
  await page.waitForTimeout(500);

  const tooltipInfo = await page.evaluate(() => {
    const tooltip = document.querySelector('volt-tooltip-content') || document.querySelector('[role="tooltip"]');
    if (!tooltip) return "No tooltip found";
    return {
      html: tooltip.outerHTML,
      rect: tooltip.getBoundingClientRect(),
      computedStyles: {
        position: window.getComputedStyle(tooltip).position,
        top: window.getComputedStyle(tooltip).top,
        left: window.getComputedStyle(tooltip).left,
        transform: window.getComputedStyle(tooltip).transform
      }
    };
  });

  console.log(JSON.stringify(tooltipInfo, null, 2));
  await browser.close();
})();
