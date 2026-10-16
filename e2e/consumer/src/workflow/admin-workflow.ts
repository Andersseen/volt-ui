import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  VoltAlert,
  VoltAlertDescription,
  VoltAlertTitle,
  VoltBadge,
  VoltDialogContent,
  VoltDialogDescription,
  VoltDialogOverlay,
  VoltDialogRoot,
  VoltDialogTitle,
  VoltEmptyState,
  VoltEmptyStateDescription,
  VoltEmptyStateTitle,
  VoltError,
  VoltFormField,
  VoltInput,
  VoltLabel,
  VoltNativeButton,
  VoltPagination,
  VoltPaginationButton,
  VoltPaginationNext,
  VoltPaginationPrevious,
  VoltSidebar,
  VoltSidebarContent,
  VoltSidebarGroup,
  VoltSidebarHeader,
  VoltSidebarItem,
  VoltSpinner,
  VoltTable,
  VoltTableBody,
  VoltTableCell,
  VoltTableHead,
  VoltTableHeader,
  VoltTableRow,
  VoltToastService,
} from '@voltui/components';

/**
 * Application-workflow benchmark.
 *
 * A small administration screen built the way an ordinary Angular app would build it, from public
 * Volt APIs only — no `Ngp*` types, no private paths, no overlay or focus code of its own:
 *
 *   shell → page header → list (loading / error / empty / no results / data)
 *   → sort → filter → pagination → edit dialog (server validation, retry)
 *   → discard confirmation nested over the editor → delete confirmation with a pending state
 *
 * Every async operation is a deterministic local fake that the test settles by hand through
 * `window.__workflow`, so "pending" is a state a test can stand in. There is no backend and no
 * domain model beyond what the screen needs.
 *
 * The same file runs against the npm package (`e2e/consumer`) and, after the CLI's own source
 * transform, against `volt add` output (`e2e/consumer-cli`).
 */

interface Project {
  id: string;
  name: string;
  owner: string;
  status: 'active' | 'archived';
}

type SortKey = 'name' | 'status';
type LoadState = 'loading' | 'error' | 'ready';

const SEED: Project[] = [
  { id: 'atlas', name: 'Atlas', owner: 'Marta', status: 'active' },
  { id: 'borealis', name: 'Borealis', owner: 'Dan', status: 'archived' },
  { id: 'cinder', name: 'Cinder', owner: 'Priya', status: 'active' },
  { id: 'delta', name: 'Delta', owner: 'Tomás', status: 'active' },
  { id: 'ember', name: 'Ember', owner: 'Marta', status: 'archived' },
  { id: 'fjord', name: 'Fjord', owner: 'Dan', status: 'active' },
  { id: 'locked', name: 'Locked', owner: 'Root', status: 'active' },
];
const PAGE_SIZE = 3;

/** The one object a test uses to drive time: hold an operation open, fail it, release it. */
interface Controls {
  /** While true, every request waits for `release()`. */
  hold: boolean;
  release(): void;
  /** The next list request fails once. */
  failNextList: boolean;
  /** The next delete fails once. */
  failNextDelete: boolean;
  /** Start from an empty dataset. */
  empty: boolean;
  calls: { list: number; save: number; remove: number };
}

declare global {
  interface Window {
    __workflow: Controls;
  }
}

class FakeApi {
  private rows = structuredClone(SEED);
  private waiters: (() => void)[] = [];

  readonly controls: Controls = {
    hold: false,
    release: () => {
      this.controls.hold = false;
      this.waiters.splice(0).forEach(resolve => resolve());
    },
    failNextList: false,
    failNextDelete: false,
    empty: false,
    calls: { list: 0, save: 0, remove: 0 },
  };

  constructor() {
    window.__workflow = this.controls;
    // Start states a test cannot reach from inside the page: ?empty, ?failList, ?hold.
    const params = new URLSearchParams(location.search);
    this.controls.empty = params.has('empty');
    this.controls.failNextList = params.has('failList');
    this.controls.hold = params.has('hold');
  }

