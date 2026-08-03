import { Component, input } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/angular';
import { VoltMeter, VoltMeterIndicator, VoltMeterLabel, VoltMeterTrack, VoltMeterValue } from './';

@Component({
  selector: 'app-meter-test-wrapper',
  imports: [VoltMeter, VoltMeterIndicator, VoltMeterLabel, VoltMeterTrack, VoltMeterValue],
  template: `
    <volt-meter [value]="value()" [max]="max()">
      <volt-meter-label>Storage</volt-meter-label>
      <volt-meter-value>50%</volt-meter-value>
      <volt-meter-track><volt-meter-indicator /></volt-meter-track>
    </volt-meter>
  `,
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

  it('should connect projected label and value primitives', async () => {
    const { container } = await render(MeterTestWrapper);

    const meter = container.querySelector('volt-meter');
    const label = container.querySelector('volt-meter-label');
    const value = container.querySelector('volt-meter-value');
    expect(label).toHaveAttribute('id');
    expect(meter).toHaveAttribute('aria-labelledby', label?.getAttribute('id'));
    expect(value).toHaveAttribute('aria-hidden', 'true');
  });
});
