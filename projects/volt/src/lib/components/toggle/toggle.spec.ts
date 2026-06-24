import { Component, input } from '@angular/core';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltToggle } from './toggle';

@Component({
  selector: 'app-toggle-test-wrapper',
  imports: [VoltToggle],
  template: `<volt-toggle [variant]="variant()" [size]="size()" [disabled]="disabled()"
    >Bold</volt-toggle
  >`,
})
class ToggleTestWrapper {
  readonly variant = input<'default' | 'outline' | 'ghost' | 'solid'>('default');
  readonly size = input<'sm' | 'md' | 'lg' | 'icon'>('md');
  readonly disabled = input(false);
}

@Component({
  selector: 'app-toggle-form-wrapper',
  imports: [VoltToggle],
  template: `<volt-toggle (pressedChange)="onChange($event)">Italic</volt-toggle>`,
})
class ToggleFormWrapper {
  onChange = vi.fn();
}

describe('VoltToggle', () => {
  it('should render toggle button', async () => {
    await render(ToggleTestWrapper);

    expect(screen.getByRole('button', { name: /Bold/i })).toBeInTheDocument();
  });

  it('should toggle pressed state on click', async () => {
    const user = userEvent.setup();
    await render(ToggleFormWrapper);

    const button = screen.getByRole('button', { name: /Italic/i });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('should be disabled and not clickable', async () => {
    const user = userEvent.setup();
    const changeSpy = vi.fn();

    @Component({
      selector: 'app-toggle-disabled-wrapper',
      imports: [VoltToggle],
      template: `<volt-toggle [disabled]="true" (pressedChange)="onChange($event)"
        >Strike</volt-toggle
      >`,
    })
    class ToggleDisabledWrapper {
      onChange = changeSpy;
    }

    await render(ToggleDisabledWrapper);

    const button = screen.getByRole('button', { name: /Strike/i });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('data-disabled');

    await user.click(button);
    expect(changeSpy).not.toHaveBeenCalled();
  });
});
