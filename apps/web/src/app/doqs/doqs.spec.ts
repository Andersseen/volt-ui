import { inputBinding, outputBinding } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { UrlSegment, type UrlMatcher } from '@angular/router';
import { DOQ_I18N_ADAPTER, validateDoqPlaygrounds } from '@doqs/analog';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { flattenLinks } from '../lib/docs-nav';
import { COMPONENTS_SIDEBAR, GUIDE_SIDEBAR } from '../lib/docs-sidebar';
import { doqConfig } from './doq.config';
import { isComponentPage } from './doq-host-layout';
import { provideSiteDoqI18n } from './doq-messages';
import { DOQ_REGION_ROUTE } from './doq-region';
import { CheckboxExample } from './examples/checkbox-example';
import { NativeSelectExample } from './examples/native-select-example';
import { CheckboxPlayground } from './playgrounds/checkbox-playground';
import { FormFieldPlayground } from './playgrounds/form-field-playground';
import { InputPlayground } from './playgrounds/input-playground';

const claims = (url: string): boolean => {
  const segments = url
    .split('/')
    .filter(Boolean)
    .map(path => new UrlSegment(path, {}));
  return !!(DOQ_REGION_ROUTE.matcher as UrlMatcher)(segments, {} as never, DOQ_REGION_ROUTE);
};

describe('the Doqs region route', () => {
  it('is reached only by documentation pages, in every locale', () => {
    for (const url of [
      '/docs/introduction',
      '/docs/components/input',
      '/es/docs/themes',
      '/uk/docs/components/select',
    ]) {
      expect(claims(url), url).toBe(true);
    }
    // The home page, Theme Studio and the bare /docs (a host redirect) never load the region.
    for (const url of [
      '/',
      '/docs',
      '/es/docs',
      '/create-theme',
      '/es',
      '/fr/docs/x',
      '/documentation/x',
    ]) {
      expect(claims(url), url).toBe(false);
    }
  });

  it('consumes nothing, so the host routes after it still see the whole URL', () => {
    const segments = ['docs', 'components', 'button'].map(path => new UrlSegment(path, {}));
    const match = (DOQ_REGION_ROUTE.matcher as UrlMatcher)(segments, {} as never, DOQ_REGION_ROUTE);
    expect(match?.consumed).toEqual([]);
  });
});

describe('the Doqs configuration', () => {
  it('registers valid playgrounds, with the overlay-compatible view for Select', () => {
    expect(validateDoqPlaygrounds(doqConfig.playgrounds)).toEqual([]);
    expect(doqConfig.playgrounds?.['select'].expandedPreview).toBe('overlay-compatible');
  });

  it('registers every demo and playground the Markdown pages use, in every locale', () => {
    const registered = new Set([
      ...Object.keys(doqConfig.demos ?? {}),
      ...Object.keys(doqConfig.playgrounds ?? {}),
    ]);
    const root = join(process.cwd(), 'apps/web/src/content');
    for (const dir of ['docs', 'docs-es', 'docs-uk']) {
      const files = readdirSync(join(root, dir), { recursive: true }).filter(f =>
        String(f).endsWith('.md')
      );
      expect(files.length, dir).toBe(7);
      for (const file of files) {
        const text = readFileSync(join(root, dir, String(file)), 'utf8');
        for (const [, id] of text.matchAll(/^::(?:demo|playground)\[([\w-]+)\]$/gm)) {
          expect(registered.has(id), `${dir}/${file}: ${id}`).toBe(true);
        }
      }
    }
  });

  it('writes the usage code for what the reader changed only', () => {
    const code = doqConfig.playgrounds!['input'].code![0].code as (v: object) => string;
    expect(code({ size: 'md', state: 'default', disabled: false, required: false })).toBe(
      '<volt-input type="email" [(value)]="email" />'
    );
    expect(code({ size: 'lg', state: 'error', disabled: true })).toContain('size="lg"');
    expect(code({ size: 'lg', state: 'error', disabled: true })).toContain('[disabled]="true"');
  });
});

