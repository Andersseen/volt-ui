import { render, screen } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CtaMagnetic } from './cta-magnetic';

/** Puts the magnet's centre at (100, 100) so distances in the tests are easy to read. */
const stubMagnetBox = () =>
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    left: 50,
    top: 80,
    width: 100,
    height: 40,
  } as DOMRect);

const pointerMove = (host: HTMLElement, clientX: number, clientY: number) =>
  host
    .querySelector('.cta-panel')!
    .dispatchEvent(new MouseEvent('pointermove', { clientX, clientY, bubbles: true }));

describe('CtaMagnetic', () => {
  afterEach(() => vi.restoreAllMocks());

  it('pulls the button a fraction of the way toward a nearby pointer', async () => {
    stubMagnetBox();
    const { fixture } = await render(CtaMagnetic);
    const host = fixture.nativeElement as HTMLElement;

    // 50px left and 20px above the centre, well inside the 140px field.
    pointerMove(host, 50, 80);

    const magnet = host.querySelector<HTMLElement>('.magnet')!;
    expect(magnet.style.translate).toBe('-14px -5.6px');
    expect(magnet.classList.contains('is-pulled')).toBe(true);
  });

  it('lets go once the pointer is outside the field', async () => {
    stubMagnetBox();
    const { fixture } = await render(CtaMagnetic);
    const host = fixture.nativeElement as HTMLElement;
    const magnet = host.querySelector<HTMLElement>('.magnet')!;

    pointerMove(host, 50, 80);
    pointerMove(host, 400, 100);

    expect(magnet.style.translate).toBe('');
    expect(magnet.classList.contains('is-pulled')).toBe(false);
  });

  it('releases the button when the pointer leaves the panel', async () => {
    stubMagnetBox();
    const { fixture } = await render(CtaMagnetic);
    const host = fixture.nativeElement as HTMLElement;
    const magnet = host.querySelector<HTMLElement>('.magnet')!;

    pointerMove(host, 50, 80);
    host
      .querySelector('.cta-panel')!
      .dispatchEvent(new MouseEvent('pointerleave', { bubbles: true }));

    expect(magnet.style.translate).toBe('');
  });

  it('does not move the button at all when reduced motion is asked for', async () => {
    stubMagnetBox();
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);
    const { fixture } = await render(CtaMagnetic);
    const host = fixture.nativeElement as HTMLElement;

    pointerMove(host, 50, 80);

    expect(host.querySelector<HTMLElement>('.magnet')!.style.translate).toBe('');
  });

  it('labels the email field and keeps the form from navigating away', async () => {
    const { fixture } = await render(CtaMagnetic);
    const host = fixture.nativeElement as HTMLElement;

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();

    const submitted = new Event('submit', { bubbles: true, cancelable: true });
    host.querySelector('form')!.dispatchEvent(submitted);

    expect(submitted.defaultPrevented).toBe(true);
  });
});
