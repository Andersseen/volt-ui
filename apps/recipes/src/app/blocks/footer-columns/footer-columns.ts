import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LmnGithubIcon, LmnMessageCircleIcon, LmnShareIcon } from 'lumen-icons';
import {
  VoltAccordion,
  VoltAccordionContent,
  VoltAccordionItem,
  VoltAccordionTrigger,
  VoltBadge,
  VoltNativeButton,
  VoltSeparator,
} from 'volt';

interface Column {
  readonly title: string;
  readonly links: readonly string[];
}

/**
 * A full site footer: brand, four columns of links, a status line and the legal row.
 *
 * Four columns of six links are 24 tap targets stacked on a phone, most of which nobody wants. So
 * below `@3xl` the columns become a Volt accordion — four headings, open the one you need — and from
 * `@3xl` up they are plain lists side by side. Both are rendered and the container query shows one,
 * which keeps the server render identical at every width and needs no resize listener. The hidden
 * copy is `display: none`, so it is out of the accessibility tree and the tab order.
 *
 * The status dot pulses gently; under reduced motion it is a still dot.
 */
@Component({
  selector: 'app-footer-columns',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltAccordion,
    VoltAccordionContent,
    VoltAccordionItem,
    VoltAccordionTrigger,
    VoltBadge,
    VoltNativeButton,
    VoltSeparator,
    LmnGithubIcon,
    LmnMessageCircleIcon,
    LmnShareIcon,
  ],
  template: `
    <footer class="@container border-t border-border bg-muted/30">
      <div class="mx-auto max-w-6xl px-4 py-14 @3xl:px-6">
        <div class="grid gap-10 @3xl:grid-cols-[16rem_1fr]">
          <div>
            <a href="#" class="inline-flex items-center gap-2 font-semibold tracking-tight">
              <span
                class="grid h-7 w-7 place-items-center rounded-md bg-primary text-xs font-bold text-primary-foreground"
                aria-hidden="true"
                >N</span
              >
              Northwind
            </a>
            <p class="mt-3 text-sm leading-6 text-muted-foreground">
              Infrastructure for teams who would rather ship than babysit servers.
            </p>
            <a
              href="#"
              class="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <span class="status h-2 w-2 rounded-full bg-success" aria-hidden="true"></span>
              All systems normal
            </a>
          </div>

          <!-- Narrow: one accordion. -->
          <volt-accordion type="single" collapsible class="@3xl:hidden">
            @for (column of columns; track column.title) {
              <volt-accordion-item [value]="column.title">
                <volt-accordion-trigger>{{ column.title }}</volt-accordion-trigger>
                <volt-accordion-content>
                  <ul class="grid gap-3 pb-2">
                    @for (link of column.links; track link) {
                      <li>
                        <a href="#" class="text-sm text-muted-foreground hover:text-foreground">{{
                          link
                        }}</a>
                      </li>
                    }
                  </ul>
                </volt-accordion-content>
              </volt-accordion-item>
            }
          </volt-accordion>

          <!-- Wide: four columns. -->
          <div class="hidden grid-cols-4 gap-6 @3xl:grid">
            @for (column of columns; track column.title) {
              <nav [attr.aria-label]="column.title">
                <h3 class="text-sm font-semibold">{{ column.title }}</h3>
                <ul class="mt-4 grid gap-3">
                  @for (link of column.links; track link) {
                    <li>
                      <a href="#" class="text-sm text-muted-foreground hover:text-foreground">{{
                        link
                      }}</a>
                    </li>
                  }
                </ul>
              </nav>
            }
          </div>
        </div>

        <volt-separator class="my-8" />

        <div
          class="flex flex-col gap-4 text-sm text-muted-foreground @2xl:flex-row @2xl:items-center @2xl:justify-between"
        >
          <p class="flex flex-wrap items-center gap-2">
            © {{ year }} Northwind Labs, Inc.
            <volt-badge variant="outline">SOC 2 Type II</volt-badge>
          </p>
          <div class="flex items-center gap-1">
            <a href="#" voltButton variant="ghost" size="sm" class="font-normal">Privacy</a>
            <a href="#" voltButton variant="ghost" size="sm" class="font-normal">Terms</a>
            <volt-separator orientation="vertical" class="mx-1 h-5" />
            <a href="#" voltButton variant="ghost" size="icon" aria-label="GitHub">
              <lmn-github [size]="20" />
            </a>
            <a href="#" voltButton variant="ghost" size="icon" aria-label="Community forum">
              <lmn-message-circle [size]="20" />
            </a>
            <a href="#" voltButton variant="ghost" size="icon" aria-label="RSS feed">
              <lmn-share [size]="20" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .status {
      box-shadow: 0 0 0 0 color-mix(in oklch, var(--success) 60%, transparent);
    }
    @media (prefers-reduced-motion: no-preference) {
      .status {
        animation: pulse 2.4s ease-out infinite;
      }
    }
    @keyframes pulse {
      to {
        box-shadow: 0 0 0 6px transparent;
      }
    }
  `,
})
export class FooterColumns {
  protected readonly year = new Date().getFullYear();

  protected readonly columns: readonly Column[] = [
    { title: 'Product', links: ['Overview', 'Pricing', 'Changelog', 'Roadmap', 'Status'] },
    { title: 'Developers', links: ['Docs', 'API reference', 'CLI', 'SDKs', 'Examples'] },
    { title: 'Company', links: ['About', 'Customers', 'Careers', 'Press', 'Contact'] },
    { title: 'Resources', links: ['Blog', 'Guides', 'Community', 'Security', 'Brand'] },
  ];
}
