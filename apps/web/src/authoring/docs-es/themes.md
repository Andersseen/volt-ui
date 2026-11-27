---
title: 'Temas'
description: 'Personaliza el aspecto de tu aplicación con temas integrados, colores y soporte de modo oscuro.'
group: 'Primeros pasos'
order: 2
---

## Temas disponibles

Volt UI incluye cinco presets de color. Cada uno define su propia paleta para los colores primario, secundario, de superficie y semánticos.

::demo[theme-presets]

## Configuración del tema

Añade el proveedor de tema a la configuración de tu aplicación:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideVoltTheme } from '@voltui/components';

export const appConfig: ApplicationConfig = {
  providers: [provideVoltTheme({ color: 'volt', style: 'soft', dark: false })],
};
```

## Opciones de color

### Colores del tema

Elige tu paleta de color principal:

- `'volt'` — Azul (por defecto)
- `'ember'` — Naranja/rojo
- `'sage'` — Verde
- `'dusk'` — Violeta
- `'glacier'` — Cian

### Variantes de estilo

Elige el estilo de tus componentes:

- `'sharp'` — Radio pequeño, sombras planas (por defecto)
- `'soft'` — Radio grande, sombras difusas
- `'brutal'` — Sin radio, sombras duras desplazadas, bordes gruesos
- `'ghost'` — Sin bordes, sin sombras
- `'retro'` — Estética Y2K

### Densidad

`density` escala la altura de los controles, el relleno y los espacios mediante `--volt-density`: `compact` (0.875), `comfortable` (1, el valor por defecto) o `spacious` (1.125). Fíjala para todo el documento con `provideVoltTheme` / `applyVoltTheme`, o pon `data-density` en cualquier contenedor para cambiar solo esa zona.

## API en tiempo de ejecución

Dos funciones de `@voltui/components` controlan el tema en tiempo de ejecución. Ambas se limitan a fijar `data-color`, `data-style`, `data-density` y una clase `.dark` (con el `color-scheme` correspondiente) en `<html>`: no hay estado oculto, así que puedes inspeccionar o sobrescribir el resultado con las API del DOM en cualquier momento.

### `provideVoltTheme(options)`

Proveedor de entorno. Llámalo una vez en `appConfig.providers` para fijar el tema en el arranque, tanto en servidor como en cliente.

**Seguro con SSR.** Lee el token de inyección `DOCUMENT` de Angular en vez del `document` global, así que los atributos del tema ya están en el HTML renderizado en servidor: sin parpadeo del tema por defecto mientras hidrata el bundle del cliente.

### `applyVoltTheme(options, doc?)`

Función normal. Llámala desde un manejador de clic, un effect o donde necesites cambiar el tema después del arranque (por ejemplo, un selector de tema).

Solo navegador por defecto (no hace nada si `document` es undefined). Pasa un argumento `doc` explícito para actuar sobre otro documento, por ejemplo en un test.

```ts
// app.config.ts — set the theme at bootstrap
import { ApplicationConfig } from '@angular/core';
import { provideVoltTheme } from '@voltui/components';

export const appConfig: ApplicationConfig = {
  providers: [provideVoltTheme({ color: 'ember', style: 'soft' })],
};
```

## Estrategia de modo oscuro

El modo oscuro se basa en una clase: añadir `.dark` a `<html>` cambia todos los componentes a sus valores de token oscuros (mira `@custom-variant dark` en `core.css`). Volt **no** lee `prefers-color-scheme` automáticamente: `dark` es claro salvo que pases `dark: true` o llames tú a `applyVoltTheme`, de modo que la decisión siempre es explícita y no cambia sin avisar si cambia el tema del sistema del visitante.

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

### Recordar la elección del visitante sin parpadeo

`provideVoltTheme` pinta el tema que configuras. El tema que elige el visitante vive en su navegador, así que el servidor no lo conoce y la página se pintaría primero con el tema por defecto. `voltThemeInitScript()` devuelve unas pocas líneas de JavaScript que leen lo que guardó `persistVoltTheme` y lo aplican antes del primer pintado; ponlas en línea al principio del `<head>`. Si no hay `dark` guardado ni `defaults.dark`, sigue a `prefers-color-scheme` (`followSystem: false` lo desactiva). Los valores desconocidos se ignoran, y `storageKey` cambia la clave que usan las dos funciones.

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

El script solo lee el almacenamiento y pone `data-color`, `data-style`, `data-density` y `.dark` en `<html>`, igual que `applyVoltTheme`, así que con una Content Security Policy estricta necesita su hash o un nonce, como cualquier script en línea.

> [!NOTE]
> La propia web de documentación guarda la elección del visitante en una cookie compartida con Volt UI Recipes (con las claves antiguas de `localStorage` como respaldo) y la aplica desde un pequeño script en línea dentro del `<head>` de `index.html`, antes de que cargue ninguna hoja de estilos; mira `packages/shared/components/theme-switcher.ts` y `packages/shared/lib/theme-preferences.ts` en el repositorio como implementación de referencia si quieres el mismo comportamiento sin parpadeo.

## Variables CSS

Cada preset define el mismo conjunto de tokens semánticos como valores `oklch()`. Los componentes los consumen mediante utilidades de Tailwind (`bg-primary`, `text-muted-foreground`) mapeadas con `@theme inline` en `core.css`, nunca con un `var(--primary)` crudo. Esta es la lista completa que puede definir un preset; mira las dos guías de abajo para plantillas listas para copiar.

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

## Crear un preset de color propio

Un preset de color es un par de selectores asociados a `data-color`: uno para el modo claro y otro para el oscuro. [Theme Studio](/es/create-theme) lo escribe por ti: parte de cualquier paleta incluida, edita los tokens, revisa el inspector de contraste y copia o descarga el CSS. Su archivo de **Proyecto** (`.theme.json`) conserva el tema editable, para volver a abrirlo en el estudio más adelante.

::demo[availability-custom-themes]

### 1. Impórtalo después de los temas de Volt

Guarda la hoja de estilos exportada (aquí `acme.css`) junto a tus estilos globales e impórtala **después** de `@voltui/components/themes.css`. El orden importa: los ajustes de forma de la paleta (radio, bordes, anillo de foco, sombras) y un preset de estilo usan selectores de la misma especificidad, así que gana el archivo posterior.

```css
/* styles.css */
@import 'tailwindcss';
@import '@voltui/components/themes.css';
@import './acme.css';
```

### 2. Declara el nombre y úsalo como una paleta incluida

`voltCustomColor()` convierte el nombre en un `VoltCustomColor`, que aceptan todas las API de tema. Lanza un error si el nombre no es un identificador en minúsculas (`a-z`, dígitos y guiones simples, empezando por una letra, como máximo 48 caracteres) o si pertenece a una paleta incluida. No se registra nada de forma global ni se carga ninguna hoja de estilos: lo que pinta sigue siendo el CSS que importaste.

```ts
// theme.ts
import { ApplicationConfig } from '@angular/core';
import { provideVoltTheme, voltCustomColor } from '@voltui/components';

