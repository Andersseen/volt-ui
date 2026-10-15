import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { VoltNativeButton } from '../button';
import { VoltEmptyState, VoltEmptyStateDescription, VoltEmptyStateTitle } from './';

const ALL = [VoltEmptyState, VoltEmptyStateTitle, VoltEmptyStateDescription, VoltNativeButton];

describe('VoltEmptyState', () => {
  it('renders icon, title, description and actions in order', async () => {
    const { container } = await render(
      `<volt-empty-state>
        <svg slot="icon" data-testid="icon" aria-hidden="true"></svg>
        <volt-empty-state-title>No projects yet</volt-empty-state-title>
        <volt-empty-state-description>Create your first project.</volt-empty-state-description>
        <div slot="actions"><button voltButton>Create project</button></div>
      </volt-empty-state>`,
      { imports: ALL }
    );

    const root = container.querySelector('volt-empty-state')!;
    expect(root.firstElementChild).toBe(screen.getByTestId('icon'));
    expect(root.lastElementChild).toContainElement(
      screen.getByRole('button', { name: 'Create project' })
    );
    expect(screen.getByText('No projects yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first project.')).toBeInTheDocument();
  });

  it('needs no icon and no action', async () => {
    const { container } = await render(
      `<volt-empty-state><volt-empty-state-title>No results</volt-empty-state-title></volt-empty-state>`,
      { imports: ALL }
    );

    expect(container.querySelector('volt-empty-state')).toHaveTextContent('No results');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('is plain content: no role, not a live region', async () => {
    const { container } = await render(
      `<volt-empty-state><volt-empty-state-title>Nothing here</volt-empty-state-title></volt-empty-state>`,
      { imports: ALL }
    );
    const root = container.querySelector('volt-empty-state')!;

    expect(root).not.toHaveAttribute('role');
    expect(root).not.toHaveAttribute('aria-live');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('merges a consumer class over the defaults and uses semantic tokens', async () => {
    const { container } = await render(
      `<volt-empty-state class="py-4 border-solid"><volt-empty-state-title>x</volt-empty-state-title></volt-empty-state>`,
      { imports: ALL }
    );
    const root = container.querySelector('volt-empty-state')!;

    expect(root).toHaveClass('py-4', 'border-solid', 'border-border');
    expect(root).not.toHaveClass('py-10');
    expect(root).not.toHaveClass('border-dashed');
    expect(root.className).not.toMatch(/#[0-9a-f]{3,6}|\[var\(/i);
  });

  it('wraps long translated text instead of overflowing', async () => {
    const long = 'Überraschenderweise_gibt_es_hier_noch_keine_Einträge_in_dieser_Sammlung '.repeat(
      4
    );
    const { container } = await render(
      `<volt-empty-state><volt-empty-state-description>${long}</volt-empty-state-description></volt-empty-state>`,
      { imports: ALL }
    );
    const root = container.querySelector('volt-empty-state')!;

    expect(root).toHaveClass('min-w-0');
    expect(root.querySelector('div')).toHaveClass('min-w-0', 'max-w-md');
  });
});
