---
title: 'Form Field'
description: 'Доступна обгортка поля форми з підписом, підказкою та текстом помилки.'
group: 'Форми'
order: 10
---

## Приклад

::demo[form-field-example]

Приклад вище — це цей файл, відрендерений наживо:

::source{file="apps/web/src/app/doqs/examples/form-field-example.ts" title="form-field-example.ts"}

## Пісочниця

Змінюйте вхідні параметри та взаємодійте з попереднім переглядом: панель подій показує, що випромінює компонент, а код відповідає вашим налаштуванням.

::playground[form-field]

## Форми та доступність

- Усередині `<volt-form-field>` елемент `<volt-label>` підписує елемент керування через `aria-labelledby`, а клік по ньому переводить фокус на елемент керування. Id не потрібні; поза form field використовуйте `<volt-label htmlFor>`.
- `<volt-hint>` завжди входить до опису елемента керування (`aria-describedby`).
- `<volt-error>` додається до опису, поки він відрендерений і валідатори елемента керування не проходять, і зникає з нього після видалення: посилання на видалене повідомлення не лишається.
- `aria-invalid="true"` ставиться на сам елемент керування (а не на обгортку), щойно він невалідний і торкнутий, тож помилку передає не лише колір.
- **Оголошення помилок:** `<volt-error>` — це сповіщення (alert), яке оголошується в момент вставлення. Рендеріть його, коли користувач покинув поле або надіслав форму (`@if (control.touched && control.invalid)`), як у прикладі, а не на кожне натискання клавіші. Для валідації, що має чекати, поки користувач покине поле, використовуйте `updateOn: 'blur'` з Angular.
- Один елемент керування на form field. Працює з `volt-input`, `volt-textarea`, `volt-select` і нативними елементами з `ngpInput`.

## Довідник API

::demo[api-form-field]

## Встановлення

Скопіюйте вихідний код у свій проєкт:

```bash
npx @voltui/cli add form-field
```

Або імпортуйте його з пакета:

```bash
npm install @voltui/components
```

## Вихідний код

Скопіюйте цей код у свій проєкт. Компонент використовує `ng-primitives/form-field`.

::source{file="packages/volt/src/lib/components/form-field/form-field.ts" title="form-field.ts"}

::source{file="packages/volt/src/lib/components/form-field/form-field-label.ts" title="form-field-label.ts"}

::source{file="packages/volt/src/lib/components/form-field/form-field-hint.ts" title="form-field-hint.ts"}

::source{file="packages/volt/src/lib/components/form-field/form-field-error.ts" title="form-field-error.ts"}
