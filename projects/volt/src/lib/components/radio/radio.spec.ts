import { Component, input, model } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltRadioGroup } from './radio-group';
import { VoltRadioItem } from './radio-item';

@Component({
  selector: 'app-radio-test-wrapper',
  imports: [VoltRadioGroup, VoltRadioItem],
  template: `
    <volt-radio-group [(value)]="value" [disabled]="disabled()">
      <volt-radio-item value="a">Option A</volt-radio-item>
      <volt-radio-item value="b">Option B</volt-radio-item>
    </volt-radio-group>
  `,
})
class RadioTestWrapper {
  readonly value = model<string | null>(null);
  readonly disabled = input(false);
}

describe('VoltRadio', () => {
  it('should render radio items', async () => {
    await render(RadioTestWrapper);

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
  });

  it('should select a radio item on click', async () => {
    const user = userEvent.setup();
    await render(RadioTestWrapper);

    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');

    await user.click(radios[0]);
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    expect(radios[1]).toHaveAttribute('aria-checked', 'false');
  });

  it('should reflect external value', async () => {
    await render(RadioTestWrapper, {
      componentInputs: { value: 'b' },
    });

    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
  });

  it('should render labels next to radio items', async () => {
    await render(RadioTestWrapper);

    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  it('should disable all radio items from the group', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(RadioTestWrapper, {
      componentInputs: { disabled: true },
    });

    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('data-disabled');
    expect(radios[1]).toHaveAttribute('data-disabled');

    await user.click(radios[0]);
    expect(fixture.componentInstance.value()).toBeNull();
  });

  it('should select a radio item when it receives keyboard focus', async () => {
    const user = userEvent.setup();
    await render(RadioTestWrapper);

    const radios = screen.getAllByRole('radio');

    await user.tab();

    expect(document.activeElement).toBe(radios[0]);
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
  });

  it('should work with reactive forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-radio-form-wrapper',
      imports: [ReactiveFormsModule, VoltRadioGroup, VoltRadioItem],
      template: `
        <volt-radio-group [formControl]="control">
          <volt-radio-item value="a">Option A</volt-radio-item>
          <volt-radio-item value="b">Option B</volt-radio-item>
        </volt-radio-group>
      `,
    })
    class RadioFormWrapper {
      control = new FormControl<string | null>('a');
    }

    const { fixture } = await render(RadioFormWrapper);
    const radios = screen.getAllByRole('radio');

    expect(radios[0]).toHaveAttribute('aria-checked', 'true');

    fixture.componentInstance.control.setValue('b');
    fixture.detectChanges();
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');

    await user.click(radios[0]);
    expect(fixture.componentInstance.control.value).toBe('a');

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(radios[0]).toHaveAttribute('data-disabled');

    await user.click(radios[1]);
    expect(fixture.componentInstance.control.value).toBe('a');
  });

  it('should mark reactive forms control as touched on blur and expose invalid state', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-radio-invalid-wrapper',
      imports: [ReactiveFormsModule, VoltRadioGroup, VoltRadioItem],
      template: `
        <volt-radio-group [formControl]="control">
          <volt-radio-item value="a">Option A</volt-radio-item>
          <volt-radio-item value="b">Option B</volt-radio-item>
        </volt-radio-group>
      `,
    })
    class RadioInvalidWrapper {
      control = new FormControl<string | null>(null, () => ({ invalid: true }));
    }

    const { fixture } = await render(RadioInvalidWrapper);
    const group = screen.getByRole('radiogroup');

    expect(group).not.toHaveAttribute('aria-invalid');

    await user.tab();
    await user.tab();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.touched).toBe(true);
    expect(group).toHaveAttribute('aria-invalid', 'true');
  });

  it('should work with template-driven forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-radio-ng-model-wrapper',
      imports: [FormsModule, VoltRadioGroup, VoltRadioItem],
      template: `
        <volt-radio-group [(ngModel)]="value">
          <volt-radio-item value="a">Option A</volt-radio-item>
          <volt-radio-item value="b">Option B</volt-radio-item>
        </volt-radio-group>
      `,
    })
    class RadioNgModelWrapper {
      value: string | null = 'a';
    }

    const { fixture } = await render(RadioNgModelWrapper);
    await fixture.whenStable();
    fixture.detectChanges();
    const radios = screen.getAllByRole('radio');

    expect(radios[0]).toHaveAttribute('aria-checked', 'true');

    await user.click(radios[1]);

    expect(fixture.componentInstance.value).toBe('b');
  });
});
