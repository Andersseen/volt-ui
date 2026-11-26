---
title: 'Input y formularios'
description: 'Muestra un campo de formulario o un componente con aspecto de campo de entrada.'
group: 'Formularios'
order: 11
---

## Ejemplo

::demo[input-example]

El ejemplo de arriba es este archivo, renderizado en vivo:

::source{file="apps/web/src/app/doqs/examples/input-example.ts" title="input-example.ts"}

## Zona de pruebas

Cambia los inputs e interactúa con la vista previa: el panel de eventos muestra lo que emite el componente y el código sigue tus ajustes.

::playground[input]

## Formularios y accesibilidad

- `<volt-input>` es un envoltorio de ancho completo alrededor de un único `<input>` nativo. `id`, `class` y `aria-label` pertenecen al elemento nativo y se eliminan del host, así que `<label for>` y `<volt-label htmlFor>` llegan al control y ningún id se duplica.
- `aria-describedby` también se aplica al input nativo. Dentro de `<volt-form-field>` sus ids se añaden a la pista y al error, sin sustituirlos; fuera de un campo son la descripción del input (se escribe en el navegador, así que una página renderizada en el servidor la obtiene al hidratarse).
- Sin `id`, el input recibe uno generado, numerado por aplicación para que la página renderizada en el servidor y la hidratada coincidan.
- Enlázalo con `[(value)]`, `formControl` / `formControlName` o `ngModel`. Escribir notifica el valor; un valor que escribe tu código (`setValue`, `reset`, un cambio del modelo) no vuelve como cambio.
- Se marca como tocado al perder el foco. `aria-invalid="true"` aparece cuando el control es inválido **y** está tocado, o cuando pones `state="error"`; `state` por sí solo solo cambia el color.
- `required`, `readonly`, `disabled`, `type`, `name`, `placeholder` y `autocomplete` se escriben en el input nativo. Un control deshabilitado desde Forms también queda deshabilitado.

::demo[availability-input-describedby]

## Referencia de la API

::demo[api-input]

## Instalación

Copia el código en tu proyecto:

```bash
npx @voltui/cli add input
```

O impórtalo desde el paquete:

```bash
npm install @voltui/components
```

## Código fuente

Copia este código en tu proyecto. El componente usa `ng-primitives/input`.

::source{file="packages/volt/src/lib/components/input/input.ts" title="input.ts"}
