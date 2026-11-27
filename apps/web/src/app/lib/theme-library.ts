import { readThemeProject, toProjectJson, type ThemeProject } from './theme-project';
import { normalizeThemeName } from './theme-draft';

/**
 * Theme Studio's local library: the draft being edited (recovered on the next visit) and the themes
 * saved by name. It lives in this browser's `localStorage` only — no account, no server, nothing
 * sent anywhere.
 *
 * Stored under one key as JSON, schema version 1:
 *
 * ```json
 * {
 *   "version": 1,
 *   "draft": { "savedId": "…" | null, "project": <theme project v1> } | null,
 *   "themes": [{ "id": "…", "savedAt": "2026-11-27T10:00:00.000Z", "project": <theme project v1> }]
 * }
 * ```
 *
 * Bounded to `THEME_LIBRARY_MAX_THEMES` saved themes; saving one more is refused, never evicts.
 * A record that fails validation is skipped and kept as it was. A whole value that is not JSON is
 * copied to `<key>:backup` before a fresh library replaces it. A value written by a newer schema is
 * left untouched and the library becomes read-only for this visit. Every method reads storage again
 * first, so two tabs do not overwrite each other's themes with a stale copy.
 */

export const THEME_LIBRARY_KEY = 'volt-theme-studio';
export const THEME_LIBRARY_VERSION = 1;
export const THEME_LIBRARY_MAX_THEMES = 20;

export interface SavedTheme {
  readonly id: string;
  readonly savedAt: string;
  readonly project: ThemeProject;
}

export interface RecoveredDraft {
  readonly savedId: string | null;
  readonly project: ThemeProject;
}

export type LibraryStatus =
  /** Storage works and held a readable library (or nothing yet). */
  | 'ready'
  /** No storage: SSR, privacy settings, a sandboxed frame. Nothing is kept. */
  | 'unavailable'
  /** A newer studio wrote this library. Shown read-only; never overwritten. */
  | 'unsupported'
  /** The stored value was not JSON; it was backed up and replaced. */
  | 'recovered';

export interface LibrarySnapshot {
  readonly status: LibraryStatus;
  readonly draft: RecoveredDraft | null;
  readonly themes: readonly SavedTheme[];
  /** Records that could not be read and were left as they were. */
  readonly skipped: number;
}

export type LibraryWrite =
  | { readonly ok: true; readonly theme?: SavedTheme }
  | {
      readonly ok: false;
      readonly reason: 'unavailable' | 'read-only' | 'quota' | 'full' | 'name-taken' | 'missing';
    };

interface RawLibrary {
  version: number;
  draft: unknown;
  themes: unknown[];
}

const emptyRaw = (): RawLibrary => ({ version: THEME_LIBRARY_VERSION, draft: null, themes: [] });