  private settle(): Promise<void> {
    if (this.controls.hold) {
      return new Promise(resolve => this.waiters.push(resolve));
    }
    return new Promise(resolve => setTimeout(resolve, 20));
  }

  async list(query: string, sort: SortKey, dir: 'asc' | 'desc', page: number) {
    this.controls.calls.list++;
    await this.settle();
    if (this.controls.failNextList) {
      this.controls.failNextList = false;
      throw new Error('Could not load projects (503)');
    }
    const q = query.trim().toLowerCase();
    const all = this.controls.empty ? [] : this.rows;
    const filtered = all.filter(r => !q || r.name.toLowerCase().includes(q));
    const sorted = [...filtered].sort(
      (a, b) => a[sort].localeCompare(b[sort]) * (dir === 'asc' ? 1 : -1)
    );
    return {
      rows: sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
      total: sorted.length,
      datasetEmpty: all.length === 0,
    };
  }

  async save(id: string, value: { name: string; owner: string }): Promise<void> {
    this.controls.calls.save++;
    await this.settle();
    if (value.name.trim().toLowerCase() === 'taken') {
      throw new ServerValidation('name', 'That name is already in use.');
    }
    this.rows = this.rows.map(r => (r.id === id ? { ...r, ...value } : r));
  }

  async remove(id: string): Promise<void> {
    this.controls.calls.remove++;
    await this.settle();
    if (this.controls.failNextDelete) {
      this.controls.failNextDelete = false;
      throw new Error('Delete failed. Try again.');
    }
    this.rows = this.rows.filter(r => r.id !== id);
  }
}

class ServerValidation extends Error {
  constructor(
    readonly field: 'name' | 'owner',
    message: string
  ) {
    super(message);
  }
}

