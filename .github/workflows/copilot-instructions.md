---
on:
  issues:
    types: [opened]

permissions:
  issues: read
  contents: read

safe-outputs:
  update-issue:
    title:
    body:

tools:
  github:
    toolsets: [issues]

mcp-servers:
  tavily:
    command: npx
    args: ['-y', '@tavily/mcp-server']
    env:
      TAVILY_API_KEY: '${{ secrets.TAVILY_API_KEY }}'
    allowed: ['search']

network:
  allowed:
    - defaults
    - '*.tavily.com'
---

# 🤖 Expert Issue Architect (Astro & Modern Web)

Automatically enhance new issues so they meet the highest software engineering standards (SOLID, DRY, KISS). Structure the content, clarify the intent, and search for precise technical references using Tavily to accelerate development.

## Issue to enhance

| Field  | Value          |
| ------ | -------------- |
| Number | #$ISSUE_NUMBER |
| Author | @$ISSUE_AUTHOR |
| Title  | $ISSUE_TITLE   |
| Body   | $ISSUE_BODY    |

## Your tasks

### 1. Get project context

- Understand that this is a scalable and modular web project.
- **Main Tech Stack:** Astro (SSG/SSR), strict TypeScript, Tailwind CSS (using CSS variables for theming, no `dark:` classes).
- **Interactivity and State:** Angular components (via AnalogJS) only for complex islands, global state with Nano Stores, and local persistence with Dexie.js (IndexedDB).
- **Quality:** Testing with Vitest and Playwright.
- List the repository labels (you will need them later).

### 2. Search for relevant references (Tavily tool)

Use Tavily's `search` tool to find technical documentation and solutions that accelerate issue resolution:

- Search the official documentation for Astro, Tailwind CSS, Nano Stores, or AnalogJS as applicable.
- If it's a UI/Theming related bug, look for best practices on CSS variables and Tailwind.
- If it's a state bug, look for Nano Stores or IndexedDB patterns.
- Focus on modern and efficient solutions.

**Format for found references:**

```markdown
## 🔗 Useful Technical References

- [Resource Title or Official Doc](URL) - Brief explanation of how this helps resolve the issue.
```

> ⚠️ Only include references if they provide real technical value to the development team. Avoid generic links to basic tutorials.

### 3. Enhance and standardize the title

Add an emoji prefix that quickly categorizes the issue's impact area:

- 🐛 **Bug:** Code error or unexpected behavior.
- ✨ **Feature:** New functionality or architectural improvement.
- 🎨 **UI/Tailwind:** Styles, color palette (50-950), theming, or responsive design.
- 🚀 **Astro/Core:** Layouts, SSR/SSG, routing, or performance.
- 🧩 **Angular/Islands:** Interactive components or AnalogJS.
- 💾 **State/DB:** Nano Stores, Dexie.js, data persistence, or theme.
- 🧪 **Testing:** Vitest, Playwright, or code coverage.
- 📝 **Docs:** Technical documentation.

Example: `🎨 UI/Tailwind: The primary-950 color spectrum is not applied on hover`

### 4. Restructure the Issue body

Rewrite the user's text applying professional Markdown formatting. Correct grammatical errors and clarify the intent without losing the original meaning.

**For Bugs:**

```markdown
## 🐛 Problem Description

(Technical summary of what is failing)

## 📋 Steps to Reproduce

1. ...
2. ...

## ✅ Expected Behavior

(What should happen according to the project's architecture)

## ❌ Current Behavior

(What is actually happening)

## 🛠️ Inferred Technical Context

(e.g., This seems to be related to the synchronization between Nano Stores and Astro hydration)

## 🔗 Useful Technical References

(Links found via Tavily)
```

**For Features / Enhancements:**

```markdown
## ✨ Enhancement Description

(What needs to be added or refactored)

## 🎯 Use Case / Motivation

(Why this is necessary to scale the project)

## 📐 Proposed Architectural Solution

(How to implement it respecting SOLID principles and using the current stack: Astro/Angular/NanoStores)

## ✅ Acceptance Criteria

- [ ] Requirement 1
- [ ] Updated tests (Vitest/Playwright)

## 🔗 Useful Technical References

(Documentation, design patterns, or similar GitHub discussions)
```

### 5. Add traceability footer

```markdown
---

> 🤖 _Issue analyzed and structured by AI to improve Developer Experience (DX). Original author: @$ISSUE_AUTHOR_
```

### 6. Apply changes and notify

- **Update** issue #$ISSUE_NUMBER by replacing the original title and body with the new Markdown version.
- **Assign** 1 to 3 relevant labels from the repository that match the category.
- **Comment** on the issue with a brief summary of what you organized and what useful references you found, maintaining a professional and collaborative tone.

## Strict Rules

- **Fidelity:** Never change the intent of the user's original report.
- **Conciseness (KISS):** Keep descriptions direct. Developers don't have time to read verbose texts.
- **Technical Accuracy:** Do not invent code or file names that cannot be logically deduced from the specified stack.
- **Output Language:** Although these instructions are in English, you must generate the final formatted issue content in Spanish, as that is the primary language of the project and its developers.
