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
        <ul class="space-y-0.5">
          @for (item of items(); track item.id) {
            <li [class.ps-3]="item.level === 3">
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

  /**
   * Merged through `voltButton`'s own `class` input, over the ghost variant — so the shape (radius),
   * focus ring and border width are the active style preset's, never forced square.
   *
   * One indicator: the active entry gets the accent surface and foreground text; hover is a lighter
   * tint of the same surface; focus-visible is the button's own ring. Weight and padding never
   * change between states, so a heading becoming active never re-wraps or shifts the list.
   */
  protected itemClass(item: TocItem): string {
    const base =
      'h-auto min-h-control-sm w-full justify-start whitespace-normal py-1.5 text-start text-[13px] font-normal wrap-break-word';
    return item.id === this.active()
      ? `${base} bg-accent text-accent-foreground data-[hover]:bg-accent`
      : `${base} text-muted-foreground data-[hover]:bg-accent/50 data-[hover]:text-foreground`;
  }
}
