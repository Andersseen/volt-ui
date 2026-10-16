import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  VoltAlert,
  VoltAlertDescription,
  VoltCombobox,
  VoltFormField,
  VoltLabel,
  VoltNativeButton,
} from 'volt';

/**
 * RECIPE — Server-side search with selection.
 *
 * `VoltCombobox` filters a list you already have. When a server decides what matches, say so with
 * `filterMode="manual"`: the combobox renders `items` exactly as you supply them, reports typing
 * through `(queryChange)`, and shows `loading` / empty states. It never fetches anything.
 *
 *   idle → loading → results | empty | error → (retry)
 *
 * Three decisions worth copying:
 *   - Stale responses lose. Every search takes a ticket; a response only lands if its ticket is
 *     still the latest. Typing "an" then "ang" can finish as "ang", "an", and the list must still
 *     say "ang". (An AbortController is the same idea at the network layer; the ticket is what
 *     protects you when your data source cannot be aborted.) This lives in YOUR code on purpose:
 *     a UI atom should not own request policy.
 *   - The selection is kept by id, in its own signal. New result arrays contain new objects, and
 *     a failed or empty search must not erase the person already chosen.
 *   - `(queryChange)` is the typed text only. Choosing an option writes its label back into the
 *     input, and that does not emit — so selecting never triggers another request.
 *
 * Do not pass server results to the default (`local`) filter: a server that matches on an email
 * or an alias would see those rows hidden again by their label.
 *
 * Replace `fakeSearch` with your service call.
 */

export interface Person {
  id: string;
  name: string;
  role: string;
}

export type SearchPeople = (query: string) => Promise<Person[]>;

const PEOPLE: Person[] = [
  { id: '1', name: 'Ada Lovelace', role: 'Analyst' },
  { id: '2', name: 'Alan Turing', role: 'Mathematician' },
  { id: '3', name: 'Grace Hopper', role: 'Admiral' },
  { id: '4', name: 'Margaret Hamilton', role: 'Engineer' },
  { id: '5', name: 'Katherine Johnson', role: 'Mathematician' },
  { id: '6', name: 'Annie Easley', role: 'Scientist' },
];

/** REPLACE ME. Rejects for the query "boom" so the error path is reproducible. */
export const fakeSearch: SearchPeople = query =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      if (query.trim().toLowerCase() === 'boom') {
        reject(new Error('The directory is unavailable.'));
        return;
      }
      const q = query.trim().toLowerCase();
      resolve(PEOPLE.filter(p => p.name.toLowerCase().includes(q)));
    }, 250)
  );

@Component({
  selector: 'app-async-search-recipe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltAlert,
    VoltAlertDescription,
    VoltCombobox,
    VoltFormField,
    VoltLabel,
    VoltNativeButton,
  ],
  template: `
    <div class="mx-auto max-w-md space-y-3">
      <volt-form-field>
        <volt-label>Owner</volt-label>
        <volt-combobox
          label="Owner"
          placeholder="Search people…"
          filterMode="manual"
          [items]="results()"
          [loading]="loading()"
          loadingText="Searching…"
          [emptyText]="emptyText()"
          [resultsText]="resultsText"
          [itemLabel]="label"
          [trackByFn]="byId"
          [compareWith]="sameId"
          [value]="selected()"
          (valueChange)="select($event)"
          (queryChange)="onType($event)"
        >
          <ng-template let-person>
            <span class="font-medium">{{ person.name }}</span>
            <span class="ml-2 text-xs text-muted-foreground">{{ person.role }}</span>
          </ng-template>
        </volt-combobox>
      </volt-form-field>

      @if (error()) {
        <volt-alert variant="destructive" role="alert">
          <volt-alert-description>{{ error() }}</volt-alert-description>
          <button
            slot="action"
            voltButton
            variant="outline"
            size="sm"
            type="button"
            (click)="retry()"
          >
            Retry
          </button>
        </volt-alert>
      }

      <p class="text-sm" data-testid="selection">
        @if (selected(); as person) {
          Selected: <strong>{{ person.name }}</strong>
        } @else {
          Nobody selected
        }
      </p>
    </div>
  `,
})
export class AsyncSearchRecipe {
  /** The one thing you swap for a real call. */
  readonly search = input<SearchPeople>(fakeSearch);
  /** Wait this long after the last keystroke before searching. */
  readonly debounceMs = input(150);

  protected readonly loading = signal(false);
  protected readonly results = signal<Person[]>([]);
  protected readonly selected = signal<Person | null>(null);
  protected readonly query = signal('');
  protected readonly error = signal('');

  protected readonly emptyText = computed(() => {
    if (this.error()) return 'The search failed.';
    return this.query().trim()
      ? `No one matches "${this.query().trim()}".`
      : 'Start typing to search.';
  });

  protected readonly label = (item: unknown) => (item as Person).name;
  protected readonly byId = (_index: number, item: unknown) => (item as Person).id;
  protected readonly sameId = (a: unknown, b: unknown) =>
    (a as Person | null)?.id === (b as Person | null)?.id;
  protected readonly resultsText = (count: number) =>
    `${count} ${count === 1 ? 'person' : 'people'} found`;

  /** Latest-wins ticket. Only the response that holds it may write state. */
  private ticket = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
      this.ticket++; // anything still in flight can no longer land
    });
  }

  /** `(queryChange)`: what the user typed. Choosing an option does not come through here. */
  protected onType(value: string): void {
    this.query.set(value);
    clearTimeout(this.timer);

    // An emptied box returns to idle. The selection is deliberately left alone.
    if (!value.trim()) {
      this.ticket++;
      this.results.set([]);
      this.error.set('');
      this.loading.set(false);
      return;
    }
    this.timer = setTimeout(() => void this.run(value), this.debounceMs());
  }

  protected retry(): void {
    void this.run(this.query());
  }

  protected select(value: unknown): void {
    this.selected.set((value as Person | undefined) ?? null);
  }

  private async run(query: string): Promise<void> {
    const mine = ++this.ticket;
    this.loading.set(true);
    this.error.set('');
    try {
      const people = await this.search()(query);
      if (mine !== this.ticket) return; // a newer search owns the screen
      this.results.set(people);
    } catch (error) {
      if (mine !== this.ticket) return;
      this.results.set([]);
      this.error.set((error as Error).message);
    } finally {
      if (mine === this.ticket) this.loading.set(false);
    }
  }
}
