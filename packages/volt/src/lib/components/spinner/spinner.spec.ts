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
});