describe('one documentation navigation for host and Doqs pages', () => {
  // Doqs's own sidebar, outline and pager know only the Markdown pages: on a migrated page the
  // reader lost the guides, the AI tools and every host component page. The site's shell frames
  // Doqs pages instead (doq-host-layout.ts), and Doqs's navigation stays off.
  it('turns the Doqs sidebar and outline off', () => {
    expect(doqConfig.sidebar).toBe('hidden');
    expect(doqConfig.showTableOfContents).toBe(false);
  });

  it('lists every Markdown page in the site sidebar of its section', () => {
    const guides = flattenLinks(GUIDE_SIDEBAR).map(link => link.path);
    const components = flattenLinks(COMPONENTS_SIDEBAR).map(link => link.path);
    const root = join(process.cwd(), 'apps/web/src/content/docs');
    const pages = readdirSync(root, { recursive: true })
      .map(String)
      .filter(file => file.endsWith('.md'))
      .map(file => `/docs/${file.replace(/\.md$/, '')}`);

    expect(pages.length).toBeGreaterThan(0);
    for (const path of pages) {
      expect(isComponentPage(path) ? components : guides, path).toContain(path);
    }
    // Host pages stay in the same lists, so the sidebar is never only the Markdown pages.
    expect(guides).toEqual(expect.arrayContaining(['/docs/versioning', '/docs/ai-skill']));
    expect(components).toEqual(expect.arrayContaining(['/docs/components/button']));
  });

  it('picks the section from the URL, in every locale', () => {
    expect(isComponentPage('/docs/components/select')).toBe(true);
    expect(isComponentPage('/uk/docs/components/input?x=1#api')).toBe(true);
    expect(isComponentPage('/docs/introduction')).toBe(false);
    expect(isComponentPage('/es/docs/themes#dark-mode')).toBe(false);
  });
});

describe('Doqs interface text', () => {
  it('comes from the site catalog, with Doqs placeholders passed through', async () => {
    const { fixture } = await render('<p>catalog</p>', { providers: [provideSiteDoqI18n()] });
    await fixture.whenStable();
    const adapter = fixture.debugElement.injector.get(DOQ_I18N_ADAPTER);

    expect(adapter.ownsRouting).toBe(true);
    expect(adapter.ownsHead).toBe(true);
    expect(adapter.translate('toc.title', 'On this page')).toBe('On this page');
    expect(adapter.translate('playground.inputs', 'Inputs')).toBe('Inputs');
    expect(adapter.translate('playground.copyLabel', 'Copy {label} code', { label: 'HTML' })).toBe(
      'Copy HTML code'
    );
    // A key the site does not list keeps Doqs's own default.
    expect(adapter.translate('search.trigger', 'Search')).toBe('Search');
  });
});

describe('playgrounds', () => {
  it('Input reports what the reader types and follows its inputs, bound the way Doqs binds them', async () => {
    const valueChange = vi.fn();
    let disabled = false;
    const fixture = TestBed.createComponent(InputPlayground, {
      bindings: [
        inputBinding('size', () => 'lg'),
        inputBinding('required', () => true),
        inputBinding('disabled', () => disabled),
        outputBinding('valueChange', valueChange),
      ],
    });
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('data-size', 'lg');

    await userEvent.setup().type(input, 'ab');
    expect(valueChange).toHaveBeenLastCalledWith('ab');

    disabled = true;
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expect(input).toBeDisabled();
    fixture.nativeElement.remove();
  });

  it('Checkbox reports activation from the mixed state through both outputs', async () => {
    const checkedChange = vi.fn();
    const indeterminateChange = vi.fn();
    await render(CheckboxPlayground, {
      componentInputs: { indeterminate: true },
      on: { checkedChange, indeterminateChange },
    });
    const box = screen.getByRole('checkbox', { name: 'Email me about releases' });
    expect(box).toHaveAttribute('aria-checked', 'mixed');

    await userEvent.setup().click(box);

    expect(box).toHaveAttribute('aria-checked', 'true');
    expect(checkedChange).toHaveBeenCalledExactlyOnceWith(true);
    expect(indeterminateChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('Form Field shows the error once the field is left, and drops it when corrected', async () => {
    const statusChange = vi.fn();
    const { fixture } = await render(FormFieldPlayground, { on: { statusChange } });
    const user = userEvent.setup();
    const input = screen.getByRole('textbox', { name: 'Work email' });

    await user.click(input);
    await user.tab();
    await fixture.whenStable();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(
      'We only use it for account updates. Enter a valid email address.'
    );

    await user.type(input, 'ada@example.com');
    await fixture.whenStable();
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAccessibleDescription('We only use it for account updates.');
    expect(statusChange).toHaveBeenLastCalledWith('VALID');
  });
});

describe('examples', () => {
  it('Checkbox derives the "select all" mixed state from its children', async () => {
    await render(CheckboxExample);
    const user = userEvent.setup();
    const all = screen.getByRole('checkbox', { name: 'All notifications' });
    expect(all).toHaveAttribute('aria-checked', 'mixed');

    await user.click(all);
    expect(all).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('checkbox', { name: 'SMS' })).toHaveAttribute('aria-checked', 'true');

    await user.click(screen.getByRole('checkbox', { name: 'SMS' }));
    expect(all).toHaveAttribute('aria-checked', 'mixed');
  });

  it('Native Select is named by its label', async () => {
    await render(NativeSelectExample);
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toHaveValue('apple');
  });
});
