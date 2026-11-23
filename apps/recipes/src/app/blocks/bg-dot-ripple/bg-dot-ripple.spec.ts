import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BgDotRipple } from './bg-dot-ripple';

describe('BgDotRipple', () => {
  it('keeps the drawn field out of the accessibility tree and the copy in it', async () => {
    const { fixture } = await render(BgDotRipple);
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('.field')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'One change, everywhere at once'
    );
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('needs no script: there is nothing to start or stop', async () => {
    const { fixture } = await render(BgDotRipple);

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('canvas, script')).toHaveLength(
      0
    );
  });
});
