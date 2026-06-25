import { Component, input } from '@angular/core';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltButton } from './button';

@Component({
  selector: 'app-button-test-wrapper',
  imports: [VoltButton],
  template: `<volt-button [variant]="variant()" [size]="size()" [disabled]="disabled()"
    >Click me</volt-button
  >`,
})
class ButtonTestWrapper {
  readonly variant = input<'solid' | 'outline' | 'ghost' | 'link' | 'destructive'>('solid');
  readonly size = input<'sm' | 'md' | 'lg' | 'icon'>('md');
  readonly disabled = input(false);
}

@Component({
  selector: 'app-button-projection-wrapper',
  imports: [VoltButton],
  template: `
    <volt-button>
      <span slot="leading">L</span>
      Content
      <span slot="trailing">R</span>
    </volt-button>
  `,
})
class ButtonProjectionWrapper {}

describe('VoltButton', () => {
  it('should render the button with default text', async () => {
    await render(ButtonTestWrapper);

    expect(screen.getByRole('button', { name: /Click me/i })).toBeInTheDocument();
  });

  it('should apply variant and size classes', async () => {
    const { container } = await render(ButtonTestWrapper, {
      componentInputs: { variant: 'outline', size: 'lg' },
    });

    const button = container.querySelector('button');
    expect(button).toHaveClass('h-11');
    expect(button).toHaveClass('px-8');
    expect(button).toHaveClass('border');
  });

  it('should merge consumer classes from class and customClass inputs', async () => {
    const { container } = await render(VoltButton, {
      componentInputs: { class: 'w-full', customClass: 'justify-start' },
      componentProperties: {},
    });

    const button = container.querySelector('button');
    expect(button).toHaveClass('w-full');
    expect(button).toHaveClass('justify-start');
  });

  it('should be disabled and not clickable', async () => {
    const clickSpy = vi.fn();
    const user = userEvent.setup();

    @Component({
      selector: 'app-button-click-wrapper',
      imports: [VoltButton],
      template: `<volt-button [disabled]="true" (click)="onClick()">Disabled</volt-button>`,
    })
    class ButtonClickWrapper {
      onClick = clickSpy;
    }

    await render(ButtonClickWrapper);

    const button = screen.getByRole('button', { name: /Disabled/i });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should project leading and trailing content', async () => {
    await render(ButtonProjectionWrapper);

    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('R')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
