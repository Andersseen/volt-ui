---
title: 'Теми'
description: 'Налаштуйте вигляд і відчуття вашого застосунку за допомогою вбудованих тем, кольорів і підтримки темного режиму.'
group: 'Перші кроки'
order: 2
---

## Доступні теми

Volt UI постачається з п’ятьма кольоровими пресетами. Кожен задає власну палітру для основного, другорядного, поверхневого та семантичних кольорів.

::demo[theme-presets]

## Налаштування теми

Додайте провайдер теми до конфігурації свого застосунку:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideVoltTheme } from '@voltui/components';

export const appConfig: ApplicationConfig = {
  providers: [provideVoltTheme({ color: 'volt', style: 'soft', dark: false })],
};
```

## Кольорові варіанти

### Кольори теми

Оберіть основну кольорову палітру:

- `'volt'` — синій (за замовчуванням)
- `'ember'` — помаранчевий/червоний
- `'sage'` — зелений
- `'dusk'` — фіолетовий
- `'glacier'` — блакитний

### Варіанти стилю

Оберіть стиль своїх компонентів:

- `'sharp'` — малий радіус, пласкі тіні (за замовчуванням)
- `'soft'` — великий радіус, розсіяні тіні
- `'brutal'` — без радіуса, жорсткі зміщені тіні, товсті рамки
- `'ghost'` — без рамок, без тіней
- `'retro'` — вигляд у стилі Y2K

### Щільність

`density` масштабує висоту елементів керування, відступи та проміжки через `--volt-density`: `compact` (0.875), `comfortable` (1, за замовчуванням) або `spacious` (1.125). Задайте її для всього документа через `provideVoltTheme` / `applyVoltTheme` або додайте `data-density` будь-якому контейнеру, щоб змінити лише цю ділянку.

## API під час виконання

Дві функції з `@voltui/components` керують темою під час виконання. Обидві лише виставляють `data-color`, `data-style`, `data-density` і клас `.dark` (із відповідним `color-scheme`) на `<html>` — прихованого стану немає, тож результат можна будь-коли переглянути чи перевизначити звичайними DOM API.

### `provideVoltTheme(options)`

Провайдер середовища. Викличте його один раз у `appConfig.providers`, щоб задати тему під час запуску — і на сервері, і на клієнті.

**Безпечно для SSR.** Читає токен впровадження `DOCUMENT` від Angular, а не глобальний `document`, тож атрибути теми присутні вже у відрендереному на сервері HTML — без спалаху теми за замовчуванням під час гідратації клієнтського бандла.

### `applyVoltTheme(options, doc?)`

Звичайна функція. Викликайте її з обробника кліку, з effect або звідусіль, де треба змінити тему після запуску (наприклад, із перемикача тем).

За замовчуванням лише для браузера (нічого не робить, якщо `document` не визначено). Передайте явний аргумент `doc`, щоб націлитися на інший документ, наприклад у тесті.

```ts
// app.config.ts — set the theme at bootstrap
import { ApplicationConfig } from '@angular/core';
import { provideVoltTheme } from '@voltui/components';

export const appConfig: ApplicationConfig = {
  providers: [provideVoltTheme({ color: 'ember', style: 'soft' })],
};
```

## Стратегія темного режиму

Темний режим працює через клас: додавання `.dark` до `<html>` перемикає кожен компонент на його темні значення токенів (див. `@custom-variant dark` у `core.css`). Volt **не** читає `prefers-color-scheme` автоматично: `dark` за замовчуванням світлий, доки ви не передасте `dark: true` або не викличете `applyVoltTheme` самі, тож вибір завжди явний і не зміниться мовчки, якщо відвідувач змінить тему своєї системи.

```ts
import { applyVoltTheme, provideVoltTheme } from '@voltui/components';

// Static: dark by default (in your appConfig providers)
export const themeProviders = [provideVoltTheme({ color: 'volt', dark: true })];

// Dynamic: toggle from a button, a signal, etc.
applyVoltTheme({ dark: true });