@Component({
  selector: 'app-admin-workflow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    VoltAlert,
    VoltAlertDescription,
    VoltAlertTitle,
    VoltBadge,
    VoltDialogContent,
    VoltDialogDescription,
    VoltDialogOverlay,
    VoltDialogRoot,
    VoltDialogTitle,
    VoltEmptyState,
    VoltEmptyStateDescription,
    VoltEmptyStateTitle,
    VoltError,
    VoltFormField,
    VoltInput,
    VoltLabel,
    VoltNativeButton,
    VoltPagination,
    VoltPaginationButton,
    VoltPaginationNext,
    VoltPaginationPrevious,
    VoltSidebar,
    VoltSidebarContent,
    VoltSidebarGroup,
    VoltSidebarHeader,
    VoltSidebarItem,
    VoltSpinner,
    VoltTable,
    VoltTableBody,
    VoltTableCell,
    VoltTableHead,
    VoltTableHeader,
    VoltTableRow,
  ],
  template: `
    <div class="flex min-h-screen">
      <volt-sidebar>
        <volt-sidebar-header>Console</volt-sidebar-header>
        <volt-sidebar-content>
          <volt-sidebar-group label="Workspace">
            <volt-sidebar-item routerLink="/projects" label="Projects" />
            <volt-sidebar-item routerLink="/members" label="Members" />
          </volt-sidebar-group>
        </volt-sidebar-content>
      </volt-sidebar>

      <main class="min-w-0 flex-1 space-y-6 p-6">
        <header class="flex flex-wrap items-center justify-between gap-3">
          <h1 #heading tabindex="-1" class="text-2xl font-semibold outline-none">Projects</h1>
          <div class="flex gap-2">
            <a voltButton variant="outline" href="#help">Help</a>
            <button voltButton type="button" (click)="reload()">Reload</button>
          </div>
        </header>

        <div class="flex flex-wrap items-center gap-3">
          <volt-input
            class="w-64"
            aria-label="Filter projects"
            placeholder="Filter by name"
            [value]="query()"
            (input)="setQuery($any($event.target).value)"
          />
          @if (state() === 'loading') {
            <span
              class="inline-flex items-center gap-2 text-sm text-muted-foreground"
              role="status"
            >
              <volt-spinner size="sm" />
              Loading projects…
            </span>
          }
        </div>

        @if (state() === 'error') {
          <volt-alert variant="destructive" role="alert">
            <volt-alert-title>Projects failed to load</volt-alert-title>
            <volt-alert-description>{{ loadError() }}</volt-alert-description>
            <button slot="action" voltButton variant="outline" size="sm" (click)="reload()">
              Retry
            </button>
          </volt-alert>
        }

        @if (state() === 'ready' && total() === 0) {
          @if (datasetEmpty()) {
            <volt-empty-state>
              <volt-empty-state-title>No projects yet</volt-empty-state-title>
              <volt-empty-state-description
                >Create your first project.</volt-empty-state-description
              >
              <div slot="actions"><button voltButton type="button">Create project</button></div>
            </volt-empty-state>
          } @else {
            <volt-empty-state>
              <volt-empty-state-title>No matches for "{{ query() }}"</volt-empty-state-title>
              <div slot="actions">
                <button voltButton variant="outline" type="button" (click)="setQuery('')">
                  Clear filter
                </button>
              </div>
            </volt-empty-state>
          }
        }

        @if (rows().length) {
          <div
            class="overflow-x-auto rounded-lg border border-border"
            [attr.aria-busy]="state() === 'loading'"
          >
            <volt-table>
              <volt-table-header>
                <volt-table-row>
                  <volt-table-head [attr.aria-sort]="ariaSort('name')">
                    <button
                      voltButton
                      variant="ghost"
                      size="sm"
                      type="button"
                      (click)="sortBy('name')"
                    >
                      Name
                    </button>
                  </volt-table-head>
                  <volt-table-head>Owner</volt-table-head>
                  <volt-table-head [attr.aria-sort]="ariaSort('status')">
                    <button
                      voltButton
                      variant="ghost"
                      size="sm"
                      type="button"
                      (click)="sortBy('status')"
                    >
                      Status
                    </button>
                  </volt-table-head>
                  <volt-table-head class="text-right">Actions</volt-table-head>
                </volt-table-row>
              </volt-table-header>
              <volt-table-body>
                @for (row of rows(); track row.id) {
                  <volt-table-row>
                    <volt-table-cell class="font-medium">{{ row.name }}</volt-table-cell>
                    <volt-table-cell>{{ row.owner }}</volt-table-cell>
                    <volt-table-cell>
                      <volt-badge [variant]="row.status === 'active' ? 'success' : 'secondary'">
                        {{ row.status }}
                      </volt-badge>
                    </volt-table-cell>
                    <volt-table-cell class="text-right">
                      <button
                        voltButton
                        variant="outline"
                        size="sm"
                        type="button"
                        [attr.aria-label]="'Edit ' + row.name"
                        (click)="edit(row, $event)"
                      >
                        Edit
                      </button>
                      <!-- Focusable but blocked, with the reason attached. Volt only dims it. -->
                      <button
                        voltButton
                        variant="destructive"
                        size="sm"
                        type="button"
                        [attr.aria-label]="'Delete ' + row.name"
                        [attr.aria-disabled]="row.id === 'locked' ? 'true' : null"
                        [attr.aria-describedby]="row.id === 'locked' ? 'locked-reason' : null"
                        (click)="askDelete(row, $event)"
                      >
                        Delete
                      </button>
                    </volt-table-cell>
                  </volt-table-row>
                }
              </volt-table-body>
            </volt-table>
          </div>
          <p id="locked-reason" class="text-xs text-muted-foreground">
            The root project cannot be deleted.
          </p>

          <volt-pagination [page]="page()" (pageChange)="goTo($event)" [pageCount]="pageCount()">
            <volt-pagination-previous />
            @for (n of pages(); track n) {
              <volt-pagination-button [page]="n" />
            }
            <volt-pagination-next />
          </volt-pagination>
        }
      </main>
    </div>

    <!-- Editor -->
    <ng-template
      voltDialogRoot
      [(open)]="editorOpen"
      [dismissible]="!saving()"
      initialFocus="input"
      let-close="close"
    >
      <div voltDialogOverlay></div>
      <form voltDialogContent [formGroup]="form" (ngSubmit)="save(close)" class="space-y-4">
        <h2 voltDialogTitle>Edit {{ editing()?.name }}</h2>
        <p voltDialogDescription>Changes apply to the whole workspace.</p>

        @if (saveError()) {
          <volt-alert variant="destructive" role="alert">
            <volt-alert-description>{{ saveError() }}</volt-alert-description>
          </volt-alert>
        }

        <volt-form-field>
          <volt-label>Name</volt-label>
          <volt-input formControlName="name" />
          @if (form.controls.name.touched && form.controls.name.errors; as errors) {
            <volt-error>{{ errors['server'] ?? 'Name is required.' }}</volt-error>
          }
        </volt-form-field>
        <volt-form-field>
          <volt-label>Owner</volt-label>
          <volt-input formControlName="owner" />
        </volt-form-field>

        <div class="flex justify-end gap-2">
          <button
            voltButton
            variant="outline"
            type="button"
            [disabled]="saving()"
            (click)="closeEditor(close)"
          >
            Close
          </button>
          <button voltButton type="submit" [disabled]="saving()">
            @if (saving()) {
              <volt-spinner size="sm" />
              Saving…
            } @else {
              Save
            }
          </button>
        </div>
      </form>
    </ng-template>

    <!-- Discard confirmation, nested over the editor -->
    <ng-template
      voltDialogRoot
      role="alertdialog"
      [(open)]="discardOpen"
      initialFocus="[data-keep]"
      let-close="close"
    >
      <div voltDialogOverlay></div>
      <div voltDialogContent>
        <h2 voltDialogTitle>Discard changes?</h2>
        <p voltDialogDescription>Your edits to this project will be lost.</p>
        <div class="mt-4 flex justify-end gap-2">
          <button voltButton data-keep variant="outline" type="button" (click)="close()">
            Keep editing
          </button>
          <button voltButton variant="destructive" type="button" (click)="discard(close)">
            Discard
          </button>
        </div>
      </div>
    </ng-template>

    <!-- Delete confirmation -->
    <ng-template
      voltDialogRoot
      role="alertdialog"
      [(open)]="deleteOpen"
      [dismissible]="!deleting()"
      initialFocus="[data-cancel]"
      let-close="close"
    >
      <div voltDialogOverlay></div>
      <div voltDialogContent>
        <h2 voltDialogTitle>Delete {{ pendingDelete()?.name }}?</h2>
        <p voltDialogDescription>This cannot be undone.</p>
        @if (deleteError()) {
          <volt-alert variant="destructive" role="alert" class="mt-3">
            <volt-alert-description>{{ deleteError() }}</volt-alert-description>
          </volt-alert>
        }
        <div class="mt-4 flex justify-end gap-2">
          <button
            voltButton
            data-cancel
            variant="outline"
            type="button"
            [disabled]="deleting()"
            (click)="close()"
          >
            Cancel
          </button>
          <button
            voltButton
            variant="destructive"
            type="button"
            [disabled]="deleting()"
            (click)="confirmDelete(close)"
          >
            @if (deleting()) {
              <volt-spinner size="sm" />
              Deleting…
            } @else {
              Delete
            }
          </button>
        </div>
      </div>
    </ng-template>
  `,
})
export class AdminWorkflow {
  private readonly api = new FakeApi();
  private readonly toast = inject(VoltToastService);

