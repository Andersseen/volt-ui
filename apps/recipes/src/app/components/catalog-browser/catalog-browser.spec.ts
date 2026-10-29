import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { entriesOf, groupsOf } from '../../lib/catalog';
import { CatalogBrowser } from './catalog-browser';

const listing = async (kind: 'blocks' | 'layouts' | 'recipes' = 'blocks', url = '/') => {
  const view = await render(CatalogBrowser, {
    inputs: { kind, titleKey: 'gallery.blocks.title', ledeKey: 'gallery.blocks.lede' },
    providers: [provideRouter([])],
  });
  const router = TestBed.inject(Router);
  await router.navigateByUrl(url);
  await view.fixture.whenStable();
  return { ...view, router };
};

/** The listing's own section headings, not the headings inside the block thumbnails. */
const sectionHeadings = (container: Element) =>
  Array.from(container.querySelectorAll(':scope > div > section > div > h2')).map(heading =>
    heading.textContent?.trim()
  );

const status = () => screen.getByText(/^Showing \d+ of \d+$/);

describe('CatalogBrowser', () => {
  // The thumbnails render real blocks, some of which draw on a canvas jsdom does not have.
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  it('opens on the overview: every entry, under its category heading', async () => {
    const { container } = await listing();
    const blocks = entriesOf('blocks');

    expect(status()).toHaveTextContent(`Showing ${blocks.length} of ${blocks.length}`);
    expect(sectionHeadings(container)).toHaveLength(groupsOf('blocks').length);
  });

  it('narrows to one category from its chip, and writes it to the URL', async () => {
    const { router, fixture } = await listing();
    const backgrounds = entriesOf('blocks').filter(entry => entry.groupId === 'backgrounds');

    await userEvent.click(screen.getByRole('radio', { name: /^Backgrounds/ }));
    await fixture.whenStable();

    expect(router.url).toBe('/?category=backgrounds');
    expect(status()).toHaveTextContent(`Showing ${backgrounds.length} of`);
  });

  it('renders a shared link to a filtered view as filtered, flat and labelled', async () => {
    const { container } = await listing('blocks', '/?category=backgrounds');

    // No category headings in a filtered view; each card names its category instead.
    expect(sectionHeadings(container)).toEqual([]);
    expect(screen.getAllByText('Backgrounds', { selector: 'app-catalog-card p' })).toHaveLength(3);
    expect(screen.getByRole('radio', { name: /^Backgrounds/ })).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });

  it('finds entries by the Volt atom they are built from', async () => {
    const { fixture, router } = await listing();

    await userEvent.type(screen.getByRole('searchbox', { name: 'Search the catalog' }), 'switch');
    await fixture.whenStable();

    const withSwitch = entriesOf('blocks').filter(entry =>
      entry.atoms.some(atom => atom.name === 'VoltSwitch')
    );
    expect(router.url).toBe('/?q=switch');
    expect(status()).toHaveTextContent(`Showing ${withSwitch.length} of`);
  });

  it('says so when nothing matches, and clears back to everything', async () => {
    const { fixture } = await listing('blocks', '/?q=nothing-is-called-this');

    expect(screen.getByText('Nothing matches')).toBeInTheDocument();

    const empty = screen.getByText('Nothing matches').closest('volt-empty-state') as HTMLElement;
    await userEvent.click(within(empty).getByRole('button', { name: 'Clear filters' }));
    await fixture.whenStable();

    expect(screen.queryByText('Nothing matches')).not.toBeInTheDocument();
    expect(status()).toHaveTextContent(`Showing ${entriesOf('blocks').length} of`);
  });

  it('sorts A–Z into one flat grid', async () => {
    const { container } = await listing('blocks', '/?sort=name');

    expect(sectionHeadings(container)).toEqual([]);
    expect(screen.getByRole('radio', { name: 'A–Z' })).toHaveAttribute('aria-checked', 'true');
  });

  it('offers no categories or sort for a catalog that has no groups', async () => {
    await listing('recipes');

    expect(screen.queryByRole('radio', { name: /^All/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: 'A–Z' })).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search the catalog' })).toBeInTheDocument();
  });

  it('explains the three catalogs and marks the one on screen', async () => {
    await listing('layouts');
    const kinds = screen.getByRole('navigation', { name: 'Blocks, layouts or recipes?' });

    expect(within(kinds).getByRole('link', { name: 'Layouts' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(within(kinds).getByRole('link', { name: 'Blocks' })).not.toHaveAttribute('aria-current');
  });
});
