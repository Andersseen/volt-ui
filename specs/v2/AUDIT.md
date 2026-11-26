# Auditoría de producto e ingeniería post-v1

**Fecha:** 2026-09-07. **Base:** `35e6816`, versión local `1.0.1`.
**Revisión 2026-11-26:** los hallazgos se conservan tal como se observaron en esa base. Su estado
actual está en «Resolución» al final; no describe el código de 2026-09-07.
**Método:** lectura de código, historial, planes y CI; pruebas locales y reproducciones
en directorios temporales. No se modificó código de producto.

## Valoración

Volt UI tiene una base seria para una librería pequeña: componentes compuestos sobre
primitivas, modelo de propiedad del código, variantes, tokens semánticos, pruebas de
interacción, distribución por CLI y documentación en tres idiomas. El problema central
no es la falta de componentes. Es la **fiabilidad del recorrido del consumidor**, desde
copiar un ejemplo hasta actualizar una pieza que ya ha personalizado.

No pondría una nota numérica: no se han medido adopción, satisfacción ni coste de soporte.
La evaluación del repositorio es favorable en fundamentos y menos favorable en coherencia
de distribución/documentación. Que los tests pasen es evidencia útil, pero su alcance
actual deja fuera fallos concretos de ese recorrido.

## Evolución observada

| Etapa                 | Evidencia                                                                                          | Lectura                                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Junio, 0.1–0.2        | `CHANGELOG.md`: catálogo, temas, CLI; adopción explícita de copia local                            | Se establece una identidad técnica reconocible                                                        |
| Julio–agosto, 0.4–0.9 | Contratos de Forms y overlays, cobertura, contraste, manifiesto, API freeze                        | Buena inversión en profundidad y distribución                                                         |
| Agosto, 1.0           | Arreglos reales en OTP, date-picker, listbox y resizable; tests que antes no detectaban los fallos | El proyecto aprende a probar efectos en DOM, no solo estado interno                                   |
| Después de 1.0        | `git log`: temas, movimiento, bloques, layouts simplificados, i18n                                 | Más utilidad visual; riesgo de que el escaparate avance más deprisa que la experiencia de integración |

Simplificar layouts para que sean esqueletos rellenables es una decisión especialmente
alineada con el producto. Añadir más marketing animado aporta variedad, pero dedicar la
misma inversión a validación, errores, carga y actualización de código tiene más valor
recurrente para una aplicación Angular.

El roadmap público actual propone headless propio, distribución sin Tailwind y después
layouts. Esa secuencia supone mantener primitivas y dos salidas de estilos antes de
mejorar flujos de usuario. No hay en esta revisión evidencia suficiente de una limitación
de ng-primitives que justifique esa ampliación del mantenimiento.

## Hallazgos

**R:** reproducido ejecutando código. **E:** constatado por lectura de archivos.
**H:** riesgo/hipótesis pendiente de prueba específica. Prioridad = impacto en esta ruta,
no una clasificación de seguridad.

