import { Component, inject, signal, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  VoltAlert,
  VoltAlertDescription,
  VoltAlertTitle,
  VoltBadge,
  VoltButton,
  VoltCard,
  VoltCardContent,
  VoltCardFooter,
  VoltDialog,
  VoltDialogContent,
  VoltDialogDescription,
  VoltDialogOverlay,
  VoltDialogRoot,
  VoltDialogService,
  VoltDialogTitle,
  VoltDrawer,
  VoltDrawerContent,
  VoltDrawerOverlay,
  VoltDrawerTitle,
  VoltError,
  VoltFormField,
  VoltHint,
  VoltInput,
  VoltLabel,
  VoltNativeButton,
  VoltNativeSelect,
  VoltSpinner,
  VoltTextarea,
  VoltToastService,
  type VoltDialogContext,
} from '@voltui/components';

/**
 * Real-world consumer patterns from the 1.1 audit (DevFlare, ForgeCMS, Wisp, …), modelled
 * without importing those apps. e2e/consumer.spec.ts asserts them in a real browser.
 */
@Component({
  selector: 'app-regressions',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    VoltAlert,
    VoltAlertDescription,
    VoltAlertTitle,
    VoltBadge,
    VoltButton,
    VoltCard,
    VoltCardContent,
    VoltCardFooter,
    VoltDialog,
    VoltDialogContent,
    VoltDialogDescription,
    VoltDialogOverlay,
    VoltDialogRoot,
    VoltDialogTitle,
    VoltDrawer,
    VoltDrawerContent,
    VoltDrawerOverlay,
    VoltDrawerTitle,
    VoltError,
    VoltFormField,
    VoltHint,
    VoltInput,
    VoltLabel,
    VoltNativeButton,
    VoltNativeSelect,
    VoltSpinner,
    VoltTextarea,
  ],
  template: `
    <section aria-label="button regressions" class="flex flex-wrap items-center gap-3">
      <a voltButton variant="outline" routerLink="/docs" data-testid="router-link-button">Docs</a>
      <a
        voltButton
        variant="ghost"
        href="https://github.com/Andersseen/volt-ui"
        target="_blank"
        rel="noopener"
        data-testid="href-button"
        >GitHub</a
      >
      <button
        voltButton
        size="icon"
        type="button"
        aria-label="Switch theme"
        data-testid="icon-native"
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" />
        </svg>
      </button>
      <volt-button size="icon" aria-label="Open settings" data-testid="icon-wrapper">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" />
        </svg>
      </volt-button>
      <volt-button
        variant="outline"
        [aria-expanded]="panelOpen()"
        aria-controls="settings-panel"
        (click)="panelOpen.set(!panelOpen())"
        data-testid="expand-wrapper"
        >Settings</volt-button
      >
      <div id="settings-panel" [hidden]="!panelOpen()">Panel</div>
      <button voltButton type="button" data-testid="icons-native">
        <svg data-testid="lead-icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24">
          <path d="M4 12h16" />
        </svg>
        Continue
        <svg data-testid="trail-icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>
      <button voltButton type="button" disabled data-testid="disabled-native">Disabled</button>
    </section>

    <section aria-label="styling regressions" class="grid gap-4">
      <div class="flex items-center gap-2">
        <volt-input
          class="w-24 px-2.5 py-1.5"
          size="sm"
          aria-label="Quantity"
          data-testid="compact-input"
        />
        <volt-input aria-label="Default width" data-testid="default-input" />
      </div>

      <volt-card data-testid="custom-card">
        <volt-card-content class="py-12 text-center" data-testid="custom-card-content"
          >Empty state</volt-card-content
        >
        <volt-card-footer
          class="justify-end gap-2 border-t border-border p-3"
          data-testid="custom-card-footer"
        >
          <button voltButton size="sm" variant="ghost" type="button">Cancel</button>
          <button voltButton size="sm" type="button">Save</button>
        </volt-card-footer>
      </volt-card>

      <volt-form-field>
        <volt-label class="text-xs uppercase tracking-wide" data-testid="styled-label"
          >Handle</volt-label
        >
        <volt-input />
        <volt-hint class="text-xs italic" data-testid="styled-hint"
          >Shown on your profile.</volt-hint
        >
        <volt-error class="text-xs" data-testid="styled-error">Taken.</volt-error>
      </volt-form-field>

      <div class="flex gap-3">
        <button
          type="button"
          voltButton
          variant="outline"
          [voltDialog]="wideDialogTpl"
          data-testid="wide-dialog-trigger"
        >
          Wide dialog
        </button>
        <button
          type="button"
          voltButton
          variant="outline"
          [voltDrawer]="sizedDrawerTpl"
          data-testid="sized-drawer-trigger"
        >
          Sized drawer
        </button>
      </div>
      <ng-template #wideDialogTpl let-close="close">
        <div voltDialogOverlay></div>
        <div voltDialogContent class="max-w-2xl" data-testid="wide-dialog-content">
          <h2 voltDialogTitle>Wide dialog</h2>
          <button voltButton type="button" (click)="close()">Close</button>
        </div>
      </ng-template>
      <ng-template #sizedDrawerTpl let-close="close">
        <div voltDrawerOverlay></div>
        <div voltDrawerContent class="w-[420px] p-6" data-testid="sized-drawer-content">
          <h2 voltDrawerTitle>Sized drawer</h2>
          <button voltButton type="button" (click)="close()">Close</button>
        </div>
      </ng-template>
    </section>

    <section aria-label="form regressions">
      <form
        [formGroup]="settings"
        (ngSubmit)="submit()"
        class="grid gap-4"
        data-testid="settings-form"
      >
        <volt-form-field>
          <volt-label>Workspace name</volt-label>
          <volt-input formControlName="name" />
          <volt-hint>Visible to your team.</volt-hint>
          @if (settings.controls.name.touched && settings.controls.name.invalid) {
            <volt-error>Workspace name is required.</volt-error>
          }
        </volt-form-field>
        <volt-form-field>
          <volt-label>Description</volt-label>
          <volt-textarea formControlName="description" />
        </volt-form-field>
        <volt-form-field>
          <volt-label>Region</volt-label>
          <select
            voltNativeSelect
            formControlName="region"
            class="h-8 text-xs"
            data-testid="region-select"
          >
            <option value="eu">Europe</option>
            <option value="us">United States</option>
          </select>
        </volt-form-field>
        <volt-form-field>
          <volt-label>Plan</volt-label>
          <volt-input formControlName="plan" data-testid="disabled-input" />
        </volt-form-field>
        <button voltButton type="submit" data-testid="settings-submit">Save settings</button>
        <output data-testid="settings-value">{{ saved() }}</output>
      </form>
    </section>

    <section aria-label="feedback regressions" class="grid gap-3">
      <div class="flex gap-2">
        <volt-badge variant="success" data-testid="badge-success">Connected</volt-badge>
        <volt-badge variant="warning" data-testid="badge-warning">Needs attention</volt-badge>
        <volt-badge variant="info" data-testid="badge-info">Beta</volt-badge>
      </div>
      <volt-alert variant="warning" data-testid="static-alert">
        <svg slot="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 9v4" /></svg>
        <volt-alert-title>Connection needs attention</volt-alert-title>
        <volt-alert-description>Reconnect your Cloudflare account.</volt-alert-description>
      </volt-alert>
      <volt-alert variant="destructive" role="alert" data-testid="live-alert">
        <volt-alert-title>{{ alertMessage() }}</volt-alert-title>
      </volt-alert>
      <button
        voltButton
        type="button"
        (click)="alertMessage.set('Payment failed')"
        data-testid="alert-trigger"
      >
        Pay
      </button>
      <div class="flex items-center gap-3">
        <volt-spinner size="sm" data-testid="decorative-spinner" />
        <volt-spinner label="Loading projects" data-testid="status-spinner" />
      </div>
      <div class="flex gap-2">
        <button
          voltButton
          type="button"
          (click)="toastSuccess()"
          data-testid="service-toast-success"
        >
          Toast success
        </button>
        <button voltButton type="button" (click)="toastError()" data-testid="service-toast-error">
          Toast error
        </button>
      </div>
    </section>

    <section aria-label="dialog regressions" class="flex flex-wrap gap-3">
      <button
        voltButton
        type="button"
        (click)="editing.set(true)"
        data-testid="controlled-dialog-trigger"
      >
        Edit workspace
      </button>
      <span data-testid="controlled-open">{{ editing() }}</span>
      <ng-template
        voltDialogRoot
        [(open)]="editing"
        (closed)="lastResult.set('' + $event)"
        let-close="close"
      >
        <div voltDialogOverlay></div>
        <form
          voltDialogContent
          data-testid="form-dialog"
          (submit)="$event.preventDefault(); close(renameControl.value)"
        >
          <h2 voltDialogTitle>Rename workspace</h2>
          <p voltDialogDescription>The new name is visible to your team.</p>
          <volt-form-field class="py-3">
            <volt-label>New name</volt-label>
            <volt-input [formControl]="renameControl" data-testid="rename-input" />
          </volt-form-field>
          <button
            voltButton
            type="button"
            variant="outline"
            (click)="close()"
            data-testid="form-dialog-cancel"
          >
            Cancel
          </button>
          <button voltButton type="submit" data-testid="form-dialog-save">Save</button>
        </form>
      </ng-template>

      <button
        voltButton
        variant="destructive"
        type="button"
        (click)="confirmDelete()"
        data-testid="confirm-trigger"
      >
        Delete workspace
      </button>
      <ng-template #confirmTpl let-close="close">
        <div voltDialogOverlay></div>
        <div voltDialogContent data-testid="confirm-dialog">
          <h2 voltDialogTitle>Delete workspace?</h2>
          <p voltDialogDescription>This cannot be undone.</p>
          <button
            voltButton
            variant="outline"
            type="button"
            (click)="close(false)"
            data-testid="confirm-cancel"
          >
            Cancel
          </button>
          <button
            voltButton
            variant="destructive"
            type="button"
            (click)="close(true)"
            data-testid="confirm-accept"
          >
            Delete
          </button>
        </div>
      </ng-template>
      <span data-testid="dialog-result">{{ lastResult() }}</span>
    </section>
  `,
})
export class RegressionFixtures {
  private readonly toast = inject(VoltToastService);
  private readonly dialog = inject(VoltDialogService);
  // Decorator query: this fixture compiles in JIT mode, like main.ts.
  @ViewChild('confirmTpl', { read: TemplateRef })
  private confirmTpl?: TemplateRef<VoltDialogContext<boolean>>;

  readonly panelOpen = signal(false);
  readonly alertMessage = signal('');
  readonly editing = signal(false);
  readonly lastResult = signal('');
  readonly saved = signal('');
  readonly renameControl = new FormControl('Acme', { nonNullable: true });

  readonly settings = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    description: new FormControl('', { nonNullable: true }),
    region: new FormControl('eu', { nonNullable: true }),
    plan: new FormControl({ value: 'Pro', disabled: true }, { nonNullable: true }),
  });

  submit(): void {
    this.settings.markAllAsTouched();
    if (this.settings.valid) {
      this.saved.set(JSON.stringify(this.settings.getRawValue()));
    }
  }

  toastSuccess(): void {
    this.toast.success('Copied to clipboard', { duration: 60_000 });
  }

  toastError(): void {
    this.toast.error('Could not save', { description: 'Try again.', duration: 60_000 });
  }

  async confirmDelete(): Promise<void> {
    if (!this.confirmTpl) return;
    const confirmed = await this.dialog.open<boolean>(this.confirmTpl, { role: 'alertdialog' })
      .closed;
    this.lastResult.set(`confirm:${confirmed}`);
  }
}
