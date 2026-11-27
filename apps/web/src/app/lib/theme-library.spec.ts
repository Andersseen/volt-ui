import { beforeEach, describe, expect, it } from 'vitest';
import { clonePreset } from './theme-draft';
import { THEME_LIBRARY_KEY, THEME_LIBRARY_MAX_THEMES, ThemeLibrary } from './theme-library';
import { parseThemeProject, serializeThemeProject, type ThemeProject } from './theme-project';

const project = (name: string, palette: 'volt' | 'sage' = 'volt'): ThemeProject =>
  parseThemeProject(serializeThemeProject(clonePreset(palette, name)));

/** A Storage that can be told to fail like a full or denied one. */
class FakeStorage implements Storage {
  data = new Map<string, string>();
  failWrites = false;
  failReads = false;
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }
  getItem(key: string) {
    if (this.failReads) throw new DOMException('denied', 'SecurityError');
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    if (this.failWrites) throw new DOMException('full', 'QuotaExceededError');
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
}

describe('ThemeLibrary', () => {
  let storage: FakeStorage;
  let library: ThemeLibrary;

  beforeEach(() => {
    storage = new FakeStorage();
    library = new ThemeLibrary(storage, THEME_LIBRARY_KEY, () => new Date('2026-11-27T10:00:00Z'));
  });

  it('starts empty on a first visit', () => {
    expect(library.load()).toEqual({ status: 'ready', draft: null, themes: [], skipped: 0 });
  });

  it('recovers the draft and which saved theme it belongs to', () => {
    library.saveDraft(project('acme'), 'id-1');
    const again = new ThemeLibrary(storage).load();
    expect(again.draft?.savedId).toBe('id-1');
    expect(again.draft?.project.draft.name).toBe('acme');
  });

  it('saves, lists, renames, duplicates and deletes', () => {
    const saved = library.saveTheme(project('acme'));
    expect(saved.ok).toBe(true);
    const id = (saved as { theme: { id: string } }).theme.id;

    expect(library.rename(id, 'Acme Dark').ok).toBe(true);
    expect(library.load().themes.map(t => t.project.draft.name)).toEqual(['acme-dark']);

    expect(library.duplicate(id).ok).toBe(true);
    expect(library.duplicate(id).ok).toBe(true);
    expect(library.load().themes.map(t => t.project.draft.name)).toEqual([
      'acme-dark',
      'acme-dark-copy',
      'acme-dark-copy-2',
    ]);

    expect(library.delete(id).ok).toBe(true);
    expect(library.load().themes).toHaveLength(2);
    expect(library.delete(id)).toEqual({ ok: false, reason: 'missing' });
  });

  it('never overwrites another saved theme by name unless told to', () => {
    library.saveTheme(project('acme', 'volt'));
    expect(library.saveTheme(project('acme', 'sage'))).toEqual({ ok: false, reason: 'name-taken' });
    expect(library.load().themes[0].project.draft.palette).toBe('volt');

    const replaced = library.saveTheme(project('acme', 'sage'), { replace: true });
    expect(replaced.ok).toBe(true);
    expect(library.load().themes).toHaveLength(1);
    expect(library.load().themes[0].project.draft.palette).toBe('sage');
  });

  it('refuses a rename onto a name already taken', () => {
    library.saveTheme(project('acme'));
    const other = library.saveTheme(project('beta')) as { theme: { id: string } };
    expect(library.rename(other.theme.id, 'acme')).toEqual({ ok: false, reason: 'name-taken' });
  });

  it('is bounded and refuses one more theme instead of evicting', () => {
    for (let i = 0; i < THEME_LIBRARY_MAX_THEMES; i++) library.saveTheme(project(`theme-${i}`));
    expect(library.saveTheme(project('one-more'))).toEqual({ ok: false, reason: 'full' });
    expect(library.load().themes).toHaveLength(THEME_LIBRARY_MAX_THEMES);
  });

  it('reports a full storage quota without losing what was stored', () => {
    library.saveTheme(project('acme'));
    storage.failWrites = true;
    expect(library.saveTheme(project('beta'))).toEqual({ ok: false, reason: 'quota' });
    storage.failWrites = false;
    expect(library.load().themes.map(t => t.project.draft.name)).toEqual(['acme']);
  });

  it('works without storage at all', () => {
    const none = new ThemeLibrary(null);
    expect(none.load().status).toBe('unavailable');
    expect(none.saveTheme(project('acme'))).toEqual({ ok: false, reason: 'unavailable' });
    storage.failReads = true;
    expect(library.load().status).toBe('unavailable');
  });

  it('skips a corrupt record and keeps it as it was', () => {
    library.saveTheme(project('acme'));
    const raw = JSON.parse(storage.getItem(THEME_LIBRARY_KEY)!);
    raw.themes.push({
      id: 'bad',
      savedAt: 'x',
      project: { format: 'volt-theme-project', version: 1 },
    });
    storage.setItem(THEME_LIBRARY_KEY, JSON.stringify(raw));

    const snapshot = library.load();
    expect(snapshot.themes).toHaveLength(1);
    expect(snapshot.skipped).toBe(1);

    library.saveTheme(project('beta'));
    expect(JSON.parse(storage.getItem(THEME_LIBRARY_KEY)!).themes).toHaveLength(3);
  });

  it('backs up a value that is not JSON before starting again', () => {
    storage.setItem(THEME_LIBRARY_KEY, '{oops');
    expect(library.load().status).toBe('recovered');
    expect(storage.getItem(`${THEME_LIBRARY_KEY}:backup`)).toBe('{oops');
    expect(library.saveTheme(project('acme')).ok).toBe(true);
  });

  it('leaves a library from a newer schema untouched and read-only', () => {
    const newer = JSON.stringify({ version: 2, themes: [{ anything: true }] });
    storage.setItem(THEME_LIBRARY_KEY, newer);
    expect(library.load().status).toBe('unsupported');
    expect(library.saveTheme(project('acme'))).toEqual({ ok: false, reason: 'read-only' });
    expect(library.saveDraft(project('acme'), null)).toEqual({ ok: false, reason: 'read-only' });
    expect(storage.getItem(THEME_LIBRARY_KEY)).toBe(newer);
  });

  it('reads storage again before each write, so another tab is not overwritten', () => {
    const otherTab = new ThemeLibrary(storage);
    library.saveTheme(project('from-this-tab'));
    otherTab.saveTheme(project('from-other-tab'));
    library.saveTheme(project('again'));
    expect(library.load().themes.map(t => t.project.draft.name)).toEqual([
      'from-this-tab',
      'from-other-tab',
      'again',
    ]);
  });

  it('unlinks the draft from a theme that is deleted', () => {
    const saved = library.saveTheme(project('acme')) as { theme: { id: string } };
    library.saveDraft(project('acme'), saved.theme.id);
    library.delete(saved.theme.id);
    expect(library.load().draft?.savedId).toBeNull();
  });
});
