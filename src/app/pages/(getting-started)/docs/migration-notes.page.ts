import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-migration-notes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">0.x Migration Notes</h1>
        <p class="text-lg text-muted-foreground mt-2">
          Volt UI's public API is frozen as of 1.0.0 — see
          <a routerLink="/docs/versioning" class="text-primary underline-offset-4 hover:underline"
            >Versioning &amp; stability</a
          >
          for the current promise. Because components are copied into your project rather than
          installed as a dependency, "upgrading" means re-running
          <code class="px-1.5 py-0.5 bg-muted rounded">volt add &lt;component&gt;</code> (or
          <code class="px-1.5 py-0.5 bg-muted rounded">--force</code> to overwrite) and diffing —
          nothing updates silently underneath you. This page covers the changes across the pre-1.0
          <code class="px-1.5 py-0.5 bg-muted rounded">0.x</code> releases that actually required
          touching template code when upgrading; see
          <a
            href="https://github.com/Andersseen/volt-ui/blob/main/MIGRATION.md"
            target="_blank"
            rel="noopener"
            class="text-primary underline-offset-4 hover:underline"
            >MIGRATION.md</a
          >
          for the 0.x → 1.0 upgrade guide specifically. Sourced from
          <a
            href="https://github.com/Andersseen/volt-ui/blob/main/CHANGELOG.md"
            target="_blank"
            rel="noopener"
            class="text-primary underline-offset-4 hover:underline"
            >CHANGELOG.md</a
          >. Most 0.x releases were additive; those aren't listed here.
        </p>
      </div>

      <div class="w-full h-px bg-border"></div>

      <!-- Actionable breaking changes -->
      <div class="space-y-6">
        <h2 class="text-xl font-semibold tracking-tight">Changes that need action</h2>

        <div class="space-y-3 p-4 rounded-lg border border-border">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-muted">0.4.0</span>
            <h3 class="font-medium">Button defaults to <code>type="button"</code></h3>
          </div>
          <p class="text-sm text-muted-foreground">
            Before 0.4.0, a
            <code class="px-1.5 py-0.5 bg-muted rounded">&lt;volt-button&gt;</code> with no explicit
            <code>type</code> fell through to the browser default inside a
            <code>&lt;form&gt;</code>, which is <code>"submit"</code>. If you had a button that
            relied on that implicit submit behavior, it now does nothing until you set
            <code class="px-1.5 py-0.5 bg-muted rounded">type="submit"</code> explicitly.
          </p>
          <div class="p-3 rounded-md bg-muted/30 font-mono text-xs">
            &lt;volt-button type="submit"&gt;Save&lt;/volt-button&gt;
            <span class="text-muted-foreground">&nbsp;&nbsp;// was implicit, now required</span>
          </div>
        </div>

        <div class="space-y-3 p-4 rounded-lg border border-border">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-muted">0.2.0</span>
            <h3 class="font-medium">Boolean inputs normalized to <code>booleanAttribute</code></h3>
          </div>
          <p class="text-sm text-muted-foreground">
            <code class="px-1.5 py-0.5 bg-muted rounded">disabled</code>,
            <code class="px-1.5 py-0.5 bg-muted rounded">required</code>,
            <code class="px-1.5 py-0.5 bg-muted rounded">multiple</code>, and similar boolean inputs
            across the library switched from plain JS-truthiness checks to Angular's
            <code>booleanAttribute</code> transform. This mainly matters if you were passing a
            string in a template attribute position — <code>disabled="false"</code> as a bare
            attribute is now correctly treated as <code>false</code>, where a naive truthiness check
            would previously have treated the non-empty string <code>"false"</code> as truthy.
          </p>
        </div>
      </div>

      <!-- Additive / non-breaking, but worth knowing about -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Additive changes worth adopting</h2>
        <p class="text-muted-foreground">
          These didn't require any change to keep working, but the newer pattern is what current
          docs and snippets show.
        </p>

        <div class="space-y-3 p-4 rounded-lg border border-border">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono px-2 py-0.5 rounded bg-muted">0.7.0</span>
            <h3 class="font-medium">
              Reactive Forms support added to combobox, listbox, input-OTP
            </h3>
          </div>
          <p class="text-sm text-muted-foreground">
            These now implement <code>ControlValueAccessor</code> in addition to their existing
            <code class="px-1.5 py-0.5 bg-muted rounded">[(value)]</code>-style model binding — the
            old binding still works unchanged. Prefer
            <code class="px-1.5 py-0.5 bg-muted rounded">formControlName</code> /
            <code>[formControl]</code> going forward for validation state
            (<code>aria-invalid</code>, disabled propagation, touched) that model binding alone
            doesn't give you.
          </p>
        </div>
      </div>

      <!-- Internal fixes with no consumer action -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Internal fixes (no action needed)</h2>
        <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>
            <span class="font-mono text-xs px-1.5 py-0.5 rounded bg-muted">0.6.0</span>
            <code>VoltSelect</code> declared <code>valueChange</code> twice; deduplicated so
            <code>value = model(...)</code> owns the single generated output. A normal
            <code>(valueChange)</code> subscriber was never affected.
          </li>
          <li>
            <span class="font-mono text-xs px-1.5 py-0.5 rounded bg-muted">0.6.0</span>
            Keyboard-opened dropdown menus now correctly move focus to the first visible item.
          </li>
        </ul>
      </div>

      <div class="p-4 rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
        Nothing on this page applies to a component you haven't copied yet — a fresh
        <code class="px-1.5 py-0.5 bg-muted rounded">volt add</code> always gives you the current
        behavior. This page is for diffing an existing copy. See the
        <a routerLink="/docs/customization" class="text-primary underline-offset-4 hover:underline"
          >Customization guide</a
        >
        for how to carry your own edits forward across a re-add.
      </div>
    </div>
  `,
})
export default class MigrationNotesPage {}