| ID        | Evidencia y resultado                                                                                                                                                                    | Impacto                                                                                                                   | Prioridad / plan |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| F01 · R   | `cli/lib/core.js`, `initProject`: crear un barrel personalizado y ejecutar `init` de nuevo lo reemplaza por `export {};`                                                                 | Pérdida de exports y ediciones del consumidor                                                                             | P0 / 01          |
| F02 · R   | CLI real: `add tooltip sidebar <temporal>/ui` termina con código 1 porque sidebar vuelve a copiar tooltip. Quedan `tooltip/` e `index.ts` creados                                        | Una petición válida falla a mitad de camino                                                                               | P1 / 01          |
| F03 · R/E | `add button badeg` termina con código 0 y crea `badeg/button/`. `parseAddArgs` interpreta el primer nombre desconocido posterior como destino                                            | Ambigüedad del destino posicional; no corregirla rompiendo destinos v1 válidos                                            | P1 / 01          |
| F04 · R/E | `installDependencies(..., {dryRun:true})` produce paquetes sin versiones; workspace fija `ng-primitives` a `0.110.2`                                                                     | Lo que se instala no está ligado a lo que se probó; fallo futuro posible, no incompatibilidad reproducida                 | P1 / 01–03       |
| F05 · R/E | Manifiesto local `1.0.1`: 24 grupos beta y 18 stable. El generador contiene esos estados; `COMPONENT_STATUS.md` declara todos estables                                                   | CLI, web y asistentes cuentan historias distintas                                                                         | P1 / 02          |
| F06 · E   | Skill: `ui-form-field-label` / hint / error. Fuente: `VoltLabel`, `VoltHint`, `VoltError`, selectores `volt-label`, `volt-hint`, `volt-error`                                            | El contexto de IA puede producir templates inválidos                                                                      | P1 / 02          |
| F07 · E   | `snippets/usage.ts`: BUTTON_USAGE usa `lmn-mail` sin importarlo; CARD_USAGE solo importa VoltCard pero usa subcomponentes y VoltButton. Ejemplos usan `from 'volt'`                      | Ejemplos presentados como fuente no son aplicaciones autocontenidas para consumidores                                     | P1 / 02          |
| F08 · E   | `snippets/blocks.ts` y `layouts.ts` exportan raw source con alias `volt`; `CopyButton` copia el texto sin adaptación                                                                     | Copiar un bloque requiere correcciones manuales de imports y dependencias                                                 | P1 / 02          |
| F09 · E   | Fixtures consumer: alias a `dist/volt`, configuración/dependencias del workspace. CLI fixture ejecuta `cli/bin/volt` local, añade todo con `--force`. Pack usa `--dry-run`               | Buen smoke de integración; no demuestra instalación de tarballs en Angular CLI independiente y oculta conflictos como F02 | P1 / 03          |
| F10 · E   | `check-ai-docs-sync.js` compara conjuntos de nombres, no selectores/estados/ejemplos. CI/release no invocan `check:contrast`, `check:docs-completeness` ni verifican regeneración de API | Hay controles útiles que no protegen completamente la entrega                                                             | P1 / 02–03       |
| F11 · E   | `VoltButton` envuelve `<button>` sin inputs para reenviar nombre ARIA o atributos de formulario. `VoltInput` no ofrece un punto explícito de clases para el input interno                | Limitaciones de composición y personalización; caracterizar DOM/nombre accesible antes de elegir solución                 | P1 / 04          |
| F12 · E   | `SDD.md` documenta `clear-cache`, ausente del CLI. El roadmap en `en.json` sigue diciendo que la web es solo inglesa. `specs/README.md` enlaza planes v0.5/v0.6 ausentes                 | Los modelos pueden seguir instrucciones históricas inexistentes                                                           | P2 / 02          |
| F13 · E   | Root engines y docs dicen Node >=20, pero Angular 21 exige rangos más precisos                                                                                                           | La promesa de entorno es más amplia que el soporte de Angular                                                             | P1 / 03          |
| F14 · E   | CLI actual sin comparación de versiones ni registro del origen copiado; shared files se conservan si existen sin `--force`                                                               | Actualizar una copia personalizada y sus utilidades requiere investigación manual                                         | P2 / 05          |
| F15 · H   | Las suites de consumidor se configuran solo para Chromium; no se ejecutó aquí SSR/hidratación aislada, Safari, lector de pantalla ni composición completa de estilos                     | No permite prometer cobertura universal por el mero estado stable                                                         | P1 / 03–04       |

F03 es una ambigüedad de la sintaxis documentada, no prueba de que todo destino sin `/`
sea inválido. F11 no justifica migrar todos los componentes a directivas ni añadir inputs
indiscriminadamente. Primero se prueba el caso real y se escoge la menor ampliación.

## Verificación realizada

| Comando / experimento                                  | Resultado                                                       |
| ------------------------------------------------------ | --------------------------------------------------------------- |
| `rtk proxy pnpm exec vitest run`                       | 84 archivos, 505 tests pasan                                    |
| Selección previa: CLI, input, date-picker, dialog, MCP | 5 archivos, 65 tests pasan; incluidos en los 505 anteriores     |
| `rtk proxy pnpm check:contrast`                        | 130 comprobaciones: 5 colores × 2 modos × 13 pares, cero fallos |
| `rtk proxy pnpm check:docs-completeness`               | 42 exports comprobados, cero huecos según el alcance del script |
| `rtk proxy node cli/check-ai-docs-sync.js`             | 42 nombres sincronizados; pasa pese a F05–F06                   |
| `init` sobre barrel personalizado en temporal          | Contenido anterior perdido                                      |
| CLI real `add tooltip sidebar` en temporal             | Exit 1, operación parcial                                       |
| CLI real `add button badeg` en temporal                | Exit 0, typo interpretado como directorio                       |

