import { ChangeDetectionStrategy, Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { describe, expect, it } from 'vitest';
import {
  VoltAccordion,
  VoltAccordionContent,
  VoltAccordionItem,
  VoltAccordionTrigger,
} from './accordion';
import { VoltTabs, VoltTabsContent, VoltTabsList, VoltTabsTrigger } from './tabs';

/*
 * Server rendering of the Quartz wrappers on the real platform-server, with several requests in
 * flight at once in one process (the way a long-lived server runs). Quartz 0.16.0 numbers its own
 * ids with module-level counters that never reset; the wrappers must not let that reach the HTML.
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltTabs,
    VoltTabsList,
    VoltTabsTrigger,
    VoltTabsContent,
    VoltAccordion,
    VoltAccordionItem,
    VoltAccordionTrigger,
    VoltAccordionContent,
  ],
  template: `
    <volt-tabs value="security">
      <volt-tabs-list aria-label="Settings">
        <volt-tabs-trigger value="account">Account</volt-tabs-trigger>
        <volt-tabs-trigger value="security">Security</volt-tabs-trigger>
      </volt-tabs-list>
      <volt-tabs-content value="account"
        ><button type="button">in-account</button></volt-tabs-content
      >
      <volt-tabs-content value="security"
        ><button type="button">in-security</button></volt-tabs-content
      >
    </volt-tabs>
    <volt-tabs>
      <volt-tabs-list aria-label="Implicit">
        <volt-tabs-trigger value="x">X</volt-tabs-trigger>
        <volt-tabs-trigger value="y">Y</volt-tabs-trigger>
      </volt-tabs-list>
      <volt-tabs-content value="x">px</volt-tabs-content>
      <volt-tabs-content value="y">py</volt-tabs-content>
    </volt-tabs>
    <volt-accordion value="a">
      <volt-accordion-item value="a">
        <volt-accordion-trigger>A</volt-accordion-trigger>
        <volt-accordion-content><button type="button">in-a</button></volt-accordion-content>
      </volt-accordion-item>
      <volt-accordion-item value="b">
        <volt-accordion-trigger>B</volt-accordion-trigger>
        <volt-accordion-content>b</volt-accordion-content>
      </volt-accordion-item>
    </volt-accordion>
    <volt-accordion type="multiple" [value]="['m1', 'm2']">
      <volt-accordion-item value="m1">
        <volt-accordion-trigger>M1</volt-accordion-trigger>
        <volt-accordion-content>m1</volt-accordion-content>
      </volt-accordion-item>
      <volt-accordion-item value="m2">
        <volt-accordion-trigger>M2</volt-accordion-trigger>
        <volt-accordion-content>m2</volt-accordion-content>
      </volt-accordion-item>
    </volt-accordion>
  `,
})
class Root {}

const render = () =>
  renderApplication(
    context => bootstrapApplication(Root, { providers: [provideServerRendering()] }, context),
    { document: '<!doctype html><html><head></head><body><app-root></app-root></body></html>' }
  );

describe('Quartz tabs and accordion — server rendering', () => {
  it('renders the same HTML for every request, even with requests in flight together', async () => {
    const first = await render();
    const concurrent = await Promise.all(Array.from({ length: 8 }, () => render()));
    for (const html of concurrent) expect(html).toBe(first);
    const later = await render();
    expect(later).toBe(first);
  });

  it('prerenders the selected / open state and no Quartz-generated id', async () => {
    const html = await render();
    expect(html).not.toMatch(/\bid="qz-/);
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-expanded="false"');
    // The unbound tabs show their first tab without a value.
    expect(html).toMatch(/volt-tabs-trigger[^>]*value="x"[^>]*aria-selected="true"/);
    // A closed accordion panel is not display:none through `hidden`: visibility owns it.
    expect(html).not.toMatch(/<volt-accordion-content[^>]*\shidden/);
  });

  it('every aria-controls / aria-labelledby resolves to exactly one element in the server HTML', async () => {
    const html = await render();
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
    const references = [...html.matchAll(/aria-(?:controls|labelledby)="([^"]+)"/g)].map(m => m[1]);
    expect(references.length).toBeGreaterThan(6);
    for (const reference of references) expect(ids.filter(id => id === reference)).toHaveLength(1);
  });
});
