import { Component, signal } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { VoltSpinner } from './spinner';

describe('VoltSpinner', () => {
  it('is decorative by default: hidden from assistive tech, no role', async () => {
    const { container } = await render(`<volt-spinner />`, { imports: [VoltSpinner] });
    const spinner = container.querySelector('volt-spinner')!;

    expect(spinner).toHaveAttribute('aria-hidden', 'true');
    expect(spinner).not.toHaveAttribute('role');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('becomes a polite status with visually hidden text when labelled', async () => {
    const { container } = await render(`<volt-spinner label="Loading results" />`, {
      imports: [VoltSpinner],
    });

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Loading results');
    expect(status).not.toHaveAttribute('aria-hidden');
    expect(container.querySelector('.sr-only')).toHaveTextContent('Loading results');
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it.each([
    ['sm', 'size-4'],
    ['md', 'size-5'],
    ['lg', 'size-8'],
  ])('applies the %s size', async (size, cls) => {
    const { container } = await render(`<volt-spinner size="${size}" />`, {
      imports: [VoltSpinner],
    });

    expect(container.querySelector('volt-spinner')).toHaveClass(cls);
  });

  it('slows down instead of stopping under reduced motion', async () => {
    const { container } = await render(`<volt-spinner />`, { imports: [VoltSpinner] });

    expect(container.querySelector('volt-spinner')!.className).toContain(
      'motion-reduce:[&>svg]:[animation-duration:1.5s]'
    );
  });

  it('follows a changing label with one status, and drops it when the label is cleared', async () => {
    @Component({
      imports: [VoltSpinner],
      template: `<volt-spinner [label]="label()" />`,
    })
    class Host {
      readonly label = signal('Loading results');
    }
    const { fixture } = await render(Host);

    fixture.componentInstance.label.set('Loading page 2');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Loading page 2');

    fixture.componentInstance.label.set('');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(screen.queryByRole('status')).toBeNull();
    expect(fixture.nativeElement.querySelector('volt-spinner')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('takes its colour from the surrounding text and lets a consumer class override size', async () => {
    const { container } = await render(`<volt-spinner size="sm" class="size-6 text-primary" />`, {
      imports: [VoltSpinner],
    });
    const spinner = container.querySelector('volt-spinner')!;

    expect(spinner).toHaveClass('size-6', 'text-primary');
    expect(spinner).not.toHaveClass('size-4', 'text-current');
    expect(container.querySelector('svg')).toHaveAttribute('stroke', 'currentColor');
  });
});
