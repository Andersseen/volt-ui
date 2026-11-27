/**
 * Bounded undo/redo over immutable snapshots. The studio records one entry per meaningful change —
 * a committed colour, a preset, an applied suggestion — not one per pointer move while a colour
 * picker is dragged (see `ThemeStudioStore.previewColor`).
 */
export class DraftHistory<T> {
  private past: T[] = [];
  private future: T[] = [];

  constructor(private readonly limit = 100) {}

  get canUndo(): boolean {
    return this.past.length > 0;
  }

  get canRedo(): boolean {
    return this.future.length > 0;
  }

  /** `previous` is the state before the change being recorded. Clears the redo stack. */
  record(previous: T): void {
    this.past.push(previous);
    if (this.past.length > this.limit) this.past.shift();
    this.future = [];
  }

  /** The state to go back to, given the one on screen; `null` when there is none. */
  undo(current: T): T | null {
    const previous = this.past.pop();
    if (previous === undefined) return null;
    this.future.push(current);
    return previous;
  }

  redo(current: T): T | null {
    const next = this.future.pop();
    if (next === undefined) return null;
    this.past.push(current);
    return next;
  }

  clear(): void {
    this.past = [];
    this.future = [];
  }
}
