import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltBadge, VoltInput, VoltSpinner } from 'volt';

/**
 * A recipe in miniature: the async search, playing its whole story on a loop — the query is typed,
 * the request is pending, the results arrive one by one.
 *
 * One CSS timeline drives every phase, so there is no timer to clean up and nothing runs on the
 * server. A specimen of the Async search recipe; its words are sample data, not copy.
 */
@Component({
  selector: 'app-recipe-mini',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltBadge, VoltInput, VoltSpinner],
  host: { class: 'block' },
  template: `
    <div class="space-y-3 p-4 text-xs">
      <p class="font-medium">Customer</p>
      <div class="relative">
        <volt-input size="sm" placeholder="" class="pointer-events-none" />
        <span
          class="typed absolute left-3 top-1/2 -translate-y-1/2 overflow-hidden whitespace-nowrap"
          >acme</span
        >
        <volt-spinner size="sm" class="pending absolute right-3 top-1/2 -translate-y-1/2" />
      </div>
      <ul class="space-y-1.5">
        @for (result of results; track result.name; let i = $index) {
          <li
            class="result flex items-center justify-between rounded-md border border-border/70 px-2.5 py-2"
            [style.--i]="i"
          >
            <span class="font-medium">{{ result.name }}</span>
            <volt-badge [variant]="result.variant" class="px-1.5 py-0 text-[9px]">{{
              result.status
            }}</volt-badge>
          </li>
        }
      </ul>
    </div>
  `,
  styles: `
    /* 6s loop: 0-25% typing, 25-45% pending, 45-90% results, 90-100% clear. */
    .typed {
      width: 0;
      animation: type 6s steps(4, end) infinite;
    }

    .pending {
      opacity: 0;
      animation: pending 6s linear infinite;
    }

    .result {
      opacity: 0;
      animation: arrive 6s cubic-bezier(0.22, 1, 0.36, 1) infinite;
      animation-delay: calc(var(--i) * 140ms);
    }

    @keyframes type {
      25%,
      90% {
        width: 4ch;
      }
      100% {
        width: 0;
      }
    }

    @keyframes pending {
      25%,
      45% {
        opacity: 1;
      }
      46%,
      100% {
        opacity: 0;
      }
    }

    @keyframes arrive {
      0%,
      45% {
        opacity: 0;
        transform: translateY(6px);
      }
      52%,
      88% {
        opacity: 1;
        transform: none;
      }
      96%,
      100% {
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .typed {
        width: 4ch;
      }

      .typed,
      .pending,
      .result {
        animation: none;
      }

      .result {
        opacity: 1;
      }
    }
  `,
})
export class RecipeMini {
  protected readonly results = [
    { name: 'Acme Corp', status: 'paid', variant: 'success' },
    { name: 'Acme Labs', status: 'pending', variant: 'warning' },
    { name: 'Acme Studio', status: 'overdue', variant: 'destructive' },
  ] as const;
}
