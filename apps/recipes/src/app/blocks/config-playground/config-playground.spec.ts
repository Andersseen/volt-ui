import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfigPlayground } from './config-playground';

const snippet = () => screen.getByText(/@keyframes/).textContent ?? '';

const preferReducedMotion = (reduce: boolean) =>
  vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: reduce } as MediaQueryList);

describe('ConfigPlayground', () => {
  afterEach(() => vi.restoreAllMocks());

  it('generates CSS for the starting settings', async () => {
    await render(ConfigPlayground);

    expect(snippet()).toContain('.card {\n  animation: fade-up 500ms ease-out both;\n}');
    expect(snippet()).toContain('opacity: 0;');
    expect(snippet()).toContain('transform: translateY(16px);');
  });

  it('rewrites the CSS when the easing changes, and replays the preview', async () => {
    preferReducedMotion(false);
    await render(ConfigPlayground);

    await userEvent.click(screen.getByRole('radio', { name: 'linear' }));

    expect(snippet()).toContain('animation: fade-up 500ms linear both;');
    expect(screen.getByText('played 1×')).toBeInTheDocument();
  });

  it('follows the duration slider from the keyboard', async () => {
    await render(ConfigPlayground);

    screen.getByRole('slider', { name: 'Duration in milliseconds' }).focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');

    expect(screen.getByText('Duration: 600ms')).toBeInTheDocument();
    expect(snippet()).toContain('animation: fade-up 600ms ease-out both;');
  });

  it('plays nothing on its own under reduced motion, but still replays on request', async () => {
    preferReducedMotion(true);
    await render(ConfigPlayground);

    await userEvent.click(screen.getByRole('radio', { name: 'ease-in-out' }));
    expect(screen.getByText('played 0×')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Replay' }));
    expect(screen.getByText('played 1×')).toBeInTheDocument();
  });

  it('targets the selector it is given', async () => {
    await render(ConfigPlayground, { inputs: { selector: '.toast' } });

    expect(snippet()).toMatch(/^\.toast \{/);
  });

  it('copies exactly the CSS on screen', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    const copiedCss = vi.fn();
    await render(ConfigPlayground, { on: { copiedCss } });

    await user.click(screen.getByRole('button', { name: 'Copy CSS' }));

    expect(writeText).toHaveBeenCalledWith(snippet());
    expect(copiedCss).toHaveBeenCalledWith(snippet());
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });
});
