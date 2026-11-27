import { ChangeDetectionStrategy, Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { describe, expect, it } from 'vitest';
import { provideVoltTheme, voltCustomColor, type VoltAnyThemeOptions } from './theme';
import { VoltTheme } from './theme-scope';

/*
 * A declared custom palette on the real platform-server: on `<html>` through `provideVoltTheme`
 * and on a `voltTheme` scope, with requests for different themes rendered at the same time. Nothing
 * is registered globally, so one request's palette can never appear in another's HTML.
 */
const acme = voltCustomColor('acme');
const harbor = voltCustomColor('harbor');

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltTheme],
  template: `<section id="island" [voltTheme]="{ color: island, dark: true }">Inside</section>`,
})
class Root {
  island = harbor;
}

const render = (theme: VoltAnyThemeOptions) =>
  renderApplication(
    context =>
      bootstrapApplication(
        Root,
        { providers: [provideServerRendering(), provideVoltTheme(theme)] },
        context
      ),
    { document: '<html><head></head><body><app-root></app-root></body></html>', url: '/' }
  );

describe('custom themes on the server', () => {
  it('renders a declared palette on <html> and on a scope, per request', async () => {
    const [first, second] = await Promise.all([
      render({ color: acme, style: 'soft', dark: false }),
      render({ color: 'ember', dark: true }),
    ]);

    expect(first).toMatch(/<html[^>]*data-color="acme"/);
    expect(first).toMatch(/<html[^>]*data-style="soft"/);
    expect(first).toMatch(/<section[^>]*data-color="harbor"/);
    expect(first).toMatch(/<section[^>]*class="dark"/);

    expect(second).toMatch(/<html[^>]*data-color="ember"/);
    expect(second).not.toContain('acme');
  });
});
