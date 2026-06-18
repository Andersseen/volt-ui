import { Component, input, model } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { VoltSlider } from './slider';

@Component({
  selector: 'app-slider-test-wrapper',
  imports: [VoltSlider],
  template: `<volt-slider [(value)]="value" [min]="min()" [max]="max()" [disabled]="disabled()" />`,
})
class SliderTestWrapper {
  readonly value = model(50);
  readonly min = input(0);
  readonly max = input(100);
  readonly disabled = input(false);
}

describe('VoltSlider', () => {
  it('should render a slider thumb', async () => {
    await render(SliderTestWrapper);

    const thumb = screen.getByRole('slider');
    expect(thumb).toBeInTheDocument();
    expect(thumb).toHaveAttribute('aria-valuenow', '50');
  });

  it('should reflect min and max', async () => {
    await render(SliderTestWrapper, {
      componentInputs: { min: 10, max: 200 },
    });

    const thumb = screen.getByRole('slider');
    expect(thumb).toHaveAttribute('aria-valuemin', '10');
    expect(thumb).toHaveAttribute('aria-valuemax', '200');
  });

  it('should be disabled', async () => {
    await render(SliderTestWrapper, {
      componentInputs: { disabled: true },
    });

    const thumb = screen.getByRole('slider');
    expect(thumb).toHaveAttribute('data-disabled');
  });
});
