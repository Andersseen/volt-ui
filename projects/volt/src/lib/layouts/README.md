# Volt UI layouts

Layouts are multi-component compositions rather than single elements. They ship in the same
package as the components (`@voltui/components`) and are copied by the CLI the same way
(`npx @voltui/cli add sidebar`), but they own more structure, so their configuration points are
documented here.

## Sidebar

```typescript
import {
  VoltSidebar,
  VoltSidebarHeader,
  VoltSidebarContent,
  VoltSidebarGroup,
  VoltSidebarItem,
  VoltSidebarFooter,
  VoltSidebarService,
} from '@voltui/components';
```

State lives in `VoltSidebarService` (`providedIn: 'root'`), not in inputs:
`isCollapsed()` and `isMobileOpen()` are signals, with `toggleCollapse()`, `toggleMobile()`,
`setCollapsed()` and `setMobileOpen()` to drive them.

### Width

`volt-sidebar` is **18rem** expanded and **4rem** collapsed by default. Both are configurable,
and both accept any CSS length — `rem`, `px`, `%`, `vw`, `clamp()`, a `calc()` expression.

Per instance, with inputs:

```html
<volt-sidebar width="20rem" collapsedWidth="4.5rem">…</volt-sidebar>
```

App-wide (or responsively, or per theme), with custom properties:

```css
:root {
  --volt-sidebar-width: 20rem;
  --volt-sidebar-collapsed-width: 4.5rem;
}

@media (min-width: 1536px) {
  :root {
    --volt-sidebar-width: 22rem;
  }
}
```

The custom properties inherit, so setting them on any ancestor works. For a **resizable**
sidebar, write `--volt-sidebar-width` from a drag handle:

```html
<volt-sidebar [style.--volt-sidebar-width.px]="dragWidth()">…</volt-sidebar>
```

The `<aside>` carries `transition-all duration-300`, which animates the width change. That is what
you want for a collapse toggle, but it lags behind the pointer during a drag — suppress it while
dragging (`[class.transition-none]` on a wrapper, or `* { transition: none }` on a `.is-resizing`
body class).

Precedence is **input → custom property → default**. Because the width is resolved on the
internal `<aside>`, app CSS that reaches into that element to resize it is no longer needed —
use one of the two supported paths instead, and it will survive changes to the internal markup.

| Input            | Type     | Default                                     |
| ---------------- | -------- | ------------------------------------------- |
| `width`          | `string` | `var(--volt-sidebar-width, 18rem)`          |
| `collapsedWidth` | `string` | `var(--volt-sidebar-collapsed-width, 4rem)` |

### Item slots

`volt-sidebar-item` projects two named slots:

```html
<volt-sidebar-item routerLink="/inbox" label="Inbox">
  <lucide-icon name="mail" slot="icon" class="h-4 w-4" />
  <span slot="trailing" class="ml-auto text-xs">3</span>
</volt-sidebar-item>
```

- `slot="icon"` renders in **both** collapsed and expanded modes.
- `slot="trailing"` renders only while expanded, where there is room for it.

The item renders a single `<a>` for both modes, with the differences driven by classes and one
`@if`. That is deliberate: Angular assigns projected nodes to a slot at compile time, so the same
`<ng-content select="[slot=…]">` duplicated across two template branches binds the content to
whichever branch is declared first and leaves the other permanently empty. Keep one
`<ng-content>` per slot name if you edit this template.

While collapsed, the item's `label` is shown as a tooltip on the right; expanded, the tooltip is
disabled and the label renders inline.
