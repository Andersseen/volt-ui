import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface RoadmapItem {
  order: number;
  title: string;
  scope: 'Library' | 'Docs site';
  status: 'Next' | 'Planned' | 'Exploring';
  summary: string;
  details: string[];
}

@Component({
  selector: 'app-roadmap-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Roadmap</h1>
        <p class="text-lg text-muted-foreground mt-2">
          Volt UI reached <code class="px-1.5 py-0.5 bg-muted rounded">1.0.0</code>, and 1.0 is a
          starting line rather than a finish. This is the direction the project is heading and the
          order it will get there in.
        </p>
      </div>

      <div class="w-full h-px bg-border"></div>

      <!-- How to read this -->
      <div class="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
        <h2 class="font-medium">How to read this page</h2>
        <p class="text-sm text-muted-foreground">
          There are no dates here on purpose — a roadmap with dates it can't keep is worse than no
          roadmap. What is committed is the <strong class="text-foreground">order</strong>: each
          item below depends on the one above it, and shipping them out of sequence would mean
          redoing work. Anything here that turns out to be wrong gets removed from this page rather
          than quietly dropped.
        </p>
        <p class="text-sm text-muted-foreground">
          None of this breaks your existing code. The 1.0 public API is frozen and everything below
          follows ordinary semantic versioning — see
          <a routerLink="/docs/versioning" class="text-primary underline-offset-4 hover:underline"
            >Versioning &amp; Stability</a
          >.
        </p>
      </div>

      <!-- Ordered items. An <ol> because the sequence is the commitment, so it has to
           reach screen readers too — the numbered badge alone is decoration. -->
      <ol class="space-y-4">
        @for (item of items; track item.order) {
          <li class="p-5 rounded-lg border border-border bg-muted/30 space-y-3">
            <div class="flex flex-wrap items-center gap-3">
              <span
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold"
                aria-hidden="true"
              >
                {{ item.order }}
              </span>
              <h2 class="text-xl font-semibold tracking-tight">{{ item.title }}</h2>
              <span
                class="rounded-full px-2 py-0.5 text-[11px] font-medium leading-none"
                [class]="statusClass(item.status)"
              >
                <span class="sr-only">Status:</span>
                {{ item.status }}
              </span>
              <span
                class="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium leading-none text-muted-foreground"
              >
                <span class="sr-only">Applies to:</span>
                {{ item.scope }}
              </span>
            </div>

            <p class="text-muted-foreground">{{ item.summary }}</p>

            <ul class="space-y-1.5 border-l border-border/50 ml-1 pl-4">
              @for (detail of item.details; track $index) {
                <li class="text-sm text-muted-foreground">{{ detail }}</li>
              }
            </ul>
          </li>
        }
      </ol>

      <!-- Why this order -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Why the headless layer comes first</h2>
        <p class="text-muted-foreground">
          The most tempting thing to do after a 1.0 is add components. That is deliberately not what
          happens next. Every Volt UI component today delegates its accessibility and interaction
          behavior to
          <a
            href="https://ng-primitives.dev"
            target="_blank"
            rel="noopener"
            class="text-primary underline-offset-4 hover:underline"
            >ng-primitives</a
          >, so every component added before that layer is replaced is one more component to port
          afterwards. Growing the catalog first would make the migration bigger, slower, and more
          likely to break your code when it lands.
        </p>
        <p class="text-muted-foreground">
          Doing it in this order means the port happens once, across the components that exist
          today, and the catalog grows afterwards on a foundation that is entirely first-party.
        </p>
      </div>

      <!-- What is not changing -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">What is not changing</h2>
        <div class="grid gap-4 md:grid-cols-3">
          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <h3 class="font-medium">The copy-in model</h3>
            <p class="text-sm text-muted-foreground mt-1">
              Components stay copyable into your project via the CLI. You own the code you copy;
              nothing on this page changes that.
            </p>
          </div>
          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <h3 class="font-medium">The 1.0 API</h3>
            <p class="text-sm text-muted-foreground mt-1">
              Selectors, inputs, and outputs frozen at 1.0 keep working. A breaking change requires
              a major version and migration notes.
            </p>
          </div>
          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <h3 class="font-medium">Theming</h3>
            <p class="text-sm text-muted-foreground mt-1">
              The 5 color × 5 style presets and the token system stay as they are. A Tailwind-free
              build adds an option; it removes nothing.
            </p>
          </div>
        </div>
      </div>

      <div class="p-4 rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
        Have an opinion on the order, or need something that isn't here? Open an issue or a
        discussion on
        <a
          href="https://github.com/Andersseen/volt-ui"
          target="_blank"
          rel="noopener"
          class="text-primary underline-offset-4 hover:underline"
          >GitHub</a
        >. Shipped work is recorded in
        <a
          href="https://github.com/Andersseen/volt-ui/blob/main/CHANGELOG.md"
          target="_blank"
          rel="noopener"
          class="text-primary underline-offset-4 hover:underline"
          >CHANGELOG.md</a
        >, and the longer-term technical framing lives in
        <a
          href="https://github.com/Andersseen/volt-ui/blob/main/specs/SPEC.md"
          target="_blank"
          rel="noopener"
          class="text-primary underline-offset-4 hover:underline"
          >specs/SPEC.md</a
        >.
      </div>
    </div>
  `,
})
export default class RoadmapPage {
  readonly items: RoadmapItem[] = [
    {
      order: 1,
      title: 'Documentation in more languages',
      scope: 'Docs site',
      status: 'Next',
      summary:
        'The docs are English-only today. Ukrainian (UA) and Spanish (ES) are next, so the library is approachable without reading English first.',
      details: [
        'Applies to this documentation site — guides, component pages, and examples.',
        'Component names, selectors, inputs, and outputs stay in English. Translating an API would break every copied component and every code sample on the internet.',
        'Language is a reader preference, not a separate build: the same components and the same package back every locale.',
      ],
    },
    {
      order: 2,
      title: 'A first-party headless layer — @volt-ui/core',
      scope: 'Library',
      status: 'Planned',
      summary:
        'Replace the ng-primitives dependency with Volt UI’s own headless primitives, so behavior and styling are two layers of one project instead of one project on top of someone else’s.',
      details: [
        'Headless and styled ship separately. Want only the behavior — focus management, keyboard handling, ARIA wiring — with your own markup and CSS? Take @volt-ui/core alone.',
        'Want what Volt UI looks like today? Keep using the styled components; they are built on the same headless layer.',
        'This happens before the component catalog grows — see the reasoning below.',
        'The @volt-ui/core name is already reserved for exactly this in the project spec; it is not a new idea, it is the next one.',
      ],
    },
    {
      order: 3,
      title: 'Two distributions: with Tailwind and without',
      scope: 'Library',
      status: 'Planned',
      summary:
        'Volt UI is styled with Tailwind CSS v4 today, which rules it out for projects that do not or cannot use Tailwind. A Tailwind-free distribution removes that constraint.',
      details: [
        'The Tailwind build stays the default and keeps working exactly as it does now.',
        'The Tailwind-free build ships the same components and the same design tokens as plain CSS.',
        'Depends on the headless layer landing first: once behavior is separate from styling, a second styling target stops being a fork and becomes a build output.',
      ],
    },
    {
      order: 4,
      title: 'More layouts built from Volt UI components',
      scope: 'Library',
      status: 'Exploring',
      summary:
        'Beyond the existing sidebar and top-nav layouts — fuller application shells assembled from components that already exist, so a real screen is a starting point rather than an assembly job.',
      details: [
        'Least critical item on this page, and honestly labelled as such — it is a convenience, not a gap.',
        'Composed from shipped Volt UI components rather than new one-off primitives.',
        'Sequenced last on purpose: layouts built before the headless port would need porting too.',
      ],
    },
  ];

  protected statusClass(status: RoadmapItem['status']): string {
    switch (status) {
      case 'Next':
        return 'bg-success/15 text-success';
      case 'Planned':
        return 'bg-info/15 text-info';
      case 'Exploring':
        return 'bg-warning/20 text-warning';
    }
  }
}
