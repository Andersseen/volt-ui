import { DOCUMENT } from '@angular/common';
import { afterNextRender, computed, effect, inject, Injectable, signal } from '@angular/core';
import type { VoltThemeDensity } from 'volt';
import type { StylePreset } from '@shared/lib/theme-presets';
import {
  crafterUrl,
  generatePalette,
  PaletteImportError,
  paletteFromCrafterExport,
  paletteHarmonies,
  randomSeed,
  type ColorToken,
  type GeneratedPalette,
  type PaletteHarmony,
} from '../lib/palette';
import { DraftHistory } from '../lib/draft-history';
import { shippedPalette, shippedStyle } from '../lib/shipped-palettes';
import { evaluateContrast, suggestCorrection, type ContrastResult } from '../lib/theme-contrast';
import {
  clonePreset,
  colorFields,
  isDensity,
  isPresetName,
  isShippedPaletteName,
  isStylePreset,
  NO_SHAPE_OVERRIDES,
  normalizeThemeName,
  themeCss,
  themeIntegrationSnippet,
  type PresetName,
  type ShapeKey,
  type ThemeDraft,
  type ThemeMode,
} from '../lib/theme-draft';
import {
  ThemeLibrary,
  type LibraryStatus,
  type LibraryWrite,
  type SavedTheme,
} from '../lib/theme-library';
import {
  parseThemeProject,
  serializeThemeProject,
  ThemeProjectError,
  type ThemeProject,
} from '../lib/theme-project';

const HEX = /^#[0-9a-f]{6}$/i;
/** Edits of the same field closer together than this are one undo step (a picker drag, typing). */
const COALESCE_MS = 800;
/** The private name the preview renders the exported stylesheet under. */
export const PREVIEW_THEME_NAME = 'studio-preview';

export type StudioNoticeKey =
  | 'saved'
  | 'loaded'
  | 'duplicated'
  | 'renamed'
  | 'deleted'
  | 'imported'
  | 'recovered'
  | 'nameTaken'
  | 'full'
  | 'quota'
  | 'readOnly'
  | 'unavailable'
  | 'missing'
  | 'corruptBackedUp'
  | 'skippedRecords'
  | 'unsupportedLibrary';

export interface StudioNotice {
  readonly key: StudioNoticeKey;
  readonly tone: 'info' | 'success' | 'error';
  /** Bumped on every notice, so the same message twice is announced twice. */
  readonly id: number;
}

