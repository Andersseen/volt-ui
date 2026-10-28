import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LmnArrowLeftIcon, LmnArrowRightIcon } from 'lumen-icons';
import { VoltNativeButton } from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';

export interface PagerLink {
  /** Already localized. */
  readonly path: string;
  readonly label: string;
}

/** Previous and next page in sidebar order, at the foot of every docs page. */
@Component({
  selector: 'app-docs-pager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, VoltNativeButton, LmnArrowLeftIcon, LmnArrowRightIcon],
  host: { class: 'block' },
  template: `
    @if (previous() || next()) {
      <nav class="grid gap-3 sm:grid-cols-2" [attr.aria-label]="t('ui.docs.pager')">
        @if (previous(); as link) {
          <a
            voltButton
            variant="outline"
            [class]="linkClass + ' items-start'"
            [routerLink]="link.path"
          >
            <span class="flex items-center gap-1.5 text-xs text-muted-foreground">
              <lmn-arrow-left [size]="12" /> {{ t('ui.docs.previous') }}
            </span>
            <span class="text-sm font-semibold">{{ link.label }}</span>
          </a>
        } @else {
          <span></span>
        }
        @if (next(); as link) {
          <a
            voltButton
            variant="outline"
            [class]="linkClass + ' items-end text-right'"
            [routerLink]="link.path"
          >
            <span class="flex items-center gap-1.5 text-xs text-muted-foreground">
              {{ t('ui.docs.next') }} <lmn-arrow-right [size]="12" />
            </span>
            <span class="text-sm font-semibold">{{ link.label }}</span>
          </a>
        }
      </nav>
    }
  `,
})
export class DocsPager {
  readonly previous = input<PagerLink | null>(null);
  readonly next = input<PagerLink | null>(null);

  protected readonly t = injectAppI18n().t;
  protected readonly linkClass = 'h-auto flex-col gap-1 rounded-xl px-5 py-4';
}