  // --- list ---------------------------------------------------------------------------------
  protected readonly state = signal<LoadState>('loading');
  protected readonly rows = signal<Project[]>([]);
  protected readonly total = signal(0);
  protected readonly datasetEmpty = signal(false);
  protected readonly loadError = signal('');
  protected readonly query = signal('');
  protected readonly page = signal(1);
  protected readonly sort = signal<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'name',
    dir: 'asc',
  });
  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));
  protected readonly pages = computed(() =>
    Array.from({ length: this.pageCount() }, (_, i) => i + 1)
  );

  /** Stale-response guard: only the latest request may write state. */
  private requestId = 0;

  // --- editor -------------------------------------------------------------------------------
  protected readonly editorOpen = signal(false);
  protected readonly editing = signal<Project | null>(null);
  protected readonly saving = signal(false);
  protected readonly saveError = signal('');
  protected readonly discardOpen = signal(false);
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    owner: new FormControl('', { nonNullable: true }),
  });

  // --- delete -------------------------------------------------------------------------------
  protected readonly deleteOpen = signal(false);
  protected readonly pendingDelete = signal<Project | null>(null);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal('');

  constructor() {
    void this.load();
  }

  protected reload(): void {
    void this.load();
  }

  protected setQuery(value: string): void {
    this.query.set(value);
    this.page.set(1);
    void this.load();
  }

  protected sortBy(key: SortKey): void {
    const current = this.sort();
    this.sort.set({ key, dir: current.key === key && current.dir === 'asc' ? 'desc' : 'asc' });
    void this.load();
  }

  protected ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
    const { key: active, dir } = this.sort();
    return active === key ? (dir === 'asc' ? 'ascending' : 'descending') : 'none';
  }

  protected goTo(page: number): void {
    this.page.set(page);
    void this.load();
  }

  private async load(): Promise<void> {
    const id = ++this.requestId;
    this.state.set('loading');
    try {
      const { key, dir } = this.sort();
      const result = await this.api.list(this.query(), key, dir, this.page());
      if (id !== this.requestId) return;
      this.rows.set(result.rows);
      this.total.set(result.total);
      this.datasetEmpty.set(result.datasetEmpty);
      this.state.set('ready');
    } catch (error) {
      if (id !== this.requestId) return;
      this.loadError.set((error as Error).message);
      this.state.set('error');
    }
  }

  // --- editor -------------------------------------------------------------------------------
  protected edit(project: Project, _event: Event): void {
    this.editing.set(project);
    this.saveError.set('');
    this.form.reset({ name: project.name, owner: project.owner });
    this.editorOpen.set(true);
  }

  protected async save(close: (result?: unknown) => void): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;

    this.saving.set(true);
    this.saveError.set('');
    try {
      await this.api.save(this.editing()!.id, this.form.getRawValue());
      this.saving.set(false);
      this.form.markAsPristine();
      close('saved');
      this.toast.success('Project saved');
      void this.load();
    } catch (error) {
      this.saving.set(false);
      if (error instanceof ServerValidation) {
        this.form.controls[error.field].setErrors({ server: error.message });
        this.form.controls[error.field].markAsTouched();
      }
      this.saveError.set('Could not save the project.');
    }
  }

  protected closeEditor(close: (result?: unknown) => void): void {
    if (this.form.dirty) {
      this.discardOpen.set(true);
    } else {
      close();
    }
  }

  protected discard(closeConfirm: (result?: unknown) => void): void {
    closeConfirm();
    this.editorOpen.set(false);
  }

  // --- delete -------------------------------------------------------------------------------
  protected askDelete(project: Project, _event: Event): void {
    // aria-disabled does not stop the click. The handler decides.
    if (project.id === 'locked') return;
    this.pendingDelete.set(project);
    this.deleteError.set('');
    this.deleteOpen.set(true);
  }

  protected async confirmDelete(close: (result?: unknown) => void): Promise<void> {
    if (this.deleting()) return;
    this.deleting.set(true);
    this.deleteError.set('');
    try {
      await this.api.remove(this.pendingDelete()!.id);
      this.deleting.set(false);
      close('deleted');
      this.toast.success('Project deleted');
      await this.load();
      // The row that held focus is gone; put focus somewhere meaningful, not on <body>.
      // Wait for the dialog to leave the DOM: its own focus restore (to the row that no longer
      // exists) runs on close and would otherwise take the focus straight back.
      const focusHeading = (): void => {
        if (document.querySelector('[role="alertdialog"]')) {
          requestAnimationFrame(focusHeading);
          return;
        }
        requestAnimationFrame(() => document.querySelector<HTMLElement>('main h1')?.focus());
      };
      focusHeading();
    } catch (error) {
      this.deleting.set(false);
      this.deleteError.set((error as Error).message);
    }
  }
}
