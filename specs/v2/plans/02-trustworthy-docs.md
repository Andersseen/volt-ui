# Plan 02 — Documentación y contexto IA que se pueden ejecutar

**Estado:** fases A, B y C implementadas en `feat/consumer-distribution-dx` (entrada `72cb016`). **Prioridad:** P1. **Depende de:** plan 01 para validar copia.
**Hallazgos:** F05–F08, F10, F12. **Entrega:** correcciones de documentación y tooling;
sin cambios de API pública de componentes.

## Contexto y archivos

Leer `cli/generate-manifest.js`, `cli/check-ai-docs-sync.js`, `COMPONENT_STATUS.md`,
`src/app/lib/component-metadata.ts`, `scripts/generate-api-reference.mjs`,
`src/app/lib/snippets/{index,usage,blocks,layouts}.ts` y `src/app/components/code-panel.ts`.
Para IA: `.agents/skills/volt-ui/SKILL.md`, `VOLT_UI_PROMPT.md`,
`cli/mcp/setup-mcp.js`, `src/server/routes/mcp.ts`, `src/server/routes/mcp/setup.ts`.

El manifiesto actual no es autoridad suficiente sobre estados: contiene 24 beta mientras
el documento de estabilidad declara todos stable. El check de IA compara nombres y no
detecta selectores erróneos. No resolverlo añadiendo más listas independientes.

## Fase A — Corregir la información falsa que ya se distribuye

- [x] Contrastar estados con fuente, pruebas y `COMPONENT_STATUS.md`; corregir generador,
      skill y contenido instalado/servido. No usar esta fase para promocionar componentes
      nuevos sin evidencia ni degradar el catálogo existente por falta de pruebas nuevas.
- [x] Corregir selectores/exports de form-field y revisar los restantes ejemplos IA contra
      fuente: después de copiar son `UiLabel` / `ui-label`, `UiHint` / `ui-hint` y
      `UiError` / `ui-error`. No inventar aliases para hacer verdaderas las docs equivocadas.
- [x] Identificar comandos inexistentes como `clear-cache` y corregir referencias vigentes.
- [x] Al adoptar este SDD, actualizar el roadmap en en/es/uk: traducciones completadas,
      nueva secuencia, headless y segunda salida de estilos aplazados. Retirar la afirmación
      de que los idiomas siguen pendientes. Conservar el historial de v1 como historial.
- [x] Revisar enlaces de `specs/README.md` y distinguir planes disponibles de hitos cuyo
      archivo no existe. No reconstruir planes históricos como si estuvieran pendientes.

## Fase B — Una sola fuente de datos técnicos

- [x] Inventariar productores y consumidores de estado, categoría, selector, ejemplo y
      versión. Registrar en este plan qué archivo será autoridad de cada dato.
- [x] Crear la metadata editorial mínima descrita en el SDD y alimentar desde ella el
      generador del manifiesto, catálogo y tabla de estados. Mantener las TranslationKey
      del sitio y las tres traducciones; no introducir texto visible fuera de `t()`.
- [x] Extraer API desde fuente usando/mejorando `generate-api-reference.mjs`. Cubrir
      hostDirectives, aliases, `model()` y sus outputs, herencia/reexports cuando existan.
      Un caso no soportado debe fallar con explicación, no omitirse silenciosamente.
- [x] Generar o comprobar secciones técnicas de skill, prompt, MCP e instaladores. La
      prosa se mantiene editorial. Reusar el instalador único de `cli/mcp/setup-mcp.js`.
- [x] Añadir modo de comprobación sin escritura para salidas generadas. Si no coincide la
      regeneración, fallar y mostrar el comando de reparación. No regenerar silenciosamente
      en CI y declarar sincronía sobre archivos que llegaron desactualizados.
- [x] Probar que un cambio deliberado de estado, selector o input provoca fallo del check.
      Añadir tests del generador con casos reales, no solo búsqueda de strings en tablas.

**Aceptación:** cada dato técnico tiene una autoridad identificada; ninguna salida puede
conservar F05/F06 y pasar el nuevo check. No es necesario generar toda la documentación.

## Fase C — Ejemplos compilables: piloto y extensión

