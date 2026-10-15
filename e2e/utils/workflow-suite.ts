import { expect, test, type Page } from '@playwright/test';

/**
 * Application-workflow benchmark, shared by the npm-package fixture (`e2e/consumer`) and the
 * copy-and-own fixture (`e2e/consumer-cli`). The two render the same source — the CLI one after
 * the CLI's own selector/import transform — so a difference between them is a CLI bug.
 *
 * Everything is found by role and accessible name, never by Volt's internal markup: if the
 * workflow only works when you reach into the DOM, the public contract is not enough.
 */
export function defineWorkflowSuite(label: string, entry: string): void {
  test.describe(`${label}: admin CRUD workflow`, () => {
    let errors: string[];

    test.beforeEach(({ page }) => {
      errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => {
        if (m.type() === 'error') errors.push(m.text());
      });
    });

    test.afterEach(() => {
      expect(errors, 'runtime errors').toEqual([]);
    });

    const open = async (page: Page, query = '') => {
      await page.goto(`${entry}${query}`);
      await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeVisible();
    };
    const release = (page: Page) => page.evaluate(() => window.__workflow.release());
    const hold = (page: Page) => page.evaluate(() => (window.__workflow.hold = true));

    test('shows loading, then data; link-styled anchors and named icon-free actions', async ({
      page,
    }) => {
      await open(page, '?hold');
      await expect(page.getByRole('status').filter({ hasText: 'Loading projects' })).toBeVisible();
      await release(page);

      await expect(page.getByRole('cell', { name: 'Atlas', exact: true })).toBeVisible();
      await expect(page.getByRole('status').filter({ hasText: 'Loading projects' })).toBeHidden();
      // <a voltButton> is a link, not a button wrapped in a link.
      const help = page.getByRole('link', { name: 'Help' });
      await expect(help).toHaveAttribute('data-variant', 'outline');
      await expect(page.getByRole('link').locator('button')).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Edit Atlas' })).toBeVisible();
    });

    test('sorts with aria-sort, filters, paginates and tells empty from no results', async ({
      page,
    }) => {
      await open(page);
      const name = page.getByRole('columnheader', { name: 'Name' });
      await expect(name).toHaveAttribute('aria-sort', 'ascending');
      await expect(page.getByRole('columnheader', { name: 'Status' })).toHaveAttribute(
        'aria-sort',
        'none'
      );

      await name.getByRole('button').click();
      await expect(name).toHaveAttribute('aria-sort', 'descending');
      await expect(page.getByRole('cell', { name: 'Locked', exact: true })).toBeVisible();

      // Page 2 exists (7 rows / 3 per page) and is reachable by name.
      await page.getByRole('button', { name: /next/i }).click();
      await expect(page.getByRole('cell', { name: 'Cinder', exact: true })).toBeVisible();

      // Filtering resets to page 1 and shrinks the result.
      await page.getByRole('textbox', { name: 'Filter projects' }).fill('fj');
      await expect(page.getByRole('cell', { name: 'Fjord', exact: true })).toBeVisible();
      // Header row + the single match.
      await expect(page.getByRole('row')).toHaveCount(2);

      await page.getByRole('textbox', { name: 'Filter projects' }).fill('zzz');
      await expect(page.getByText('No matches for "zzz"')).toBeVisible();
      await page.getByRole('button', { name: 'Clear filter' }).click();
      // Sort is still descending, so the first page starts at the end of the alphabet.
      await expect(page.getByRole('cell', { name: 'Locked', exact: true })).toBeVisible();
    });

    test('empty dataset offers a way forward; a failed load can be retried', async ({ page }) => {
      await open(page, '?empty');
      await expect(page.getByText('No projects yet')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Create project' })).toBeVisible();

      await open(page, '?failList');
      const alert = page.getByRole('alert');
      await expect(alert).toContainText('Projects failed to load');
      await alert.getByRole('button', { name: 'Retry' }).click();
      await expect(page.getByRole('cell', { name: 'Atlas', exact: true })).toBeVisible();
      await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test('edit: server validation keeps the dialog and the values; retry saves; focus returns', async ({
      page,
    }) => {
      await open(page);
      const opener = page.getByRole('button', { name: 'Edit Atlas' });
      await opener.focus();
      await page.keyboard.press('Enter');

      const dialog = page.getByRole('dialog', { name: 'Edit Atlas' });
      await expect(dialog).toBeVisible();
      // Initial focus lands in the first field.
      const name = dialog.getByRole('textbox', { name: 'Name' });
      await expect(name).toBeFocused();

      await name.fill('Taken');
      await dialog.getByRole('textbox', { name: 'Owner' }).fill('Zoe');
      await dialog.getByRole('button', { name: 'Save' }).click();

      await expect(dialog.getByRole('alert').filter({ hasText: 'Could not save' })).toBeVisible();
      await expect(dialog.getByText('That name is already in use.')).toBeVisible();
      await expect(name).toHaveAttribute('aria-invalid', 'true');
      await expect(name).toHaveAccessibleDescription(/already in use/);
      await expect(name).toHaveValue('Taken');
      await expect(dialog.getByRole('textbox', { name: 'Owner' })).toHaveValue('Zoe');

      await name.fill('Atlas 2');
      await dialog.getByRole('button', { name: 'Save' }).click();
      await expect(dialog).toBeHidden();
      await expect(page.getByRole('status').filter({ hasText: 'Project saved' })).toBeVisible();
      await expect(page.getByRole('cell', { name: 'Atlas 2', exact: true })).toBeVisible();
    });

    test('edit: Escape and outside click are ignored while saving', async ({ page }) => {
      await open(page);
      await page.getByRole('button', { name: 'Edit Atlas' }).click();
      const dialog = page.getByRole('dialog', { name: 'Edit Atlas' });
      await dialog.getByRole('textbox', { name: 'Name' }).fill('Atlas 3');

      await hold(page);
      await dialog.getByRole('button', { name: 'Save' }).click();
      await expect(dialog.getByRole('button', { name: 'Saving…' })).toBeDisabled();

      await page.keyboard.press('Escape');
      await page.mouse.click(5, 5);
      await expect(dialog).toBeVisible();

      await release(page);
      await expect(dialog).toBeHidden();
    });

    test('nested discard confirmation returns focus inside the editor, then to the opener', async ({
      page,
    }) => {
      await open(page);
      const opener = page.getByRole('button', { name: 'Edit Borealis' });
      // Focus it first: Safari does not focus a button on click, so there would be nothing to restore.
      await opener.focus();
      await page.keyboard.press('Enter');
      const editor = page.getByRole('dialog', { name: 'Edit Borealis' });
      await editor.getByRole('textbox', { name: 'Owner' }).fill('Changed');

      await editor.getByRole('button', { name: 'Close' }).click();
      const confirm = page.getByRole('alertdialog', { name: 'Discard changes?' });
      await expect(confirm).toBeVisible();
      // The safe action is focused, not the first tabbable.
      await expect(confirm.getByRole('button', { name: 'Keep editing' })).toBeFocused();

      // Escape closes only the topmost dialog.
      await page.keyboard.press('Escape');
      await expect(confirm).toBeHidden();
      await expect(editor).toBeVisible();
      expect(await editor.evaluate(el => el.contains(document.activeElement))).toBe(true);

      await editor.getByRole('button', { name: 'Close' }).click();
      await confirm.getByRole('button', { name: 'Discard' }).click();
      await expect(editor).toBeHidden();
      await expect(confirm).toBeHidden();
      await expect(opener).toBeFocused();
    });

    test('delete: safe focus, pending ignores dismissal, failure then retry, focus survives', async ({
      page,
    }) => {
      await open(page);
      await page.getByRole('button', { name: 'Delete Atlas' }).click();

      const dialog = page.getByRole('alertdialog', { name: 'Delete Atlas?' });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();

      await page.evaluate(() => (window.__workflow.failNextDelete = true));
      await hold(page);
      await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
      await expect(dialog.getByRole('button', { name: 'Deleting…' })).toBeDisabled();
      await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();

      await page.keyboard.press('Escape');
      await page.mouse.click(5, 5);
      await expect(dialog).toBeVisible();

      await release(page);
      await expect(dialog.getByRole('alert').filter({ hasText: 'Delete failed' })).toBeVisible();
      await expect(dialog.getByRole('button', { name: 'Delete', exact: true })).toBeEnabled();

      await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
      await expect(dialog).toBeHidden();
      await expect(page.getByRole('cell', { name: 'Atlas', exact: true })).toHaveCount(0);
      await expect(page.getByRole('status').filter({ hasText: 'Project deleted' })).toBeVisible();
      // The row that opened the dialog is gone: focus moved to the page heading, not <body>.
      await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeFocused();
    });

    test('a blocked action stays focusable, explains itself, and does nothing', async ({
      page,
    }) => {
      await open(page);
      await page.getByRole('textbox', { name: 'Filter projects' }).fill('lock');
      const blocked = page.getByRole('button', { name: 'Delete Locked' });
      await expect(blocked).toBeVisible();

      await blocked.focus();
      await expect(blocked).toBeFocused();
      await expect(blocked).toHaveAttribute('aria-disabled', 'true');
      await expect(blocked).toHaveAccessibleDescription('The root project cannot be deleted.');

      await page.keyboard.press('Enter');
      // Playwright's actionability check treats aria-disabled as disabled; the point here is
      // that a real user can still press it, so force the click.
      await blocked.click({ force: true });
      await expect(page.getByRole('alertdialog')).toHaveCount(0);
      expect(await page.evaluate(() => window.__workflow.calls.remove)).toBe(0);
    });

    test('the whole delete path works from the keyboard', async ({ page, browserName }) => {
      test.skip(browserName === 'webkit', 'Tab skips buttons by default in macOS WebKit');
      await open(page);
      await page.getByRole('button', { name: 'Delete Cinder' }).focus();
      await page.keyboard.press('Enter');
      const dialog = page.getByRole('alertdialog', { name: 'Delete Cinder?' });
      await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(dialog.getByRole('button', { name: 'Delete', exact: true })).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(dialog).toBeHidden();
      await expect(page.getByRole('cell', { name: 'Cinder', exact: true })).toHaveCount(0);
    });
  });
}
