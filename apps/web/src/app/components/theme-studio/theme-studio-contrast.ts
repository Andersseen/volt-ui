import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  VoltBadge,
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardHeader,
  VoltCardTitle,
  VoltNativeButton,
  VoltSwitch,
} from 'volt';
import { injectAppI18n, type PlainTranslationKey } from '@shared/i18n/i18n';
import { DERIVED, type ContrastResult } from '../../lib/theme-contrast';
import { CONTRAST_ROLE_KEYS } from '../../lib/theme-contrast-roles';
import { ThemeStudioStore } from '../../services/theme-studio-store';

/** Checks the inspector cannot make from tokens alone, said plainly rather than left out. */
const NOT_EVALUATED: readonly PlainTranslationKey[] = [
  'themeStudio.contrast.skipDisabled',
  'themeStudio.contrast.skipDecorative',
  'themeStudio.contrast.skipShadows',
  'themeStudio.contrast.skipImages',
];

/**
 * The Live Contrast Inspector: every token pair Volt paints, in both modes, against the WCAG
 * threshold of its role, updated as the draft changes. Results are words and numbers first; the
 * badge colour only repeats them. It never moves focus by itself: only "Edit token" does, on request.
 */
@Component({
  selector: 'app-theme-studio-contrast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltBadge,
    VoltCard,
    VoltCardContent,
    VoltCardDescription,
    VoltCardHeader,
    VoltCardTitle,
    VoltNativeButton,
    VoltSwitch,
  ],
  template: `
    <volt-card
      id="theme-studio-contrast"
      class="border-border/70 bg-surface/80 shadow-sm backdrop-blur"
    >
      <volt-card-header>
        <volt-card-title>{{ t('themeStudio.contrast.title') }}</volt-card-title>
        <volt-card-description>{{ t('themeStudio.contrast.lede') }}</volt-card-description>
      </volt-card-header>
      <volt-card-content class="space-y-4">
        <div class="grid gap-2 sm:grid-cols-2" data-testid="contrast-summary">
          @for (mode of store.modes; track mode) {
            @let s = summary()[mode];
            <p class="rounded-lg border border-border p-3 text-sm">
              <strong class="font-medium">{{
                mode === 'light' ? t('themeStudio.tokens.light') : t('themeStudio.tokens.dark')
              }}</strong>:
              {{
                t('themeStudio.contrast.summary', {
                  fail: s.fail,
                  pass: s.pass,
                  skipped: s.skipped,
                })
              }}
            </p>
          }
        </div>

        <div class="flex items-center gap-2">
          <volt-switch
            [id]="'contrast-failing-only'"
            [checked]="failingOnly()"
            (checkedChange)="failingOnly.set($event)"
          />
          <label for="contrast-failing-only" class="text-sm">{{
            t('themeStudio.contrast.failingOnly')
          }}</label>
        </div>

        @if (visible().length === 0) {
          <p class="text-sm text-muted-foreground">{{ t('themeStudio.contrast.noFailures') }}</p>
        } @else {
          <ul
            class="max-h-[32rem] divide-y divide-border overflow-y-auto rounded-lg border border-border"
            [attr.aria-label]="t('themeStudio.contrast.listLabel')"
          >
            @for (result of visible(); track result.id) {
              <li class="space-y-2 p-3" [attr.data-result]="result.id">
                <div class="flex flex-wrap items-baseline justify-between gap-2">
                  <span class="font-mono text-xs break-all"
                    >--{{ result.fg }} / --{{ result.bg }}</span
                  >
                  <volt-badge
                    [variant]="
                      result.status === 'fail'
                        ? 'destructive'
                        : result.status === 'pass'
                          ? 'outline'
                          : 'secondary'
                    "
                  >
                    {{ t(statusKey[result.status]) }}
                  </volt-badge>
                </div>
                <p class="text-sm">{{ role(result) }}</p>
                <p class="text-xs text-muted-foreground">
                  {{
                    result.mode === 'light'
                      ? t('themeStudio.tokens.light')
                      : t('themeStudio.tokens.dark')
                  }}
                  ·
                  {{
                    t('themeStudio.contrast.ratio', { ratio: result.ratio ?? '–', min: result.min })
                  }}
                  ·
                  {{
                    result.kind === 'text'
                      ? t('themeStudio.contrast.kindText')
                      : t('themeStudio.contrast.kindNonText')
                  }}
                  @if (derived(result)) {
                    · {{ t('themeStudio.contrast.derived') }}
                  }
                </p>
                @if (result.status === 'fail') {
                  <div class="flex flex-wrap items-center gap-2">
                    @if (result.target) {
                      <button
                        voltButton
                        size="sm"
                        variant="outline"
                        (click)="store.focusToken(result.mode, result.target)"
                      >
                        {{ t('themeStudio.contrast.edit') }}
                      </button>
                    }
                    @if (result.adjustable) {
                      @if (store.suggestionFor(result); as fix) {
                        <span class="inline-flex items-center gap-1 text-xs">
                          <span
                            class="inline-block h-4 w-4 rounded border border-border"
                            [style.background]="fix.from"
                            aria-hidden="true"
                          ></span>
                          →
                          <span
                            class="inline-block h-4 w-4 rounded border border-border"
                            [style.background]="fix.to"
                            aria-hidden="true"
                          ></span>
                          <code>{{ fix.to }}</code>
                        </span>
                        <button
                          voltButton
                          size="sm"
                          [attr.aria-label]="
                            t('themeStudio.contrast.applyNamed', {
                              token: '--' + result.fg,
                              from: fix.from,
                              to: fix.to,
                              ratio: fix.ratio,
                            })
                          "
                          (click)="store.applySuggestion(result)"
                        >
                          {{ t('themeStudio.contrast.apply', { ratio: fix.ratio }) }}
                        </button>
                      } @else {
                        <span class="text-xs text-muted-foreground">{{
                          t('themeStudio.contrast.noFix')
                        }}</span>
                      }
                    } @else {
                      <span class="text-xs text-muted-foreground">{{
                        t('themeStudio.contrast.manualFix')
                      }}</span>
                    }
                  </div>
                }
              </li>
            }
          </ul>
        }

        <div
          class="space-y-2 rounded-lg border border-border/70 bg-muted/25 p-3 text-xs text-muted-foreground"
        >
          <p class="font-medium text-foreground">
            {{ t('themeStudio.contrast.notEvaluatedTitle') }}
          </p>
          <ul class="list-disc space-y-1 pl-4">
            @for (key of notEvaluated; track key) {
              <li>{{ t(key) }}</li>
            }
          </ul>
          <p>{{ t('themeStudio.contrast.honesty') }}</p>
        </div>
      </volt-card-content>
    </volt-card>
  `,
})
export class ThemeStudioContrast {
  protected readonly t = injectAppI18n().t;
  protected readonly store = inject(ThemeStudioStore);
  protected readonly notEvaluated = NOT_EVALUATED;
  protected readonly failingOnly = signal(true);

  protected readonly statusKey: Record<ContrastResult['status'], PlainTranslationKey> = {
    pass: 'themeStudio.contrast.pass',
    fail: 'themeStudio.contrast.fail',
    'not-evaluated': 'themeStudio.contrast.notEvaluated',
  };

  protected readonly visible = computed(() =>
    this.failingOnly()
      ? this.store.contrast().filter(result => result.status !== 'pass')
      : this.store.contrast()
  );

  protected readonly summary = computed(() => {
    const count = (mode: string, status: ContrastResult['status']) =>
      this.store.contrast().filter(r => r.mode === mode && r.status === status).length;
    const of = (mode: string) => ({
      fail: count(mode, 'fail'),
      pass: count(mode, 'pass'),
      skipped: count(mode, 'not-evaluated'),
    });
    return { light: of('light'), dark: of('dark') };
  });

  /** The pair's id without its mode is the role's key. */
  protected role(result: ContrastResult): string {
    const key = CONTRAST_ROLE_KEYS[result.id.slice(result.mode.length + 1)];
    return key ? this.t(key) : result.label;
  }

  protected derived(result: ContrastResult): boolean {
    return result.fg in DERIVED || result.bg in DERIVED;
  }
}
