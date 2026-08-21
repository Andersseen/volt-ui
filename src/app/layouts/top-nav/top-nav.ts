import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LmnMenuIcon } from 'lumen-icons';
import {
  VoltAvatar,
  VoltAvatarFallback,
  VoltButton,
  VoltCard,
  VoltDropdownMenu,
  VoltDropdownMenuItem,
  VoltDropdownMenuLabel,
  VoltDropdownMenuSeparator,
  VoltDropdownMenuTrigger,
  VoltNavigationMenu,
  VoltNavigationMenuContent,
  VoltNavigationMenuItem,
  VoltNavigationMenuLink,
  VoltNavigationMenuList,
  VoltNavigationMenuTrigger,
} from 'volt';

interface Panel {
  readonly title: string;
  readonly body: string;
  readonly span: string;
}

/**
 * Top navigation shell: a full-width header over a centred content column.
 *
 * The shape to reach for when the sections fit on one line. A sidebar buys room for
 * twenty destinations at the cost of a permanent column; a top bar gives the content the
 * whole width, and stops working the moment you have more sections than fit.
 *
 * `volt-navigation-menu` rather than a row of anchors: sections with children need a
 * trigger that opens on hover and on keyboard, closes on Escape, and tells assistive
 * technology what it expanded. That is a lot of behaviour to reimplement per app, and
 * getting it half right is worse than a plain link.
 *
 * The content column is capped and centred while the header is not. A header that stops
 * at the same width as the text looks like the page is floating.
 */
@Component({
  selector: 'app-top-nav-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltNavigationMenu,
    VoltNavigationMenuList,
    VoltNavigationMenuItem,
    VoltNavigationMenuTrigger,
    VoltNavigationMenuContent,
    VoltNavigationMenuLink,
    VoltDropdownMenuTrigger,
    VoltDropdownMenu,
    VoltDropdownMenuItem,
    VoltDropdownMenuLabel,
    VoltDropdownMenuSeparator,
    VoltAvatar,
    VoltAvatarFallback,
    VoltButton,
    VoltCard,
    LmnMenuIcon,
  ],
  template: `
    <div class="flex h-[640px] flex-col overflow-hidden bg-background">
      <!-- Full width, so it reads as the frame rather than as part of the content. -->
      <header class="shrink-0 border-b border-border">
        <div class="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <div class="flex items-center gap-2">
            <span
              class="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground"
            >
              A
            </span>
            <span class="text-sm font-semibold">Acme</span>
          </div>

          <volt-navigation-menu class="hidden md:block">
            <volt-navigation-menu-list>
              <volt-navigation-menu-item>
                <!-- The panel is passed as a template, not projected: the trigger hands it
                     to the overlay, which renders it outside this subtree. -->
                <volt-navigation-menu-trigger [content]="productPanel">
                  Product
                </volt-navigation-menu-trigger>
                <ng-template #productPanel>
                  <volt-navigation-menu-content class="w-[16rem]">
                    <div class="grid gap-1 p-1">
                      @for (link of productLinks; track link) {
                        <a voltNavigationMenuLink href="#">{{ link }}</a>
                      }
                    </div>
                  </volt-navigation-menu-content>
                </ng-template>
              </volt-navigation-menu-item>
              <volt-navigation-menu-item>
                <a voltNavigationMenuLink href="#">Customers</a>
              </volt-navigation-menu-item>
              <volt-navigation-menu-item>
                <a voltNavigationMenuLink href="#">Pricing</a>
              </volt-navigation-menu-item>
            </volt-navigation-menu-list>
          </volt-navigation-menu>

          <div class="ml-auto flex items-center gap-2">
            <volt-button variant="ghost" size="icon" class="md:hidden" aria-label="Open menu">
              <lmn-menu [size]="20" />
            </volt-button>

            <button
              [voltDropdownMenu]="accountMenu"
              class="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Account menu"
            >
              <volt-avatar class="h-8 w-8">
                <volt-avatar-fallback class="text-xs">AL</volt-avatar-fallback>
              </volt-avatar>
            </button>
          </div>
        </div>
      </header>

      <!-- Content: capped and centred, unlike the header above it. -->
      <main class="min-h-0 flex-1 overflow-auto bg-muted/20">
        <div class="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
          <div>
            <h1 class="text-2xl font-bold tracking-tight">Overview</h1>
            <p class="mt-1 text-sm text-muted-foreground">
              The panels below are the part you replace.
            </p>
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            @for (panel of panels; track panel.title) {
              <volt-card class="p-5" [class]="panel.span">
                <h2 class="font-medium tracking-tight">{{ panel.title }}</h2>
                <p class="mt-2 text-sm leading-6 text-muted-foreground">{{ panel.body }}</p>
              </volt-card>
            }
          </div>
        </div>
      </main>
    </div>

    <ng-template #accountMenu>
      <volt-dropdown-menu>
        <volt-dropdown-menu-label>Ada Lovelace</volt-dropdown-menu-label>
        <volt-dropdown-menu-separator />
        @for (item of accountItems; track item) {
          <volt-dropdown-menu-item>{{ item }}</volt-dropdown-menu-item>
        }
      </volt-dropdown-menu>
    </ng-template>
  `,
})
export class TopNavLayout {
  protected readonly productLinks: readonly string[] = [
    'Overview',
    'Integrations',
    'Changelog',
    'Roadmap',
  ];

  protected readonly accountItems: readonly string[] = ['Profile', 'Settings', 'Sign out'];

  protected readonly panels: readonly Panel[] = [
    {
      title: 'Wide panel',
      body: 'Spans two columns, because the thing it holds is worth twice the space of the one beside it. Unequal panels are how a grid says what matters.',
      span: 'md:col-span-2',
    },
    {
      title: 'Narrow panel',
      body: 'A list, a summary, a set of shortcuts — whatever fits in a third.',
      span: '',
    },
    {
      title: 'Third',
      body: 'Three equal panels underneath, for content with no hierarchy between it.',
      span: '',
    },
    { title: 'Fourth', body: 'Same weight as the one before it.', span: '' },
    { title: 'Fifth', body: 'And the one after.', span: '' },
  ];
}
