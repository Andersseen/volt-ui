import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LmnCheckIcon, LmnMinusIcon } from 'lumen-icons';
import {
  VoltBadge,
  VoltNativeButton,
  VoltTable,
  VoltTableBody,
  VoltTableCaption,
  VoltTableCell,
  VoltTableHead,
  VoltTableHeader,
  VoltTableRow,
  VoltToggleGroup,
  VoltToggleGroupItem,
} from 'volt';

type PlanId = 'starter' | 'team' | 'scale';

interface Plan {
  readonly id: PlanId;
  readonly name: string;
  readonly price: string;
}

/** `true` is a check, `false` a dash, a string is shown as written. */
type Cell = boolean | string;

interface Row {
  readonly feature: string;
  readonly cells: Readonly<Record<PlanId, Cell>>;
}

/**
 * The full comparison under a pricing section: every plan against every feature, in a real table.
 *
 * It is a `volt-table` because it is tabular data — a screen reader can move along a row and hear
 * each column's plan, which a grid of cards cannot offer. A check or dash is an icon, so each one
 * carries visually hidden text ("Included", "Not included").
 *
 * "Compare for" highlights one plan's column. On a narrow container the table keeps its columns and
 * scrolls sideways inside its own region — focusable and labelled, so a keyboard can scroll it too —
 * instead of squeezing three plans into a phone's width.
 *
 * The region is `relative` on purpose: the visually hidden caption is absolutely positioned, and
 * without a containing block inside the scroller it would sit at the table's far edge and widen
 * the whole page.
 */
@Component({
  selector: 'app-pricing-compare',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltBadge,
    VoltNativeButton,
    VoltTable,
    VoltTableBody,
    VoltTableCaption,
    VoltTableCell,
    VoltTableHead,
    VoltTableHeader,
    VoltTableRow,
    VoltToggleGroup,
    VoltToggleGroupItem,
    LmnCheckIcon,
    LmnMinusIcon,
  ],
  template: `
    <section class="@container bg-background px-4 py-20 @3xl:px-6">
      <div class="mx-auto max-w-5xl">
        <div class="flex flex-col gap-5 @3xl:flex-row @3xl:items-end @3xl:justify-between">
          <div>
            <h2 class="text-3xl font-bold tracking-tight">Compare plans</h2>
            <p class="mt-2 text-muted-foreground">Every limit, side by side. Prices per month.</p>
          </div>
          <div class="flex items-center gap-3">
            <span id="compare-for" class="text-sm text-muted-foreground">Compare for</span>
            <volt-toggle-group
              type="single"
              [allowDeselection]="false"
              [value]="[highlight()]"
              (valueChange)="pick($event)"
              aria-labelledby="compare-for"
            >
              @for (plan of plans; track plan.id) {
                <volt-toggle-group-item [value]="plan.id" size="sm">{{
                  plan.name
                }}</volt-toggle-group-item>
              }
            </volt-toggle-group>
          </div>
        </div>

        <div
          class="relative mt-8 overflow-x-auto rounded-xl border border-border"
          tabindex="0"
          role="region"
          aria-label="Plan comparison"
        >
          <volt-table class="min-w-[36rem]">
            <volt-table-caption class="sr-only">
              Features included in each plan, with prices per month
            </volt-table-caption>
            <volt-table-header>
              <volt-table-row>
                <volt-table-head class="w-2/5">Feature</volt-table-head>
                @for (plan of plans; track plan.id) {
                  <volt-table-head
                    class="col text-center"
                    [attr.data-highlight]="plan.id === highlight() ? '' : null"
                  >
                    <span class="block font-semibold text-foreground">{{ plan.name }}</span>
                    <span class="block text-xs font-normal">{{ plan.price }}</span>
                  </volt-table-head>
                }
              </volt-table-row>
            </volt-table-header>
            <volt-table-body>
              @for (row of rows; track row.feature) {
                <volt-table-row>
                  <volt-table-cell class="font-medium">{{ row.feature }}</volt-table-cell>
                  @for (plan of plans; track plan.id) {
                    <volt-table-cell
                      class="col text-center"
                      [attr.data-highlight]="plan.id === highlight() ? '' : null"
                    >
                      @switch (kind(row.cells[plan.id])) {
                        @case ('yes') {
                          <lmn-check [size]="16" class="inline text-primary" aria-hidden="true" />
                          <span class="sr-only">Included</span>
                        }
                        @case ('no') {
                          <lmn-minus
                            [size]="16"
                            class="inline text-muted-foreground/60"
                            aria-hidden="true"
                          />
                          <span class="sr-only">Not included</span>
                        }
                        @default {
                          {{ row.cells[plan.id] }}
                        }
                      }
                    </volt-table-cell>
                  }
                </volt-table-row>
              }
            </volt-table-body>
          </volt-table>
        </div>

        <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-muted-foreground">
            Need more than Scale? <volt-badge variant="outline">Enterprise</volt-badge>
          </p>
          <a voltButton href="#">Start with {{ nameOf(highlight()) }}</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .col {
      transition: background-color 250ms ease;
    }
    .col[data-highlight] {
      background: color-mix(in oklch, var(--primary) 8%, transparent);
    }
    volt-table-head.col[data-highlight] {
      box-shadow: inset 0 3px 0 var(--primary);
    }
    @media (prefers-reduced-motion: reduce) {
      .col {
        transition: none;
      }
    }
  `,
})
export class PricingCompare {
  protected readonly plans: readonly Plan[] = [
    { id: 'starter', name: 'Starter', price: '$0' },
    { id: 'team', name: 'Team', price: '$24 / seat' },
    { id: 'scale', name: 'Scale', price: '$49 / seat' },
  ];

  protected readonly rows: readonly Row[] = [
    { feature: 'Projects', cells: { starter: '3', team: 'Unlimited', scale: 'Unlimited' } },
    { feature: 'History', cells: { starter: '7 days', team: '1 year', scale: 'Forever' } },
    { feature: 'Custom domains', cells: { starter: false, team: true, scale: true } },
    { feature: 'Single sign-on', cells: { starter: false, team: false, scale: true } },
    { feature: 'Audit log', cells: { starter: false, team: true, scale: true } },
    { feature: 'Support', cells: { starter: 'Community', team: 'Email', scale: '1-hour SLA' } },
  ];

  protected readonly highlight = signal<PlanId>('team');

  protected pick(value: readonly string[]): void {
    const plan = this.plans.find(entry => entry.id === value[0]);
    if (plan) this.highlight.set(plan.id);
  }

  protected kind(cell: Cell): 'yes' | 'no' | 'text' {
    return cell === true ? 'yes' : cell === false ? 'no' : 'text';
  }

  protected nameOf(id: PlanId): string {
    return this.plans.find(plan => plan.id === id)?.name ?? '';
  }
}
