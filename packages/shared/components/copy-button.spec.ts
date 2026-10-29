import { fireEvent, render, screen } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CopyButton } from './copy-button';

describe('CopyButton', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('copies its value and resets its success state', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    const { fixture } = await render(CopyButton, {
      componentInputs: { code: 'const value = 42;' },
    });
    await fixture.componentInstance.copyToClipboard();
    fixture.detectChanges();
    expect(writeText).toHaveBeenCalledWith('const value = 42;');
    expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(2000);
    fixture.detectChanges();
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
  });

  it('keeps the default state when clipboard access fails', async () => {
    const error = new Error('clipboard denied');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(error) },
    });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await render(CopyButton, { componentInputs: { code: 'nope' } });
    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));

    await vi.waitFor(() => expect(consoleError).toHaveBeenCalledWith('Failed to copy:', error));
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
  });
});
