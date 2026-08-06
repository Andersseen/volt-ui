import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-versioning-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Versioning &amp; Stability</h1>
        <p class="text-lg text-muted-foreground mt-2">
          Volt UI reached <code class="px-1.5 py-0.5 bg-muted rounded">1.0.0</code> — the public API
          is locked and follows ordinary
          <a
            href="https://semver.org/"
            target="_blank"
            rel="noopener"
            class="text-primary underline-offset-4 hover:underline"
            >semantic versioning</a
          >
          from here on.
        </p>
      </div>

      <div class="w-full h-px bg-border"></div>

      <!-- Semver promise -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">The semver promise</h2>
        <div class="grid gap-4 md:grid-cols-3">
          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <h3 class="font-medium">Major — <code>2.0.0</code></h3>
            <p class="text-sm text-muted-foreground mt-1">
              The only place breaking changes happen: renamed or removed inputs/outputs/selectors,
              changed default behavior, dropped Angular major support.
            </p>
          </div>
          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <h3 class="font-medium">Minor — <code>1.1.0</code></h3>
            <p class="text-sm text-muted-foreground mt-1">
              New components, new optional inputs/outputs, new CVA variants. Always
              backward-compatible with the previous minor.
            </p>
          </div>
          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <h3 class="font-medium">Patch — <code>1.0.1</code></h3>
            <p class="text-sm text-muted-foreground mt-1">
              Bug fixes, accessibility corrections, internal refactors. Never changes the public
              contract.
            </p>
          </div>
        </div>
        <p class="text-sm text-muted-foreground">
          The frozen surface itself is inventoried in
          <a
            href="https://github.com/Andersseen/volt-ui/blob/main/specs/api-freeze-0.9.md"
            target="_blank"
            rel="noopener"
            class="text-primary underline-offset-4 hover:underline"
            >specs/api-freeze-0.9.md</a
          >
          — every input, output, and selector present at the 1.0.0 freeze. Upgrading from a 0.x
          release? See
          <a
            routerLink="/docs/migration-notes"
            class="text-primary underline-offset-4 hover:underline"
            >0.x Migration Notes</a
          >.
        </p>
      </div>

      <!-- Status labels -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">What status labels mean now</h2>
        <p class="text-muted-foreground">
          Every component in 1.0.0 is <code>stable</code> — see
          <a routerLink="/docs/components" class="text-primary underline-offset-4 hover:underline"
            >the component catalog</a
          >
          for the per-component label. <code>beta</code> and <code>experimental</code> stay defined
          below because components added after 1.0 may start there; nothing carries either label
          today. The label is a confidence signal, not an availability gate: every component ships
          through the npm package and the CLI regardless of label.
        </p>
        <div class="grid gap-4 md:grid-cols-3">
          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <h3 class="font-medium text-success">Stable</h3>
            <p class="text-sm text-muted-foreground mt-1">
              Recommended for production use. Documented API, meaningful tests, known accessibility
              caveats (if any) written down.
            </p>
          </div>
          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <h3 class="font-medium text-info">Beta</h3>
            <p class="text-sm text-muted-foreground mt-1">
              Usable today, but may still gain forms, keyboard, or accessibility hardening in a
              minor or patch release — that hardening never breaks the existing public API, so
              moving from beta to stable is a documentation change, not a version bump on its own.
              Unused in 1.0.
            </p>
          </div>
          <div class="p-4 rounded-lg border border-border bg-muted/30">
            <h3 class="font-medium text-warning">Experimental</h3>
            <p class="text-sm text-muted-foreground mt-1">
              Reserved for future previews whose API may still change. Not currently used — no
              shipped component carries this label as of 1.0.0.
            </p>
          </div>
        </div>
      </div>

      <!-- Angular support policy -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Angular version support</h2>
        <p class="text-muted-foreground">
          The <code class="px-1.5 py-0.5 bg-muted rounded">1.x</code> line targets Angular
          <code class="px-1.5 py-0.5 bg-muted rounded">^21.2</code> and Node 20 or newer. Volt UI
          supports the latest declared Angular major only — widening that range requires
          consumer-fixture verification, not just a successful build, so it's never assumed.
        </p>
        <p class="text-muted-foreground">
          When a new Angular major ships, moving Volt UI's support to it is a minor release with
          migration notes or release notes documenting anything that changed. A supported major is
          never dropped silently.
        </p>
      </div>

      <div class="p-4 rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
        Full per-component status table:
        <a routerLink="/docs/components" class="text-primary underline-offset-4 hover:underline"
          >component catalog</a
        >. Upgrading an existing copy?
        <a
          routerLink="/docs/migration-notes"
          class="text-primary underline-offset-4 hover:underline"
          >0.x Migration Notes</a
        >. Full release history:
        <a
          href="https://github.com/Andersseen/volt-ui/blob/main/CHANGELOG.md"
          target="_blank"
          rel="noopener"
          class="text-primary underline-offset-4 hover:underline"
          >CHANGELOG.md</a
        >.
      </div>
    </div>
  `,
})
export default class VersioningPage {}