function newId(): string {
  const random = globalThis.crypto?.randomUUID?.();
  return random ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function readSaved(record: unknown): SavedTheme | null {
  if (typeof record !== 'object' || record === null) return null;
  const { id, savedAt, project } = record as Record<string, unknown>;
  if (typeof id !== 'string' || !id || typeof savedAt !== 'string') return null;
  try {
    return { id, savedAt, project: readThemeProject(project) };
  } catch {
    return null;
  }
}

function readDraft(value: unknown): RecoveredDraft | null {
  if (typeof value !== 'object' || value === null) return null;
  const { savedId, project } = value as Record<string, unknown>;
  try {
    return {
      savedId: typeof savedId === 'string' ? savedId : null,
      project: readThemeProject(project),
    };
  } catch {
    return null;
  }
}

const projectJson = (project: ThemeProject) => toProjectJson(project.draft, project.generator);

export class ThemeLibrary {
  private readOnly = false;

  constructor(
    private readonly storage: Storage | null,
    private readonly key = THEME_LIBRARY_KEY,
    private readonly now: () => Date = () => new Date()
  ) {}

  /** Reads everything; repairs nothing except a value that is not JSON at all. */
  load(): LibrarySnapshot {
    if (!this.storage) return { status: 'unavailable', draft: null, themes: [], skipped: 0 };

    let text: string | null;
    try {
      text = this.storage.getItem(this.key);
    } catch {
      return { status: 'unavailable', draft: null, themes: [], skipped: 0 };
    }
    if (text === null) return { status: 'ready', draft: null, themes: [], skipped: 0 };

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = undefined;
    }
    const shaped =
      typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;

    if (!shaped || typeof shaped['version'] !== 'number') {
      // Not ours, or not JSON: keep a copy, start again.
      try {
        this.storage.setItem(`${this.key}:backup`, text);
        this.storage.setItem(this.key, JSON.stringify(emptyRaw()));
      } catch {
        this.readOnly = true;
      }
      return { status: 'recovered', draft: null, themes: [], skipped: 0 };
    }

    if (shaped['version'] !== THEME_LIBRARY_VERSION) {
      this.readOnly = true;
      return { status: 'unsupported', draft: null, themes: [], skipped: 0 };
    }

    const records = Array.isArray(shaped['themes']) ? shaped['themes'] : [];
    const themes = records.map(readSaved).filter((theme): theme is SavedTheme => theme !== null);
    return {
      status: 'ready',
      draft: readDraft(shaped['draft']),
      themes,
      skipped: records.length - themes.length,
    };
  }

  get writable(): boolean {
    return !!this.storage && !this.readOnly;
  }

  /** Keeps the draft for the next visit. */
  saveDraft(project: ThemeProject, savedId: string | null): LibraryWrite {
    return this.mutate(raw => {
      raw.draft = { savedId, project: projectJson(project) };
      return { ok: true };
    });
  }

  /**
   * Saves `project`. With `id`, over that saved theme; without, as a new one. A name another saved
   * theme already has is refused unless `replace` says to write over that one.
   */
  saveTheme(project: ThemeProject, options: { id?: string; replace?: boolean } = {}): LibraryWrite {
    return this.mutate(raw => {
      const themes = raw.themes;
      const idOf = (record: unknown) => readSaved(record)?.id;
      const name = project.draft.name;

      const own = options.id ? themes.findIndex(record => idOf(record) === options.id) : -1;
      if (options.id && own < 0) return { ok: false, reason: 'missing' };

      const clash = themes.findIndex(
        record => readSaved(record)?.project.draft.name === name && idOf(record) !== options.id
      );
      if (clash >= 0 && !options.replace) return { ok: false, reason: 'name-taken' };

      // Replacing a same-named theme: it takes this content, and this one (if saved) goes.
      const clashId = clash >= 0 ? idOf(themes[clash]) : undefined;
      if (clash >= 0 && own >= 0) themes.splice(own, 1);
      const target = clashId ? themes.findIndex(record => idOf(record) === clashId) : own;
      if (target < 0 && themes.length >= THEME_LIBRARY_MAX_THEMES) {
        return { ok: false, reason: 'full' };
      }

      const id = target >= 0 ? idOf(themes[target])! : newId();
      const theme: SavedTheme = { id, savedAt: this.now().toISOString(), project };
      const record = { id, savedAt: theme.savedAt, project: projectJson(project) };
      if (target >= 0) themes[target] = record;
      else themes.push(record);
      return { ok: true, theme };
    });
  }

  rename(id: string, name: string): LibraryWrite {
    const normalized = normalizeThemeName(name);
    const current = this.find(id);
    if (!current) return { ok: false, reason: 'missing' };
    const project = { ...current.project, draft: { ...current.project.draft, name: normalized } };
    return this.saveTheme(project, { id });
  }

  /** A copy under the first free `<name>-copy`, `<name>-copy-2`… */
  duplicate(id: string): LibraryWrite {
    const current = this.find(id);
    if (!current) return { ok: false, reason: 'missing' };
    const taken = new Set(this.load().themes.map(theme => theme.project.draft.name));
    const base = normalizeThemeName(`${current.project.draft.name}-copy`);
    let name = base;
    for (let n = 2; taken.has(name); n++) name = normalizeThemeName(`${base}-${n}`);
    const project = { ...current.project, draft: { ...current.project.draft, name } };
    return this.saveTheme(project);
  }

  delete(id: string): LibraryWrite {
    return this.mutate(raw => {
      const index = raw.themes.findIndex(record => readSaved(record)?.id === id);
      if (index < 0) return { ok: false, reason: 'missing' };
      raw.themes.splice(index, 1);
      const draft = readDraft(raw.draft);
      if (draft?.savedId === id) {
        raw.draft = { savedId: null, project: projectJson(draft.project) };
      }
      return { ok: true };
    });
  }

  find(id: string): SavedTheme | undefined {
    return this.load().themes.find(theme => theme.id === id);
  }

  private mutate(change: (raw: RawLibrary) => LibraryWrite): LibraryWrite {
    if (!this.storage) return { ok: false, reason: 'unavailable' };
    if (this.readOnly) return { ok: false, reason: 'read-only' };

    let raw: RawLibrary;
    try {
      const text = this.storage.getItem(this.key);
      const parsed = text === null ? emptyRaw() : (JSON.parse(text) as RawLibrary);
      if (parsed.version !== THEME_LIBRARY_VERSION) {
        this.readOnly = true;
        return { ok: false, reason: 'read-only' };
      }
      raw = {
        version: THEME_LIBRARY_VERSION,
        draft: parsed.draft ?? null,
        themes: Array.isArray(parsed.themes) ? parsed.themes : [],
      };
    } catch {
      return { ok: false, reason: 'unavailable' };
    }

    const result = change(raw);
    if (!result.ok) return result;
    try {
      this.storage.setItem(this.key, JSON.stringify(raw));
    } catch {
      return { ok: false, reason: 'quota' };
    }
    return result;
  }
}
