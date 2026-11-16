---
title: 'Select'
description: 'Показує список варіантів на вибір, який відкриває кнопка.'
group: 'Форми'
order: 13
---

## Приклад

::demo[select-example]

Приклад вище — це цей файл, відрендерений наживо:

::source{file="apps/web/src/app/doqs/examples/select-example.ts" title="select-example.ts"}

### Нативний select

Легша альтернатива до `volt-select` для простих випадків: це справжній нативний елемент `<select>` (повна поведінка мобільного та системного вибору, працює з `formControl`/`ngModel` без зусиль), стилізований під тему.

::demo[native-select-example]

::source{file="apps/web/src/app/doqs/examples/native-select-example.ts" title="native-select-example.ts"}

## Пісочниця

Змінюйте вхідні параметри та взаємодійте з попереднім переглядом: панель подій показує, що випромінює компонент, а код відповідає вашим налаштуванням.

::playground[select]

## Форми та доступність

- Тригер — це нативний `<button role="combobox">` з `aria-expanded`, а поки список відкритий — з `aria-controls`, що вказує на спливний `role="listbox"`, і `aria-activedescendant` — на активний `role="option"`. Вибрані варіанти мають `aria-selected="true"`, вимкнені — `aria-disabled="true"`.
- Назвіть його через `<volt-label>` усередині `<volt-form-field>` або через `aria-label`. `required` задає `aria-required`.
- Клавіатура: стрілки відкривають список і переміщують між варіантами (пропускаючи вимкнені), Home і End переходять до першого й останнього, поки список відкритий, Enter або пробіл вибирають, Escape закриває, і фокус повертається на тригер. Введення літери не переходить до варіанта (пошуку за першими символами немає); для довгих списків використовуйте Listbox або Combobox.
- Спливний список додається до `<body>` (`container`) і перевертається, щоб лишатися у вікні (`flip`); він видаляється, коли select закривається або знищується.
- З Forms вибір повідомляє значення один раз. Елемент керування позначається торкнутим, коли фокус залишає select, — а не коли натискання вказівником переносить фокус у список, — тож обов’язковий select не показує помилку, поки користувач вибирає.
- Тригер показує значення через `displayWith` (за замовчуванням `String(value)`), бо підписи варіантів не рендеряться, поки список закритий. Передайте `displayWith`, щоб показати підпис.
- Точка входу Quartz: той самий контракт, без `container`, `scrollToOption` і `allOptions`.

## Довідник API

::demo[api-select]

## Встановлення

Скопіюйте вихідний код у свій проєкт:

```bash
npx @voltui/cli add select
```

Або імпортуйте його з пакета:

```bash
npm install @voltui/components
```

## Вихідний код

Скопіюйте цей код у свій проєкт. Компонент використовує `ng-primitives/select`.

::source{file="packages/volt/src/lib/components/select/select.ts" title="select.ts"}

::source{file="packages/volt/src/lib/components/select/select-content.ts" title="select-content.ts"}

::source{file="packages/volt/src/lib/components/select/select-item.ts" title="select-item.ts"}
