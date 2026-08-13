import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { COMPONENTS } from '../lib/component-metadata';
import { ComponentPreview } from './component-preview';

describe('ComponentPreview', () => {
  it('is decorative, so the catalog card stays a single link target', async () => {
    const { fixture } = await render(ComponentPreview, {
      inputs: { name: 'button' },
    });

    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.className).toContain('pointer-events-none');
  });

  it('renders a real component for the named preview', async () => {
    const { container } = await render(ComponentPreview, { inputs: { name: 'switch' } });

    // Queried through the DOM rather than by role: the host is aria-hidden, so the
    // preview is deliberately absent from the accessibility tree.
    expect(container.querySelector('volt-switch')).toBeInTheDocument();
    expect(container.textContent).toContain('Airplane mode');
  });

  /** True when the @switch fell through to the bare placeholder box. */
  const isPlaceholder = (host: HTMLElement): boolean =>
    host.children.length === 1 &&
    host.firstElementChild?.className === 'h-8 w-24 rounded-md bg-muted';

  it('falls back to a placeholder for an unknown component', async () => {
    const { fixture } = await render(ComponentPreview, { inputs: { name: 'not-a-component' } });

    // Guards the check below: proves it can actually observe the fallback.
    expect(isPlaceholder(fixture.nativeElement as HTMLElement)).toBe(true);
  });

  it.each(COMPONENTS.map(component => component.name))(
    'has a dedicated preview for %s',
    async name => {
      const { fixture } = await render(ComponentPreview, { inputs: { name } });

      expect(
        isPlaceholder(fixture.nativeElement as HTMLElement),
        `${name} falls back to the placeholder preview`
      ).toBe(false);
    }
  );
});
