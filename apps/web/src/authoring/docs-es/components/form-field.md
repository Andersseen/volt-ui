---
title: 'Form Field'
description: 'Envoltorio de formulario accesible con etiqueta, pista y texto de error.'
group: 'Formularios'
order: 10
---

## Ejemplo

::demo[form-field-example]

El ejemplo de arriba es este archivo, renderizado en vivo:

::source{file="apps/web/src/app/doqs/examples/form-field-example.ts" title="form-field-example.ts"}

## Zona de pruebas

Cambia los inputs e interactúa con la vista previa: el panel de eventos muestra lo que emite el componente y el código sigue tus ajustes.

::playground[form-field]

## Formularios y accesibilidad

- Dentro de `<volt-form-field>`, `<volt-label>` etiqueta el control mediante `aria-labelledby`, y al pulsarla se enfoca el control. No hacen falta ids; fuera de un form field, usa `<volt-label htmlFor>`.
- `<volt-hint>` forma siempre parte de la descripción del control (`aria-describedby`).
- `<volt-error>` entra en la descripción mientras está renderizado y fallan los validadores del control, y sale de ella al eliminarse: no queda ninguna referencia a un mensaje eliminado.
- `aria-invalid="true"` se pone en el control (no en un envoltorio) en cuanto es inválido y está tocado, así que el error no se transmite solo con el color.
- **Anuncio de errores:** `<volt-error>` es una alerta que se anuncia al insertarse. Renderízalo cuando el usuario haya salido del campo o enviado el formulario (`@if (control.touched && control.invalid)`), como en el ejemplo, y no en cada pulsación. Para una validación que deba esperar a que el usuario salga del campo, usa `updateOn: 'blur'` de Angular.
- Un control por form field. Funciona con `volt-input`, `volt-textarea`, `volt-select` y controles nativos con `ngpInput`.

## Referencia de la API

::demo[api-form-field]

## Instalación

Copia el código en tu proyecto:

```bash
npx @voltui/cli add form-field
```

O impórtalo desde el paquete:

```bash
npm install @voltui/components
```

## Código fuente

Copia este código en tu proyecto. El componente usa `ng-primitives/form-field`.

::source{file="packages/volt/src/lib/components/form-field/form-field.ts" title="form-field.ts"}

::source{file="packages/volt/src/lib/components/form-field/form-field-label.ts" title="form-field-label.ts"}

::source{file="packages/volt/src/lib/components/form-field/form-field-hint.ts" title="form-field-hint.ts"}

::source{file="packages/volt/src/lib/components/form-field/form-field-error.ts" title="form-field-error.ts"}