Los temporales de reproducción se eliminaron después. pnpm emitió un aviso de sustitución
de `${NPM_TOKEN}` en la configuración local; no impidió estas verificaciones. No se
instalaron dependencias, publicaron paquetes ni consultaron credenciales.

**No ejecutado:** lint/typecheck/build completos, cobertura instrumentada, navegador,
release gate, instalación desde npm, revisión visual del sitio desplegado. No se afirma
que fallen ni que pasen. Los 130 pares de colores no equivalen a una auditoría completa
WCAG de las 50 combinaciones color/estilo/modo ni de componentes compuestos.

## Fuentes y alcance de las recomendaciones

Las rutas anteriores son relativas a la raíz del repositorio en el commit indicado.
Para contrastar requisitos externos se consultaron fuentes primarias el 2026-09-07:

- [Compatibilidad de Angular](https://angular.dev/reference/versions): Angular 21.2
  declara Node `^20.19.0 || ^22.12.0 || ^24.0.0`, TypeScript `>=5.9.0 <6.0.0`.
  Angular 22 figura también, pero eso no demuestra que Volt o sus primitivas lo soporten.
- [CLI de shadcn/ui](https://ui.shadcn.com/docs/cli): permite previsualizar y comparar
  cambios. Se toma como referencia de utilidad para código copiado, no como obligación
  de replicar su plataforma o todos sus comandos.
- [Patrones WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/): referencia para
  contratos por patrón. Su aplicación aquí requiere tests y revisión de cada composición.

La prioridad propuesta es una valoración de ingeniería a partir de este repositorio.
No se ha realizado investigación de mercado ni se infiere adopción a partir de commits.

## Resolución (revisada 2026-11-26, base `4526886` + `feat/consumer-lifecycle-reliability`)

| ID  | Estado                                                                                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F01 | Resuelto (#249): `init` conserva el barrel byte a byte.                                                                                                                 |
| F02 | Resuelto (#249): un plan único para todo el `add`, dependencias compartidas reutilizadas, rollback.                                                                     |
| F03 | Resuelto de forma compatible (#260): `--path`; el destino posicional v1 se explica cuando no parece una ruta.                                                           |
| F04 | Resuelto (#260): rangos y versión probada en el registro; `--install` con política explícita.                                                                           |
| F05 | Resuelto (#260): estado desde `COMPONENT_STATUS.md` hacia manifiesto, MCP y skills.                                                                                     |
| F06 | Resuelto (#260): selectores/clases verificados por `pnpm check:ai-docs` contra la fuente.                                                                               |
| F07 | Resuelto (#260): ejemplos compilados en modo paquete y copia (`pnpm check:examples`).                                                                                   |
| F08 | Resuelto (antes de #249, `d2705ef`): bloques, layouts y recetas se compilan desde su fuente copiable (`pnpm check:copied-source`, job `packages` de CI).                |
| F09 | Resuelto (#260): `pnpm check:consumer` con tarballs reales fuera del monorepo.                                                                                          |
| F10 | Resuelto (#260): contraste, completitud de docs y regeneración de API en CI.                                                                                            |
| F11 | Resuelto: Button ya reenviaba ARIA y ofrece `voltButton` nativo; Input/Textarea aplican ahora `aria-describedby` al control nativo (plan 04). `class` ya tenía destino. |
| F12 | Resuelto (#260): instrucciones y roadmap; rutas obsoletas `projects/volt/` y `src/` corregidas en AGENTS/GUARDRAILS en esta iniciativa.                                 |
| F13 | Resuelto: el `engines` raíz exige Node `>=22.22.0`, dentro del rango de Angular 21.2/22; el CLI no declara `engines` (plan 03, no se restringe en un patch).            |
| F14 | Resuelto (plan 05): `volt add --track` y `volt diff` de solo lectura.                                                                                                   |
| F15 | Parcial: Firefox/WebKit en `check:consumer` y contratos; SSR/hidratación en consumidor. Sin revisión con lector de pantalla en esta iniciativa.                         |
