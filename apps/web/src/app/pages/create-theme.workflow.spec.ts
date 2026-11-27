import { fireEvent, render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COLOR_PRESETS } from '@shared/lib/theme-presets';
import { ThemeStudioStore, PREVIEW_THEME_NAME } from '../services/theme-studio-store';
import { shippedPalette } from '../lib/shipped-palettes';
import { THEME_LIBRARY_KEY, ThemeLibrary } from '../lib/theme-library';
import { parseThemeProject, serializeThemeProject } from '../lib/theme-project';
import { clonePreset } from '../lib/theme-draft';
import CreateThemePage from './create-theme.page';

/**
 * Theme Studio 2.0 through its public surface: what a designer clicks and reads, and the store the
 * panels share (read from the page injector, as a panel would).
 */
async function renderStudio() {
  const result = await render(CreateThemePage);
  const store = result.fixture.debugElement.injector.get(ThemeStudioStore);
  await result.fixture.whenStable();
  return { ...result, store };
}

beforeEach(() => localStorage.clear());
afterEach(() => vi.useRealTimers());

describe('Theme Studio — palettes, style and density', () => {
  it('starts from any of the five shipped palettes, keeping name and shape', async () => {
    const { store } = await renderStudio();
    store.setName('acme');
    store.setNumber('radius', 12);

    for (const preset of COLOR_PRESETS) {
      store.presetValue = preset;
      expect(store.theme().light).toEqual(shippedPalette(preset).light);
      expect(store.theme().dark).toEqual(shippedPalette(preset).dark);
    }
    expect(store.theme().name).toBe('acme');
    expect(store.theme().shape.radius).toBe(12);
  });

  it('keeps the export of an untouched draft unchanged', async () => {
    const { store } = await renderStudio();
    const css = store.generatedCss();
    expect(css).toContain('--radius: 6px;');
    expect(css).toContain('--volt-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.025);');
    expect(css).not.toContain('--spacing-component');
  });

  it('separates the style preset from the CSS: choosing one clears the shape overrides', async () => {
    const { store } = await renderStudio();
    store.styleValue = 'brutal';

    expect(store.theme().style).toBe('brutal');
    expect(Object.values(store.theme().shape).every(value => value === null)).toBe(true);
    expect(store.generatedCss()).not.toContain('--radius');
    expect(store.integrationSnippet()).toContain("style: 'brutal'");

    store.densityValue = 'compact';
    expect(store.integrationSnippet()).toContain("density: 'compact'");
    expect(store.generatedCss()).not.toContain('density');
  });

  it('flags a name that would replace a shipped palette', async () => {
    const user = userEvent.setup();
    await renderStudio();
    const name = screen.getByRole('textbox', { name: 'Theme name' });
    await user.clear(name);
    await user.type(name, 'Ember');
    expect(screen.getByText(/ember is a shipped palette/)).toBeInTheDocument();
  });
});

