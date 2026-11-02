import { ChangeDetectionStrategy, Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { describe, expect, it } from 'vitest';
import { VoltListbox, VoltListboxHeader, VoltListboxOption, VoltListboxSection } from './listbox';
import { VoltSelect, VoltSelectContent, VoltSelectItem } from './select';

/*
 * Server rendering of the Quartz Listbox and Select on the real platform-server, with several
 * requests in flight at once in one process. Quartz 0.16.0 numbers option, group and trigger ids
 * with module-level counters that never reset; the wrappers must not let that reach the HTML. The
 * Select popup is client-only (it needs a window), so the server HTML is the closed trigger.
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltListbox,
    VoltListboxHeader,
    VoltListboxOption,
    VoltListboxSection,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
  ],
  template: `
    <volt-listbox aria-label="Frameworks" [value]="['vue']">
      <volt-listbox-section>
        <volt-listbox-header>Frameworks</volt-listbox-header>
        <volt-listbox-option value="angular">Angular</volt-listbox-option>
        <volt-listbox-option value="vue">Vue</volt-listbox-option>
      </volt-listbox-section>
      <volt-listbox-option value="svelte" disabled>Svelte</volt-listbox-option>
    </volt-listbox>
    <volt-listbox aria-label="Many" mode="multiple" [value]="['a', 'b']">
      <volt-listbox-option value="a">A</volt-listbox-option>
      <volt-listbox-option value="b">B</volt-listbox-option>
    </volt-listbox>
    <volt-select aria-label="Framework" value="vue">
      <volt-select-content>
        <volt-select-item value="angular">Angular</volt-select-item>
        <volt-select-item value="vue">Vue</volt-select-item>
      </volt-select-content>
    </volt-select>
    <volt-select aria-label="Empty" placeholder="Pick one" multiple>
      <volt-select-content>
        <volt-select-item value="a">A</volt-select-item>
      </volt-select-content>
    </volt-select>
  `,
})
class Root {}

const render = () =>
  renderApplication(
    context => bootstrapApplication(Root, { providers: [provideServerRendering()] }, context),
    { document: '<!doctype html><html><head></head><body><app-root></app-root></body></html>' }
  );

describe('Quartz listbox and select — server rendering', () => {
  it('renders the same HTML for every request, even with requests in flight together', async () => {
    const first = await render();
    const concurrent = await Promise.all(Array.from({ length: 8 }, () => render()));
    for (const html of concurrent) expect(html).toBe(first);
    expect(await render()).toBe(first);
  });

  it('prerenders the selection and the closed trigger, with no Quartz-generated id', async () => {
    const html = await render();
    expect(html).not.toMatch(/\bid="qz-/);
    expect(html).toContain('role="listbox"');
    expect(html).toContain('aria-multiselectable="true"');
    expect(html).toMatch(/volt-listbox-option[^>]*aria-selected="true"/);
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('Pick one');
    // The popup does not exist on the server: no second listbox for the selects.
    expect(html.match(/role="listbox"/g)).toHaveLength(2);
  });

  it('every id is unique and every id reference resolves to exactly one element', async () => {
    const html = await render();
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
    const references = [
      ...html.matchAll(/aria-(?:controls|labelledby|activedescendant)="([^"]+)"/g),
    ].map(m => m[1]);
    expect(references.length).toBeGreaterThan(0);
    for (const reference of references) expect(ids.filter(id => id === reference)).toHaveLength(1);
  });
});
