import {
  ChangeDetectionStrategy,
  Component,
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
  VoltSpinner,
} from 'volt';

/**
 * RECIPE — Async search with selection.
 *
 * `VoltCombobox` filters a list you already have. Searching a server is the other half: the list
 * arrives later, may fail, and may arrive out of order. The combobox stays exactly as it is; this
 * recipe adds the missing states *around* it.
 *
 *   idle → loading → results | empty | error → (retry)
 *
 * Three decisions worth copying:
 *   - Stale responses lose. Every search takes a ticket; a response only lands if its ticket is
 *     still the latest. Typing "an" then "ang" can finish as "ang", "an", and the list must still
 *     say "ang". (An AbortController is the same idea at the network layer; the ticket is what
 *     protects you when your data source cannot be aborted.)
 *   - The selection is kept by id, in its own signal. New result arrays contain new objects, and
 *     a failed or empty search must not erase the person already chosen.
 *   - The input never re-renders: loading, empty and error text live in a status line beside it,
 *     so focus and the caret stay where the user left them.
 *
 * `VoltCombobox` also narrows `items` by label as you type, so a server that matches on something
 * other than the label (an email, an alias) will see those rows hidden. Make `itemLabel` return
 * the text you search on, or search on the label.
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

type Status = 'idle' | 'loading' | 'results' | 'empty' | 'error';

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
    VoltSpinner,
  ],
  template: `
    <div class="mx-auto max-w-md space-y-3">
      <volt-form-field>
        <volt-label>Owner</volt-label>
        <!--
          The combobox reports typing through the native input event, which bubbles to its host.
        -->
        <volt-combobox
          label="Owner"
          placeholder="Search people…"
          [items]="results()"
          [itemLabel]="label"
          [trackByFn]="byId"
          [compareWith]="sameId"
          [value]="selected()"
          (valueChange)="select($event)"
          (input)="onType($any($event.target).value)"
        >
          <ng-template let-person>
            <span class="font-medium">{{ person.name }}</span>
            <span class="ml-2 text-xs text-muted-foreground">{{ person.role }}</span>
          </ng-template>
        </volt-combobox>
      </volt-form-field>

      <!-- Polite status line; its text changes, the element does not. -->
      <p class="min-h-5 text-sm text-muted-foreground" role="status" aria-live="polite">
        @switch (status()) {
          @case ('loading') {
            <span class="inline-flex items-center gap-2">
              <volt-spinner size="sm" />
              Searching…
            </span>
          }
          @case ('results') {
            {{ results().length }} {{ results().length === 1 ? 'person' : 'people' }} found
          }
          @case ('empty') {
            No one matches "{{ query() }}".
          }
        }
      </p>

      @if (status() === 'error') {
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

  protected readonly status = signal<Status>('idle');
  protected readonly results = signal<Person[]>([]);
  protected readonly selected = signal<Person | null>(null);
  protected readonly query = signal('');
  protected readonly error = signal('');

  protected readonly label = (item: unknown) => (item as Person).name;
  protected readonly byId = (_index: number, item: unknown) => (item as Person).id;
  protected readonly sameId = (a: unknown, b: unknown) =>
    (a as Person | null)?.id === (b as Person | null)?.id;

  /** Latest-wins ticket. Only the response that holds it may write state. */
  private ticket = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
      this.ticket++; // anything still in flight can no longer land
    });
  }

  protected onType(value: string): void {
    this.query.set(value);
    clearTimeout(this.timer);

    // An emptied box returns to idle. The selection is deliberately left alone.
    if (!value.trim()) {
      this.ticket++;
      this.results.set([]);
      this.status.set('idle');
      return;
    }
    this.timer = setTimeout(() => void this.run(value), this.debounceMs());
  }

  protected retry(): void {
    void this.run(this.query());
  }

  /** The combobox echoes the chosen label back into the input; that is not a new search. */
  protected select(value: unknown): void {
    this.selected.set((value as Person | undefined) ?? null);
  }

  private async run(query: string): Promise<void> {
    const mine = ++this.ticket;
    this.status.set('loading');
    try {
      const people = await this.search()(query);
      if (mine !== this.ticket) return; // a newer search owns the screen
      this.results.set(people);
      this.status.set(people.length ? 'results' : 'empty');
    } catch (error) {
      if (mine !== this.ticket) return;
      this.error.set((error as Error).message);
      this.status.set('error');
    }
  }
}