- [x] Empezar con button, card y form-field. Convertir el ejemplo en fuente Angular con
      todos los imports, decorador completo y datos necesarios para compilar templates.
- [x] Usar esa fuente para la demostración y el snippet. Evitar dos implementaciones
      manuales del mismo ejemplo. No usar `NO_ERRORS_SCHEMA`/`CUSTOM_ELEMENTS_SCHEMA`
      para ocultar imports o selectores faltantes en los ejemplos.
- [x] Definir dos salidas: copia CLI por defecto (`Ui*`, `ui-*`, imports locales explícitos)
      e import npm cuando esté soportado (`Volt*`, `volt-*`, `@voltui/components`). Ninguna
      salida entregada al consumidor depende de `from 'volt'`.
- [x] Adaptar también selectores dentro del template. El transformador actual de archivos
      no basta como garantía para snippets: comprobar tags, atributos, imports relativos,
      helpers y reexports. No cambiar palabras en textos, comentarios o URLs arbitrarios.
- [x] Extender por lotes al resto de ejemplos declarados completos, bloques y layouts.
      Mostrar todos los archivos necesarios cuando haya dependencias locales; listar e
      instalar en la fixture dependencias externas de iconos o movimiento utilizadas.
- [x] Los fragmentos parciales deben identificarse como tales y compilarse insertados en
      un host explícito conocido. No etiquetar como fragmento algo antes «copiar y usar»
      solo para eludir su validación.
- [x] Mantener el código visible y el texto copiado iguales para el modo seleccionado.
      Probar el contenido real del portapapeles al menos para un componente y un bloque.
- [x] Conectar validación de templates a un script local; el plan 03 lo ejecutará además
      contra los tarballs en el consumidor aislado.

**Aceptación:** cero aliases del workspace en artefactos de consumidor; todos los ejemplos
completos compilan y los fragmentos tienen host verificado. `CARD_USAGE` debe importar
sus subcomponentes; los iconos de button deben estar importados o no formar parte del
ejemplo mínimo. Los bloques conservan su copy de demostración sin dependencia de i18n.

## Verificación y límites

Con `rtk proxy`: `pnpm check:ai-docs`, `pnpm check:docs-completeness`, `pnpm typecheck`,
`pnpm lint`, `pnpm test:run`, `pnpm build`, `pnpm build:lib`, `pnpm pack:cli` y
`pnpm pack:mcp`. Incorporar los nuevos checks de generación/templates con sus nombres
reales en el registro de ejecución. Build de docs es obligatorio por traducciones y
templates; `tsc` solo no prueba eso. El plan 03 cierra la integración externa.

No crear un CMS, servidor de registry nuevo, herramientas IA adicionales, segunda skill
manual ni componentes nuevos. Mantener las herramientas y transportes MCP actuales.

## Registro de ejecución

### 2026-11-25 — Fases A, B y C

**Infraestructura existente conservada (no reimplementada):** el estado ya se leía de
`COMPONENT_STATUS.md` en manifiesto, catálogo, MCP y skills (corregido antes de esta rama); responsabilidades
desde las guías de Storybook (`scripts/lib/component-catalog.mjs`); checks `--check` de los generadores.
Los hallazgos F05/F06 de la auditoría (estados beta, selectores de form-field) ya no se reproducían.

**Autoridad por dato:**

| Dato                                                          | Autoridad                                                         | Consumidores generados                                                                                       |
| ------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Selectores, inputs, outputs, models, host directives, exports | Fuente Angular (`scripts/lib/api-extract.mjs`, AST de TypeScript) | `api-reference.generated.ts`, `mcp/api.generated.ts`, `shared/lib/volt-names.generated.ts`, MDX de Storybook |
| Variantes CVA                                                 | `variants.ts` de cada componente                                  | idem                                                                                                         |
| Estabilidad                                                   | `COMPONENT_STATUS.md`                                             | manifiesto, catálogo, MCP, skills                                                                            |
| Responsabilidad, título, grupo                                | Guías de Storybook                                                | manifiesto (label/group/description), MCP, skills                                                            |
| Claves de traducción y rutas                                  | `apps/web/src/app/lib/component-metadata.ts`                      | sitio                                                                                                        |
| Rangos de dependencias                                        | `packages/volt/package.json`                                      | manifiesto (`runtime`), CLI, MCP (`packages`)                                                                |
| Ejemplos                                                      | `snippets/usage.ts` (completos) y `mcp/editorial.ts` (fragmentos) | panel de código en dos modos, MCP                                                                            |

