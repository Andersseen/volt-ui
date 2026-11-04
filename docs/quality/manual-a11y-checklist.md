# Manual assistive-technology checklist

**Status: NOT TESTED.** No screen-reader session has been run for the 1.4 verification. Automated
evidence (axe, ARIA assertions, keyboard and focus in three browser engines) is in
[`headless-contract-verification.md`](headless-contract-verification.md); it does not replace this.

Run each row with **both** backends — the Quartz consumer fixture serves the same page for each
(`node scripts/check-quartz-consumer.mjs 22 --keep`, then serve `dist/primitives/browser` and
`dist/quartz/browser` from the kept folder with `node scripts/serve-static.mjs <dir> <port>`). For the
other families use `pnpm test:e2e:contracts` fixtures (`/contracts.html#<fixture>`) or voltui.dev.

Pairs to cover at least once: **VoiceOver + Safari** (macOS), **NVDA + Firefox** (Windows), and
**TalkBack + Chrome** (Android) for one form and one overlay. Record the tester, date, AT and browser
versions, backend, and PASS / FAIL with a sentence per failure.

| #   | Component   | Steps                                                                       | Expected announcement / behaviour                                                                                                                                 |
| --- | ----------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Checkbox    | Tab to "Accept terms", Space, then to "Mixed box" and Space                 | "Accept terms, checkbox, not checked" → "checked"; mixed is announced as "mixed" / "half checked" before activation                                               |
| 2   | Switch      | Tab to "Notifications", Space                                               | Role switch (or toggle button), state on/off changes once per press                                                                                               |
| 3   | Toggle      | Tab to "Bold", Space then Enter                                             | "toggle button, pressed / not pressed"; disabled toggle is announced dimmed or skipped                                                                            |
| 4   | RadioGroup  | Tab into "Fruit", arrow keys                                                | Group name read on entry; "Pear, radio, checked, 2 of 3"; arrows select and announce the new radio only                                                           |
| 5   | ToggleGroup | Tab into "Alignment" (single) and "Format" (multiple)                       | Single: radio-like "checked"; multiple: "pressed" per item; arrows move without selecting                                                                         |
| 6   | Tabs        | Tab into "Account sections", arrows; then "Manual sections", arrows + Enter | "tab, selected, 1 of 3"; panel is reachable with Tab and named after its tab; manual mode selects only on Enter/Space                                             |
| 7   | Accordion   | Tab to "Shipping", Enter; browse with the virtual cursor                    | "button, collapsed/expanded"; the region "Shipping" exists only while open; closed content is never read                                                          |
| 8   | Listbox     | Tab to "Stack", arrows, Space; "Tags" (multiple)                            | Active option announced with selection state; group "Frameworks" named; multiselectable announced for Tags                                                        |
| 9   | Select      | Tab to "Meta framework", Enter, arrows, Enter; Escape                       | "combobox, collapsed, nuxt"; options announced with selected state and position; after choosing, focus and announcement return to the combobox with its new value |
| 10  | Dialog      | Open, Tab around, Escape                                                    | Dialog role and title announced on open; focus trapped; focus returns to the opener                                                                               |
| 11  | Toast       | Trigger a success and an error toast                                        | Success is announced politely, error assertively, each exactly once                                                                                               |
| 12  | Form field  | Leave "Workspace" empty and blur                                            | "invalid entry" + the error text is read as the description                                                                                                       |

Anything that fails here is a defect against the Volt contract, whatever the axe result.
