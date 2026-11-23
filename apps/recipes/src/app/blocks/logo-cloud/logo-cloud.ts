import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  LmnDatabaseIcon,
  LmnGlobeIcon,
  LmnHeartIcon,
  LmnPackageIcon,
  LmnShieldIcon,
  LmnSparklesIcon,
  LmnStarIcon,
  LmnZapIcon,
} from 'lumen-icons';
import { VoltBadge, VoltNativeButton } from 'volt';

type Mark = 'zap' | 'globe' | 'shield' | 'package' | 'sparkles' | 'star' | 'heart' | 'database';

interface Customer {
  readonly name: string;
  readonly mark: Mark;
  /** A per-logo typographic treatment, so placeholder wordmarks do not all look the same. */
  readonly style: string;
}

/**
 * The row of customer logos under a hero, settling into place as the section scrolls in.
 *
 * The logos are placeholder wordmarks — an icon and a name — so the block works before you have the
 * real files. Swap each `<li>` for an `<img>` or inline SVG with the company name as its `alt`. They
 * sit in a list labelled for what it is ("Customers"), muted until hovered so the row supports the
 * page instead of competing with it.
 *
 * The entrance is a scroll-driven animation staggered by each logo's index. Without scroll
 * timelines, or with reduced motion, the logos are simply there.
 */
@Component({
  selector: 'app-logo-cloud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltBadge,
    VoltNativeButton,
    LmnZapIcon,
    LmnGlobeIcon,
    LmnShieldIcon,
    LmnPackageIcon,
    LmnSparklesIcon,
    LmnStarIcon,
    LmnHeartIcon,
    LmnDatabaseIcon,
  ],
  template: `
    <section class="@container bg-background px-4 py-16 @3xl:px-6 @3xl:py-20">
      <div class="mx-auto max-w-5xl text-center">
        <p class="text-sm font-medium text-muted-foreground">
          Trusted by product teams at
          <volt-badge variant="outline" class="ml-1 tabular-nums">2,000+ companies</volt-badge>
        </p>

        <ul
          aria-label="Customers"
          class="mt-10 grid grid-cols-2 items-center gap-x-6 gap-y-8 @xl:grid-cols-4"
        >
          @for (customer of customers; track customer.name; let i = $index) {
            <li class="logo flex justify-center" [style.--i]="i">
              <span
                class="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                [class]="customer.style"
              >
                <span aria-hidden="true">
                  @switch (customer.mark) {
                    @case ('zap') {
                      <lmn-zap [size]="20" />
                    }
                    @case ('globe') {
                      <lmn-globe [size]="20" />
                    }
                    @case ('shield') {
                      <lmn-shield [size]="20" />
                    }
                    @case ('package') {
                      <lmn-package [size]="20" />
                    }
                    @case ('sparkles') {
                      <lmn-sparkles [size]="20" />
                    }
                    @case ('star') {
                      <lmn-star [size]="20" />
                    }
                    @case ('heart') {
                      <lmn-heart [size]="20" />
                    }
                    @case ('database') {
                      <lmn-database [size]="20" />
                    }
                  }
                </span>
                {{ customer.name }}
              </span>
            </li>
          }
        </ul>

        <a voltButton variant="link" href="#" class="mt-10">Read their stories</a>
      </div>
    </section>
  `,
  styles: `
    @supports (animation-timeline: view()) {
      @media (prefers-reduced-motion: no-preference) {
        .logo {
          animation: settle linear both;
          animation-timeline: view();
          animation-range: entry calc(var(--i) * 4%) entry calc(60% + var(--i) * 4%);
        }
      }
    }

    @keyframes settle {
      from {
        opacity: 0;
        translate: 0 0.75rem;
        filter: blur(4px);
      }
    }
  `,
})
export class LogoCloud {
  protected readonly customers: readonly Customer[] = [
    { name: 'Northwind', mark: 'zap', style: 'text-lg font-bold tracking-tight' },
    { name: 'Globex', mark: 'globe', style: 'text-lg font-semibold uppercase tracking-widest' },
    { name: 'Umbrella', mark: 'shield', style: 'text-lg font-medium' },
    { name: 'Initech', mark: 'package', style: 'font-mono text-lg font-semibold' },
    { name: 'Hooli', mark: 'sparkles', style: 'text-xl font-bold italic tracking-tight' },
    { name: 'Stark', mark: 'star', style: 'text-lg font-black uppercase' },
    { name: 'Soylent', mark: 'heart', style: 'font-serif text-xl' },
    { name: 'Vandelay', mark: 'database', style: 'text-lg font-semibold tracking-tight' },
  ];
}
