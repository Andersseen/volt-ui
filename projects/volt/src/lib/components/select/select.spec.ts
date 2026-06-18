import { Component, model } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { VoltSelect } from './select';
import { VoltSelectContent } from './select-content';
import { VoltSelectItem } from './select-item';

@Component({
  selector: 'app-select-test-wrapper',
  imports: [VoltSelect, VoltSelectContent, VoltSelectItem],
  template: `
    <volt-select [(value)]="value" placeholder="Choose an option">
      <volt-select-content>
        <volt-select-item value="a">Option A</volt-select-item>
        <volt-select-item value="b">Option B</volt-select-item>
      </volt-select-content>
    </volt-select>
  `,
})
class SelectTestWrapper {
  readonly value = model<string | undefined>(undefined);
}

describe('VoltSelect', () => {
  it('should render the select trigger with placeholder', async () => {
    await render(SelectTestWrapper);

    expect(screen.getByRole('combobox')).toHaveTextContent('Choose an option');
  });

  it('should reflect the selected value', async () => {
    await render(SelectTestWrapper, {
      componentInputs: { value: 'b' },
    });

    expect(screen.getByRole('combobox')).toHaveTextContent('b');
  });
});
