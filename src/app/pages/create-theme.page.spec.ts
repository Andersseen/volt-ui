import { fireEvent, render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import CreateThemePage from './create-theme.page';

describe('Theme Studio', () => {
  it('renders editable palettes and generated CSS', async () => {
    const { container } = await render(CreateThemePage);

    expect(screen.getByRole('heading', { name: 'Design your system.' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Light' })).toHaveAttribute('aria-selected', 'true');
    expect(
      within(screen.getByRole('tabpanel', { name: 'Light' })).getByLabelText('Background')
    ).toHaveValue('#f7fbff');
    expect(container.textContent).toContain(":root[data-color='custom-theme']");
  });

  it('normalizes theme names in the preview and generated selectors', async () => {
    const user = userEvent.setup();
    const { container } = await render(CreateThemePage);

    const name = screen.getByRole('textbox', { name: 'Theme name' });
    await user.clear(name);
    await user.type(name, '  Northern Lights!  ');

    expect(screen.getByRole('heading', { name: 'northern-lights' })).toBeInTheDocument();
    expect(container.textContent).toContain(":root[data-color='northern-lights']");
  });

  it('edits colors independently and synchronizes dark preview mode', async () => {
    const { container } = await render(CreateThemePage);

    const lightPanel = screen.getByRole('tabpanel', { name: 'Light' });
    fireEvent.input(within(lightPanel).getByLabelText('Primary'), {
      target: { value: '#123456' },
    });
    expect(container.textContent).toContain('--primary: #123456;');

    fireEvent.click(screen.getByRole('tab', { name: 'Dark' }));
    expect(screen.getByRole('switch', { name: 'Dark preview' })).toBeChecked();
    expect(
      within(screen.getByRole('tabpanel', { name: 'Dark' })).getByLabelText('Primary')
    ).toHaveValue('#28aee8');

    fireEvent.click(screen.getByRole('switch', { name: 'Dark preview' }));
    expect(screen.getByRole('switch', { name: 'Dark preview' })).not.toBeChecked();
  });
});
