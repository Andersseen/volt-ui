// Plan 04 (specs/v2/plans/04-component-contracts.md), phase A: the composition matrix, observed on
// the element a user actually focuses — not on the custom element around it. Each case states the
// expected behaviour; the plan's execution record says which ones already held and which failed
// first and were fixed.
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltButton, VoltNativeButton } from './components/button';
import { VoltInput } from './components/input';
import { VoltTextarea } from './components/textarea';
import { VoltError, VoltFormField, VoltHint, VoltLabel } from './components/form-field';
import { VoltNativeSelect } from './components/select';

/** Every id an element points at through aria-describedby / aria-labelledby exists, once. */
function expectReferencesResolve(element: Element) {
  for (const attr of ['aria-describedby', 'aria-labelledby', 'aria-controls']) {
    const ids = (element.getAttribute(attr) ?? '').split(/\s+/).filter(Boolean);
    for (const id of ids) {
      expect(document.querySelectorAll(`[id="${id}"]`), `${attr} → #${id}`).toHaveLength(1);
    }
  }
}

describe('actions', () => {
  it('icon-only volt-button: the name is on the focusable button, the icon adds none', async () => {
    @Component({
      imports: [VoltButton],
      template: `<volt-button aria-label="Close"
        ><svg aria-hidden="true" data-testid="icon"></svg
      ></volt-button>`,
    })
    class Host {}
    const { container } = await render(Host);
    const button = screen.getByRole('button', { name: 'Close' });
    expect(button.tagName).toBe('BUTTON');
    expect(container.querySelector('volt-button')).not.toHaveAttribute('aria-label');
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(container.querySelector('volt-button')).not.toHaveAttribute('tabindex');
  });

  it('volt-button type="submit": click and Enter submit once; disabled submits nothing', async () => {
    const submitted = vi.fn();
    @Component({
      imports: [VoltButton, ReactiveFormsModule, VoltInput],
      template: `<form [formGroup]="form" (ngSubmit)="submit()">
        <volt-input aria-label="Name" formControlName="name" />
        <volt-button type="submit" [disabled]="off()">Save</volt-button>
      </form>`,
    })
    class Host {
      readonly form = new FormGroup({ name: new FormControl('') });
      readonly off = signal(false);
      submit = submitted;
    }
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(submitted).toHaveBeenCalledTimes(1);
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'x{Enter}');
    expect(submitted).toHaveBeenCalledTimes(2);

    fixture.componentInstance.off.set(true);
    await fixture.whenStable();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(submitted).toHaveBeenCalledTimes(2);
  });

  it('a navigation action is a real link: role link, href kept, no button role', async () => {
    @Component({
      imports: [VoltNativeButton],
      template: `<a voltButton href="/docs" target="_blank" rel="noopener">Docs</a>`,
    })
    class Host {}
    await render(Host);
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveAttribute('href', '/docs');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('aria-disabled keeps the native button focusable and its description resolves', async () => {
    @Component({
      imports: [VoltNativeButton],
      template: `<button voltButton aria-disabled="true" aria-describedby="why">Publish</button>
        <p id="why">Fill in the title first.</p>`,
    })
    class Host {}
    await render(Host);
    const button = screen.getByRole('button', { name: 'Publish' });
    button.focus();
    expect(button).toHaveFocus();
    expect(button).not.toBeDisabled();
    expect(button).toHaveAccessibleDescription('Fill in the title first.');
  });
});

describe('text controls with Forms', () => {
  @Component({
    imports: [ReactiveFormsModule, VoltInput, VoltTextarea, VoltFormField, VoltLabel],
    template: `
      <volt-form-field>
        <volt-label>Title</volt-label>
        <volt-input [formControl]="title" />
      </volt-form-field>
      <volt-form-field>
        <volt-label>Body</volt-label>
        <volt-textarea [formControl]="body" />
      </volt-form-field>
    `,
  })
  class Fields {
    readonly title = new FormControl<string | null>('first');
    readonly body = new FormControl<string | null>('text');
  }

  it('write, reset and null reach the native control without marking it dirty', async () => {
    const { fixture } = await render(Fields);
    const { title, body } = fixture.componentInstance;
    const titleBox = screen.getByRole('textbox', { name: 'Title' }) as HTMLInputElement;
    const bodyBox = screen.getByRole('textbox', { name: 'Body' }) as HTMLTextAreaElement;

    title.setValue('second');
    body.setValue('more');
    await fixture.whenStable();
    expect(titleBox.value).toBe('second');
    expect(bodyBox.value).toBe('more');

    title.setValue(null);
    body.reset();
    await fixture.whenStable();
    expect(titleBox.value).toBe('');
    expect(bodyBox.value).toBe('');
    expect(title.dirty || body.dirty).toBe(false);
  });

  it('one keystroke is one value change; disabling blocks typing and is not a change', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Fields);
    const { title } = fixture.componentInstance;
    const changes: unknown[] = [];
    title.valueChanges.subscribe(value => changes.push(value));
    const box = screen.getByRole('textbox', { name: 'Title' });

    await user.type(box, 'x');
    expect(changes).toEqual(['firstx']);

    title.disable();
    await fixture.whenStable();
    expect(box).toBeDisabled();
    const before = changes.length;
    await user.type(box, 'y');
    expect(box).toHaveValue('firstx');
    expect(changes.length).toBe(before); // typing into a disabled control is no change
  });

  it('touched on blur, not on focus', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Fields);
    const { title } = fixture.componentInstance;
    await user.click(screen.getByRole('textbox', { name: 'Title' }));
    expect(title.touched).toBe(false);
    await user.tab();
    expect(title.touched).toBe(true);
  });

  it("updateOn: 'blur' commits the typed value once, when focus leaves", async () => {
    @Component({
      imports: [ReactiveFormsModule, VoltInput, VoltTextarea],
      template: `<volt-input aria-label="City" [formControl]="city" />
        <volt-textarea aria-label="Notes" [formControl]="notes" />`,
    })
    class Host {
      readonly city = new FormControl('', { updateOn: 'blur' });
      readonly notes = new FormControl('', { updateOn: 'blur' });
    }
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    const { city, notes } = fixture.componentInstance;
    const changes: unknown[] = [];
    city.valueChanges.subscribe(value => changes.push(value));

    await user.type(screen.getByRole('textbox', { name: 'City' }), 'Lviv');
    expect(city.value).toBe('');
    expect(changes).toEqual([]);
    await user.tab();
    expect(city.value).toBe('Lviv');
    expect(city.touched).toBe(true);
    expect(changes).toEqual(['Lviv']);

    await user.type(screen.getByRole('textbox', { name: 'Notes' }), 'n');
    await user.tab();
    expect(notes.value).toBe('n');
  });
});

