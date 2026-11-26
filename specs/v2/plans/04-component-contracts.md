# Plan 04 — Componentes fáciles de componer y personalizar

**Estado:** ejecutado en `feat/consumer-lifecycle-reliability` (PR #261, merge `494b0fc`), salvo la revisión manual de la fase C (teclado completo, lector de pantalla, zoom 200 %) y las fechas localizadas, que siguen pendientes. Reconciliado el 2026-11-26 en el plan 07 contra los tests de la rama. **Prioridad:** P1. **Depende de:** plan 03.
**Hallazgos:** F11, F15. **Entrega:** contratos documentados, regresiones y mejoras acotadas.

## Contexto y archivos

Leer `projects/volt/src/lib/components/{button,input,textarea,form-field,select,dialog,drawer}/`,
`projects/volt/src/lib/form-control-state.ts`, temas y las suites consumer.
Consultar `specs/patterns/{component,form-control-tests,overlay-tests}.md` y comprobar
los patrones contra la fuente actual. La cobertura existente es trabajo aprovechable.

El botón tiene un botón nativo interior y el input un input interior. Poner un atributo
o una clase en el host no garantiza que llegue al control. No se han reproducido aquí
todos los efectos: la fase A produce evidencia antes de proponer APIs.

## Fase A — Caracterización desde tareas de usuario

- [x] Crear una matriz por familia: elemento interactivo, destino de class/id/ARIA,
      valores/control de estado, mecanismo de foco y comportamiento de formularios.
- [x] Priorizar button, input, textarea y form-field; probar el resto al componerlos con
      select/dialog. No auditar todo el catálogo con la misma batería irrelevante.
- [x] Registrar estos casos con su DOM/nombre accesible real (`packages/volt/src/lib/composition-contracts.spec.ts`; select en diálogo/drawer en `e2e/contracts/overlay-forms.spec.ts`):

| Caso                                | Resultado esperado                                                                            |
| ----------------------------------- | --------------------------------------------------------------------------------------------- |
| Botón solo con icono                | Nombre accesible en el botón enfocable; icono decorativo no introduce un segundo nombre       |
| Botón submit dentro de form         | Enter/click produce una única acción; disabled la impide                                      |
| Acción que navega                   | Enlace real, semántica y comportamiento de abrir en nueva pestaña; no botón disfrazado        |
| Label y hint/error                  | Label enfoca el control correcto; IDs únicos y aria-describedby resuelve elementos existentes |
| Input personalizado                 | Ancho del host y padding/borde del input se pueden cambiar con destino explícito y predecible |
| FormControl con reset/null/disabled | Valor visible coincide con estado; reset y disabled no generan cambios de usuario             |
| `updateOn: 'blur'`                  | El contrato de touched/change permite el comportamiento documentado de Angular                |
| Select en dialog/drawer             | Teclado usable; Escape y foco vuelven al nivel correcto sin cerrar toda la composición        |

- [x] Para cada fallo, escribir reproducción antes del arreglo. Para comportamientos que
      ya pasan, conservar la implementación y registrar cobertura. Separar limitación de
      ergonomía de incumplimiento de accesibilidad.

## Fase B — La menor mejora compatible

- [x] Elegir un mecanismo acotado para nombre accesible y atributos nativos necesarios
      en button. Contrastar input explícito, composición sobre elemento nativo y patrones
      ya presentes; documentar alternativa elegida antes de ampliar exports.
- [x] Definir destino de clases para input/textarea y consistencia con button. No mover
      silenciosamente la clase actual del host al elemento interno: puede romper layouts
      existentes. Si se necesita un input aditivo para el control interno, probarlo y
      documentarlo; no añadir diez slots/clases sin uso real.
- [x] Corregir únicamente fallos Forms/labels/overlays reproducidos. Mantener API de
      model y CVA existentes; una interacción no debe duplicar outputs ni activar dos
      fuentes de verdad distintas al usar el modo de binding documentado.
- [ ] Documentar la frontera entre APIs alternativas: qué modo se recomienda y qué
      combinaciones no se deben usar a la vez. No «arreglar» imponiendo un estado global.
- [x] No retirar selectores, renombrar inputs, cambiar tipos de valor ni añadir un segundo
      conjunto completo de componentes. Si un caso exige ruptura, registrarlo con ejemplo
      antes/después como candidato de major y continuar con los casos compatibles.

**Aceptación:** cada API nueva resuelve un caso de la fase A; no aparece por uniformidad
abstracta. Las pruebas v1 de consumidores personalizados continúan pasando.

## Fase C — Temas, tamaño y accesibilidad de la composición

- [ ] Probar la composición formulario + select + dialog con texto largo, ancho estrecho,
      zoom 200%, light/dark y estilos sharp/soft/brutal/ghost/retro. Distinguir problemas
      geométricos de contraste; reutilizar los 130 checks de color existentes.
- [ ] Validar foco visible, reduced motion y contraste de estados efectivos. Los overlays
      portaled deben conservar el tema soportado; documentar el alcance document-level
      actual sin inventar soporte a temas anidados independientes.
- [ ] Revisar etiquetas internas y fechas localizadas separadamente de la traducción del
      sitio. Caracterizar locale/primer día de semana existentes; RTL completo queda fuera
      salvo arreglo localizado demostrado, sin prometer soporte global por cambiar CSS.
- [ ] Registrar revisión manual de teclado y un recorrido de lector de pantalla en las
      composiciones prioritarias si el entorno lo permite. Si no, dejar esa evidencia
      pendiente; no sustituirla por una declaración de cumplimiento WCAG total.
- [ ] Documentar limitaciones upstream con reproducción y versión. Preferir adaptación
      mínima o contribución upstream; no usar una limitación como autorización de headless.

Referencia para comportamiento por patrón:
[WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/). Sus patrones guían la revisión;
no sustituyen la observación del componente compuesto.

## Verificación y límites

Ejecutar primero specs de las familias tocadas y tests consumer de los casos de A.
Antes de cerrar, con `rtk proxy`: `pnpm typecheck`, `pnpm lint`, `pnpm test:run`,
`pnpm build:lib`, `pnpm manifest`, `pnpm check:ai-docs`, `pnpm check:contrast`,
`pnpm check:docs-completeness`, `pnpm build` y el consumidor aislado del plan 03.
Actualizar public-api, snippets, demos, metadata, skill/instaladores/MCP/prompt y API
generada según AGENTS para cualquier cambio público. No marcar ripple effects como
hechos si solo se actualizó una de sus copias.

Sin nuevos presets, sistema de densidad global, motor de formularios ni migración
general a directivas. Las recetas del plan 06 usarán los contratos que aquí se prueben.

## Registro de ejecución

### 2026-11-26 — Reconciliación (plan 07, sobre `494b0fc`)

El documento seguía «no iniciado» aunque #261 entregó el trabajo. Evidencia comprobada en el código:

- **Fase A, matriz:** `packages/volt/src/lib/composition-contracts.spec.ts` (`904a728`) cubre los ocho casos
  de la tabla: botón solo icono (nombre en el botón enfocable), submit único y `disabled`, acción que navega
  como enlace real, `aria-disabled` enfocable, escritura/reset/null/disabled sin marcar dirty, una
  pulsación = un cambio, touched al salir, `updateOn: 'blur'`, label/hint/error con ids únicos y sin
  referencias huérfanas, destinos de class/id/aria-label en `volt-input`, select nativo con Forms.
  Select y combobox dentro de diálogo, drawer y popover, en navegador real:
  `e2e/contracts/overlay-forms.spec.ts`; overlays anidados y formulario en diálogo:
  `e2e/contracts/nested-overlays.spec.ts` (`c209367`).
- **Fase B:** el único fallo reproducido fue `aria-describedby` de consumidor en Input/Textarea, que se
  quedaba en el host sin rol; se corrigió con un input aditivo (`904a728`). La clase sigue en el host
  (sin mover clases silenciosamente). Ningún candidato de major.
- **Fase C, con evidencia automática:** estados en los 5 estilos × paletas × claro/oscuro
  (`e2e/contracts/theme-matrix.spec.ts`), contraste de estados seleccionados
  (`e2e/contracts/visual-state.spec.ts`), reduced motion en Progress, alcance de tema y overlays
  (`e2e/contracts/theme-scope.spec.ts`). Las casillas de la fase C **no se marcan**: no hay prueba de
  texto largo + ancho estrecho + zoom 200 % sobre la composición formulario + select + diálogo, ni
  revisión manual de teclado con lector de pantalla, ni caracterización de fechas localizadas/primer día
  de semana registrada aquí.
- **Pendiente:** fase C completa (revisión manual y lector de pantalla), limitaciones upstream
  documentadas con versión.
