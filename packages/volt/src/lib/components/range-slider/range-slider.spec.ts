import { Component, input, model } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltRangeSlider } from './range-slider';

@Component({
  selector: 'app-range-slider-test-wrapper',
  imports: [VoltRangeSlider],
  template: `<volt-range-slider
    [(low)]="low"
    [(high)]="high"
    [min]="min()"
    [max]="max()"
    [disabled]="disabled()"
  />`,
})
class RangeSliderTestWrapper {
  readonly low = model(25);
  readonly high = model(75);
  readonly min = input(0);
  readonly max = input(100);
  readonly disabled = input(false);
}

describe('VoltRangeSlider', () => {
  it('should render two slider thumbs', async () => {
    await render(RangeSliderTestWrapper);

    const thumbs = screen.getAllByRole('slider');
    expect(thumbs).toHaveLength(2);
    expect(thumbs[0]).toHaveAttribute('aria-valuenow', '25');
    expect(thumbs[1]).toHaveAttribute('aria-valuenow', '75');
  });

  it('should reflect min and max', async () => {
    await render(RangeSliderTestWrapper, {
      componentInputs: { min: 10, max: 200 },
    });

    const [low, high] = screen.getAllByRole('slider');
    expect(low).toHaveAttribute('aria-valuemin', '10');
    expect(low).toHaveAttribute('aria-valuemax', '200');
    expect(high).toHaveAttribute('aria-valuemin', '10');
    expect(high).toHaveAttribute('aria-valuemax', '200');
  });

  it('should be disabled', async () => {
    await render(RangeSliderTestWrapper, {
      componentInputs: { disabled: true },
    });

    const [low, high] = screen.getAllByRole('slider');
    expect(low).toHaveAttribute('data-disabled');
    expect(high).toHaveAttribute('data-disabled');
  });

  it('should work with reactive forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-range-slider-form-wrapper',
      imports: [ReactiveFormsModule, VoltRangeSlider],
      template: `<volt-range-slider
        [formControl]="control"
        ariaLabelLow="Minimum price"
        ariaLabelHigh="Maximum price"
      />`,
    })
    class RangeSliderFormWrapper {
      control = new FormControl<[number, number]>([20, 80], { nonNullable: true });
    }

    const { fixture } = await render(RangeSliderFormWrapper);
    const [low, high] = screen.getAllByRole('slider');

    expect(low).toHaveAttribute('aria-valuenow', '20');
    expect(high).toHaveAttribute('aria-valuenow', '80');

    fixture.componentInstance.control.setValue([30, 90]);
    fixture.detectChanges();
    expect(low).toHaveAttribute('aria-valuenow', '30');
    expect(high).toHaveAttribute('aria-valuenow', '90');

    low.focus();
    await user.keyboard('{ArrowRight}');
    expect(fixture.componentInstance.control.value).toEqual([31, 90]);

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(low).toHaveAttribute('data-disabled');

    low.blur();
    await user.keyboard('{ArrowRight}');
    expect(fixture.componentInstance.control.value).toEqual([31, 90]);
  });

  it('should mark reactive forms control as touched on blur and expose invalid state', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-range-slider-invalid-wrapper',
      imports: [ReactiveFormsModule, VoltRangeSlider],
      template: `<volt-range-slider
        [formControl]="control"
        ariaLabelLow="Minimum"
        ariaLabelHigh="Maximum"
      />`,
    })
    class RangeSliderInvalidWrapper {
      control = new FormControl<[number, number] | null>(null, Validators.required);
    }

    const { fixture } = await render(RangeSliderInvalidWrapper);
    const [low] = screen.getAllByRole('slider');

    expect(low).not.toHaveAttribute('aria-invalid');

    low.focus();
    await user.tab();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.touched).toBe(true);
    expect(low).toHaveAttribute('aria-invalid', 'true');
  });

  it('should work with template-driven forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-range-slider-ng-model-wrapper',
      imports: [FormsModule, VoltRangeSlider],
      template: `<volt-range-slider
        [(ngModel)]="value"
        ariaLabelLow="Minimum"
        ariaLabelHigh="Maximum"
      />`,
    })
    class RangeSliderNgModelWrapper {
      value: [number, number] = [10, 90];
    }

    const { fixture } = await render(RangeSliderNgModelWrapper);
    await fixture.whenStable();
    fixture.detectChanges();
    const [low] = screen.getAllByRole('slider');

    expect(low).toHaveAttribute('aria-valuenow', '10');

    low.focus();
    await user.keyboard('{ArrowRight}');

    expect(fixture.componentInstance.value).toEqual([11, 90]);
  });
});
