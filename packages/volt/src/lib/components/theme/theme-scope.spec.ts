import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { applyVoltTheme, type VoltThemeOptions } from './theme';
import { VoltTheme, VoltThemeInherit } from './theme-scope';

@Component({
  imports: [VoltTheme, VoltThemeInherit],
  template: `
    <section data-testid="outer" [voltTheme]="outer()">
      <div data-testid="inner" [voltTheme]="inner()">
        <p data-testid="portalled" voltThemeInherit></p>
      </div>
    </section>
    <p data-testid="sibling" voltThemeInherit></p>
  `,
})
class Scopes {
  readonly outer = signal<VoltThemeOptions>({ color: 'ember', style: 'soft', density: 'compact' });
  readonly inner = signal<VoltThemeOptions>({ style: 'brutal' });
}

const element = (id: string) => screen.getByTestId(id);

describe('VoltTheme', () => {
  it('writes the options it was given as attributes, and nothing else', async () => {
    await render(Scopes);

    const outer = element('outer');
    expect(outer).toHaveAttribute('data-volt-theme');
    expect(outer).toHaveAttribute('data-color', 'ember');
    expect(outer).toHaveAttribute('data-style', 'soft');
    expect(outer).toHaveAttribute('data-density', 'compact');
    expect(outer).not.toHaveClass('dark');
    expect(outer).not.toHaveAttribute('data-mode');
    expect(outer.style.colorScheme).toBe('');

    expect(element('inner')).toHaveAttribute('data-style', 'brutal');
    expect(element('inner')).not.toHaveAttribute('data-color');
  });

  it('updates when the options change, and leaves the document alone', async () => {
    const { fixture } = await render(Scopes);

    fixture.componentInstance.outer.set({ color: 'sage', dark: true });
    await fixture.whenStable();

    expect(element('outer')).toHaveAttribute('data-color', 'sage');
    expect(element('outer')).toHaveClass('dark');
    expect(element('outer').style.colorScheme).toBe('dark');
    expect(element('outer')).not.toHaveAttribute('data-style');
    expect(document.documentElement).not.toHaveAttribute('data-color');
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('forces light with data-mode, so a dark page cannot reach the scope', async () => {
    const { fixture } = await render(Scopes);

    fixture.componentInstance.outer.set({ color: 'dusk', dark: false });
    await fixture.whenStable();

    expect(element('outer')).toHaveAttribute('data-mode', 'light');
    expect(element('outer')).not.toHaveClass('dark');
    expect(element('outer').style.colorScheme).toBe('light');
  });

  it('gives a nested scope the forced mode and a palette to apply it to', async () => {
    const { fixture } = await render(Scopes);

    fixture.componentInstance.outer.set({ dark: true });
    await fixture.whenStable();

    expect(element('inner')).toHaveClass('dark');
    expect(element('inner')).toHaveAttribute('data-color', 'volt');
  });

  it('accepts the bare attribute', async () => {
    await render(`<div voltTheme data-testid="bare"></div>`, { imports: [VoltTheme] });
    expect(element('bare')).toHaveAttribute('data-volt-theme');
    expect(element('bare')).not.toHaveAttribute('data-color');
  });
});

describe('VoltThemeInherit', () => {
  it('copies everything in force from the surrounding scopes', async () => {
    await render(Scopes);

    const portalled = element('portalled');
    expect(portalled).toHaveAttribute('data-volt-theme');
    expect(portalled).toHaveAttribute('data-color', 'ember');
    expect(portalled).toHaveAttribute('data-style', 'brutal');
    expect(portalled).toHaveAttribute('data-density', 'compact');
  });

  it('writes nothing outside a scope', async () => {
    await render(Scopes);

    const sibling = element('sibling');
    expect(sibling).not.toHaveAttribute('data-volt-theme');
    expect(sibling).not.toHaveAttribute('data-color');
  });
});

describe('applyVoltTheme density', () => {
  it('sets data-density on the document', () => {
    const doc = document.implementation.createHTMLDocument('test');
    applyVoltTheme({ density: 'spacious' }, doc);
    expect(doc.documentElement.getAttribute('data-density')).toBe('spacious');
  });
});
