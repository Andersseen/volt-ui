import { Component, input } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
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

  describe('value contract', () => {
    @Component({
      imports: [VoltProgress, VoltProgressLabel],
      template: `
        <volt-progress [value]="value()" [min]="min()" [max]="max()">
          <volt-progress-label>Upload</volt-progress-label>
        </volt-progress>
      `,
    })
    class Bare {
      readonly value = input<number | null>(0);
      readonly min = input(0);
      readonly max = input(100);
    }

    const widthOf = (container: Element) =>
      (container.querySelector('[ngpProgressIndicator]') as HTMLElement).style.width;

    it.each([
      [0, 0, 100, '0%'],
      [50, 0, 100, '50%'],
      [100, 0, 100, '100%'],
      [100, 50, 150, '50%'],
      [-10, -20, 0, '50%'],
    ])('value %d in [%d, %d] reads and paints %s', async (value, min, max, expected) => {
      const { container } = await render(Bare, { componentInputs: { value, min, max } });
      const bar = screen.getByRole('progressbar', { name: 'Upload' });
      expect(bar).toHaveAttribute('aria-valuetext', expected);
      expect(bar).toHaveAttribute('aria-valuenow', String(value));
      expect(widthOf(container)).toBe(expected);
    });

    it('clamps a value outside the range for both the announcement and the paint', async () => {
      const { container, fixture } = await render(Bare, { componentInputs: { value: 140 } });
      const bar = screen.getByRole('progressbar');
      expect(bar).toHaveAttribute('aria-valuenow', '100');
      expect(widthOf(container)).toBe('100%');

      fixture.componentRef.setInput('value', -5);
      await fixture.whenStable();
      expect(bar).toHaveAttribute('aria-valuenow', '0');
      expect(widthOf(container)).toBe('0%');
    });

    it('is indeterminate with null: no value announced, no fill claimed', async () => {
      const { container } = await render(Bare, { componentInputs: { value: null } });
      const bar = screen.getByRole('progressbar');
      expect(bar).not.toHaveAttribute('aria-valuenow');
      expect(bar).not.toHaveAttribute('aria-valuetext');
      expect(bar).toHaveAttribute('data-indeterminate');
      expect(widthOf(container)).toBe('');
    });

    it('follows dynamic updates', async () => {
      const { container, fixture } = await render(Bare, { componentInputs: { value: 10 } });
      fixture.componentRef.setInput('value', 80);
      await fixture.whenStable();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '80');
      expect(widthOf(container)).toBe('80%');
    });
  });
});
