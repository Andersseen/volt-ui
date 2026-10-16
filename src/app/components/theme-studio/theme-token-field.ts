import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { VoltCard } from 'volt';
import { injectAppI18n } from '../../i18n/i18n';
import type { ColorField } from '../../lib/theme-draft';

/** One semantic color token: a swatch that opens the color picker, its name and role, its hex. */
@Component({
  selector: 'app-theme-token-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltCard],
  host: { class: 'block' },
  template: `
    <volt-card
      class="field flex h-full items-center gap-3 bg-background/60 p-3 shadow-none transition-colors duration-200 hover:border-primary/40"
    >
      <input
        type="color"
        class="swatch h-10 w-10 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0"
        [value]="value()"
        [attr.aria-label]="t(field().labelKey)"
        (input)="changed.emit($event)"
      />
      <span class="min-w-0 flex-1">
        <span class="block truncate text-sm font-medium">{{ t(field().labelKey) }}</span>
        <span class="block truncate text-xs text-muted-foreground">{{
          t(field().descriptionKey)
        }}</span>
      </span>
      <code class="shrink-0 font-mono text-xs text-muted-foreground">{{ value() }}</code>
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
  readonly changed = output<Event>();

  protected readonly t = injectAppI18n().t;
}
