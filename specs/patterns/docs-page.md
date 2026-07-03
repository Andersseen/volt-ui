# Pattern — Docs Page & Snippet Registration

Every public component needs: demo page + source snippet + usage snippet. This is
GUARDRAILS "ripple effects" 2–4 spelled out. Reference: `checkbox`.

## 1. Demo page

`src/app/pages/(components-docs)/docs/components/<name>.page.ts` — file-based routing:
the file name IS the route (`/docs/components/<name>`). Real shape at v0.4.0:

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltCheckbox, VoltLabel } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { CHECKBOX_SNIPPET } from '../../../../lib/snippets';
import { CHECKBOX_USAGE } from '../../../../lib/snippets/usage';

@Component({
  selector: 'app-checkbox-demo',
  standalone: true,
  imports: [VoltCheckbox, VoltLabel, CodePanel],
  templateUrl: './checkbox.component.html', // some pages use inline template — either is fine
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CheckboxDemo {
  // NOTE: default export — required by Analog
  readonly checkboxCode = CHECKBOX_SNIPPET;
  readonly checkboxUsage = CHECKBOX_USAGE;
}
```

Rules: import library components from the `volt` alias (never relative paths into
`projects/`); `export default`; pass source+usage to `CodePanel` like sibling pages do
(open one sibling page and mirror its template structure).

## 2. Source snippet — `src/app/lib/snippets/index.ts`

Two lines per component file (import with `?raw`, then export):

```ts
import checkboxSource from '../../../../projects/volt/src/lib/components/checkbox/checkbox.ts?raw';
// ...
export const CHECKBOX_SNIPPET = checkboxSource;
```

Components with `variants.ts` also export their variants source (see existing entries —
follow the established naming, e.g. `BUTTON_VARIANTS_SNIPPET`).

## 3. Usage snippet — `src/app/lib/snippets/usage.ts`

A template-string constant showing minimal real usage (imports + template). Mirror the
format of the neighboring entries in that file. Keep it copy-paste runnable for a
consumer (use `ui-*`?—no: usage snippets show the library form the docs demo uses;
follow whatever the sibling entries do).

## 4. After any of the above

```bash
pnpm manifest        # regenerate public/manifest.json
pnpm typecheck && pnpm lint
pnpm dev             # optional: verify /docs/components/<name> renders
```

## Common mistakes (all have broken CI before)

- Missing `export default` on the page → route 404s.
- Snippet import path wrong by one `../` → vite build error.
- Adding a component file but not its `?raw` snippet import → "Copy code" shows stale source.
- Forgetting `pnpm manifest` → CLI `volt add` copies an incomplete file set.
