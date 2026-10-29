import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BgLightThreads, buildThreads } from './bg-light-threads';

@Component({
  imports: [BgLightThreads],
  template: `<app-bg-light-threads><h2>Our own headline</h2></app-bg-light-threads>`,
})
class WithContent {}

describe('BgLightThreads', () => {
  it('shows its demo copy when nothing is projected', async () => {
    await render(BgLightThreads);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Ship interfaces you can own.' })
    ).toBeVisible();
  });

  it('puts projected content in front of the threads instead of the demo', async () => {
    await render(WithContent);

    expect(screen.getByRole('heading', { level: 2, name: 'Our own headline' })).toBeVisible();
    expect(screen.queryByText('Ship interfaces you can own.')).not.toBeInTheDocument();
  });

  it('draws one rail and one pulse per thread, hidden from assistive technology', async () => {
    const { container } = await render(BgLightThreads, { inputs: { count: 6 } });
    const svg = container.querySelector('svg')!;

    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.querySelectorAll('path.rail')).toHaveLength(6);
    expect(svg.querySelectorAll('path.pulse')).toHaveLength(6);
  });

  it('places the glow where the threads meet', async () => {
    const { container } = await render(BgLightThreads, { inputs: { focusX: 0.3, focusY: 0.4 } });
    const glow = container.querySelector<HTMLElement>('.glow')!;

    expect(glow.style.left).toBe('30%');
    expect(glow.style.top).toBe('40%');
  });

  it('draws the same threads every time, so server and browser agree', () => {
    expect(buildThreads(5, 0.5, 0.5)).toEqual(buildThreads(5, 0.5, 0.5));
    for (const thread of buildThreads(5, 0.5, 0.5)) {
      // Every thread passes through the focus point: 600, 300 on the 1200 × 600 box.
      expect(thread.d).toContain('600.0 300.0');
    }
  });
});
