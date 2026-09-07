# Plan 02 — Documentación y contexto IA que se pueden ejecutar

**Estado:** no iniciado. **Prioridad:** P1. **Depende de:** plan 01 para validar copia.
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

- [ ] Contrastar estados con fuente, pruebas y `COMPONENT_STATUS.md`; corregir generador,
      skill y contenido instalado/servido. No usar esta fase para promocionar componentes
      nuevos sin evidencia ni degradar el catálogo existente por falta de pruebas nuevas.
- [ ] Corregir selectores/exports de form-field y revisar los restantes ejemplos IA contra
      fuente: después de copiar son `UiLabel` / `ui-label`, `UiHint` / `ui-hint` y
      `UiError` / `ui-error`. No inventar aliases para hacer verdaderas las docs equivocadas.
- [ ] Identificar comandos inexistentes como `clear-cache` y corregir referencias vigentes.
- [ ] Al adoptar este SDD, actualizar el roadmap en en/es/uk: traducciones completadas,
      nueva secuencia, headless y segunda salida de estilos aplazados. Retirar la afirmación
      de que los idiomas siguen pendientes. Conservar el historial de v1 como historial.
- [ ] Revisar enlaces de `specs/README.md` y distinguir planes disponibles de hitos cuyo
      archivo no existe. No reconstruir planes históricos como si estuvieran pendientes.

## Fase B — Una sola fuente de datos técnicos

- [ ] Inventariar productores y consumidores de estado, categoría, selector, ejemplo y
      versión. Registrar en este plan qué archivo será autoridad de cada dato.
- [ ] Crear la metadata editorial mínima descrita en el SDD y alimentar desde ella el
      generador del manifiesto, catálogo y tabla de estados. Mantener las TranslationKey
      del sitio y las tres traducciones; no introducir texto visible fuera de `t()`.
- [ ] Extraer API desde fuente usando/mejorando `generate-api-reference.mjs`. Cubrir
      hostDirectives, aliases, `model()` y sus outputs, herencia/reexports cuando existan.
      Un caso no soportado debe fallar con explicación, no omitirse silenciosamente.
- [ ] Generar o comprobar secciones técnicas de skill, prompt, MCP e instaladores. La
      prosa se mantiene editorial. Reusar el instalador único de `cli/mcp/setup-mcp.js`.
- [ ] Añadir modo de comprobación sin escritura para salidas generadas. Si no coincide la
      regeneración, fallar y mostrar el comando de reparación. No regenerar silenciosamente
      en CI y declarar sincronía sobre archivos que llegaron desactualizados.
- [ ] Probar que un cambio deliberado de estado, selector o input provoca fallo del check.
      Añadir tests del generador con casos reales, no solo búsqueda de strings en tablas.

**Aceptación:** cada dato técnico tiene una autoridad identificada; ninguna salida puede
conservar F05/F06 y pasar el nuevo check. No es necesario generar toda la documentación.

## Fase C — Ejemplos compilables: piloto y extensión

- [ ] Empezar con button, card y form-field. Convertir el ejemplo en fuente Angular con
      todos los imports, decorador completo y datos necesarios para compilar templates.
- [ ] Usar esa fuente para la demostración y el snippet. Evitar dos implementaciones
      manuales del mismo ejemplo. No usar `NO_ERRORS_SCHEMA`/`CUSTOM_ELEMENTS_SCHEMA`
      para ocultar imports o selectores faltantes en los ejemplos.
- [ ] Definir dos salidas: copia CLI por defecto (`Ui*`, `ui-*`, imports locales explícitos)
      e import npm cuando esté soportado (`Volt*`, `volt-*`, `@voltui/components`). Ninguna
      salida entregada al consumidor depende de `from 'volt'`.
- [ ] Adaptar también selectores dentro del template. El transformador actual de archivos
      no basta como garantía para snippets: comprobar tags, atributos, imports relativos,
      helpers y reexports. No cambiar palabras en textos, comentarios o URLs arbitrarios.
- [ ] Extender por lotes al resto de ejemplos declarados completos, bloques y layouts.
      Mostrar todos los archivos necesarios cuando haya dependencias locales; listar e
      instalar en la fixture dependencias externas de iconos o movimiento utilizadas.
- [ ] Los fragmentos parciales deben identificarse como tales y compilarse insertados en
      un host explícito conocido. No etiquetar como fragmento algo antes «copiar y usar»
      solo para eludir su validación.
- [ ] Mantener el código visible y el texto copiado iguales para el modo seleccionado.
      Probar el contenido real del portapapeles al menos para un componente y un bloque.
- [ ] Conectar validación de templates a un script local; el plan 03 lo ejecutará además
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

- Implementación: pendiente.
- Autoridades de datos y scripts finales: pendiente.
- Evidencia de aceptación: pendiente.
- Preguntas abiertas: ninguna que impida la fase A; resolver la extracción de APIs
  especiales con ejemplos reales durante B.
- Próximo paso: fase A.
