import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  VoltBadge,
  VoltDialogContent,
  VoltDialogDescription,
  VoltDialogOverlay,
  VoltDialogRoot,
  VoltDialogTitle,
  VoltNativeButton,
} from 'volt';
import { injectAppI18n, type PlainTranslationKey } from '@shared/i18n/i18n';
import { ThemeStudioStore, type StudioNoticeKey } from '../../services/theme-studio-store';

const NOTICES: Record<StudioNoticeKey, PlainTranslationKey> = {
  saved: 'themeStudio.notice.saved',
  loaded: 'themeStudio.notice.loaded',
  duplicated: 'themeStudio.notice.duplicated',
  renamed: 'themeStudio.notice.renamed',
  deleted: 'themeStudio.notice.deleted',
  imported: 'themeStudio.notice.imported',
  recovered: 'themeStudio.notice.recovered',
  nameTaken: 'themeStudio.notice.nameTaken',
  full: 'themeStudio.notice.full',
  quota: 'themeStudio.notice.quota',
  readOnly: 'themeStudio.notice.readOnly',
  unavailable: 'themeStudio.notice.unavailable',
  missing: 'themeStudio.notice.missing',
  corruptBackedUp: 'themeStudio.notice.corruptBackedUp',
  skippedRecords: 'themeStudio.notice.skippedRecords',
  unsupportedLibrary: 'themeStudio.notice.unsupportedLibrary',
};

/** The draft's lifecycle: undo/redo, its saved state, save and reset, and what just happened. */
@Component({
  selector: 'app-theme-studio-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltBadge,
    VoltDialogContent,
    VoltDialogDescription,
    VoltDialogOverlay,
    VoltDialogRoot,
    VoltDialogTitle,
    VoltNativeButton,
  ],
  template: `
    <div
      role="toolbar"
      [attr.aria-label]="t('themeStudio.toolbar.label')"
      class="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-surface/80 p-2 shadow-sm backdrop-blur"
    >
      <button
        voltButton
        size="sm"
        variant="ghost"
        [disabled]="!store.canUndo()"
        (click)="store.undo()"
      >
        {{ t('themeStudio.toolbar.undo') }}
      </button>
      <button
        voltButton
        size="sm"
        variant="ghost"
        [disabled]="!store.canRedo()"
        (click)="store.redo()"
      >
        {{ t('themeStudio.toolbar.redo') }}
      </button>
      <span class="mx-1 h-5 w-px bg-border" aria-hidden="true"></span>
      <button voltButton size="sm" (click)="save()">
        {{ store.savedId() ? t('themeStudio.toolbar.save') : t('themeStudio.toolbar.saveNew') }}
      </button>
      @if (store.savedId()) {
        <button voltButton size="sm" variant="outline" (click)="save(true)">
          {{ t('themeStudio.toolbar.saveCopy') }}
        </button>
      }
      <button voltButton size="sm" variant="ghost" (click)="confirmReset.set(true)">
        {{ t('themeStudio.toolbar.reset') }}
      </button>
      <volt-badge
        class="ml-auto"
        [variant]="store.dirty() ? 'secondary' : 'outline'"
        data-testid="draft-state"
      >
        {{ store.dirty() ? t('themeStudio.toolbar.unsaved') : t('themeStudio.toolbar.allSaved') }}
      </volt-badge>
    </div>

    <!-- Polite for progress, assertive for what went wrong; each notice is announced once. -->
    <p class="sr-only" role="status">{{ politeNotice() }}</p>
    <p class="sr-only" role="alert">{{ errorNotice() }}</p>
    @if (store.notice(); as notice) {
      <p
        class="mt-2 text-xs"
        [class.text-error]="notice.tone === 'error'"
        [class.text-muted-foreground]="notice.tone !== 'error'"
        aria-hidden="true"
      >
        {{ t(noticeKey(notice.key)) }}
      </p>
    }

    <ng-template
      voltDialogRoot
      role="alertdialog"
      [(open)]="confirmReset"
      initialFocus="[data-cancel]"
      let-close="close"
    >
      <div voltDialogOverlay></div>
      <div voltDialogContent>
        <h2 voltDialogTitle>{{ t('themeStudio.toolbar.resetTitle') }}</h2>
        <p voltDialogDescription>
          {{ t('themeStudio.toolbar.resetBody', { palette: store.theme().palette }) }}
        </p>
        <div class="mt-4 flex flex-wrap justify-end gap-2">
          <button voltButton variant="outline" data-cancel (click)="close()">
            {{ t('themeStudio.common.cancel') }}
          </button>
          <button voltButton variant="destructive" (click)="store.resetDraft(); close()">
            {{ t('themeStudio.toolbar.resetConfirm') }}
          </button>
        </div>
      </div>
    </ng-template>

    <ng-template
      voltDialogRoot
      role="alertdialog"
      [(open)]="confirmReplace"
      initialFocus="[data-cancel]"
      let-close="close"
    >
      <div voltDialogOverlay></div>
      <div voltDialogContent>
        <h2 voltDialogTitle>{{ t('themeStudio.toolbar.replaceTitle') }}</h2>
        <p voltDialogDescription>
          {{ t('themeStudio.toolbar.replaceBody', { name: store.normalizedName() }) }}
        </p>
        <div class="mt-4 flex flex-wrap justify-end gap-2">
          <button voltButton variant="outline" data-cancel (click)="close()">
            {{ t('themeStudio.common.cancel') }}
          </button>
          <button voltButton variant="destructive" (click)="replace(); close()">
            {{ t('themeStudio.toolbar.replaceConfirm') }}
          </button>
        </div>
      </div>
    </ng-template>
  `,
})
export class ThemeStudioToolbar {
  protected readonly t = injectAppI18n().t;
  protected readonly store = inject(ThemeStudioStore);

  protected readonly confirmReset = signal(false);
  protected readonly confirmReplace = signal(false);
  private pendingAsNew = false;

  protected readonly politeNotice = computed(() => {
    const notice = this.store.notice();
    return notice && notice.tone !== 'error' ? this.t(NOTICES[notice.key]) : '';
  });
  protected readonly errorNotice = computed(() => {
    const notice = this.store.notice();
    return notice?.tone === 'error' ? this.t(NOTICES[notice.key]) : '';
  });

  protected noticeKey(key: StudioNoticeKey): PlainTranslationKey {
    return NOTICES[key];
  }

  /** Saves; a name another saved theme already has asks before writing over it. */
  protected save(asNew = false): void {
    const result = this.store.save({ asNew });
    if (!result.ok && result.reason === 'name-taken') {
      this.pendingAsNew = asNew;
      this.confirmReplace.set(true);
    }
  }

  protected replace(): void {
    this.store.save({ asNew: this.pendingAsNew, replace: true });
  }
}
