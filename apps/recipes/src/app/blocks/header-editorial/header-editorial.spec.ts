import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { HeaderEditorial } from './header-editorial';

describe('HeaderEditorial', () => {
  it('has one page heading with the category above it', async () => {
    await render(HeaderEditorial, { inputs: { title: 'On caching', category: 'Case study' } });

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1, name: 'On caching' })).toBeInTheDocument();
    expect(screen.getByText('Case study')).toBeInTheDocument();
  });

  it('pairs metadata labels with values and marks dates up as time', async () => {
    const { fixture } = await render(HeaderEditorial, {
      inputs: { meta: [{ label: 'Published', value: 'May 1', datetime: '2026-05-01' }] },
    });
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('dt')).toHaveTextContent('Published');
    expect(host.querySelector('dd time')).toHaveAttribute('datetime', '2026-05-01');
  });

  it('emits the id of the contextual action pressed', async () => {
    const user = userEvent.setup();
    const pressed: string[] = [];
    await render(HeaderEditorial, {
      inputs: { actions: [{ id: 'print', label: 'Print' }] },
      on: { action: id => pressed.push(id) },
    });

    await user.click(screen.getByRole('button', { name: 'Print' }));
    expect(pressed).toEqual(['print']);
  });

  it('omits optional parts that are empty', async () => {
    const { fixture } = await render(HeaderEditorial, {
      inputs: { category: null, standfirst: null, meta: [], actions: [] },
    });
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('dl')).toBeNull();
    expect(host.querySelector('button')).toBeNull();
    expect(host.querySelector('p')).toBeNull();
  });
});