describe('labels, hints and errors', () => {
  @Component({
    imports: [ReactiveFormsModule, VoltInput, VoltFormField, VoltLabel, VoltHint, VoltError],
    template: `
      @for (field of fields; track field) {
        <volt-form-field>
          <volt-label>{{ field }}</volt-label>
          <volt-input [formControl]="controls[field]" />
          <volt-hint>Hint for {{ field }}</volt-hint>
          @if (controls[field].invalid && controls[field].touched) {
            <volt-error>{{ field }} is required</volt-error>
          }
        </volt-form-field>
      }
    `,
  })
  class TwoFields {
    readonly fields = ['Email', 'Phone'] as const;
    readonly controls = {
      Email: new FormControl('', Validators.required),
      Phone: new FormControl('', Validators.required),
    };
  }

  it('each label focuses its own control; ids are unique', async () => {
    const user = userEvent.setup();
    const { container } = await render(TwoFields);
    await user.click(screen.getByText('Phone'));
    expect(screen.getByRole('textbox', { name: 'Phone' })).toHaveFocus();
    const ids = [...container.querySelectorAll('[id]')].map(el => el.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('hint and error are the description; removing the error leaves no stale reference', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(TwoFields);
    const email = screen.getByRole('textbox', { name: 'Email' });
    expect(email).toHaveAccessibleDescription('Hint for Email');
    expect(email).not.toHaveAttribute('aria-invalid');

    await user.click(email);
    await user.tab();
    await fixture.whenStable();
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription(/Email is required/);
    expectReferencesResolve(email);

    await user.type(email, 'a@b.c');
    await fixture.whenStable();
    expect(screen.queryByText('Email is required')).toBeNull();
    expect(email).not.toHaveAttribute('aria-invalid');
    expectReferencesResolve(email);
    expect(email).toHaveAccessibleDescription('Hint for Email');
  });
});

describe('customisation destinations', () => {
  it('volt-input: class, id and aria-label land on the native input; the host stays a block', async () => {
    @Component({
      imports: [VoltInput],
      template: `<volt-input class="w-40 font-mono" id="sku" aria-label="SKU" />`,
    })
    class Host {}
    const { container } = await render(Host);
    const host = container.querySelector('volt-input')!;
    const input = screen.getByRole('textbox', { name: 'SKU' });
    expect(input).toHaveAttribute('id', 'sku');
    expect(input).toHaveClass('w-40', 'font-mono');
    expect(host).not.toHaveAttribute('id');
    expect(host).not.toHaveAttribute('aria-label');
    expect(host).toHaveClass('block');
    // Not duplicated: the styling utilities exist once, on the element they describe.
    expect(host).not.toHaveClass('font-mono');
  });

  it('volt-input outside a form field: a consumer aria-describedby reaches the native input', async () => {
    @Component({
      imports: [VoltInput],
      template: `<volt-input aria-label="Coupon" aria-describedby="coupon-help" />
        <p id="coupon-help">Case-insensitive.</p>`,
    })
    class Host {}
    const { container } = await render(Host);
    const input = screen.getByRole('textbox', { name: 'Coupon' });
    expect(input).toHaveAccessibleDescription('Case-insensitive.');
    expect(container.querySelector('volt-input')).not.toHaveAttribute('aria-describedby');
  });

  it('volt-textarea outside a form field: a consumer aria-describedby reaches the native textarea', async () => {
    @Component({
      imports: [VoltTextarea],
      template: `<volt-textarea aria-label="Bio" aria-describedby="bio-help" />
        <p id="bio-help">Shown on your profile.</p>`,
    })
    class Host {}
    const { container } = await render(Host);
    const textarea = screen.getByRole('textbox', { name: 'Bio' });
    expect(textarea).toHaveAccessibleDescription('Shown on your profile.');
    expect(container.querySelector('volt-textarea')).not.toHaveAttribute('aria-describedby');
  });

  it('inside a form field, a consumer aria-describedby is kept next to the hint', async () => {
    @Component({
      imports: [VoltInput, VoltFormField, VoltLabel, VoltHint],
      template: `<volt-form-field>
          <volt-label>Code</volt-label>
          <volt-input aria-describedby="extra" />
          <volt-hint>Six digits.</volt-hint>
        </volt-form-field>
        <p id="extra">Sent by SMS.</p>`,
    })
    class Host {}
    await render(Host);
    const input = screen.getByRole('textbox', { name: 'Code' });
    expect(input).toHaveAccessibleDescription(/Six digits\./);
    expect(input).toHaveAccessibleDescription(/Sent by SMS\./);
    expectReferencesResolve(input);
  });
});

describe('dynamic aria-describedby', () => {
  @Component({
    imports: [VoltInput, VoltFormField, VoltLabel, VoltHint],
    template: `<volt-form-field>
        <volt-label>Inside</volt-label>
        <volt-input [aria-describedby]="ids()" />
        <volt-hint>Hint.</volt-hint>
      </volt-form-field>
      <volt-input aria-label="Outside" [aria-describedby]="ids()" />
      <p id="one">One.</p>
      <p id="two">Two.</p>`,
  })
  class Host {
    readonly ids = signal<string | null>('one');
  }

  it('follows the binding and drops ids it no longer names, keeping the hint', async () => {
    const { fixture } = await render(Host);
    const inside = screen.getByRole('textbox', { name: 'Inside' });
    const outside = screen.getByRole('textbox', { name: 'Outside' });
    expect(inside).toHaveAccessibleDescription('Hint. One.');
    expect(outside).toHaveAccessibleDescription('One.');

    fixture.componentInstance.ids.set('two');
    await fixture.whenStable();
    expect(inside).toHaveAccessibleDescription('Hint. Two.');
    expect(outside).toHaveAccessibleDescription('Two.');

    fixture.componentInstance.ids.set(null);
    await fixture.whenStable();
    expect(inside).toHaveAccessibleDescription('Hint.');
    expect(outside).not.toHaveAttribute('aria-describedby');
  });
});

describe('native select with Forms', () => {
  it('null and reset select the empty option; one pick is one change', async () => {
    @Component({
      imports: [ReactiveFormsModule, VoltNativeSelect],
      template: `<select voltNativeSelect aria-label="Plan" [formControl]="plan">
        <option [ngValue]="null">Choose…</option>
        <option value="free">Free</option>
        <option value="pro">Pro</option>
      </select>`,
    })
    class Host {
      readonly plan = new FormControl<string | null>('pro');
    }
    const user = userEvent.setup();
    const { fixture } = await render(Host);
    const select = screen.getByRole('combobox', { name: 'Plan' }) as HTMLSelectElement;
    expect(select.value).toBe('pro');
    const changes: unknown[] = [];
    fixture.componentInstance.plan.valueChanges.subscribe(v => changes.push(v));
    await user.selectOptions(select, 'free');
    expect(changes).toEqual(['free']);
    fixture.componentInstance.plan.reset();
    await fixture.whenStable();
    expect(select.selectedOptions[0].textContent).toBe('Choose…');
  });
});
