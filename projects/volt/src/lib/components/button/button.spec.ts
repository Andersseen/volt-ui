import { Component, input, signal } from '@angular/core';
import { provideRouter, RouterLink } from '@angular/router';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { VoltButton } from './button';
import { VoltNativeButton } from './native-button';

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

  it('should default to type button to avoid accidental form submits', async () => {
    const { container } = await render(VoltButton);

    const button = container.querySelector('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('should allow submit buttons when explicitly requested', async () => {
    const { container } = await render(VoltButton, {
      componentInputs: { type: 'submit' },
    });

    const button = container.querySelector('button');
    expect(button).toHaveAttribute('type', 'submit');
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

  describe('ARIA forwarding', () => {
    it('names an icon-only button from aria-label on the host', async () => {
      const { container } = await render(
        `<volt-button size="icon" aria-label="Switch theme"><svg aria-hidden="true"></svg></volt-button>`,
        { imports: [VoltButton] }
      );

      const button = screen.getByRole('button', { name: 'Switch theme' });
      expect(button.tagName).toBe('BUTTON');
      // The host has no role, so a label left there would be ignored; it is moved, not copied.
      expect(container.querySelector('volt-button')).not.toHaveAttribute('aria-label');
    });

    it('forwards bound state attributes to the native button', async () => {
      @Component({
        imports: [VoltButton],
        template: `
          <volt-button
            [aria-expanded]="open()"
            [aria-pressed]="pressed()"
            aria-controls="menu"
            aria-haspopup="menu"
            aria-describedby="hint"
            aria-labelledby="label"
            (click)="open.set(!open())"
            >Menu</volt-button
          >
        `,
      })
      class AriaWrapper {
        readonly open = signal(false);
        readonly pressed = signal<boolean | 'mixed'>('mixed');
      }

      const { container, fixture } = await render(AriaWrapper);
      const button = container.querySelector('volt-button > button')!;
      const host = container.querySelector('volt-button')!;

      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-pressed', 'mixed');
      expect(button).toHaveAttribute('aria-controls', 'menu');
      expect(button).toHaveAttribute('aria-haspopup', 'menu');
      expect(button).toHaveAttribute('aria-describedby', 'hint');
      expect(button).toHaveAttribute('aria-labelledby', 'label');
      for (const attr of [
        'aria-controls',
        'aria-haspopup',
        'aria-describedby',
        'aria-labelledby',
      ]) {
        expect(host).not.toHaveAttribute(attr);
      }

      await userEvent.setup().click(button);
      fixture.detectChanges();
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('omits ARIA attributes that were not set', async () => {
      const { container } = await render(`<volt-button>Plain</volt-button>`, {
        imports: [VoltButton],
      });
      const button = container.querySelector('button')!;

      for (const attr of ['aria-label', 'aria-expanded', 'aria-pressed', 'aria-haspopup']) {
        expect(button).not.toHaveAttribute(attr);
      }
    });
  });
});

describe('VoltNativeButton (voltButton)', () => {
  it('styles a native <button> without adding a wrapper or a role', async () => {
    const { container } = await render(`<button voltButton type="submit">Save</button>`, {
      imports: [VoltNativeButton],
    });

    const button = screen.getByRole('button', { name: 'Save' });
    expect(container.firstElementChild).toBe(button);
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).not.toHaveAttribute('role');
    expect(button).toHaveClass('bg-primary', 'h-10');
  });

  it('matches <volt-button> classes for every variant and size', async () => {
    const variants = ['solid', 'destructive', 'outline', 'ghost', 'link'];
    const sizes = ['sm', 'md', 'lg', 'icon'];
    const pairs = variants.flatMap(variant => sizes.map(size => ({ variant, size })));

    const { container } = await render(
      pairs
        .map(
          ({ variant, size }) =>
            `<volt-button variant="${variant}" size="${size}">A</volt-button>` +
            `<button voltButton variant="${variant}" size="${size}">B</button>`
        )
        .join(''),
      { imports: [VoltButton, VoltNativeButton] }
    );

    const buttons = Array.from(container.querySelectorAll('button'));
    pairs.forEach(({ variant, size }, i) => {
      const [wrapped, native] = [buttons[i * 2], buttons[i * 2 + 1]];
      expect(native.className, `${variant}/${size}`).toBe(wrapped.className);
      expect(native).toHaveAttribute('data-variant', variant);
      expect(native).toHaveAttribute('data-size', size);
    });
  });

  it('keeps aria-* and ids on the element the consumer wrote them on', async () => {
    await render(
      `<button voltButton size="icon" id="theme" aria-label="Switch theme" aria-expanded="false" aria-controls="panel">
        <svg aria-hidden="true"></svg>
      </button>`,
      { imports: [VoltNativeButton] }
    );

    const button = screen.getByRole('button', { name: 'Switch theme' });
    expect(button).toHaveAttribute('id', 'theme');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-controls', 'panel');
  });

  it('disables a native button and blocks clicks', async () => {
    const onClick = vi.fn();
    await render(`<button voltButton disabled (click)="onClick()">Save</button>`, {
      imports: [VoltNativeButton],
      componentProperties: { onClick },
    });

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-disabled');
    await userEvent.setup().click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders a real link with routerLink — no nested interactive element', async () => {
    const { container } = await render(
      `<a voltButton variant="outline" size="lg" routerLink="/docs">Documentation</a>`,
      { imports: [VoltNativeButton, RouterLink], providers: [provideRouter([])] }
    );

    const link = screen.getByRole('link', { name: 'Documentation' });
    expect(link).toHaveAttribute('href', '/docs');
    expect(link).toHaveClass('border', 'h-11');
    expect(container.querySelector('a button, button a')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders an external link with href and target', async () => {
    await render(
      `<a voltButton variant="ghost" href="https://github.com/Andersseen/volt-ui" target="_blank" rel="noopener">GitHub</a>`,
      { imports: [VoltNativeButton] }
    );

    const link = screen.getByRole('link', { name: 'GitHub' });
    expect(link).toHaveAttribute('href', 'https://github.com/Andersseen/volt-ui');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('never marks a link disabled, and warns in dev mode', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(`<a voltButton href="/x" disabled>Link</a>`, { imports: [VoltNativeButton] });

    const link = screen.getByRole('link', { name: 'Link' });
    expect(link).not.toHaveAttribute('disabled');
    expect(link).not.toHaveAttribute('aria-disabled');
    expect(link).not.toHaveAttribute('data-disabled');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('has no effect on <a>'));
    warn.mockRestore();
  });

  it('projects leading and trailing content in order', async () => {
    await render(
      `<button voltButton><svg data-testid="lead" aria-hidden="true"></svg>Next<svg data-testid="trail" aria-hidden="true"></svg></button>`,
      { imports: [VoltNativeButton] }
    );

    const button = screen.getByRole('button', { name: 'Next' });
    expect(button.firstElementChild).toBe(screen.getByTestId('lead'));
    expect(button.lastElementChild).toBe(screen.getByTestId('trail'));
  });
});
