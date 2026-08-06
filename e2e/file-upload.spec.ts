import { test, expect, type Page } from '@playwright/test';

/**
 * Drag-and-drop is the one part of the file-upload surface that unit tests can only
 * fake: jsdom has no DataTransfer carrying real files, so a spec there proves the event
 * handler runs, not that a browser's own drag sequence reaches the component. These
 * tests drive a genuine DragEvent chain with a populated DataTransfer instead.
 *
 * Each interaction is wrapped in `toPass` because the page is server-rendered: the
 * dropzone is visible in the SSR markup before Angular has hydrated, and a drop
 * dispatched in that window lands on an element with no listeners yet. Retrying the
 * whole drop keeps the assertion strict while removing the race.
 */
async function dropFiles(
  page: Page,
  files: { name: string; type: string; body: string }[]
): Promise<void> {
  await page.evaluate(files => {
    const dropzone = document.querySelector('volt-file-dropzone');
    if (!dropzone) throw new Error('No volt-file-dropzone on the page');

    const dataTransfer = new DataTransfer();
    for (const file of files) {
      dataTransfer.items.add(new File([file.body], file.name, { type: file.type }));
    }

    for (const type of ['dragenter', 'dragover', 'drop'] as const) {
      dropzone.dispatchEvent(
        new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer })
      );
    }
  }, files);
}

async function dispatchDrag(page: Page, type: 'dragenter' | 'dragleave'): Promise<void> {
  await page.evaluate(type => {
    const dropzone = document.querySelector('volt-file-dropzone')!;
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File(['x'], 'x.png', { type: 'image/png' }));
    dropzone.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer }));
  }, type);
}

test.describe('File upload dropzone', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/components/file-upload');
    await expect(page.locator('volt-file-dropzone')).toBeVisible();
    await expect(page.getByText('No files selected')).toBeVisible();
  });

  test('accepts files from a real browser drop', async ({ page }) => {
    await expect(async () => {
      await dropFiles(page, [
        { name: 'report.png', type: 'image/png', body: 'a' },
        { name: 'chart.png', type: 'image/png', body: 'b' },
      ]);
      await expect(page.getByText('2 file(s) selected')).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 20000 });
  });

  test('marks itself as a drop target while a drag is over it', async ({ page }) => {
    const dropzone = page.locator('volt-file-dropzone');

    // data-dragover is what drives the highlighted border in the component's styles.
    await expect(async () => {
      await dispatchDrag(page, 'dragenter');
      await expect(dropzone).toHaveAttribute('data-dragover', /.*/, { timeout: 1000 });
    }).toPass({ timeout: 20000 });

    await dispatchDrag(page, 'dragleave');
    await expect(dropzone).not.toHaveAttribute('data-dragover', /.*/);
  });

  test('accepts files chosen through the button trigger', async ({ page }) => {
    await expect(async () => {
      const chooser = page.waitForEvent('filechooser', { timeout: 2000 });
      await page.getByRole('button', { name: 'Browse files' }).click();
      const fileChooser = await chooser;
      await fileChooser.setFiles([
        { name: 'invoice.png', mimeType: 'image/png', buffer: Buffer.from('a') },
      ]);
      await expect(page.getByText('1 file(s) selected')).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 20000 });
  });
});
