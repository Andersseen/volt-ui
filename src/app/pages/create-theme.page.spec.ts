import { fireEvent, render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ThemeStudioStore } from '../services/theme-studio-store';
import CreateThemePage from './create-theme.page';

/**
 * The generated CSS is rendered by `app-code-editor`, whose `vertex-editor-lite` web
 * component is loaded lazily and never boots under jsdom. Assert the generated string
 * itself — that is the unit under test here, not the syntax highlighter around it.
 *
 * The page provides the store, so reading it from the fixture's injector is how a panel
 * sees it too, rather than reaching into a component's protected members.
 */
async function renderStudio() {
  const result = await render(CreateThemePage);
  return { ...result, store: result.fixture.debugElement.injector.get(ThemeStudioStore) };
}

describe('Theme Studio', () => {
  it('renders editable palettes and generated CSS', async () => {
    const { store } = await renderStudio();

    expect(screen.getByRole('heading', { name: 'Design your system.' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Light' })).toHaveAttribute('aria-selected', 'true');
    expect(
      within(screen.getByRole('tabpanel', { name: 'Light' })).getByLabelText('Background')
    ).toHaveValue('#f7fbff');
    expect(store.generatedCss()).toContain(":root[data-color='custom-theme']");
  });

  it('normalizes theme names in the preview and generated selectors', async () => {
    const user = userEvent.setup();
    const { store } = await renderStudio();

    const name = screen.getByRole('textbox', { name: 'Theme name' });
    await user.clear(name);
    await user.type(name, '  Northern Lights!  ');

    expect(screen.getByRole('heading', { name: 'northern-lights' })).toBeInTheDocument();
    expect(store.generatedCss()).toContain(":root[data-color='northern-lights']");
  });

  it('edits colors independently and synchronizes dark preview mode', async () => {
    const { store } = await renderStudio();

    const lightPanel = screen.getByRole('tabpanel', { name: 'Light' });
    fireEvent.input(within(lightPanel).getByLabelText('Primary'), {
      target: { value: '#123456' },
    });
    expect(store.generatedCss()).toContain('--primary: #123456;');

    fireEvent.click(screen.getByRole('tab', { name: 'Dark' }));
    expect(screen.getByRole('switch', { name: 'Dark preview' })).toBeChecked();
    expect(
      within(screen.getByRole('tabpanel', { name: 'Dark' })).getByLabelText('Primary')
    ).toHaveValue('#28aee8');

    fireEvent.click(screen.getByRole('switch', { name: 'Dark preview' }));
    expect(screen.getByRole('switch', { name: 'Dark preview' })).not.toBeChecked();
  });

  it('keeps shape tokens out of a generated palette', async () => {
    const { store } = await renderStudio();

    store.setNumber('radius', 18);
    store.generate();

    // Generating replaces colors only: the radius the user dialled in is their own work.
    expect(store.theme().radius).toBe(18);
    expect(store.generatedCss()).toContain('--radius: 18px;');
  });
});
