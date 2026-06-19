import { Component, input, model } from '@angular/core';
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
});
