import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { ServiceList } from './service-list';

describe('ServiceList', () => {
  it('lists every service with a number and a heading', async () => {
    const { fixture } = await render(ServiceList);
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelectorAll('.service')).toHaveLength(4);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4);
  });

  it('keeps the detail in the document rather than hiding it', async () => {
    const { fixture } = await render(ServiceList);
    const host = fixture.nativeElement as HTMLElement;

    // The row collapses with grid-template-rows, not display:none — a screen reader
    // still reaches every word, whether or not a pointer ever hovers.
    for (const detail of host.querySelectorAll('.service-detail')) {
      expect(detail.textContent?.trim().length).toBeGreaterThan(0);
      expect(getComputedStyle(detail).display).not.toBe('none');
    }
  });

  it('makes each row reachable by keyboard, which is what opens it', async () => {
    const { fixture } = await render(ServiceList);
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>(
      '.service-link'
    );

    expect(links).toHaveLength(4);
    for (const link of links) {
      link.focus();
      expect(document.activeElement).toBe(link);
    }
  });

  it('names deliverables under every service', async () => {
    const { fixture } = await render(ServiceList);
    const host = fixture.nativeElement as HTMLElement;

    for (const service of host.querySelectorAll('.service')) {
      expect(service.querySelectorAll('.service-detail li').length).toBeGreaterThan(0);
    }
  });
});