// Opt in to following the OS preference yourself
const media = matchMedia('(prefers-color-scheme: dark)');
applyVoltTheme({ dark: media.matches });
media.addEventListener('change', e => applyVoltTheme({ dark: e.matches }));
```

### Запам'ятати вибір відвідувача без спалаху

`provideVoltTheme` рендерить тему, яку ви налаштували. Тема, яку обрав відвідувач, живе в його браузері, тож сервер про неї не знає, і сторінка спершу намалювалася б у темі за замовчуванням. `voltThemeInitScript()` повертає кілька рядків JavaScript, які читають збережене `persistVoltTheme` і застосовують його до першого малювання; вбудуйте їх на початку `<head>`. Якщо немає збереженого `dark` і `defaults.dark`, скрипт слідує `prefers-color-scheme` (`followSystem: false` це вимикає). Невідомі значення ігноруються, а `storageKey` змінює ключ, який використовують обидві функції.

```ts
import { persistVoltTheme, voltThemeInitScript } from '@voltui/components';

// When the visitor picks a theme: store it (localStorage, key "volt-theme") and apply it.
persistVoltTheme({ dark: true });

// Once, at build or server-render time: the source of the inline script for <head>.
const script = voltThemeInitScript({ defaults: { color: 'volt', style: 'soft' } });
```

```html
<head>
  <script>
    /* paste the output of voltThemeInitScript() here, or write it from your server template */
  </script>
  <!-- stylesheets after it -->
</head>
```

Скрипт лише читає сховище й ставить `data-color`, `data-style`, `data-density` і `.dark` на `<html>`, так само як `applyVoltTheme`, тож суворій Content Security Policy потрібен його хеш або nonce, як і будь-якому вбудованому скрипту.

> [!NOTE]
> Сайт документації сам зберігає вибір відвідувача в cookie, спільному з Volt UI Recipes (зі старими ключами `localStorage` як запасним варіантом), і застосовує його невеликим вбудованим скриптом у `<head>` файлу `index.html`, ще до завантаження будь-якої таблиці стилів — див. `packages/shared/components/theme-switcher.ts` і `packages/shared/lib/theme-preferences.ts` у репозиторії як зразкову реалізацію, якщо хочете таку саму поведінку без спалаху.

## CSS-змінні

Кожен пресет задає той самий набір семантичних токенів значеннями `oklch()`. Компоненти беруть їх через утиліти Tailwind (`bg-primary`, `text-muted-foreground`), зіставлені через `@theme inline` у `core.css`, і ніколи через сирий `var(--primary)`. Це повний перелік того, що може визначити пресет; шаблони для копіювання — у двох посібниках нижче.

```css
/* Color tokens — one block per data-color, one per .dark[data-color] */
--background / --foreground
--surface / --surface-foreground        /* cards */
--surface-elevated                      /* popovers, menus, dialogs; derived, may be set */
--track                                 /* the unfilled part of Progress, Meter, Slider; derived */
--muted / --muted-foreground
--border / --input / --ring             /* --input is the form-control border */
--primary / --primary-foreground
--secondary / --secondary-foreground    /* a quiet fill, never a second accent */
--destructive / --destructive-foreground
--success / --success-foreground
--warning / --warning-foreground
--error / --error-foreground
--info / --info-foreground

/* Style tokens — one block per data-style */
--radius / --volt-radius-pill
--border-width                          /* surfaces */
--volt-control-border-width             /* inputs, outlines */
--volt-divider-width                    /* table rows, accordion items */
--volt-border-emphasis / --volt-surface-tint / --volt-control-solid-border
--ring-width / --ring-offset-width
--volt-shadow-sm / --volt-shadow / --volt-shadow-md / --volt-shadow-lg / --volt-shadow-xl
--volt-press-x / --volt-press-y / --volt-press-scale
--spacing-component / --spacing-gap
--volt-track-size / --volt-track-border-width / --volt-thumb-size
--volt-font-weight-base / --volt-font-weight-heading / --volt-font-weight-label

