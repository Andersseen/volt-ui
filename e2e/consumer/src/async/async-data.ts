import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  VoltAlert,
  VoltAlertDescription,
  VoltBreadcrumbItem,
  VoltBreadcrumbLink,
  VoltBreadcrumbList,
  VoltBreadcrumbPage,
  VoltBreadcrumbSeparator,
  VoltBreadcrumbs,
  VoltCombobox,
  VoltError,
  VoltFormField,
  VoltLabel,
  VoltNativeBreadcrumbLink,
  VoltNativeButton,
} from '@voltui/components';

/**
 * Relation picker + router breadcrumbs, the two Angular-integration cases of Volt 1.3.
 *
 * Modelled on a CMS "pick the owner of this record" field, from public Volt APIs only:
 *
 *   type → (queryChange) → app requests → loading → results | none | error → pick → reopen
 *
 * The backend is a deterministic local fake that a test settles by hand through `window.__async`,
 * so "slow", "out of order" and "failing" are states a test can stand in. Nothing here is Volt
 * code: the request, its latest-wins policy and its error handling belong to the application.
 *
 * The same file runs against the npm package (`e2e/consumer`) and, after the CLI's own source
 * transform, against `volt add` output (`e2e/consumer-cli`).
 */

interface Person {
  id: number;
  name: string;
  /** Searchable on the server, deliberately NOT part of the label. */
  alias: string;
}

const PEOPLE: Person[] = [
  { id: 1, name: 'Alice', alias: 'ally' },
  { id: 2, name: 'Bob', alias: 'robert' },
  { id: 3, name: 'Charlie', alias: 'chuck' },
];

interface Controls {
  /** Queries the app asked for, in order. */
  calls: string[];
  /** When true, a request waits for `resolve` / `reject`; otherwise it answers after a tick. */
  manual: boolean;
  resolve(query: string): void;
  reject(query: string): void;
}

declare global {
  interface Window {
    __async: Controls;
  }
}

const pending = new Map<string, { resolve: () => void; reject: () => void }>();

function search(query: string): Promise<Person[]> {
  const controls = window.__async;
  controls.calls.push(query);
  const answer = () => {
    const q = query.trim().toLowerCase();
    return PEOPLE.filter(p => p.name.toLowerCase().includes(q) || p.alias.includes(q));
  };
  if (!controls.manual) {
    return new Promise((resolve, reject) =>
      setTimeout(
        () => (query === 'boom' ? reject(new Error('Directory down')) : resolve(answer())),
        30
      )
    );
  }
  return new Promise((resolve, reject) => {
    pending.set(query, {
      resolve: () => resolve(answer()),
      reject: () => reject(new Error('Directory down')),
    });
  });
}

