import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardHeader,
  VoltCardTitle,
  VoltDialogContent,
  VoltDialogDescription,
  VoltDialogOverlay,
  VoltDialogRoot,
  VoltDialogTitle,
  VoltInput,
  VoltNativeButton,
} from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import type { SavedTheme } from '../../lib/theme-library';
import { ThemeStudioStore } from '../../services/theme-studio-store';
import { ThemeStudioProjectImport } from './theme-studio-project-import';

type Pending =
  | { kind: 'open'; theme: SavedTheme }
  | { kind: 'rename'; theme: SavedTheme }
  | { kind: 'delete'; theme: SavedTheme };

/**
 * The themes saved in this browser. Opening one over unsaved work, renaming and deleting all ask
 * first; nothing here talks to a server.
 */
@Component({
  selector: 'app-theme-studio-library',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ThemeStudioProjectImport,
    VoltCard,
    VoltCardContent,
    VoltCardDescription,
    VoltCardHeader,
    VoltCardTitle,
    VoltDialogContent,
    VoltDialogDescription,
    VoltDialogOverlay,
    VoltDialogRoot,
    VoltDialogTitle,
    VoltInput,
    VoltNativeButton,
  ],
  template: `
    <volt-card class="border-border/70 bg-surface/80 shadow-sm backdrop-blur">
      <volt-card-header>
        <volt-card-title>{{ t('themeStudio.library.title') }}</volt-card-title>
        <volt-card-description>{{ t('themeStudio.library.lede') }}</volt-card-description>
      </volt-card-header>
      <volt-card-content class="space-y-4">
        @if (store.libraryStatus() === 'unavailable') {
          <p class="text-sm text-muted-foreground">{{ t('themeStudio.library.unavailable') }}</p>
        } @else if (store.libraryStatus() === 'unsupported') {
          <p class="text-sm text-error">{{ t('themeStudio.notice.unsupportedLibrary') }}</p>
        }

        @if (store.savedThemes().length) {
          <ul
            class="divide-y divide-border rounded-lg border border-border"
            [attr.aria-label]="t('themeStudio.library.listLabel')"
          >
            @for (theme of store.savedThemes(); track theme.id) {
              <li class="flex flex-wrap items-center gap-2 p-3">
                <span class="min-w-0 flex-1 basis-40">
                  <span class="block truncate font-mono text-sm">{{
                    theme.project.draft.name
                  }}</span>
                  <span class="block text-xs text-muted-foreground">
                    {{ theme.project.draft.palette }} · {{ theme.project.draft.style }}
                    @if (theme.id === store.savedId()) {
                      ·
                      <strong class="font-medium text-foreground">{{
                        t('themeStudio.library.current')
                      }}</strong>
                    }
                  </span>
                </span>
                <button
                  voltButton
                  size="sm"
                  variant="outline"
                  [attr.aria-label]="
                    t('themeStudio.library.openNamed', { name: theme.project.draft.name })
                  "
                  (click)="open(theme)"
                >
                  {{ t('themeStudio.library.open') }}
                </button>
                <button
                  voltButton
                  size="sm"
                  variant="ghost"
                  [attr.aria-label]="
                    t('themeStudio.library.duplicateNamed', { name: theme.project.draft.name })
                  "
                  (click)="store.duplicate(theme.id)"
                >
                  {{ t('themeStudio.library.duplicate') }}
                </button>
                <button
                  voltButton
                  size="sm"
                  variant="ghost"
                  [attr.aria-label]="
                    t('themeStudio.library.renameNamed', { name: theme.project.draft.name })
                  "
                  (click)="startRename(theme)"
                >
                  {{ t('themeStudio.library.rename') }}
                </button>
                <button
                  voltButton
                  size="sm"
                  variant="ghost"
                  class="text-error"
                  [attr.aria-label]="
                    t('themeStudio.library.deleteNamed', { name: theme.project.draft.name })
                  "
                  (click)="pending.set({ kind: 'delete', theme })"
                >
                  {{ t('themeStudio.library.delete') }}
                </button>
              </li>
            }
          </ul>
        } @else if (store.libraryStatus() !== 'unavailable') {
          <p class="text-sm text-muted-foreground">{{ t('themeStudio.library.empty') }}</p>
        }

        <app-theme-studio-project-import />
      </volt-card-content>
    </volt-card>

    <ng-template
      voltDialogRoot
      role="alertdialog"
      [open]="dialogOpen()"
      (openChange)="$event || pending.set(null)"
      initialFocus="[data-cancel]"
      let-close="close"
    >
      <div voltDialogOverlay></div>
      @if (pending(); as action) {
        @switch (action.kind) {
          @case ('open') {
            <div voltDialogContent>
              <h2 voltDialogTitle>{{ t('themeStudio.library.discardTitle') }}</h2>
              <p voltDialogDescription>
                {{
                  t('themeStudio.library.discardBody', { name: action.theme.project.draft.name })
                }}
              </p>
              <div class="mt-4 flex flex-wrap justify-end gap-2">
                <button voltButton variant="outline" data-cancel (click)="close()">
                  {{ t('themeStudio.common.cancel') }}
                </button>
                <button
                  voltButton
                  variant="destructive"
                  (click)="store.loadSaved(action.theme.id); close()"
                >
                  {{ t('themeStudio.library.discardConfirm') }}
                </button>
              </div>
            </div>
          }
          @case ('delete') {
            <div voltDialogContent>
              <h2 voltDialogTitle>
                {{
                  t('themeStudio.library.deleteTitle', { name: action.theme.project.draft.name })
                }}
              </h2>
              <p voltDialogDescription>{{ t('themeStudio.library.deleteBody') }}</p>
              <div class="mt-4 flex flex-wrap justify-end gap-2">
                <button voltButton variant="outline" data-cancel (click)="close()">
                  {{ t('themeStudio.common.cancel') }}
                </button>
                <button
                  voltButton
                  variant="destructive"
                  (click)="store.delete(action.theme.id); close()"
                >
                  {{ t('themeStudio.library.delete') }}
                </button>
              </div>
            </div>
          }
          @case ('rename') {
            <form
              voltDialogContent
              (submit)="$event.preventDefault(); rename(action.theme) && close()"
            >
              <h2 voltDialogTitle>{{ t('themeStudio.library.renameTitle') }}</h2>
              <p voltDialogDescription>
                {{ t('themeStudio.library.renameBody', { name: action.theme.project.draft.name }) }}
              </p>
              <label for="rename-theme" class="mt-4 block text-sm font-medium">{{
                t('themeStudio.setup.nameLabel')
              }}</label>
              <volt-input
                class="mt-2"
                [id]="'rename-theme'"
                [ariaLabel]="t('themeStudio.setup.nameLabel')"
                [value]="renameValue()"
                (valueChange)="renameValue.set($event)"
              />
              @if (renameError()) {
                <p class="mt-2 text-xs text-error" role="alert">
                  {{ t('themeStudio.notice.nameTaken') }}
                </p>
              }
              <div class="mt-4 flex flex-wrap justify-end gap-2">
                <button voltButton type="button" variant="outline" data-cancel (click)="close()">
                  {{ t('themeStudio.common.cancel') }}
                </button>
                <button voltButton type="submit" [disabled]="!renameValue().trim()">
                  {{ t('themeStudio.library.rename') }}
                </button>
              </div>
            </form>
          }
        }
      }
    </ng-template>
  `,
})
export class ThemeStudioLibrary {
  protected readonly t = injectAppI18n().t;
  protected readonly store = inject(ThemeStudioStore);

  protected readonly pending = signal<Pending | null>(null);
  protected readonly renameValue = signal('');
  protected readonly renameError = signal(false);

  /** The dialog is open while an action waits for an answer. */
  protected readonly dialogOpen = computed(() => this.pending() !== null);

  protected open(theme: SavedTheme): void {
    if (this.store.dirty()) this.pending.set({ kind: 'open', theme });
    else this.store.loadSaved(theme.id);
  }

  protected startRename(theme: SavedTheme): void {
    this.renameValue.set(theme.project.draft.name);
    this.renameError.set(false);
    this.pending.set({ kind: 'rename', theme });
  }

  protected rename(theme: SavedTheme): boolean {
    const result = this.store.rename(theme.id, this.renameValue());
    this.renameError.set(!result.ok && result.reason === 'name-taken');
    return result.ok;
  }
}