describe('Theme Studio — editing ergonomics', () => {
  it('edits a token from its hex field and resets that token alone', async () => {
    const user = userEvent.setup();
    const { store } = await renderStudio();
    const panel = screen.getByRole('tabpanel', { name: 'Light' });
    const hex = within(panel).getByRole('textbox', { name: 'Primary hex value' });

    await user.clear(hex);
    await user.type(hex, '#12345');
    expect(store.theme().light.primary).toBe(shippedPalette('glacier').light.primary);
    await user.type(hex, '6');
    expect(store.theme().light.primary).toBe('#123456');
    expect(within(panel).getAllByText('edited')).toHaveLength(1);

    await user.click(within(panel).getByRole('button', { name: 'Reset Primary' }));
    expect(store.theme().light.primary).toBe(shippedPalette('glacier').light.primary);
  });

  it('records a picker drag as one undo step, and undo/redo walk it', async () => {
    const { store } = await renderStudio();
    const picker = within(screen.getByRole('tabpanel', { name: 'Light' })).getByLabelText(
      'Primary'
    );
    const original = store.theme().light.primary;

    for (const value of ['#111111', '#222222', '#333333']) {
      fireEvent.input(picker, { target: { value } });
    }
    expect(store.theme().light.primary).toBe('#333333');

    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(store.theme().light.primary).toBe(original);
    await userEvent.click(screen.getByRole('button', { name: 'Redo' }));
    expect(store.theme().light.primary).toBe('#333333');
  });

  it('shows unsaved changes and resets the draft only after confirming', async () => {
    const user = userEvent.setup();
    const { store } = await renderStudio();
    expect(screen.getByText('No unsaved changes')).toBeInTheDocument();

    store.setColor('light', 'primary', '#123456');
    await screen.findByText('Unsaved changes');

    await user.click(screen.getByRole('button', { name: 'Reset draft' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Reset this draft?' });
    await user.click(within(dialog).getByRole('button', { name: 'Reset' }));
    expect(store.theme().light.primary).toBe(shippedPalette('glacier').light.primary);

    store.undo();
    expect(store.theme().light.primary).toBe('#123456');
  });
});

describe('Theme Studio — projects and the local library', () => {
  it('round-trips a project through the import field, and refuses a bad one without changes', async () => {
    const user = userEvent.setup();
    const { store } = await renderStudio();
    const project = serializeThemeProject({ ...clonePreset('sage', 'forest'), style: 'soft' });
    const paste = screen.getByRole('textbox', { name: 'Or paste the project JSON' });

    fireEvent.input(paste.querySelector('textarea') ?? paste, {
      target: { value: '{"format":"volt-theme-project","version":9}' },
    });
    await user.click(screen.getByRole('button', { name: 'Open project' }));
    expect(await screen.findByText(/version 9 is not supported/)).toBeInTheDocument();
    expect(store.theme().palette).toBe('glacier');

    expect(store.importProject(project)).toBe(true);
    expect(store.theme().name).toBe('forest');
    expect(store.projectJson()).toBe(project);
  });

  it('recovers the draft of a previous visit, still linked to its saved theme', async () => {
    // What a previous visit left behind: a saved theme and a draft edited after saving it.
    const previous = new ThemeLibrary(localStorage);
    const saved = clonePreset('dusk', 'acme');
    const { theme } = previous.saveTheme(parseThemeProject(serializeThemeProject(saved))) as {
      theme: { id: string };
    };
    previous.saveDraft(
      parseThemeProject(
        serializeThemeProject({ ...saved, light: { ...saved.light, primary: '#123456' } })
      ),
      theme.id
    );

    const { store } = await renderStudio();
    expect(store.theme().name).toBe('acme');
    expect(store.theme().light.primary).toBe('#123456');
    expect(store.savedId()).toBe(theme.id);
    expect(store.dirty()).toBe(true);
    // Shown, and announced once through the polite live region.
    expect(await screen.findAllByText('Your last draft was restored.')).toHaveLength(2);
    expect(screen.getByRole('list', { name: 'Saved themes' })).toHaveTextContent('acme');

    store.loadSaved(theme.id);
    expect(store.theme().light.primary).toBe(saved.light.primary);
    expect(store.dirty()).toBe(false);
  });

  it('asks before replacing a theme with the same name, and before deleting', async () => {
    const user = userEvent.setup();
    const { store, fixture } = await renderStudio();
    store.setName('acme');
    store.save();
    store.setColor('light', 'primary', '#123456');
    store.save({ asNew: true });
    expect(store.notice()?.key).toBe('nameTaken');
    expect(store.savedThemes()).toHaveLength(1);
    await fixture.whenStable();

    await user.click(screen.getByRole('button', { name: 'Delete acme' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Delete acme?' });
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    expect(store.savedThemes()).toHaveLength(0);
  });

  it('keeps working when storage is unavailable', async () => {
    const { store } = await renderStudio();
    store.connectLibrary(new ThemeLibrary(null));
    expect(store.save()).toEqual({ ok: false, reason: 'unavailable' });
    expect(await screen.findByText(/cannot be saved/)).toBeInTheDocument();
    expect(store.generatedCss()).toContain(':root');
  });

  it('never overwrites a library written by a newer studio', async () => {
    const newer = JSON.stringify({ version: 7, themes: [] });
    localStorage.setItem(THEME_LIBRARY_KEY, newer);
    const { store } = await renderStudio();
    store.setColor('light', 'primary', '#123456');
    expect(store.save().ok).toBe(false);
    expect(localStorage.getItem(THEME_LIBRARY_KEY)).toBe(newer);
  });
});

describe('Theme Studio — contrast inspector and preview', () => {
  it('reports a failing pair in words, jumps to its token and applies a reversible fix', async () => {
    const user = userEvent.setup();
    const { store, fixture } = await renderStudio();
    store.setColor('dark', 'ring', store.theme().dark.background);
    await fixture.whenStable();

    const list = screen.getByRole('list', { name: 'Contrast results' });
    const item = list.querySelector('[data-result="dark:ring|background"]') as HTMLElement;
    expect(item).toHaveTextContent('Fail');
    expect(item).toHaveTextContent('Focus ring against the page');
    expect(item).toHaveTextContent(/1:1, needs 3:1/);

    await user.click(within(item).getByRole('button', { name: 'Edit token' }));
    await fixture.whenStable();
    expect(screen.getByRole('tab', { name: 'Dark' })).toHaveAttribute('aria-selected', 'true');
    expect(document.activeElement).toBe(
      within(screen.getByRole('tabpanel', { name: 'Dark' })).getByLabelText('Ring')
    );

    const before = store.theme().dark.ring;
    await user.click(within(item).getByRole('button', { name: /^Change --ring from/ }));
    expect(store.contrast().find(r => r.id === 'dark:ring|background')?.status).toBe('pass');
    store.undo();
    expect(store.theme().dark.ring).toBe(before);
  });

  it('paints the preview with the exported stylesheet itself, under a private name', async () => {
    const { store, fixture } = await renderStudio();
    const style = document.head.querySelector('style[data-theme-studio-preview]');
    expect(style?.textContent).toBe(store.previewCss());
    expect(store.previewCss().replaceAll(PREVIEW_THEME_NAME, store.normalizedName())).toBe(
      store.generatedCss()
    );

    const preview = screen.getByTestId('theme-preview');
    expect(preview).toHaveAttribute('data-color', PREVIEW_THEME_NAME);
    expect(preview).toHaveAttribute('data-style', 'sharp');
    expect(document.documentElement).not.toHaveAttribute('data-color', PREVIEW_THEME_NAME);

    fixture.destroy();
    expect(document.head.querySelector('style[data-theme-studio-preview]')).toBeNull();
  });

  it('switches scenario and state with real components', async () => {
    const user = userEvent.setup();
    await renderStudio();
    const preview = screen.getByTestId('theme-preview');

    await user.click(screen.getByText('Settings form'));
    expect(
      within(preview).getByRole('heading', { name: 'Workspace settings' })
    ).toBeInTheDocument();
    // Real validation: the terms are required, so the first submit saves nothing.
    await user.click(within(preview).getByRole('button', { name: 'Save changes' }));
    expect(within(preview).queryByText('Settings saved')).toBeNull();
    await user.click(
      within(preview).getByRole('checkbox', { name: 'I accept the data processing terms' })
    );
    await user.click(within(preview).getByRole('button', { name: 'Save changes' }));
    expect(await within(preview).findByText('Settings saved')).toBeInTheDocument();

    await user.click(screen.getByText('Data and overlays'));
    expect(within(preview).getByRole('checkbox', { name: 'Select INV-1043' })).toBeChecked();
  });
});
