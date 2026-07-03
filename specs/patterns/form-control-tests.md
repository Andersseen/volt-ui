# Pattern — Form Control Contract Tests (the 6 points from plan v0.5)

Copy this skeleton into `<name>.spec.ts` and adapt selectors/roles. It encodes the full
v0.5 forms contract. Idioms are the repo's real ones: Vitest + `@testing-library/angular`

- `userEvent`, zoneless (no fakeAsync — always `await`).

Replace `VoltCheckbox` / `volt-checkbox` / role `checkbox` / value type `boolean` with
your component's equivalents (e.g. input → role `textbox`, value `string`).

```ts
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltCheckbox } from './checkbox';

@Component({
  selector: 'app-reactive-wrapper',
  imports: [VoltCheckbox, ReactiveFormsModule],
  template: `<volt-checkbox [formControl]="control" />`,
})
class ReactiveWrapper {
  readonly control = new FormControl(false, { nonNullable: true });
}

describe('VoltCheckbox forms contract', () => {
  // 1. WRITE — programmatic value reaches the UI
  it('renders the value set via setValue', async () => {
    const { fixture } = await render(ReactiveWrapper);
    fixture.componentInstance.control.setValue(true);
    fixture.detectChanges();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  // 2. CHANGE — user interaction reaches the FormControl
  it('updates control.value and dirty state on user interaction', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(ReactiveWrapper);
    await user.click(screen.getByRole('checkbox'));
    expect(fixture.componentInstance.control.value).toBe(true);
    expect(fixture.componentInstance.control.dirty).toBe(true);
  });

  // 3. TOUCHED — blur marks the control touched
  it('marks the control touched on blur', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(ReactiveWrapper);
    const el = screen.getByRole('checkbox');
    el.focus();
    await user.tab(); // moves focus away → blur
    expect(fixture.componentInstance.control.touched).toBe(true);
  });

  // 4. DISABLED — forms-driven disable blocks interaction
  it('disables via control.disable() and ignores interaction', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(ReactiveWrapper);
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    const el = screen.getByRole('checkbox');
    expect(el).toBeDisabled(); // or: expect(el).toHaveAttribute('data-disabled')
    await user.click(el);
    expect(fixture.componentInstance.control.value).toBe(false);
    // re-enable restores interactivity
    fixture.componentInstance.control.enable();
    fixture.detectChanges();
    await user.click(el);
    expect(fixture.componentInstance.control.value).toBe(true);
  });

  // 5. TEMPLATE-DRIVEN — one ngModel smoke test
  it('works with ngModel', async () => {
    @Component({
      selector: 'app-ngmodel-wrapper',
      imports: [VoltCheckbox, FormsModule],
      template: `<volt-checkbox [(ngModel)]="value" />`,
    })
    class NgModelWrapper {
      value = false;
    }
    const user = userEvent.setup();
    const { fixture } = await render(NgModelWrapper);
    await fixture.whenStable();
    await user.click(screen.getByRole('checkbox'));
    expect(fixture.componentInstance.value).toBe(true);
  });

  // 6. INVALID STATE — invalid + touched is visually representable
  it('exposes an invalid-state hook when control is invalid and touched', async () => {
    @Component({
      selector: 'app-invalid-wrapper',
      imports: [VoltCheckbox, ReactiveFormsModule],
      template: `<volt-checkbox [formControl]="control" />`,
    })
    class InvalidWrapper {
      readonly control = new FormControl(false, {
        nonNullable: true,
        validators: c => (c.value ? null : { required: true }),
      });
    }
    const { fixture } = await render(InvalidWrapper);
    fixture.componentInstance.control.markAsTouched();
    fixture.detectChanges();
    // Adapt to the hook chosen in plan v0.5 Phase 2 (aria-invalid or a data attribute):
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });
});
```

## Notes for adapting

- **Disabled assertion:** native `<button>`/`<input>` hosts → `toBeDisabled()`.
  Non-native hosts (ng-primitives div-based widgets) → assert `data-disabled` attribute
  and `aria-disabled`.
- **Text inputs:** point 2 uses `await user.type(el, 'abc')`; point 1 asserts
  `toHaveValue('abc')`.
- **Radio/toggle-group:** the FormControl sits on the GROUP; test arrow-key navigation
  moves selection (`await user.keyboard('{ArrowDown}')`).
- **Select/combobox/listbox:** point 2 = open overlay, choose option; combine with the
  overlay pattern (`specs/patterns/overlay-tests.md`) for dismissal.
- Run just your file while iterating:
  `pnpm vitest --run projects/volt/src/lib/components/<name>/<name>.spec.ts`
- Existing partial specs (checkbox, input, switch, select, textarea) already cover some
  points — EXTEND them to the full contract; don't delete or duplicate passing tests.
