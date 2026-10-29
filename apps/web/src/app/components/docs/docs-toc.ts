import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { VoltNativeButton } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import type { TocItem } from '../../lib/docs-nav';

/** "On this page": the page's headings, the one being read marked, a click jumps to it. */
@Component({
  selector: 'app-docs-toc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltNativeButton],
  host: { class: 'block' },
  template: `
    @if (items().length > 1) {
      <nav [attr.aria-label]="t('ui.docs.onThisPage')">
        <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {{ t('ui.docs.onThisPage') }}
        </p>
        <ul class="space-y-0.5 border-l border-border">
          @for (item of items(); track item.id) {
            <li>
              <button
                voltButton
                type="button"
                variant="ghost"
                size="sm"
                [class]="itemClass(item)"
                [attr.aria-current]="item.id === active() ? 'location' : null"
                (click)="selected.emit(item.id)"
              >
                {{ item.text }}
              </button>
            </li>
          }
        </ul>
      </nav>
    }
  `,
})
export class DocsToc {
  readonly items = input.required<readonly TocItem[]>();
  readonly active = input<string | null>(null);
  readonly selected = output<string>();

  protected readonly t = injectAppI18n().t;

  /** Merged through `voltButton`'s own `class` input, over the ghost variant. */
  protected itemClass(item: TocItem): string {
    const base =
      '-ml-px h-auto w-full justify-start whitespace-normal rounded-none border-l-2 py-1.5 text-left text-[13px] font-normal';
    const indent = item.level === 3 ? ' pl-6' : ' pl-3';
    return item.id === this.active()
      ? `${base}${indent} border-primary text-foreground`
      : `${base}${indent} border-transparent text-muted-foreground`;
  }
}
