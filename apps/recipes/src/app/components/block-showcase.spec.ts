import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CodeEditor } from '@shared/components/code-editor';
import { HERO_SPOTLIGHT_BLOCK } from '../lib/snippets/blocks';
import en from '@shared/i18n/__fixtures__/en.json';
import { BlockShowcase } from './block-showcase';
import { blockBySlug } from '../lib/blocks-metadata';

@Component({
  imports: [BlockShowcase],
  template: `
    <app-block-showcase [block]="block" [code]="code">
      <p data-testid="projected">the live block</p>
    </app-block-showcase>
  `,
})
class Host {
  readonly block = blockBySlug('hero');
  readonly code = 'export class HeroSpotlight {}';
}

const renderHost = () => render(Host, { providers: [provideRouter([])] });

describe('BlockShowcase', () => {
  it('titles the page after the block and projects the live section', async () => {
    await renderHost();

    expect(screen.getByRole('heading', { level: 1, name: 'Hero Spotlight' })).toBeInTheDocument();
    expect(screen.getByTestId('projected')).toBeInTheDocument();
  });

  it('explains what moves, rather than leaving the visitor to hover and guess', async () => {
    await renderHost();

    expect(screen.getByRole('heading', { name: /what moves/i })).toBeInTheDocument();
    expect(screen.getByText(en.blocks.items.hero.motion)).toBeInTheDocument();
  });

  it('links every atom back to its own component page', async () => {
    await renderHost();
    const block = blockBySlug('hero');

    for (const atom of block.atoms) {
      expect(screen.getByRole('link', { name: atom.name })).toHaveAttribute(
        'href',
        `https://voltui.dev${atom.path}`
      );
    }
  });

  it('offers the source with a copy button', async () => {
    await renderHost();

    expect(screen.getByRole('heading', { name: /block source/i })).toBeInTheDocument();
    // One copy button for the source, one for the install command shown above it.
    expect(screen.getAllByRole('button', { name: /copy/i })).toHaveLength(2);
    expect(screen.getByText(/^pnpm add @voltui\/components/)).toBeInTheDocument();
  });
});

@Component({
  imports: [BlockShowcase],
  template: `
    <app-block-showcase [block]="block" [code]="code" [files]="files">
      <p>the live block</p>
    </app-block-showcase>
  `,
})
class HostWithData {
  readonly block = blockBySlug('contact-map');
  readonly code = "import { CONTACT_MAP } from './contact-map.data';";
  readonly files = [{ name: 'contact-map.data.ts', code: 'export const CONTACT_MAP = {};' }];
}

describe('BlockShowcase with sibling files', () => {
  it('shows each file the block imports beside it, so the copy is complete', async () => {
    await render(HostWithData, { providers: [provideRouter([])] });

    expect(screen.getByRole('heading', { name: 'contact-map.data.ts' })).toBeInTheDocument();
    // Source, install command, and the data file: each copyable on its own.
    expect(screen.getAllByRole('button', { name: /copy/i })).toHaveLength(3);
  });

  it('copies exactly the complete block it shows, in the package a consumer installs', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    @Component({
      imports: [BlockShowcase],
      template: `<app-block-showcase [block]="block" [code]="code" />`,
    })
    class RealBlock {
      readonly block = blockBySlug('hero');
      readonly code = HERO_SPOTLIGHT_BLOCK;
    }
    const { fixture, container } = await render(RealBlock, { providers: [provideRouter([])] });
    const shown = fixture.debugElement.query(By.directive(CodeEditor)).componentInstance.code();

    await userEvent.click(container.querySelector('app-copy-button button') as HTMLElement);

    expect(writeText).toHaveBeenCalledWith(shown);
    expect(shown).toContain("from '@voltui/components'");
    expect(shown).not.toMatch(/from\s+['"]volt['"]/);
  });
});