/* Density — data-density on the document or any container */
--volt-density                          /* compact 0.875, comfortable 1, spacious 1.125 */
```

## Створити власний кольоровий пресет

Кольоровий пресет — це пара селекторів, прив’язаних до `data-color`: один для світлого режиму, другий для темного. [Theme Studio](/uk/create-theme) напише його за вас: почніть із будь-якої вбудованої палітри, відредагуйте токени, перевірте інспектор контрасту, а потім скопіюйте або завантажте CSS. Файл **Проєкту** (`.theme.json`) зберігає редаговану тему, щоб пізніше знову відкрити її в студії.

::demo[availability-custom-themes]

### 1. Імпортуйте його після тем Volt

Збережіть експортовану таблицю стилів (тут `acme.css`) поруч із глобальними стилями й імпортуйте її **після** `@voltui/components/themes.css`. Порядок важливий: перевизначення форми з палітри (радіус, рамки, кільце фокусу, тіні) і пресет стилю використовують селектори однакової специфічності, тож перемагає пізніший файл.

```css
/* styles.css */
@import 'tailwindcss';
@import '@voltui/components/themes.css';
@import './acme.css';
```

### 2. Оголосіть назву й використовуйте її як вбудовану палітру

`voltCustomColor()` перетворює назву на `VoltCustomColor`, який приймають усі API тем. Функція кидає помилку, якщо назва не є ідентифікатором у нижньому регістрі (`a-z`, цифри й одинарні дефіси, на початку літера, щонайбільше 48 символів) або належить вбудованій палітрі. Нічого не реєструється глобально й жодна таблиця стилів не завантажується: малює й далі імпортований вами CSS.

```ts
// theme.ts
import { ApplicationConfig } from '@angular/core';
import { provideVoltTheme, voltCustomColor } from '@voltui/components';

export const acme = voltCustomColor('acme');

export const appConfig: ApplicationConfig = {
  providers: [provideVoltTheme({ color: acme, style: 'soft', density: 'compact' })],
};
```

Та сама назва працює для області з `voltTheme` — світлої, темної та вкладеної в обидва боки з вбудованими палітрами, — а оверлеї, відкриті всередині, переносять її з собою:

```ts
import { Component } from '@angular/core';
import { VoltButton, VoltTheme, voltCustomColor } from '@voltui/components';

const acme = voltCustomColor('acme');

@Component({
  selector: 'app-preview',
  imports: [VoltButton, VoltTheme],
  template: `
    <section [voltTheme]="{ color: acme, dark: true }">
      <volt-button>Dark acme island</volt-button>
    </section>
  `,
})
export class Preview {
  protected readonly acme = acme;
}
```

Щоб відновити збережену палітру відвідувача до першого відмальовування, перелічіть свої палітри у `voltThemeInitScript`. Збережена назва, якої немає в жодному зі списків — підроблена або зі старої версії, — ігнорується, і застосовуються типові значення.

```ts
import { voltCustomColor, voltThemeInitScript } from '@voltui/components';

