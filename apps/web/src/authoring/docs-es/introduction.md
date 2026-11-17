---
title: 'Introducción'
description: 'Volt UI es una colección de componentes de Angular reutilizables y accesibles, inspirada en shadcn/ui. Instala el paquete o copia el código en tu proyecto y hazlo tuyo.'
group: 'Primeros pasos'
order: 1
---

Los componentes se construyen sobre [ng-primitives](https://ng-primitives.dev). Un segundo punto de entrada experimental, `@voltui/components/quartz`, ejecuta nueve de ellos (Accordion, Checkbox, Listbox, Radio, Select, Switch, Tabs, Toggle y Toggle Group) sobre Quartz Headless con los mismos selectores e inputs. Se publica con `@voltui/components` desde la 1.4.0.

## Herramientas de IA para consumidores

Volt UI incluye tres formas complementarias de dar a los asistentes de IA contexto completo sobre sus componentes, selectores y convenciones.

- [Skills de agente](/es/docs/ai-skill) — Guías breves para Claude Code, Codex y OpenCode: cuándo usar Volt, qué componente encaja y cómo componerlo.
- [Servidor MCP](/es/docs/ai-mcp) — Herramientas MCP alojadas para listar componentes, obtener ejemplos y generar comandos de la CLI.
- [Referencia de prompt](/es/docs/ai-prompt) — Un prompt en un solo archivo para pegar en cualquier chat de LLM y obtener selectores y ejemplos correctos.

## Opciones de instalación

Hay tres formas de usar los componentes de Volt UI en tu proyecto:

### Opción 1: paquete de npm

Instala la librería directamente desde npm e importa los componentes en tu proyecto.

```bash
npm install @voltui/components
```

```css
@import '@voltui/components/themes.css';
```

Después importa: `from '@voltui/components'`.

### Opción 2: CLI (estilo shadcn)

Copia los archivos fuente de los componentes a tu proyecto con el prefijo ui-*. Personalización total.

```bash
npx @voltui/cli init
npx @voltui/cli add button card input
```

Usa `--dry-run` para previsualizar los archivos y `--force` para sobrescribir componentes ya editados.

### Opción 3: copiar y pegar

Explora las demos de los componentes y copia el código directamente. Control total sobre la implementación. [Ver componentes](/es/docs/components)

## Convenciones de nombres

Volt UI usa prefijos distintos para el código de la librería y para lo que genera la CLI.

| Contexto              | Selector               | Nombre de clase | Ruta de importación    |
| --------------------- | ---------------------- | --------------- | ---------------------- |
| Código de la librería | `volt-*` / `[voltXxx]` | `VoltXxx`       | `'@voltui/components'` |
| Salida de la CLI      | `ui-*` / `[uiXxx]`     | `UiXxx`         | `'./ui/<component>'`   |

## Requisitos previos

Antes de usar los componentes de Volt UI, asegúrate de tener instaladas estas dependencias:

### paquete de npm

Las dependencias de runtime se incluyen automáticamente. Importa el CSS del tema una vez en tu hoja de estilos global.

```bash
npm install @voltui/components
```

### CLI / copiar y pegar — dependencias de runtime

```bash
npm install ng-primitives class-variance-authority clsx tailwind-merge
```

### Tailwind CSS v4

Los componentes de Volt incluyen el CSS de disposición crítico, así que quien consuma el paquete de npm no necesita una directiva `@source` para `node_modules`.

```bash
npm install -D tailwindcss @tailwindcss/postcss
```

## Sistema de temas

Volt UI ofrece tokens semánticos de Tailwind mediante custom properties de CSS. Configura el tema en la configuración de tu app.

```ts
import { provideVoltTheme } from '@voltui/components';

bootstrapApplication(AppComponent, {
  providers: [
    provideVoltTheme({
      color: 'volt', // volt | ember | sage | dusk | glacier
      style: 'sharp', // sharp | soft | brutal | ghost | retro
      density: 'comfortable', // compact | comfortable | spacious
      dark: false,
    }),
  ],
});
```

## Estructura del proyecto

Al usar la CLI, los componentes se añaden a la carpeta ui de tu proyecto:

```text
src/app/
  ui/
    button/
      button.ts
      index.ts
    card/
      card.ts
      index.ts
    ...
```

## Uso

Tras añadir un componente, impórtalo y úsalo en tus componentes de Angular:

```ts
import { Component } from '@angular/core';
import { UiButton } from './ui/button';

@Component({
  selector: 'app-my-component',
  imports: [UiButton],
  template: '<ui-button variant="solid">Click me</ui-button>',
})
export class MyComponent {}
```

## Componentes de overlay

Dialog, drawer, popover, tooltip y dropdown-menu usan una directiva de atributo como disparador que referencia un `<ng-template>` con el contenido de la superposición.

```html
<button [uiDialog]="dialogTpl">Open Dialog</button>

<ng-template #dialogTpl let-close="close">
  <div uiDialogOverlay></div>
  <div uiDialogContent>
    <h2 uiDialogTitle>Confirm</h2>
    <p uiDialogDescription>Are you sure?</p>
    <ui-button (click)="close()">Confirm</ui-button>
  </div>
</ng-template>
```

## Catálogo de componentes

Los componentes marcados como **estables** tienen una API asentada, tests que comprueban su propio comportamiento y uso documentado. **Beta** marca las incorporaciones recientes cuya API aún puede cambiar en una versión menor. La política completa está en [Versionado y estabilidad](/es/docs/versioning).

::demo[component-catalog]

## Siguientes pasos

- [Temas](/es/docs/themes) — Aprende a personalizar colores, tipografía y modo oscuro.
- [Componentes](/es/docs/components) — Explora todos los componentes disponibles con ejemplos y código.
- [Integración con IA](/es/docs/mcp) — Configura el servidor MCP y los snippets del IDE para Claude, Cursor, Copilot y más.