export const acme = voltCustomColor('acme');

export const appConfig: ApplicationConfig = {
  providers: [provideVoltTheme({ color: acme, style: 'soft', density: 'compact' })],
};
```

El mismo nombre funciona en una región con `voltTheme` —claro, oscuro y anidado en ambos sentidos con las paletas incluidas—, y los overlays que se abren dentro lo llevan consigo:

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

Para restaurar la paleta guardada de un visitante antes del primer pintado, enumera tus paletas en `voltThemeInitScript`. Un nombre guardado que no esté en ninguna de las dos listas —manipulado o de una versión antigua— se ignora y se aplican los valores por defecto.

```ts
import { voltCustomColor, voltThemeInitScript } from '@voltui/components';

const acme = voltCustomColor('acme');
export const themeScript = voltThemeInitScript({
  defaults: { color: acme },
  customColors: [acme],
});
```

Con componentes copiados por la CLI, el mismo código importa desde tu carpeta de UI y la CLI renombra el prefijo `volt`: `uiCustomColor` desde `./ui/theme`. Los presets de estilo propios funcionan igual con `voltCustomStyle()` y `customStyles`.

### Paleta, estilo y densidad son cosas distintas

| Qué                                 | Dónde vive                                                 | Quién lo fija                                               |
| ----------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| **Paleta** (`data-color`)           | Tu CSS exportado: los tokens de color de ambos modos       | `color: acme`                                               |
| **Ajustes de forma**                | El mismo CSS, solo los valores que cambiaste en el estudio | Se importan después de los presets de estilo, así que ganan |
| **Preset de estilo** (`data-style`) | Los archivos de estilo de Volt: bordes, sombras, pesos     | `style: 'soft'`                                             |
| **Densidad** (`data-density`)       | Los tokens de Volt                                         | `density: 'compact'`                                        |

Un ámbito `voltTheme` anidado que no fija un estilo hereda los ajustes de forma del ámbito que lo rodea, como cualquier otro token heredado.

### Escribirlo a mano

Los selectores son los que usa cada paleta incluida. Mantén cada par de primer plano y fondo en 4.5:1 o más, y en 3:1 para `--ring` e `--input` frente a `--background`.

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
> El inspector de contraste de Theme Studio comprueba cada par que pinta Volt, en ambos modos, frente al umbral de su función: los mismos pares y cálculos que `scripts/contrast-audit.mjs`, que este proyecto ejecuta sobre sus propios presets. Es una comprobación a nivel de tokens, no una certificación WCAG: las páginas renderizadas siguen necesitando comprobaciones en el navegador, una revisión manual y pruebas con lectores de pantalla.

## Crear un preset de estilo propio

Un preset de estilo no toca el color, solo la forma. Se indexa por `data-style` y se aplica a todos los colores a la vez.

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

El registro es igual que el de un preset de color: ponlo en tu hoja de estilos global después de `@voltui/components/themes.css` decláralo con `const mystyle = voltCustomStyle('mystyle')` y pasa `style: mystyle` a `provideVoltTheme`, `applyVoltTheme` o `voltTheme`.
