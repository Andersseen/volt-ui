import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BlockThumbnail } from './block-thumbnail';
import { BLOCKS } from '../lib/blocks-metadata';

describe('BlockThumbnail', () => {
  it.each(BLOCKS.map(block => block.slug))('renders the real %s block', async slug => {
    const { fixture } = await render(BlockThumbnail, { inputs: { slug } });
    const host = fixture.nativeElement as HTMLElement;

    // Every block is a <section>; an unhandled slug would render an empty stage instead.
    expect(host.querySelector('section')).not.toBeNull();
  });

  it('takes the whole preview out of the tab order and the accessibility tree', async () => {
    const { fixture } = await render(BlockThumbnail, { inputs: { slug: 'pricing' } });
    const host = fixture.nativeElement as HTMLElement;

    // A card is one link. Without `inert`, the buttons inside every thumbnail would each
    // be a separate tab stop inside it.
    expect(host.hasAttribute('inert')).toBe(true);
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.querySelectorAll('button').length).toBeGreaterThan(0);
  });
});
