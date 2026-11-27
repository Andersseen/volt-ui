import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { VoltCard, VoltInput, VoltNativeButton } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import type { ColorField } from '../../lib/theme-draft';

/**
 * One semantic color token: the native picker, the editable hex value, its name and role, and a
 * reset to the starting palette. Both inputs edit the same value; the hex field only commits a
 * complete `#rrggbb`, so a half-typed value never reaches the theme.
 */
@Component({
  selector: 'app-theme-token-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltCard, VoltInput, VoltNativeButton],
  host: { class: 'block' },
  template: `
    <volt-card
      class="field flex h-full flex-wrap items-center gap-3 bg-background/60 p-3 shadow-none transition-colors duration-200 hover:border-primary/40"
      [attr.data-token]="field().key"
    >
      <input
        #picker
        type="color"
        class="swatch h-10 w-10 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0"
        [id]="id()"
        [value]="value()"
        [attr.aria-label]="t(field().labelKey)"
        [attr.aria-describedby]="id() + '-role'"
        (input)="changed.emit(picker.value)"
      />
      <span class="min-w-0 flex-1 basis-32">
        <label [for]="id()" class="block text-sm font-medium break-words">
          {{ t(field().labelKey) }}
          @if (modified()) {
            <span class="ml-1 text-xs font-normal text-primary">{{
              t('themeStudio.tokens.modified')
            }}</span>
          }
        </label>
        <span [id]="id() + '-role'" class="block text-xs text-muted-foreground">{{
          t(field().descriptionKey)
        }}</span>
      </span>
      <div class="flex shrink-0 items-center gap-1">
        <volt-input
          class="w-24 font-mono text-xs"
          [value]="value()"
          [ariaLabel]="t('themeStudio.tokens.hexLabel', { token: t(field().labelKey) })"
          autocomplete="off"
          (valueChange)="commitHex($event)"
        />
        <button
          voltButton
          size="sm"
          variant="ghost"
          [disabled]="!modified()"
          [attr.aria-label]="t('themeStudio.tokens.resetToken', { token: t(field().labelKey) })"
          (click)="resetRequested.emit()"
        >
          {{ t('themeStudio.tokens.reset') }}
        </button>
      </div>
    </volt-card>
  `,
  styles: `
    /* Let the native picker be the swatch itself: no inner padding or default border. */
    .swatch {
      appearance: none;
      overflow: hidden;
    }

    .swatch::-webkit-color-swatch-wrapper {
      padding: 0;
    }

    .swatch::-webkit-color-swatch {
      border: none;
      border-radius: calc(var(--radius) - 1px);
    }

    .swatch::-moz-color-swatch {
      border: none;
      border-radius: calc(var(--radius) - 1px);
    }

    .swatch:focus-visible {
      outline: 2px solid var(--ring);
      outline-offset: 2px;
    }
  `,
})
export class ThemeTokenField {
  readonly field = input.required<ColorField>();
  readonly value = input.required<string>();
  /** The starting palette's value, for the reset and the "modified" mark. */
  readonly preset = input.required<string>();
  /** Unique per mode, so the light and dark panels never share ids. */
  readonly idPrefix = input.required<string>();
  /** Bumped by the contrast inspector to bring keyboard focus here. */
  readonly focusRequest = input<number | null>(null);

  readonly changed = output<string>();
  readonly resetRequested = output<void>();

  protected readonly t = injectAppI18n().t;

  protected readonly id = computed(() => `${this.idPrefix()}-${this.field().key}`);
  protected readonly modified = computed(
    () => this.value().toLowerCase() !== this.preset().toLowerCase()
  );

  private readonly picker = viewChild.required<ElementRef<HTMLInputElement>>('picker');

  constructor() {
    // After rendering: the request usually switches the tab first, and a field in a panel that is
    // still hidden cannot take focus.
    afterRenderEffect(() => {
      if (this.focusRequest() === null) return;
      const element = this.picker().nativeElement;
      element.scrollIntoView?.({ block: 'center' });
      element.focus();
    });
  }

  protected commitHex(raw: unknown): void {
    if (typeof raw !== 'string') return;
    const value = raw.trim().startsWith('#') ? raw.trim() : `#${raw.trim()}`;
    if (/^#[0-9a-f]{6}$/i.test(value)) this.changed.emit(value.toLowerCase());
  }
}
