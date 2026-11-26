---
title: 'Checkbox'
description: 'Un control que permite al usuario alternar entre marcado y no marcado.'
group: 'Formularios'
order: 12
---

## Ejemplo

::demo[checkbox-example]

El ejemplo de arriba es este archivo, renderizado en vivo:

::source{file="apps/web/src/app/doqs/examples/checkbox-example.ts" title="checkbox-example.ts"}

## Zona de pruebas

Cambia los inputs e interactúa con la vista previa: el panel de eventos muestra lo que emite el componente y el código sigue tus ajustes.

::playground[checkbox]

## Formularios y accesibilidad

- `<volt-checkbox>` renderiza un `<button role="checkbox">` nativo; `id` y `aria-label` pasan a él. Nómbralo con un `<volt-label htmlFor>` que apunte a su `id`, o con `aria-label`.
- `aria-checked` es `true`, `false` o `mixed` (`indeterminate`). La tecla Espacio lo activa; activar una casilla mixta la deja marcada y notifica `indeterminateChange(false)`.
- Con Forms, el valor del control es el booleano `checked`. Una activación del usuario lo notifica una vez y marca el control como modificado; un valor que escribe tu código no.
- `indeterminate` sigue siendo tuyo: una escritura de Forms del valor que la casilla ya tiene (la escritura inicial, un padre "seleccionar todo" que se resincroniza) lo conserva; una escritura que cambia el valor lo resuelve.
- Se marca como tocada al perder el foco; `aria-invalid="true"` cuando el control es inválido y está tocado. `required` fija `aria-required`.
- Sin `id`, recibe uno generado y numerado por aplicación, de modo que el renderizado en servidor y la hidratación coinciden.
- El punto de entrada experimental de Quartz (`@voltui/components/quartz`) pasa las mismas pruebas de contrato.

::demo[availability-quartz]

## Referencia de la API

::demo[api-checkbox]

## Instalación

Copia el código en tu proyecto:

```bash
npx @voltui/cli add checkbox
```

O impórtalo desde el paquete:

```bash
npm install @voltui/components
```

## Código fuente

Copia este código en tu proyecto. El componente usa `ng-primitives/checkbox`.

::source{file="packages/volt/src/lib/components/checkbox/checkbox.ts" title="checkbox.ts"}