@Component({
  selector: 'app-async-data',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    VoltAlert,
    VoltAlertDescription,
    VoltBreadcrumbItem,
    VoltBreadcrumbLink,
    VoltBreadcrumbList,
    VoltBreadcrumbPage,
    VoltBreadcrumbSeparator,
    VoltBreadcrumbs,
    VoltCombobox,
    VoltError,
    VoltFormField,
    VoltLabel,
    VoltNativeBreadcrumbLink,
    VoltNativeButton,
  ],
  template: `
    <main class="mx-auto flex max-w-xl flex-col gap-6 p-6">
      <h1 class="text-2xl font-semibold">Project settings</h1>

      <volt-breadcrumbs>
        <volt-breadcrumb-list>
          <volt-breadcrumb-item>
            <a voltBreadcrumbLink href="/plain">Plain</a>
          </volt-breadcrumb-item>
          <volt-breadcrumb-separator />
          <volt-breadcrumb-item>
            <a
              voltBreadcrumbLink
              routerLink="/projects"
              [queryParams]="{ tab: 'owners' }"
              fragment="list"
              routerLinkActive
              ariaCurrentWhenActive="page"
            >
              Projects
            </a>
          </volt-breadcrumb-item>
          <volt-breadcrumb-separator />
          <volt-breadcrumb-item>
            <a
              voltBreadcrumbLink
              [routerLink]="['/projects', 'atlas']"
              routerLinkActive
              ariaCurrentWhenActive="page"
            >
              Atlas
            </a>
          </volt-breadcrumb-item>
          <volt-breadcrumb-separator />
          <volt-breadcrumb-item>
            <volt-breadcrumb-link href="/wrapper">Wrapper</volt-breadcrumb-link>
          </volt-breadcrumb-item>
          <volt-breadcrumb-separator />
          <volt-breadcrumb-item>
            <volt-breadcrumb-page>Settings</volt-breadcrumb-page>
          </volt-breadcrumb-item>
        </volt-breadcrumb-list>
      </volt-breadcrumbs>

      <a voltButton variant="outline" routerLink="/projects/atlas" class="w-fit">Open Atlas</a>

      <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-3" novalidate>
        <volt-form-field>
          <volt-label>Owner</volt-label>
          <volt-combobox
            label="Owner"
            placeholder="Search people…"
            filterMode="manual"
            formControlName="owner"
            [items]="results()"
            [loading]="loading()"
            loadingText="Searching…"
            [emptyText]="emptyText()"
            [itemLabel]="label"
            [compareWith]="sameId"
            [trackByFn]="byId"
            (queryChange)="onQuery($event)"
          >
            <ng-template let-person>{{ person.name }}</ng-template>
          </volt-combobox>
          @if (form.controls.owner.touched && form.controls.owner.invalid) {
            <volt-error>Choose an owner.</volt-error>
          }
        </volt-form-field>

        @if (failed()) {
          <volt-alert variant="destructive" role="alert">
            <volt-alert-description>Search failed: {{ failed() }}</volt-alert-description>
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

        <div class="flex gap-2">
          <button voltButton type="submit">Save</button>
          <button voltButton variant="outline" type="button" (click)="toggleDisabled()">
            Toggle owner field
          </button>
        </div>
      </form>

      <p data-testid="saved">{{ saved() }}</p>
    </main>
  `,
})
export class AsyncDataApp {
  protected readonly form = new FormGroup({
    owner: new FormControl<Person | null>(null, Validators.required),
  });

  protected readonly results = signal<Person[]>([]);
  protected readonly loading = signal(false);
  protected readonly failed = signal('');
  protected readonly saved = signal('');
  private readonly query = signal('');

  protected readonly label = (item: unknown) => (item as Person).name;
  protected readonly sameId = (a: unknown, b: unknown) =>
    (a as Person | null)?.id === (b as Person | null)?.id;
  protected readonly byId = (_i: number, item: unknown) => (item as Person).id;
  protected emptyText = () =>
    this.query().trim() ? `No matches for ${this.query().trim()}` : 'Type to search';

  private latest = 0;

  constructor() {
    const controls: Controls = {
      calls: [],
      manual: new URLSearchParams(location.search).has('manual'),
      resolve: query => pending.get(query)?.resolve(),
      reject: query => pending.get(query)?.reject(),
    };
    window.__async = controls;
  }

  protected onQuery(query: string): void {
    this.query.set(query);
    if (!query.trim()) {
      this.latest++;
      this.results.set([]);
      this.loading.set(false);
      return;
    }
    void this.run(query);
  }

  protected retry(): void {
    void this.run(this.query());
  }

  private async run(query: string): Promise<void> {
    const mine = ++this.latest; // latest wins; this is the application's job, not Volt's
    this.loading.set(true);
    this.failed.set('');
    try {
      const people = await search(query);
      if (mine === this.latest) this.results.set(people);
    } catch (error) {
      if (mine === this.latest) {
        this.results.set([]);
        this.failed.set((error as Error).message);
      }
    } finally {
      if (mine === this.latest) this.loading.set(false);
    }
  }

  protected toggleDisabled(): void {
    const owner = this.form.controls.owner;
    if (owner.disabled) owner.enable();
    else owner.disable();
  }

  protected save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saved.set(`Saved owner ${this.form.controls.owner.value?.name}`);
  }
}
