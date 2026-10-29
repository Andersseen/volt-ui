import { Component, input, model } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
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

  it('should work with reactive forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-slider-form-wrapper',
      imports: [ReactiveFormsModule, VoltSlider],
      template: `<volt-slider [formControl]="control" ariaLabel="Volume" />`,
    })
    class SliderFormWrapper {
      control = new FormControl(25, { nonNullable: true });
    }

    const { fixture } = await render(SliderFormWrapper);
    const thumb = screen.getByRole('slider');

    expect(thumb).toHaveAttribute('aria-valuenow', '25');

    fixture.componentInstance.control.setValue(40);
    fixture.detectChanges();
    expect(thumb).toHaveAttribute('aria-valuenow', '40');

    thumb.focus();
    await user.keyboard('{ArrowRight}');
    expect(fixture.componentInstance.control.value).toBe(41);

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(thumb).toHaveAttribute('data-disabled');

    thumb.blur();
    await user.keyboard('{ArrowRight}');
    expect(fixture.componentInstance.control.value).toBe(41);
  });

  it('should mark reactive forms control as touched on blur and expose invalid state', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-slider-invalid-wrapper',
      imports: [ReactiveFormsModule, VoltSlider],
      template: `<volt-slider [formControl]="control" ariaLabel="Volume" />`,
    })
    class SliderInvalidWrapper {
      control = new FormControl<number | null>(null, Validators.required);
    }

    const { fixture } = await render(SliderInvalidWrapper);
    const thumb = screen.getByRole('slider');

    expect(thumb).not.toHaveAttribute('aria-invalid');

    thumb.focus();
    await user.tab();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.touched).toBe(true);
    expect(thumb).toHaveAttribute('aria-invalid', 'true');
  });

  it('should work with template-driven forms', async () => {
    const user = userEvent.setup();

    @Component({
      selector: 'app-slider-ng-model-wrapper',
      imports: [FormsModule, VoltSlider],
      template: `<volt-slider [(ngModel)]="value" ariaLabel="Volume" />`,
    })
    class SliderNgModelWrapper {
      value = 10;
    }

    const { fixture } = await render(SliderNgModelWrapper);
    await fixture.whenStable();
    fixture.detectChanges();
    const thumb = screen.getByRole('slider');

    expect(thumb).toHaveAttribute('aria-valuenow', '10');

    thumb.focus();
    await user.keyboard('{ArrowRight}');

    expect(fixture.componentInstance.value).toBe(11);
  });

  it('should support keyboard min and max shortcuts', async () => {
    const user = userEvent.setup();
    await render(SliderTestWrapper);

    const thumb = screen.getByRole('slider');
    thumb.focus();

    await user.keyboard('{End}');
    expect(thumb).toHaveAttribute('aria-valuenow', '100');

    await user.keyboard('{Home}');
    expect(thumb).toHaveAttribute('aria-valuenow', '0');
  });
});