`cli/generate-manifest.js` ya no tiene tabla propia de categoría/label/descripción. `mcp.ts` ya no tiene
la tabla manual de inputs/variantes/dependencias (servía `delayMs` en Avatar y `collapsed` en Sidebar,
inexistentes); solo descripción y ejemplos en `mcp/editorial.ts`. No se creó un registro nuevo.

**Extracción de API:** reescrita con el compilador de TypeScript (ya dependencia). Soporta `input`,
`input.required`, aliases, transform, `model` y `model.required` con su output, `output`, `@Input`/`@Output`,
host directives con tipos resueltos desde fuente Volt o `.d.ts` de ng-primitives, herencia, varias clases
por archivo, todos los `cva()` y exports del barrel. Forma no soportada → diagnóstico de error que hace
fallar el generador. Corrigió filas erróneas: variantes fantasma `defaultVariants`/`variants` en
navigation-menu, default de `inset` en listbox, `page` de pagination con las opciones como default.
`generate-api-freeze.mjs` usa el mismo extractor. Fixtures: `scripts/lib/api-extract.spec.mjs` (14).

**Checks sin escritura:** `node cli/generate-manifest.js --check` construye en memoria y falla si el
manifiesto en disco está obsoleto; está en `check:generated`. `check:ai-docs` ya no regenera el manifiesto.
Nota: el manifiesto está en `.gitignore` (no es un archivo comprometido); en CI se valida que se construye
y `prepare-package.js` rechaza empaquetar uno obsoleto. `scripts/generated-drift.spec.mjs` ejecuta los
generadores reales sobre una copia de las fuentes (`VOLT_REPO_ROOT`): renombrar un input, cambiar un
selector, cambiar un estado o importar un paquete no declarado hace fallar el check con el comando de
reparación.

**Ejemplos compilables (`pnpm check:examples`, `scripts/check-examples.mjs`):** inventario: 45 ejemplos
completos (`usage.ts`), 74 parciales (fragmentos MCP + 1 snippet solo de marcado) compilados en el host
documentado, bloques/layouts/patterns de Recipes por `check-copied-source.mjs` (sin cambios). Ambos modos:
paquete y copia CLI (transform `packages/shared/lib/distribution.ts`, solo renombra nombres declarados).
`strictTemplates` y diagnósticos extendidos como error. Corregido: iconos no declarados (`lmn-x`, `lmn-bold`,
`lucide-icon`), popover con botón dentro de botón, snippet de navigation-menu que no era TypeScript válido,
fragmentos MCP sin inputs requeridos, `inject()` fuera de contexto, `*ngpDatePickerRowRender` sin importar,
y en la librería 17 inputs numéricos con `input<number, number>` que rechazaban atributos estáticos en
templates estrictos (ahora `input<number, unknown>`).

**Panel de código:** los 38 ejemplos de uso del sitio muestran y copian el modo paquete o copia CLI
(claves Glossa `ui.codePanel.modeLabel/modePackage/modeCopy`). Tests de portapapeles: un componente en ambos
modos (`code-panel.spec.ts`) y un bloque completo (`block-showcase.spec.ts`).

**Roadmap:** nuevas claves `guide.roadmapPage.v2.*` en en/es/uk; headless propio y distribución sin Tailwind
marcados como aplazados. Las claves antiguas siguen en Glossa hasta el despliegue (borrarlas después).
`clear-cache`: no aparece en contenido vigente.

**Evidencia:** `pnpm check:generated`, `pnpm check:ai-docs`, `pnpm check:examples` en verde; tests MCP (29),
distribución (7), code panel, bloque. Builds de docs en verde.

**Limitaciones:** los fragmentos parciales se comprueban en un host con miembros sin tipo (verifica
selectores, inputs y literales, no los tipos de expresiones del consumidor). La descripción editorial del
MCP sigue siendo prosa manual.
