import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../../utils';
import { spinnerVariants, type SpinnerVariants } from './variants';

/**
 * An indeterminate loading indicator in the current text colour.
 *
 * - **Decorative (default):** no `label` — hidden from assistive tech. Use it next to text that
 *   already says what is happening, e.g. inside a button reading "Saving…".
 * - **Standalone status:** set `label` — the host becomes `role="status"` with the label as
 *   visually hidden text, so "Loading results" is announced politely.
 *
 * It does not set `aria-busy` on anything; mark the region that is loading yourself.
 */
@Component({
  selector: 'volt-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.role]': "label() ? 'status' : null",
    '[attr.aria-hidden]': "label() ? null : 'true'",
    '[attr.data-size]': 'size()',
  },
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" class="opacity-25" />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
    @if (label()) {
      <span class="sr-only">{{ label() }}</span>
    }
  `,
})
export class VoltSpinner {
  readonly size = input<SpinnerVariants['size']>('md');
  /** Accessible status text. Leave empty for a decorative spinner. */
  readonly label = input<string>('');
  readonly class = input<string>('');

  protected readonly classes = computed(() =>
    cn(spinnerVariants({ size: this.size() }), this.class())
  );
}
