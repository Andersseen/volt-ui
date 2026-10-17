---
name: volt-ui-overlays
description: >
  Compose Volt UI overlays correctly: Dialog (trigger vs controlled vs service), Drawer, Popover,
  Tooltip, Dropdown Menu and Toast. Covers dismissible while pending, initial focus, focus return,
  nested overlays, Dialog vs Drawer, Popover vs Tooltip, Toast vs Alert. Use when opening anything
  above the page.
---

# Volt overlays

Dialog, Drawer, Popover, Tooltip and Dropdown Menu share one pattern: an attribute directive on the
trigger, and the overlay declared in an `<ng-template>` the trigger references. Exact markup:
MCP `get_usage_example`. Never import `Ngp*` — Volt exports everything a consumer needs.

## Dialog

Three ways to open one; pick by who owns the state.

- **Trigger-driven**: `<button [voltDialog]="tpl">`. The simplest; the dialog owns open state.
- **Controlled**: `<ng-template voltDialogRoot [(open)]="editing">`. Application state decides —
  CRUD forms, anything you open from code paths with no trigger element.
- **Service**: `VoltDialogService.open(tpl, { role: 'alertdialog' }).closed` — an imperative
  confirm that returns a promise-like result.

Rules:

- Always give it a title (`voltDialogTitle`) and a description (`voltDialogDescription`): they name
  the dialog for assistive technology.
- A destructive confirm is `role="alertdialog"`, with focus on the **safe** action
  (`initialFocus="[data-cancel]"`).
- **While a request is pending, set `[dismissible]="false"`** so Escape and overlay clicks do
  nothing; `close()` always works. `[dismissible]` is live; `closeOnEscape` / `closeOnClick` are only
  read when it opens.
- Focus moves in on open, is trapped, and returns to the trigger on close. Do not move it yourself
  except to choose the initial target.
- Nested dialogs are fine; close the inner first. Do not open a dialog from a tooltip.

## Dialog vs Drawer vs Popover

| Use      | When                                                                  |
| -------- | --------------------------------------------------------------------- |
| Dialog   | the user must decide before continuing                                |
| Drawer   | a secondary panel or small-screen navigation; keeps context beside it |
| Popover  | small contextual content anchored to a control; may contain controls  |
| Tooltip  | a short name or hint for a control; **never** the only copy of it     |
| Dropdown | a list of commands; for choosing a value use Select                   |

A Popover can hold a form control; a Tooltip cannot hold anything interactive.

## Toast vs Alert

- `Toast` (via the toast service): a transient confirmation of something that already happened
  ("Saved"). It disappears; never rely on it for an error the user must read.
- `Alert`: part of the page, persistent until the condition clears. Errors and blocking states.

## Triggers and focus

- The trigger must be a real `<button>` (or `<a>` for navigation). Style it with `voltButton`.
- Escape closes, outside click dismisses (unless the overlay is not dismissible), focus returns to
  the trigger. If you see any of these not happening, the overlay was built wrong — check against
  the usage example before patching.
- Portals escape their container: do not rely on a parent's `overflow` or `z-index`.

<!-- volt:digest:start -->

- Dialog: trigger-driven `[voltDialog]`, controlled `voltDialogRoot [(open)]`, or `VoltDialogService`; always title + description; `[dismissible]="false"` while a request is pending.
- Destructive confirm → `role="alertdialog"` with initial focus on the safe action. Focus is trapped and returns to the trigger; do not manage it by hand.
- Overlays are an attribute directive on a real `<button>` plus an `<ng-template>`. Never import `Ngp*`.
- Toast is transient confirmation; Alert is persistent page feedback.

<!-- volt:digest:end -->
