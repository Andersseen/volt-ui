import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PageHeader } from './page-header';

describe('PageHeader', () => {
  it('exposes the title as the page heading and the trail as a breadcrumb', async () => {
    await render(PageHeader, { inputs: { title: 'Billing' } });

    expect(screen.getByRole('heading', { level: 1, name: 'Billing' })).toBeInTheDocument();
    const trail = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(trail).toBeInTheDocument();
    expect(screen.getByText('Projects', { selector: '[aria-current]' })).toBeInTheDocument();
  });

  it('wires every action to an event carrying its id', async () => {
    const user = userEvent.setup();
    const pressed: string[] = [];
    await render(PageHeader, {
      inputs: {
        primary: { id: 'save', label: 'Save' },
        secondary: [{ id: 'cancel', label: 'Cancel' }],
      },
      on: { action: id => pressed.push(id) },
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(pressed).toEqual(['cancel', 'save']);
  });

  it('does not press a disabled action', async () => {
    const user = userEvent.setup();
    const pressed: string[] = [];
    await render(PageHeader, {
      inputs: { primary: { id: 'save', label: 'Save', disabled: true }, secondary: [] },
      on: { action: id => pressed.push(id) },
    });

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(pressed).toEqual([]);
  });

  it('renders no empty regions when nothing optional is given', async () => {
    const { fixture } = await render(PageHeader, {
      inputs: { breadcrumbs: [], description: null, primary: null, secondary: [] },
    });

    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(fixture.nativeElement.querySelector('p')).toBeNull();
  });
});
