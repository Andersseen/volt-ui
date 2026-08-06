import { fireEvent, render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import CreateThemePage from './create-theme.page';

/**
 * The generated CSS is rendered by `app-code-editor`, whose `vertex-editor-lite` web
 * component is loaded lazily and never boots under jsdom. Assert the generated string
 * itself — that is the unit under test here, not the syntax highlighter around it.
 */
function generatedCss(fixture: { componentInstance: CreateThemePage }): string {
  // `generatedCss` is protected on the page (template-only); read it directly here.
  return (fixture.componentInstance as unknown as { generatedCss: () => string }).generatedCss();
}

describe('Theme Studio', () => {
  it('renders editable palettes and generated CSS', async () => {
    const { fixture } = await render(CreateThemePage);

    expect(screen.getByRole('heading', { name: 'Design your system.' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Light' })).toHaveAttribute('aria-selected', 'true');
    expect(
      within(screen.getByRole('tabpanel', { name: 'Light' })).getByLabelText('Background')
    ).toHaveValue('#f7fbff');
    expect(generatedCss(fixture)).toContain(":root[data-color='custom-theme']");
  });

  it('normalizes theme names in the preview and generated selectors', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(CreateThemePage);

    const name = screen.getByRole('textbox', { name: 'Theme name' });
    await user.clear(name);
    await user.type(name, '  Northern Lights!  ');

    expect(screen.getByRole('heading', { name: 'northern-lights' })).toBeInTheDocument();
    expect(generatedCss(fixture)).toContain(":root[data-color='northern-lights']");
  });

  it('edits colors independently and synchronizes dark preview mode', async () => {
    const { fixture } = await render(CreateThemePage);

    const lightPanel = screen.getByRole('tabpanel', { name: 'Light' });
    fireEvent.input(within(lightPanel).getByLabelText('Primary'), {
      target: { value: '#123456' },
    });
    expect(generatedCss(fixture)).toContain('--primary: #123456;');

    fireEvent.click(screen.getByRole('tab', { name: 'Dark' }));
    expect(screen.getByRole('switch', { name: 'Dark preview' })).toBeChecked();
    expect(
      within(screen.getByRole('tabpanel', { name: 'Dark' })).getByLabelText('Primary')
    ).toHaveValue('#28aee8');

    fireEvent.click(screen.getByRole('switch', { name: 'Dark preview' }));
    expect(screen.getByRole('switch', { name: 'Dark preview' })).not.toBeChecked();
  });
});
