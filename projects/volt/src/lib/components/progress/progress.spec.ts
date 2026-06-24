import { Component, input } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/angular';
import { VoltProgress } from './progress';

@Component({
  selector: 'app-progress-test-wrapper',
  imports: [VoltProgress],
  template: `<volt-progress [value]="value()" [max]="max()" />`,
})
class ProgressTestWrapper {
  readonly value = input<number | null>(50);
  readonly max = input<number>(100);
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
});