const acme = voltCustomColor('acme');
export const themeScript = voltThemeInitScript({
  defaults: { color: acme },
  customColors: [acme],
});
```

Для компонентів, скопійованих CLI, той самий код імпортує з вашої теки UI, а CLI перейменовує префікс `volt`: `uiCustomColor` з `./ui/theme`. Власні пресети стилю працюють так само з `voltCustomStyle()` і `customStyles`.

### Палітра, стиль і щільність — окремі речі

| Що                              | Де живе                                              | Хто задає                                          |
| ------------------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| **Палітра** (`data-color`)      | Ваш експортований CSS: кольорові токени обох режимів | `color: acme`                                      |
| **Перевизначення форми**        | Той самий CSS, лише значення, змінені в студії       | Імпортуються після пресетів стилю, тож перемагають |
| **Пресет стилю** (`data-style`) | Файли стилів Volt: рамки, тіні, насиченість шрифту   | `style: 'soft'`                                    |
| **Щільність** (`data-density`)  | Токени Volt                                          | `density: 'compact'`                               |

Вкладена область `voltTheme`, яка не задає стилю, успадковує перевизначення форми від зовнішньої області, як і будь-який інший успадкований токен.

### Написати вручну

Селектори ті самі, що в кожної вбудованої палітри. Тримайте кожну пару тексту й тла на рівні 4.5:1 або вище, а для `--ring` та `--input` відносно `--background` — 3:1.

```css
:root[data-color='mytheme'],
[data-volt-theme][data-color='mytheme'] {
  --primary: oklch(0.58 0.2 265);
  --primary-foreground: oklch(0.98 0 0);
  --secondary: oklch(0.96 0.01 265);
  --secondary-foreground: oklch(0.15 0.01 265);
  --background: oklch(1 0 0);
  --foreground: oklch(0.15 0.01 265);
  --surface: oklch(1 0 0);
  --surface-foreground: oklch(0.15 0.01 265);
  --muted: oklch(0.96 0.005 265);
  --muted-foreground: oklch(0.5 0.02 265);
  --border: oklch(0.9 0.01 265);
  --input: oklch(0.65 0.02 265);
  --ring: oklch(0.58 0.2 265);
  --success: oklch(0.5 0.14 150);
  --success-foreground: oklch(0.98 0 0);
  --warning: oklch(0.7 0.16 70);
  --warning-foreground: oklch(0.2 0.05 70);
  --error: oklch(0.55 0.22 25);
  --error-foreground: oklch(0.98 0 0);
  --info: oklch(0.55 0.14 240);
  --info-foreground: oklch(0.98 0 0);
}

.dark[data-color='mytheme'],
.dark [data-volt-theme][data-color='mytheme']:not([data-mode='light']) {
  /* same tokens, tuned for a dark --background/--surface */
}
```

> [!TIP]
> Інспектор контрасту Theme Studio перевіряє кожну пару, яку малює Volt, в обох режимах, проти порогу її ролі — ті самі пари й обчислення, що й `scripts/contrast-audit.mjs`, який цей проєкт запускає для власних пресетів. Це перевірка на рівні токенів, а не сертифікація WCAG: відрендерені сторінки все одно потребують перевірок у браузері, ручного огляду й тестування зі зчитувачами екрана.

## Створити власний пресет стилю

Пресет стилю не торкається кольору — лише форми. Він працює за ключем `data-style` і застосовується до всіх кольорів одразу.

```css
:root[data-style='mystyle'],
[data-volt-theme][data-style='mystyle'] {
  --radius: 0.5rem; /* a length: 0rem, never a bare 0 */
  --volt-radius-pill: 9999px;
  --border-width: 1px;
  --volt-control-border-width: 1px;
  --volt-divider-width: 1px;
  --ring-width: 2px;
  --ring-offset-width: 2px;
  /* Not none: that would void the focus ring. Use 0 0 #0000. */
  --volt-shadow-sm: 0 1px 2px 0 var(--volt-shadow-tint);
  --volt-shadow: 0 1px 3px 0 var(--volt-shadow-tint);
  --volt-shadow-md: 0 4px 6px -1px var(--volt-shadow-tint);
  --volt-shadow-lg: 0 10px 15px -3px var(--volt-shadow-tint);
  --volt-shadow-xl: 0 20px 25px -5px var(--volt-shadow-tint);
  --spacing-component: 1;
  --spacing-gap: 0.5rem;
  --volt-font-weight-base: 400;
  --volt-font-weight-heading: 600;
  --volt-font-weight-label: 500;
}
```

Реєстрація така сама, як у кольорового пресета: покладіть його у глобальну таблицю стилів після `@voltui/components/themes.css`, оголосіть його через `const mystyle = voltCustomStyle('mystyle')` і передайте `style: mystyle` у `provideVoltTheme`, `applyVoltTheme` або `voltTheme`.
