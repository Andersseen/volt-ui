# Pattern — Overlay Contract Tests (plan v0.6)

Overlays are tested at two levels. Unit specs cover state + ARIA; **focus behavior is
tested in Playwright e2e** (jsdom focus emulation is unreliable — don't fight it in
Vitest).

## Level 1 — Unit spec (Vitest): state and ARIA only

```ts
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

describe('VoltDialog', () => {
  it('is closed by default and opens from the trigger', async () => {
    const user = userEvent.setup();
    await render(DialogDemoWrapper); // wrapper with trigger + dialog content
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /open/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has correct ARIA wiring when open', async () => {
    // dialog: role="dialog" + aria-modal="true" + aria-labelledby → title id
    // menu: role="menu", items role="menuitem"
    // tooltip: role="tooltip" + trigger aria-describedby → tooltip id
    // toast: role="status" (info) or role="alert" (error)
  });
});
```

SSR-safety check belongs in unit scope too: rendering the component must not throw when
`document`/`window` are absent at construction (see GUARDRAILS rule 9 — grep is usually
enough; a render test catches field-initializer access).

## Level 2 — E2E (Playwright): focus, keyboard, dismissal

Shared helpers live in `e2e/utils/overlay.ts` (created in plan v0.6 Phase 1 — if the
file doesn't exist yet, creating it IS that task; put these helpers there):

```ts
import { expect, type Page, type Locator } from '@playwright/test';

export async function expectEscapeCloses(page: Page, overlay: Locator) {
  await expect(overlay).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(overlay).toBeHidden();
}

export async function expectOutsideClickCloses(page: Page, overlay: Locator) {
  await expect(overlay).toBeVisible();
  await page.mouse.click(4, 4); // top-left corner = outside
  await expect(overlay).toBeHidden();
}

export async function expectFocusReturn(
  page: Page,
  trigger: Locator,
  closeAction: () => Promise<void>
) {
  await closeAction();
  await expect(trigger).toBeFocused();
}

export async function expectFocusTrap(page: Page, overlay: Locator, tabPresses = 10) {
  for (let i = 0; i < tabPresses; i++) {
    await page.keyboard.press('Tab');
    const inside = await overlay.evaluate(el => el.contains(document.activeElement));
    expect(inside).toBe(true);
  }
}
```

Typical modal test (dialog/drawer):

```ts
test('dialog focus contract', async ({ page }) => {
  await page.goto('/docs/components/dialog');
  const trigger = page.getByRole('button', { name: /open dialog/i }).first();
  await trigger.click();
  const dialog = page.getByRole('dialog');

  await expect(dialog).toBeVisible();
  // 1. focus moved inside on open
  expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
  // 2. trap
  await expectFocusTrap(page, dialog);
  // 3. escape closes + 4. focus returns
  await expectFocusReturn(page, trigger, () => expectEscapeCloses(page, dialog));
});
```

## Contract → test mapping (what each overlay MUST have)

| Overlay       |   Escape    | Outside click | Focus trap | Focus return |     Keyboard nav      | Extra                                    |
| ------------- | :---------: | :-----------: | :--------: | :----------: | :-------------------: | ---------------------------------------- |
| dialog        |      ✔      | configurable  |     ✔      |      ✔       |           —           | aria-modal, scroll lock, nested case     |
| drawer        |      ✔      | configurable  |     ✔      |      ✔       |           —           | same as dialog                           |
| popover       |      ✔      |       ✔       |     —      |      ✔       |           —           | flip/shift stays in viewport             |
| dropdown-menu |      ✔      |       ✔       |     —      |      ✔       | arrows/Home/End/Enter | role=menu/menuitem                       |
| tooltip       |      ✔      |       —       |   never    |     n/a      |           —           | opens on hover AND focus; closes on blur |
| toast         | dismiss btn |       —       |   never    |     n/a      |  Tab reaches dismiss  | timer pauses on hover/focus              |

## Rules

- Reuse existing e2e specs in `e2e/` — extend, don't duplicate. Escape handling for
  dialog/drawer/popover/dropdown/select already has minimal coverage there.
- Run one spec: `pnpm exec playwright test e2e/<file>.spec.ts --project=chromium`.
- If a behavior is missing in the component (not just untested), fixing it is in scope
  for plan v0.6 Phases 2–3; follow ng-primitives docs for the right directive option
  before writing custom code.
- Never `waitForTimeout` to "fix" flake; use `expect(...).toBeVisible/Hidden` auto-wait.
