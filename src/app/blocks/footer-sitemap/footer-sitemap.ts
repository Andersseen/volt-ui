import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LmnCheckIcon, LmnGithubIcon, LmnMailIcon, LmnSendIcon } from 'lumen-icons';
import { VoltButton, VoltInput, VoltSeparator } from 'volt';

interface LinkColumn {
  readonly heading: string;
  readonly links: readonly string[];
}

/**
 * Sitemap footer: four link columns, a newsletter field, and a status line.
 *
 * The status line is the part worth copying. A footer that says "All systems operational"
 * as static text is a claim nobody can check; wiring the same row to a real status feed
 * costs one fetch and turns it into information. The dot pulses so it reads as live
 * rather than as a decoration that happens to be green.
 *
 * The link underlines grow from the left using a background gradient rather than
 * `text-decoration`, because a background can be transitioned and an underline cannot.
 */
@Component({
  selector: 'app-footer-sitemap',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltInput,
    VoltButton,
    VoltSeparator,
    LmnGithubIcon,
    LmnMailIcon,
    LmnSendIcon,
    LmnCheckIcon,
  ],
  template: `
    <footer class="@container border-t border-border bg-background px-4 pb-10 pt-16 @2xl:px-6">
      <div class="mx-auto max-w-6xl">
        <div class="grid gap-12 @4xl:grid-cols-[1.2fr_2fr]">
          <div class="max-w-sm">
            <div class="flex items-center gap-2">
              <span
                class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                aria-hidden="true"
              >
                <lmn-mail [size]="16" />
              </span>
              <p class="text-lg font-semibold tracking-tight">Northwind</p>
            </div>
            <p class="mt-4 text-sm leading-6 text-muted-foreground">
              Infrastructure for teams that would rather ship than operate. Built in the open.
            </p>

            <form class="mt-6" (submit)="subscribe($event)">
              <label class="sr-only" for="footer-email">Email address</label>
              <div class="flex gap-2">
                <volt-input
                  [id]="'footer-email'"
                  type="email"
                  autocomplete="email"
                  placeholder="you@company.com"
                />
                <volt-button type="submit" variant="outline" class="shrink-0">
                  @if (subscribed()) {
                    <lmn-check [size]="16" class="text-success" />
                    <span class="sr-only">Subscribed</span>
                  } @else {
                    <lmn-send [size]="16" />
                    <span class="sr-only">Subscribe</span>
                  }
                </volt-button>
              </div>
              <p class="mt-2 h-4 text-xs text-muted-foreground" role="status">
                @if (subscribed()) {
                  Thanks — check your inbox to confirm.
                }
              </p>
            </form>
          </div>

          <!-- A container query, not a breakpoint. Breakpoints answer to the viewport,
               which says nothing about how much room this nav actually got: dropped into
               a narrow column on a wide screen it would still lay out four columns, and
               a word like "Subprocessors" would escape one 86px wide. Querying the
               container makes the block behave wherever it is pasted. -->
          <div class="@container">
            <nav class="grid grid-cols-2 gap-8 @lg:grid-cols-4" aria-label="Footer">
              @for (column of columns; track column.heading) {
                <div class="min-w-0">
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-foreground">
                    {{ column.heading }}
                  </h3>
                  <ul class="mt-4 space-y-3">
                    @for (link of column.links; track link) {
                      <li>
                        <a
                          href="#"
                          class="footer-link break-words"
                          (click)="$event.preventDefault()"
                        >
                          {{ link }}
                        </a>
                      </li>
                    }
                  </ul>
                </div>
              }
            </nav>
          </div>
        </div>

        <volt-separator class="mt-14" />

        <div
          class="flex flex-col items-center justify-between gap-4 pt-6 text-sm text-muted-foreground @md:flex-row"
        >
          <p>&copy; {{ year }} Northwind Systems. All rights reserved.</p>

          <div class="flex items-center gap-5">
            <!-- Point this at your real status feed; the markup is already the right shape. -->
            <a href="#" class="flex items-center gap-2" (click)="$event.preventDefault()">
              <span class="status-dot h-2 w-2 rounded-full bg-success" aria-hidden="true"></span>
              <span class="footer-link">All systems operational</span>
            </a>
            <a
              href="#"
              class="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="GitHub"
              (click)="$event.preventDefault()"
            >
              <lmn-github [size]="16" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: `
    /* A gradient sized to 0% and grown to 100% animates; text-decoration does not. */
    .footer-link {
      color: var(--muted-foreground);
      text-decoration: none;
      background-image: linear-gradient(currentColor, currentColor);
      background-repeat: no-repeat;
      background-position: 0 100%;
      background-size: 0% 1px;
      transition:
        background-size 300ms cubic-bezier(0.22, 1, 0.36, 1),
        color 200ms ease;
    }

    .footer-link:hover,
    .footer-link:focus-visible {
      color: var(--foreground);
      background-size: 100% 1px;
    }

    .status-dot {
      animation: status-pulse 2.4s ease-in-out infinite;
    }

    @keyframes status-pulse {
      0%,
      100% {
        opacity: 1;
        box-shadow: 0 0 0 0 color-mix(in oklch, var(--success) 45%, transparent);
      }
      70% {
        opacity: 0.7;
        box-shadow: 0 0 0 6px transparent;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .footer-link {
        transition: color 200ms ease;
        background-size: 0% 1px;
      }

      .footer-link:hover,
      .footer-link:focus-visible {
        background-size: 100% 1px;
      }

      .status-dot {
        animation: none;
      }
    }
  `,
})
export class FooterSitemap {
  protected readonly year = new Date().getFullYear();
  protected readonly subscribed = signal(false);

  protected readonly columns: readonly LinkColumn[] = [
    {
      heading: 'Product',
      links: ['Overview', 'Pricing', 'Changelog', 'Roadmap', 'Status'],
    },
    {
      heading: 'Developers',
      links: ['Documentation', 'API reference', 'CLI', 'Examples', 'SDKs'],
    },
    {
      heading: 'Company',
      links: ['About', 'Careers', 'Customers', 'Blog', 'Press'],
    },
    {
      heading: 'Legal',
      links: ['Privacy', 'Terms', 'Security', 'DPA', 'Subprocessors'],
    },
  ];

  /** Wire this to your own list; the block only owns what the visitor sees. */
  protected subscribe(event: Event): void {
    event.preventDefault();
    this.subscribed.set(true);
  }
}
