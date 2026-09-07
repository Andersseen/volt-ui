# Plan 04 — Componentes fáciles de componer y personalizar

**Estado:** no iniciado. **Prioridad:** P1. **Depende de:** plan 03.
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

- [ ] Crear una matriz por familia: elemento interactivo, destino de class/id/ARIA,
      valores/control de estado, mecanismo de foco y comportamiento de formularios.
- [ ] Priorizar button, input, textarea y form-field; probar el resto al componerlos con
      select/dialog. No auditar todo el catálogo con la misma batería irrelevante.
- [ ] Registrar estos casos con su DOM/nombre accesible real:

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

- [ ] Para cada fallo, escribir reproducción antes del arreglo. Para comportamientos que
      ya pasan, conservar la implementación y registrar cobertura. Separar limitación de
      ergonomía de incumplimiento de accesibilidad.

## Fase B — La menor mejora compatible

- [ ] Elegir un mecanismo acotado para nombre accesible y atributos nativos necesarios
      en button. Contrastar input explícito, composición sobre elemento nativo y patrones
      ya presentes; documentar alternativa elegida antes de ampliar exports.
- [ ] Definir destino de clases para input/textarea y consistencia con button. No mover
      silenciosamente la clase actual del host al elemento interno: puede romper layouts
      existentes. Si se necesita un input aditivo para el control interno, probarlo y
      documentarlo; no añadir diez slots/clases sin uso real.
- [ ] Corregir únicamente fallos Forms/labels/overlays reproducidos. Mantener API de
      model y CVA existentes; una interacción no debe duplicar outputs ni activar dos
      fuentes de verdad distintas al usar el modo de binding documentado.
- [ ] Documentar la frontera entre APIs alternativas: qué modo se recomienda y qué
      combinaciones no se deben usar a la vez. No «arreglar» imponiendo un estado global.
- [ ] No retirar selectores, renombrar inputs, cambiar tipos de valor ni añadir un segundo
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

- Matriz y reproducciones: pendiente.
- Cambios compatibles elegidos: pendiente.
- Candidatos de major: ninguno aprobado.
- Navegadores y revisión manual realizados: pendiente.
- Próximo paso: fase A.