/** `localStorage`, or `null` where reading it throws (sandboxed frames, blocked cookies). */
function browserStorage(document: Document): Storage | null {
  try {
    return document.defaultView?.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * Everything the theme studio knows: the draft being edited, its history, the local library, the
 * contrast diagnostics, what the preview shows, and the generated stylesheet.
 *
 * It is a store rather than page state because the studio is a set of sibling panels that all read
 * and write the same draft. It is provided by the page, so its lifetime is the page's, and it touches
 * browser storage only after the first render in a browser — never on the server.
 */
@Injectable()
export class ThemeStudioStore {
  readonly modes: ThemeMode[] = ['light', 'dark'];
  readonly colorFields = colorFields;
  readonly harmonies = paletteHarmonies;

  readonly theme = signal<ThemeDraft>(clonePreset('glacier'));
  readonly activeMode = signal<ThemeMode>('light');
  readonly previewDark = signal(false);

  readonly harmony = signal<PaletteHarmony>('analogous');
  /** Set once a palette has been generated or imported, so we can offer a deep link. */
  readonly paletteMeta = signal<GeneratedPalette['meta'] | null>(null);
  readonly importOpen = signal(false);
  readonly importText = signal('');
  readonly importError = signal('');

  /** Theme project JSON import (a separate format from Palette Crafter's). */
  readonly projectError = signal<{ code: ThemeProjectError['code']; detail: string } | null>(null);

  /** The saved theme the draft belongs to, if any. */
  readonly savedId = signal<string | null>(null);
  readonly savedThemes = signal<readonly SavedTheme[]>([]);
  readonly libraryStatus = signal<LibraryStatus>('unavailable');
  readonly notice = signal<StudioNotice | null>(null);

  /** Where a contrast result asked to go: the tokens panel switches mode and focuses the field. */
  readonly tokenFocus = signal<{ mode: ThemeMode; key: ColorToken; id: number } | null>(null);

  private readonly history = new DraftHistory<ThemeDraft>(100);
  private readonly historyVersion = signal(0);
  private lastChange: { key: string; at: number } | null = null;
  private library: ThemeLibrary | null = null;
  private noticeId = 0;
  private readonly now: () => number = () => Date.now();

  /** What the draft looked like when it was last saved or opened: the "unsaved" reference. */
  private readonly baseline = signal(this.serialize(this.theme(), null));

  readonly canUndo = computed(() => (this.historyVersion(), this.history.canUndo));
  readonly canRedo = computed(() => (this.historyVersion(), this.history.canRedo));
  readonly dirty = computed(
    () => this.serialize(this.theme(), this.paletteMeta()) !== this.baseline()
  );

  readonly crafterLink = computed(() => {
    const meta = this.paletteMeta();
    return meta
      ? crafterUrl(meta, this.previewDark() ? 'dark' : 'light')
      : 'https://palette-crafter.andersseen.dev/';
  });

  readonly normalizedName = computed(() => normalizeThemeName(this.theme().name));
  readonly nameIsShipped = computed(() => isShippedPaletteName(this.theme().name));

  readonly activePalette = computed(() =>
    this.previewDark() ? this.theme().dark : this.theme().light
  );

  /** The exported stylesheet, the copied one and the downloaded one: one string. */
  readonly generatedCss = computed(() => themeCss(this.theme()));
  /** The same stylesheet under the preview's private name; the preview paints with nothing else. */
  readonly previewCss = computed(() => themeCss(this.theme(), PREVIEW_THEME_NAME));
  readonly projectJson = computed(() => this.serialize(this.theme(), this.paletteMeta()));
  readonly integrationSnippet = computed(() => themeIntegrationSnippet(this.theme()));

  /** The starting palette, for per-token reset and "modified" marks. */
  readonly presetPalette = computed(() => shippedPalette(this.theme().palette));
  readonly styleShape = computed(() => shippedStyle(this.theme().style));

  readonly contrast = computed<ContrastResult[]>(() =>
    evaluateContrast(this.theme(), this.styleShape().knobs)
  );

  constructor() {
    const document = inject(DOCUMENT);
    afterNextRender(() => this.connectLibrary(new ThemeLibrary(browserStorage(document))));

    // Keep the draft for the next visit, once the library is connected.
    effect(() => {
      const project = this.currentProject();
      const savedId = this.savedId();
      if (this.library?.writable) this.library.saveDraft(project, savedId);
    });
  }

  /** Separate from the constructor so tests can hand in a library over a fake storage. */
  connectLibrary(library: ThemeLibrary): void {
    const snapshot = library.load();
    this.library = library;
    this.libraryStatus.set(snapshot.status);
    this.savedThemes.set(snapshot.themes);

    if (snapshot.status === 'recovered') this.announce('corruptBackedUp', 'error');
    else if (snapshot.status === 'unsupported') this.announce('unsupportedLibrary', 'error');
    else if (snapshot.skipped > 0) this.announce('skippedRecords', 'error');

    if (snapshot.draft) {
      const saved = snapshot.themes.find(theme => theme.id === snapshot.draft!.savedId);
      this.openProject(snapshot.draft.project, saved ?? null, false);
      // A recovered draft that differs from its saved theme stays "unsaved".
      if (saved) this.baseline.set(this.serialize(saved.project.draft, saved.project.generator));
      else this.baseline.set(this.serialize(clonePreset('glacier'), null));
      this.announce('recovered', 'info');
    }
    this.historyVersion.update(v => v + 1);
  }

  // ---------------------------------------------------------------- editing

  setName(value: unknown): void {
    if (typeof value !== 'string') return;
    this.change('name', theme => ({ ...theme, name: value }));
  }

  get presetValue(): PresetName {
    return this.theme().palette;
  }

  /** Starts the colours over from a shipped palette; name, style and shape stay. */
  set presetValue(value: unknown) {
    if (!isPresetName(value) || value === this.theme().palette) return;
    this.change(null, theme => ({ ...theme, palette: value, ...shippedPalette(value) }));
    this.paletteMeta.set(null);
  }

  get styleValue(): StylePreset {
    return this.theme().style;
  }

  /** A style comes with its own shape, so choosing one clears the shape overrides. */
  set styleValue(value: unknown) {
    if (!isStylePreset(value) || value === this.theme().style) return;
    this.change(null, theme => ({ ...theme, style: value, shape: { ...NO_SHAPE_OVERRIDES } }));
  }

  get densityValue(): VoltThemeDensity {
    return this.theme().density;
  }

  set densityValue(value: unknown) {
    if (!isDensity(value) || value === this.theme().density) return;
    this.change(null, theme => ({ ...theme, density: value }));
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

  /**
   * A colour from the picker or the hex field. Anything that is not `#rrggbb` is ignored. Rapid
   * changes to one token — a picker being dragged — become a single undo step.
   */
  setColor(mode: ThemeMode, key: ColorToken, value: unknown): void {
    if (typeof value !== 'string' || !HEX.test(value.trim())) return;
    const hex = value.trim().toLowerCase();
    if (this.theme()[mode][key] === hex) return;
    this.change(`color:${mode}:${key}`, theme => ({
      ...theme,
      [mode]: { ...theme[mode], [key]: hex },
    }));
  }

  resetColor(mode: ThemeMode, key: ColorToken): void {
    this.lastChange = null;
    this.setColor(mode, key, this.presetPalette()[mode][key]);
    this.lastChange = null;
  }

  /** Every colour of one mode back to the starting palette. */
  resetPalette(mode: ThemeMode): void {
    this.change(null, theme => ({ ...theme, [mode]: { ...this.presetPalette()[mode] } }));
  }

  /** The whole draft back to its starting palette with default style, density and shape. */
  resetDraft(): void {
    this.change(null, theme => clonePreset(theme.palette, theme.name));
    this.paletteMeta.set(null);
  }

  setShape(key: ShapeKey, value: number | null): void {
    if (value !== null && typeof value !== 'number') return;
    if (this.theme().shape[key] === value) return;
    this.change(`shape:${key}`, theme => ({ ...theme, shape: { ...theme.shape, [key]: value } }));
  }

  /** Kept for the shape sliders' `(valueChange)`. */
  setNumber(key: ShapeKey, value: unknown): void {
    if (typeof value === 'number') this.setShape(key, value);
  }

  undo(): void {
    const previous = this.history.undo(this.theme());
    if (previous) this.restore(previous);
  }

  redo(): void {
    const next = this.history.redo(this.theme());
    if (next) this.restore(next);
  }

  // ---------------------------------------------------------------- palettes

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

  // ---------------------------------------------------------------- contrast

  suggestionFor(result: ContrastResult) {
    return suggestCorrection(this.theme(), this.styleShape().knobs, result);
  }

  /** Applies one proposed colour as its own undo step. Never touches any other token. */
  applySuggestion(result: ContrastResult): void {
    const suggestion = this.suggestionFor(result);
    if (!suggestion) return;
    this.lastChange = null;
    this.setColor(suggestion.mode, suggestion.token, suggestion.to);
    this.lastChange = null;
  }

  focusToken(mode: ThemeMode, key: ColorToken): void {
    this.setActiveMode(mode);
    this.tokenFocus.set({ mode, key, id: (this.tokenFocus()?.id ?? 0) + 1 });
  }

  // ---------------------------------------------------------------- projects

  /** Opens a project file's text. Nothing changes unless all of it is valid. */
  importProject(text: string): boolean {
    try {
      const project = parseThemeProject(text);
      this.change(null, () => project.draft);
      this.paletteMeta.set(project.generator);
      this.savedId.set(null);
      this.projectError.set(null);
      this.announce('imported', 'success');
      return true;
    } catch (error) {
      const known = error instanceof ThemeProjectError;
      this.projectError.set({
        code: known ? error.code : 'invalid',
        detail: known ? error.message : String(error),
      });
      return false;
    }
  }

  clearProjectError(): void {
    this.projectError.set(null);
  }

  /** Saves over the theme the draft came from, or as a new one. */
  save(options: { asNew?: boolean; replace?: boolean } = {}): LibraryWrite {
    const id = options.asNew ? undefined : (this.savedId() ?? undefined);
    const result = this.write(library =>
      library.saveTheme(this.currentProject(), { id, replace: options.replace })
    );
    if (result.ok && result.theme) {
      this.savedId.set(result.theme.id);
      this.baseline.set(this.projectJson());
      this.announce('saved', 'success');
    }
    return result;
  }

  loadSaved(id: string): void {
    const theme = this.savedThemes().find(saved => saved.id === id);
    if (!theme) return this.announce('missing', 'error');
    this.openProject(theme.project, theme, true);
    this.announce('loaded', 'success');
  }

  duplicate(id: string): LibraryWrite {
    const result = this.write(library => library.duplicate(id));
    if (result.ok) this.announce('duplicated', 'success');
    return result;
  }

  rename(id: string, name: string): LibraryWrite {
    const result = this.write(library => library.rename(id, name));
    if (result.ok) {
      if (id === this.savedId()) {
        this.theme.update(theme => ({ ...theme, name: normalizeThemeName(name) }));
        this.baseline.set(this.projectJson());
      }
      this.announce('renamed', 'success');
    }
    return result;
  }

  delete(id: string): LibraryWrite {
    const result = this.write(library => library.delete(id));
    if (result.ok) {
      if (id === this.savedId()) this.savedId.set(null);
      this.announce('deleted', 'success');
    }
    return result;
  }

  // ---------------------------------------------------------------- internals

  private currentProject(): ThemeProject {
    return parseThemeProject(this.projectJson());
  }

  private serialize(draft: ThemeDraft, meta: GeneratedPalette['meta'] | null): string {
    return serializeThemeProject(draft, meta);
  }

  /**
   * Applies an edit and records the state before it. `key` names the field: consecutive edits of
   * the same field within `COALESCE_MS` share one undo step. `null` always records.
   */
  private change(key: string | null, edit: (theme: ThemeDraft) => ThemeDraft): void {
    const now = this.now();
    const coalesce =
      key !== null &&
      this.lastChange?.key === key &&
      now - this.lastChange.at < COALESCE_MS &&
      this.history.canUndo;
    if (!coalesce) {
      this.history.record(this.theme());
      this.historyVersion.update(v => v + 1);
    }
    this.lastChange = key === null ? null : { key, at: now };
    this.theme.update(edit);
  }

  private restore(draft: ThemeDraft): void {
    this.lastChange = null;
    this.theme.set(draft);
    this.historyVersion.update(v => v + 1);
  }

  private openProject(project: ThemeProject, saved: SavedTheme | null, record: boolean): void {
    if (record) this.change(null, () => project.draft);
    else this.theme.set(project.draft);
    this.paletteMeta.set(project.generator);
    if (project.generator) this.harmony.set(project.generator.harmony);
    this.savedId.set(saved?.id ?? null);
    if (saved) this.baseline.set(this.serialize(saved.project.draft, saved.project.generator));
  }

  private write(operation: (library: ThemeLibrary) => LibraryWrite): LibraryWrite {
    if (!this.library) {
      this.announce('unavailable', 'error');
      return { ok: false, reason: 'unavailable' };
    }
    const result = operation(this.library);
    this.savedThemes.set(this.library.load().themes);
    if (!result.ok) {
      const keys: Record<typeof result.reason, StudioNoticeKey> = {
        'name-taken': 'nameTaken',
        full: 'full',
        quota: 'quota',
        'read-only': 'readOnly',
        unavailable: 'unavailable',
        missing: 'missing',
      };
      this.announce(keys[result.reason], 'error');
    }
    return result;
  }

  private announce(key: StudioNoticeKey, tone: StudioNotice['tone']): void {
    this.notice.set({ key, tone, id: ++this.noticeId });
  }

  private applyPalette(palette: GeneratedPalette): void {
    // Only the colors change — radius, borders and shadows are the user's own shape work.
    this.change(null, theme => ({ ...theme, light: palette.light, dark: palette.dark }));
    this.paletteMeta.set(palette.meta);
    this.harmony.set(palette.meta.harmony);
    this.importError.set('');
  }
}
