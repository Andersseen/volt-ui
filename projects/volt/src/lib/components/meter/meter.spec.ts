import { Component, input } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/angular';
import { VoltMeter } from './meter';

@Component({
  selector: 'app-meter-test-wrapper',
  imports: [VoltMeter],
  template: `<volt-meter [value]="value()" [max]="max()" />`,
})
class MeterTestWrapper {
  readonly value = input<number>(50);
  readonly max = input<number>(100);
}

describe('VoltMeter', () => {
  it('should render meter with aria attributes', async () => {
    const { container } = await render(MeterTestWrapper, {
      componentInputs: { value: 60, max: 100 },
    });

    const meter = container.querySelector('volt-meter');
    expect(meter).toBeInTheDocument();
    expect(meter).toHaveAttribute('role', 'meter');
    expect(meter).toHaveAttribute('aria-valuenow', '60');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });
});
