import { Component } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DocsPageShell } from '../docs-page-shell';
import { DocsToc } from './docs-toc';

@Component({ template: '' })
class Blank {}

const groups = [
  {
    links: [
      { path: '/docs/introduction', labelKey: 'guide.introduction' as const },
      { path: '/docs/themes', labelKey: 'guide.themes' as const },
      { path: '/docs/customization', labelKey: 'guide.customization' as const },
    ],
  },
];

async function shellAt(url: string) {
  const view = await render(DocsPageShell, {
    providers: [provideRouter([{ path: '**', component: Blank }])],
    componentInputs: { title: 'Getting Started', groups },
  });
  await view.fixture.debugElement.injector.get(Router).navigateByUrl(url);
  await view.fixture.whenStable();
  return view;
}

describe('docs page shell', () => {
  it('shows where the reader is, with the section linked', async () => {
    await shellAt('/docs/themes');

    const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(crumbs).toHaveTextContent('Getting Started');
    expect(crumbs).toHaveTextContent('Themes');
    expect(screen.getAllByRole('link', { name: 'Getting Started' })[0]).toHaveAttribute(
      'href',
      '/docs/introduction'
    );
  });

  it('links the previous and next pages in sidebar order', async () => {
    await shellAt('/docs/themes');

    const pager = screen.getByRole('navigation', { name: 'Previous and next pages' });
    expect(pager.querySelector('a[href="/docs/introduction"]')).toHaveTextContent('Introduction');
    expect(pager.querySelector('a[href="/docs/customization"]')).toHaveTextContent('Customization');
  });

  it('has no previous link on the first page', async () => {
    await shellAt('/docs/introduction');

    const pager = screen.getByRole('navigation', { name: 'Previous and next pages' });
    expect(pager).not.toHaveTextContent('Previous');
    expect(pager).toHaveTextContent('Themes');
  });
});

describe('docs outline', () => {
  const items = [
    { id: 'install', text: 'Install', level: 2 as const },
    { id: 'usage', text: 'Usage', level: 2 as const },
  ];

  it('lists the headings and marks the one being read', async () => {
    await render(DocsToc, { componentInputs: { items, active: 'usage' } });

    const nav = screen.getByRole('navigation', { name: 'On this page' });
    expect(nav.querySelector('[aria-current="location"]')).toHaveTextContent('Usage');
  });

  it('asks to jump when a heading is chosen', async () => {
    const chosen: string[] = [];
    await render(DocsToc, {
      componentInputs: { items, active: null },
      on: { selected: (id: string) => chosen.push(id) },
    });

    await userEvent.setup().click(screen.getByRole('button', { name: 'Install' }));
    expect(chosen).toEqual(['install']);
  });

  it('stays hidden for a page with a single heading', async () => {
    await render(DocsToc, { componentInputs: { items: items.slice(0, 1), active: null } });

    expect(screen.queryByRole('navigation', { name: 'On this page' })).not.toBeInTheDocument();
  });
});
