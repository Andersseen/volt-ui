---
title: Workflow patterns
description: What the settings form, async search and data table patterns solve, which state is yours, where your services plug in and how loading, errors and recovery work.
group: Concepts
order: 2
---

A pattern is a complete, tested piece of behaviour built from Volt components. Volt supplies the controls and their accessibility; the **state and the requests stay in your component**, as plain Angular signals. Each pattern has exactly one function to replace with your service.

## Settings form

::demo[settings-form]

**Solves** editing a saved record — a profile, preferences — with validation, one save at a time and recovery that never loses what was typed.

**Use it when** the record is loaded, edited and saved as a whole. For a single toggle that saves instantly, a form is too much.

**Built from** Form Field, Input, Native Select, Switch, Alert and Button.

**Your state**: the `FormGroup` and its validators, the last saved values (the baseline that decides what "unsaved changes" means), whether a save is pending, and the last result.

**Connect** your API by replacing `fakeSave`, or pass `(value) => Promise<Settings>` to the `[save]` input. What it resolves becomes the new baseline.

**Loading, errors, recovery**: an invalid submit shows every error and focuses the first invalid field. While saving, Save and Cancel use `aria-disabled`, so keyboard focus stays where it was, and the fields stay editable. A failure keeps the input, explains what happened, and pressing Save again retries. Anything typed during a save is kept as unsaved.

## Async search

::demo[async-search]

**Solves** searching data that only the server can match — by email, alias or a remote index — and choosing one result.

**Use it when** the list is too big to load or the matching rules live on the server. When you already have the list, a plain Combobox filters it for you.

**Built from** Combobox (`filterMode="manual"`), Form Field, Alert and Button.

**Your state**: the query, the results, loading and error, a request ticket so a slow old response can never overwrite a newer one, and the selected item, kept apart from the results so a failed search does not clear it.

**Connect** your API by replacing `fakeSearch`, or pass `(query) => Promise<Person[]>` to `[search]`. Keep `filterMode="manual"`: otherwise Volt filters your server's results again by their label.

**Loading, errors, recovery**: typing is debounced; the combobox shows loading and empty text. A failed request shows an alert with Retry and keeps the current selection. Choosing an option never starts a new search.

## Data table

::demo[data-table]

**Solves** a paged list with sorting, filtering and every state a real service produces. There is no `VoltDataTable` on purpose: the behaviour is a few signals that depend on your data.

**Use it when** rows come from a service page by page. For a short static list, a Table on its own is enough.

**Built from** Table, Pagination, Input, Badge, Skeleton and Alert.

**Your state**: the query (filter, sort column and direction, page, page size), the current rows and the totals, loading and error.

**Connect** your API by replacing `fakeFetch` with `(query) => Promise<InvoicePage>`. Keep the request shape, so sorting and paging stay on the server.

**Loading, errors, recovery**: skeleton rows on the first load; on later loads the previous rows stay, dimmed and marked busy. An empty dataset and a filter with no match are different states, each with a way forward. A failed request shows an alert with Retry and keeps any rows already shown. Changing the filter returns to page 1.

## What not to change

Keep the request policy (debounce, latest response wins, one save at a time) in your component, not inside a copied Volt component: the components are meant to be reused by other screens with other rules.
