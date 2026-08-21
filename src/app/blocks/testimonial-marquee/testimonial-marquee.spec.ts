import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { TestimonialMarquee } from './testimonial-marquee';

describe('TestimonialMarquee', () => {
  it('renders each row twice, which is what makes the loop seamless', async () => {
    const { fixture } = await render(TestimonialMarquee);
    const host = fixture.nativeElement as HTMLElement;

    const rows = host.querySelectorAll('.marquee-row');
    expect(rows).toHaveLength(2);

    for (const row of rows) {
      const groups = row.querySelectorAll('.marquee-group');
      expect(groups).toHaveLength(2);
      // Identical content is the point: -50% has to land the copy where the original was.
      expect(groups[0].textContent).toBe(groups[1].textContent);
    }
  });

  it('hides the duplicate copy, so each quote is announced once', async () => {
    const { fixture } = await render(TestimonialMarquee);
    const host = fixture.nativeElement as HTMLElement;

    for (const row of host.querySelectorAll('.marquee-row')) {
      const groups = row.querySelectorAll('.marquee-group');
      expect(groups[0].hasAttribute('aria-hidden')).toBe(false);
      expect(groups[1].getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('gives the two rows different speeds so they never fall into step', async () => {
    const { fixture } = await render(TestimonialMarquee);
    const host = fixture.nativeElement as HTMLElement;

    const speeds = [...host.querySelectorAll<HTMLElement>('.marquee-row')].map(row =>
      row.style.getPropertyValue('--speed')
    );

    expect(speeds).toHaveLength(2);
    expect(speeds[0]).not.toBe(speeds[1]);
    expect(speeds.every(speed => speed.endsWith('s'))).toBe(true);
  });

  it('sends the second row the other way', async () => {
    const { fixture } = await render(TestimonialMarquee);
    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('.marquee-row');

    expect(rows[0].classList.contains('is-reverse')).toBe(false);
    expect(rows[1].classList.contains('is-reverse')).toBe(true);
  });

  it('marks up the quotes as quotes', async () => {
    const { fixture } = await render(TestimonialMarquee);
    const host = fixture.nativeElement as HTMLElement;

    // Six testimonials, each rendered twice.
    expect(host.querySelectorAll('blockquote')).toHaveLength(12);
  });
});
