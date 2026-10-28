import { Component, input } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/angular';
import { VoltProgress, VoltProgressLabel, VoltProgressValue } from './';

@Component({
  selector: 'app-progress-test-wrapper',
  imports: [VoltProgress, VoltProgressLabel, VoltProgressValue],
  template: `
    <volt-progress [value]="value()" [max]="max()" [valueLabel]="valueLabel()">
      <volt-progress-label>Loading</volt-progress-label>
      <volt-progress-value>50%</volt-progress-value>
    </volt-progress>
  `,
})
class ProgressTestWrapper {
  readonly value = input<number | null>(50);
  readonly max = input<number>(100);
  readonly valueLabel = input<(value: number, max: number) => string>(
    (value, max) => `${value} of ${max}`
  );
}

describe('VoltProgress', () => {
  it('should render progress track and indicator', async () => {
    const { container } = await render(ProgressTestWrapper);

    const progress = container.querySelector('volt-progress');
    expect(progress).toBeInTheDocument();

    const track = progress?.querySelector('[ngpProgressTrack]');
    const indicator = progress?.querySelector('[ngpProgressIndicator]');
    expect(track).toBeInTheDocument();
    expect(indicator).toBeInTheDocument();
  });

  it('should apply value to aria-valuenow', async () => {
    const { container } = await render(ProgressTestWrapper, {
      componentInputs: { value: 75 },
    });

    const progress = container.querySelector('volt-progress');
    expect(progress).toHaveAttribute('aria-valuenow', '75');
  });

  it('should connect projected label and value primitives', async () => {
    const { container } = await render(ProgressTestWrapper, {
      componentInputs: { value: 75 },
    });

    const progress = container.querySelector('volt-progress');
    const label = container.querySelector('volt-progress-label');
    const value = container.querySelector('volt-progress-value');
    expect(label).toHaveAttribute('id');
    expect(progress).toHaveAttribute('aria-labelledby', label?.getAttribute('id'));
    expect(progress).toHaveAttribute('aria-valuetext', '75 of 100');
    expect(value).toHaveAttribute('aria-hidden', 'true');
  });
});
