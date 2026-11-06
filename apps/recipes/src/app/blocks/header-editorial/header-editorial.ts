import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { VoltBadge, VoltNativeButton } from 'volt';

export interface EditorialMeta {
  readonly label: string;
  readonly value: string;
  /** A machine-readable value for the `<time>` element, when `value` is a date. */
  readonly datetime?: string;
}

export interface EditorialAction {
  readonly id: string;
  readonly label: string;
}

/**
 * Header for articles, documentation, guides and case studies.
 *
 * The composition is typographic and left-aligned to a reading measure: a category, a large title,
 * a standfirst, a metadata line (author, date, reading time) and quiet text-style actions underneath.
 * It is not a hero — no background, no centred block, no call to action — so the first paragraph of
 * the article is still visible beneath it on a laptop.
 *
 * Metadata is a `<dl>` so assistive technology reads "Author, Ada Lovelace" as a pair; dates use
 * `<time>`. Actions are data and emit `(action)` with their `id`.
 */
@Component({
  selector: 'app-header-editorial',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltBadge, VoltNativeButton],
  host: { class: 'block' },
  template: `
    <header class="@container mx-auto max-w-3xl px-4 py-10 @2xl:py-14">
      @if (category()) {
        <volt-badge variant="secondary" class="mb-4">{{ category() }}</volt-badge>
      }
      <h1
        class="text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground @2xl:text-5xl"
      >
        {{ title() }}
      </h1>
      @if (standfirst()) {
        <p class="mt-4 text-pretty text-lg leading-8 text-muted-foreground">{{ standfirst() }}</p>
      }

      @if (meta().length) {
        <dl
          class="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-y border-border py-3 text-sm @2xl:gap-x-8"
        >
          @for (item of meta(); track item.label) {
            <div class="flex items-baseline gap-2">
              <dt class="text-muted-foreground">{{ item.label }}</dt>
              <dd class="font-medium text-foreground">
                @if (item.datetime) {
                  <time [attr.datetime]="item.datetime">{{ item.value }}</time>
                } @else {
                  {{ item.value }}
                }
              </dd>
            </div>
          }
        </dl>
      }

      @if (actions().length) {
        <div class="mt-4 flex flex-wrap gap-1">
          @for (item of actions(); track item.id) {
            <button
              voltButton
              variant="ghost"
              size="sm"
              type="button"
              (click)="action.emit(item.id)"
            >
              {{ item.label }}
            </button>
          }
        </div>
      }
    </header>
  `,
})
export class HeaderEditorial {
  readonly category = input<string | null>('Guide');
  readonly title = input('Designing a navigation that survives a redesign');
  readonly standfirst = input<string | null>(
    'Navigation outlives pages. Here is how to structure it so that adding a section is a one-line change.'
  );
  readonly meta = input<readonly EditorialMeta[]>([
    { label: 'By', value: 'Ada Lovelace' },
    { label: 'Published', value: 'March 4, 2026', datetime: '2026-03-04' },
    { label: 'Reading time', value: '8 min' },
  ]);
  readonly actions = input<readonly EditorialAction[]>([
    { id: 'copy-link', label: 'Copy link' },
    { id: 'print', label: 'Print' },
  ]);

  readonly action = output<string>();
}
