import { Injectable, computed, signal } from '@angular/core';
import {
  PaletteImportError,
  crafterUrl,
  generatePalette,
  paletteFromCrafterExport,
  paletteHarmonies,
  randomSeed,
  type ColorToken,
  type GeneratedPalette,
  type PaletteHarmony,
} from '../lib/palette';
import {
  clonePreset,
  colorFields,
  eventValue,
  isPresetName,
  normalizeThemeName,
  paletteVars,
  shapeVars,
  themeCss,
  type PresetName,
  type ThemeDraft,
  type ThemeMode,
} from '../lib/theme-draft';

/**
 * Everything the theme studio knows: the draft being edited, what the preview shows, and
 * the generated stylesheet.
 *
 * It is a store rather than page state because the studio is now five sibling panels —
 * setup, tokens, shape, output and preview — that all read and write the same draft.
 * Passing that through inputs and outputs would mean the page relaying a dozen bindings
 * it has no opinion about. It is provided by the page, so its lifetime is the page's.
 */
@Injectable()
export class ThemeStudioStore {
  readonly modes: ThemeMode[] = ['light', 'dark'];
  readonly colorFields = colorFields;
  readonly harmonies = paletteHarmonies;

  readonly theme = signal<ThemeDraft>(clonePreset('glacier'));
  readonly selectedPreset = signal<PresetName>('glacier');
  readonly activeMode = signal<ThemeMode>('light');
  readonly previewDark = signal(false);

  readonly harmony = signal<PaletteHarmony>('analogous');
  /** Set once a palette has been generated or imported, so we can offer a deep link. */
  readonly paletteMeta = signal<GeneratedPalette['meta'] | null>(null);
  readonly importOpen = signal(false);
  readonly importText = signal('');
  readonly importError = signal('');

  readonly crafterLink = computed(() => {
    const meta = this.paletteMeta();
    return meta
      ? crafterUrl(meta, this.previewDark() ? 'dark' : 'light')
      : 'https://palette-crafter.andersseen.dev/';
  });

  readonly normalizedName = computed(() => normalizeThemeName(this.theme().name));

  readonly activePalette = computed(() =>
    this.previewDark() ? this.theme().dark : this.theme().light
  );

  readonly previewStyle = computed(() => ({
    ...paletteVars(this.activePalette()),
    ...shapeVars(this.theme()),
  }));

  readonly generatedCss = computed(() => themeCss(this.theme()));

  setName(value: unknown): void {
    if (typeof value !== 'string') return;
    this.theme.update(theme => ({ ...theme, name: value }));
  }

  get presetValue(): PresetName {
    return this.selectedPreset();
  }

  set presetValue(value: unknown) {
    if (!isPresetName(value)) return;
    this.selectedPreset.set(value);
    this.theme.set(clonePreset(value, this.theme().name));
  }

  setActiveMode(value: unknown): void {
    if (value === 'light' || value === 'dark') {
      this.activeMode.set(value);
      this.previewDark.set(value === 'dark');
    }
  }

  setPreviewDark(value: unknown): void {
    if (typeof value === 'boolean') {
      this.previewDark.set(value);
    }
  }

  get harmonyValue(): PaletteHarmony {
    return this.harmony();
  }

  set harmonyValue(value: unknown) {
    if ((paletteHarmonies as string[]).includes(value as string)) {
      this.harmony.set(value as PaletteHarmony);
    }
  }

  /** One click: a fresh, contrast-checked light + dark palette. */
  generate(): void {
    this.applyPalette(generatePalette({ seed: randomSeed(), harmony: this.harmony() }));
  }

  toggleImport(): void {
    this.importOpen.update(open => !open);
    this.importError.set('');
  }

  setImportText(value: string): void {
    this.importText.set(value);
    if (this.importError()) this.importError.set('');
  }

  importFromCrafter(): void {
    try {
      this.applyPalette(paletteFromCrafterExport(this.importText()));
      this.importOpen.set(false);
      this.importText.set('');
    } catch (error) {
      this.importError.set(
        error instanceof PaletteImportError ? error.message : 'Could not read that palette.'
      );
    }
  }

  setColor(mode: ThemeMode, key: ColorToken, event: Event): void {
    const value = eventValue(event);
    this.theme.update(theme => ({
      ...theme,
      [mode]: {
        ...theme[mode],
        [key]: value,
      },
    }));
  }

  setNumber(key: 'radius' | 'borderWidth' | 'ringWidth' | 'shadowIntensity', value: unknown): void {
    if (typeof value !== 'number') return;
    this.theme.update(theme => ({ ...theme, [key]: value }));
  }

  private applyPalette(palette: GeneratedPalette): void {
    // Only the colors change — radius, borders and shadows are the user's own shape work.
    this.theme.update(theme => ({ ...theme, light: palette.light, dark: palette.dark }));
    this.paletteMeta.set(palette.meta);
    this.harmony.set(palette.meta.harmony);
    this.importError.set('');
  }
}
