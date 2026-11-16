---
title: 'Select'
description: 'Muestra una lista de opciones para que el usuario elija, activada por un botón.'
group: 'Formularios'
order: 13
---

## Ejemplo

::demo[select-example]

El ejemplo de arriba es este archivo, renderizado en vivo:

::source{file="apps/web/src/app/doqs/examples/select-example.ts" title="select-example.ts"}

### Select nativo

Una alternativa más ligera a `volt-select` para casos sencillos: es el elemento `<select>` nativo de verdad (comportamiento completo del selector móvil/nativo, funciona con `formControl`/`ngModel` sin más), con estilo acorde al tema.

::demo[native-select-example]

::source{file="apps/web/src/app/doqs/examples/native-select-example.ts" title="native-select-example.ts"}

## Zona de pruebas

Cambia los inputs e interactúa con la vista previa: el panel de eventos muestra lo que emite el componente y el código sigue tus ajustes.

::playground[select]

## Formularios y accesibilidad

- El disparador es un `<button role="combobox">` nativo con `aria-expanded` y, mientras está abierto, `aria-controls` apuntando al popup `role="listbox"` y `aria-activedescendant` a la `role="option"` activa. Las opciones seleccionadas llevan `aria-selected="true"`; las deshabilitadas, `aria-disabled="true"`.
- Nómbralo con un `<volt-label>` dentro de `<volt-form-field>` o con `aria-label`. `required` fija `aria-required`.
- Teclado: las flechas lo abren y recorren las opciones (saltando las deshabilitadas), Inicio y Fin van a la primera y la última mientras está abierto, Enter o Espacio seleccionan, Escape cierra y el foco vuelve al disparador. Escribir una letra no salta a ninguna opción (no hay búsqueda incremental); usa Listbox o Combobox cuando la lista sea larga.
- El popup se añade a `<body>` (`container`) y se voltea para seguir dentro de la ventana (`flip`); se elimina cuando el select se cierra o se destruye.
- Con Forms, una selección notifica el valor una sola vez. El control se marca como tocado cuando el foco sale del select —no cuando una pulsación del puntero lleva el foco al popup—, así que un select obligatorio no muestra su error mientras el usuario está eligiendo.
- El disparador muestra el valor mediante `displayWith` (por defecto `String(value)`), porque las etiquetas de las opciones no se renderizan con el popup cerrado. Pasa `displayWith` para mostrar una etiqueta.
- Punto de entrada de Quartz: mismo contrato, sin `container`, `scrollToOption` ni `allOptions`.

## Referencia de la API

::demo[api-select]

## Instalación

Copia el código en tu proyecto:

```bash
npx @voltui/cli add select
```

O impórtalo desde el paquete:

```bash
npm install @voltui/components
```

## Código fuente

Copia este código en tu proyecto. El componente usa `ng-primitives/select`.

::source{file="packages/volt/src/lib/components/select/select.ts" title="select.ts"}

::source{file="packages/volt/src/lib/components/select/select-content.ts" title="select-content.ts"}

::source{file="packages/volt/src/lib/components/select/select-item.ts" title="select-item.ts"}
