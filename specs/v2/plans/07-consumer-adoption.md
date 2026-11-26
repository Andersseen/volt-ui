# Plan 07 — Adopción por consumidores y fidelidad de las releases

**Estado:** ejecutado en `feat/consumer-adoption-release-fidelity` (2026-11-26). **Prioridad:** P1.
**SHA de entrada:** `494b0fc078de7b131f6f4d917d171a296c87df18` (merge de #261; `origin/main` no había avanzado).
**Entrega:** una iniciativa de tamaño minor, un PR. Sin publicar, sin desplegar, sin tocar la configuración privada de npm.

## Contexto verificado al empezar

| Paquete              | Fuente | npm `latest` | Última Release de GitHub |
| -------------------- | ------ | ------------ | ------------------------ |
| `@voltui/components` | 1.4.1  | 1.3.3        | `components-v1.3.3`      |
| `@voltui/cli`        | 1.4.0  | 1.3.3        | `cli-v1.3.3`             |
| `@voltui/agent`      | 0.6.0  | 0.6.0        | `agent-v0.6.0`           |

Las seis últimas ejecuciones de **Release** fallan en el preflight OIDC con
`HTTP 404: OIDC token exchange error - package not found` para `@voltui/components`, con la identidad esperada
(`Andersseen/volt-ui`, `release.yml`, `refs/heads/main`); CLI y agente quedaban `not-attempted`.
El `gitHead` que npm registra para 1.3.1–1.3.3 y 0.6.0 coincide con los tags existentes; ninguna versión publicada
tiene atestación de provenance (se publicaron con token).

## Decisiones

1. **La evidencia de publicación manda.** Una Release que falta se crea en el commit que npm registró (`gitHead`), el
   de la atestación de provenance o un tag existente, si coinciden y están en la historia. Nunca en el commit que
   introdujo el número de versión. Sin evidencia: `release-unresolved`, nada se etiqueta.
2. **Paquetes independientes.** Un rechazo previo a publicar bloquea solo a sus dependientes (`dependsOn`); el agente
   depende del CLI porque sus skills documentan comandos del CLI.
3. **Capacidades explícitas, comprobadas contra lo publicado.** `packages/shared/lib/release-capabilities.ts` lista lo
   que la documentación y el MCP describen y npm puede no servir, con la primera versión que lo trae y una sonda.
   `pnpm check:published` exige que cada afirmación sea cierta en ambos sentidos. No se infiere nada de la versión
   fuente.
4. **Recipes reutiliza la distribución de la web.** El mismo transform (`packages/shared/lib/distribution.ts`), los
   mismos nombres generados y un manifiesto generado desde las páginas; sin segundo sistema de nombres ni registro
   manual de dependencias.
5. **MCP aditivo.** Sin versión del consumidor, las respuestas describen la fuente como antes y añaden
   `availability`; con versión, lo que falta es un error accionable. Una herramienta nueva acotada:
   `find_compositions`.
6. **Versiones:** solo `@voltui/agent` cambia en esta rama (0.6.0 → 0.6.1, patch, calculado desde npm con
   `release:bump`). Componentes 1.4.1 y CLI 1.4.0 siguen pendientes sin cambios de fuente.

## Workstream A — Integridad de las releases

- [x] Reproducir con tests el riesgo de reconciliación: publicado, GitHub falla, main avanza → la Release va al commit
      publicado, no a la punta ni al que introdujo la versión (`scripts/release.spec.mjs`).
- [x] Evidencia: `fetchVersionEvidence` (gitHead, integridad, commit de provenance SLSA v1/v0.2), `resolveReleaseTarget`,
      tag existente e historia (`git merge-base --is-ancestor`). Desacuerdo o ausencia → `release-unresolved`.
- [x] Publicación del propio run: Release en el SHA del run; si npm registró otro `gitHead`, no se etiqueta.
- [x] `dependsOn` y bloqueo solo de dependientes tras un rechazo previo; un fallo durante la publicación sigue
      deteniendo todo.
- [x] `pnpm release:readiness` (lectura, determinista con fixtures, `--json`).
- [x] `release:bump` pliega `[Unreleased]` en una versión pendiente; secciones no publicadas marcadas.
- [x] Diagnóstico del 404 OIDC con las comprobaciones del propietario; `RELEASING.md` contrastado con la documentación
      oficial de npm (2026-10-06): campos exactos, `npm publish` permitido (por defecto solo `stage publish` desde
      2026-09-03), caducidad de 2 días, `npm trust`, reintento y verificación de los tres paquetes.
- [x] Casos probados: registro no disponible, versión inválida, versión publicada, pendiente, rechazo OIDC, publicado +
      GitHub falla, reconciliación tras cambios posteriores, publicación parcial, ejecución repetida, dry run.

## Workstream B — Recipes en los dos modos

- [x] Modo paquete y copia para las 63 composiciones con `CodePanel` compartido; comandos por modo; ficheros de apoyo
      con el mismo modo; modo compartido entre páginas (en memoria; el servidor renderiza paquete).
- [x] Manifiesto generado (`pnpm generate:compositions`, en `check:generated`): página ↔ composición ↔ fuente mostrada,
      ficheros hermanos, imports prohibidos, componentes declarados frente a importados (por carpeta).
- [x] Caracterización del transform: alias, `type`, multilínea con comentarios, re-export, plantillas, ficheros
      hermanos, prosa. Arreglos demostrados: re-export, comentarios, rechazo de formas no expresables.
- [x] B.4: el layout Sidebar mostraba la implementación de la librería y quedaba fuera de la validación; ahora es una
      composición real sobre la API pública. Ninguna composición se excluye.
- [x] B.5: guía «Workflow patterns» (en/es/uk) y «Copying a recipe» para ambos modos.
- [ ] Texto por receta en las tarjetas del listado (sigue aplazado en `docs/recipes-app.md`).

## Workstream C — Documentación consciente de versión

- [x] Modelo: `release-capabilities.ts` + `release-availability.generated.ts` (fuente y npm de los tres paquetes;
      último valor conocido si npm falla, nunca la fuente).
- [x] Avisos contextuales (`AvailabilityNote`, Doqs `::demo[availability-*]`) en Introducción, Input y Checkbox;
      desaparecen cuando npm lo tiene; dicen si el registro no pudo confirmarse.
- [x] Nunca una versión no publicada en un comando de instalación (los comandos no fijan versión; el MCP no la sugiere).
- [x] `pnpm check:published` separado del arnés de tarballs; job `published` en CI.
- [ ] Bloques de código Markdown de las guías: no se compilan contra lo publicado (el ejemplo de `density` se encontró
      a mano en el ejercicio). Candidato siguiente.

## Workstream D — MCP y agente

- [x] Contexto de versión opcional (`componentsVersion`, `cliVersion`, `agentVersion`) en `get_project_info`,
      `get_component`, `get_usage_example`; `project://info` incluye las versiones.
- [x] `generate_cli_command`: validación de nombres, varios componentes, citado POSIX, `argv`, rechazo de rutas
      peligrosas, disponibilidad por versión, alternativa posicional para `--path`.
- [x] `find_compositions` desde el manifiesto generado; inventario y tests sincronizados.
- [x] Skills de distribución, adopción, selección, formularios, estilos y router; `VOLT_UI_PROMPT.md`; instalador.
      Sin skill nueva.

## Workstream E — Evidencia de adopción

- [x] `check:copied-source` en ambos modos; copia con el tarball del CLI; tests negativos
      (`scripts/copied-source.spec.mjs`).
- [x] `check:consumer`: 63 composiciones en ambos modos en el proyecto aislado (primero sin los paquetes indicados:
      debe fallar), y app de onboarding con cuatro composiciones en ambos modos, SSR + hidratación, Button copiado y
      personalizado, `volt diff` que reporta exactamente ese fichero, checks de navegador.
- [x] Ejercicio manual interno (abajo).

## Ejercicio manual de adopción (interno, 2026-11-26)

**No es investigación con usuarios**: lo realizó el agente que implementó este plan, en un proyecto desechable fuera
del repositorio, con las instrucciones publicadas y los paquetes de npm (1.3.3 / 1.3.3). Tiempos con caché de npm
caliente; excluyen descargas en frío.

### 1. Formulario siguiendo las instrucciones oficiales

| Paso                                                                                 | Resultado                                                                                                                                                              |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx @angular/cli@22 new`                                                            | Falla en este equipo («inside a workspace»), también con `HOME` limpio; ajeno a Volt. Proyecto montado a mano (package.json, angular.json, tsconfig) como en el arnés. |
| `npm install @voltui/components` / `npm install -D tailwindcss @tailwindcss/postcss` | 2 s / 1 s; instala 1.3.3.                                                                                                                                              |
| `styles.css` con `@import '@voltui/components/themes.css'` (opción 1)                | —                                                                                                                                                                      |
| `provideVoltTheme({ …, density: 'comfortable' })` (ejemplo de la guía)               | **Error**: `TS2353 'density' does not exist in type 'VoltThemeOptions'` (1.3.3).                                                                                       |
| Patrón settings-form copiado en modo paquete                                         | Compila tras quitar `density` (build 2 s), pero **sin ninguna utilidad de Tailwind** (CSS 4,8 KB).                                                                     |
| `.postcssrc.json` + `@import 'tailwindcss'` antes del tema                           | CSS 59 KB con las utilidades; el formulario valida, enfoca y guarda en Chromium, sin avisos.                                                                           |

Correcciones manuales necesarias: 2 (quitar `density`; completar Tailwind). Ambas corregidas en la Introducción
(en/es/uk). Hallazgo adicional en el arnés: el patrón settings-form perdía el clic de Guardar cuando un error aparecía
al salir del campo, y el foco tras un envío inválido se quedaba en Guardar (Chromium y Firefox); corregido con tests.
Tiempo hasta el primer formulario funcionando: ~15 min de trabajo, la mayor parte en diagnosticar los dos problemas.

### 2. Trasladar una corrección a una copia personalizada

| Paso                                                                               | Resultado                                                                                                  |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `npx @voltui/cli@1.3.3 add textarea src/app/ui`                                    | Copia; sin `--track` (no existe en 1.3.3).                                                                 |
| Personalizar `ui/textarea/variants.ts` (clase propia)                              | —                                                                                                          |
| Plantilla con `rows="4"`                                                           | **TS2322** con la copia 1.3.3 (corregido en la fuente 1.4.x).                                              |
| Instalar el tarball de `@voltui/cli` 1.4.0; `volt diff textarea --path=src/app/ui` | Exit 1; procedencia desconocida (sin registro); 4 de 7 ficheros difieren; diff legible local → referencia. |
| Trasladar a mano el hunk de una línea de `rows`                                    | Build correcta; la personalización se conserva; ningún fichero cambiado por `diff`.                        |

Tiempo: ~5 min. Límite observado: sin `--track` (no publicado aún) `diff` no puede decir qué lado cambió, y el diff de
Textarea mezcla la corrección con la función de `aria-describedby`, que además necesita el helper compartido.

## Verificación

Ver «Registro de ejecución». Comandos con el prefijo `rtk` cuando RTK está instalado.

## Límites y siguiente paso

- **Bloqueo operativo:** Trusted Publishing de npm (configuración del propietario; `RELEASING.md`, «Trusted
  Publishing recovery»). Ningún cambio de código lo resuelve.
- Revisión manual con lector de pantalla y zoom 200 % (plan 04, fase C) sigue pendiente.
- Los ejemplos de código en Markdown no se compilan contra lo publicado.
- Sin feedback de consumidores externos.

## Registro de ejecución

### 2026-11-26

- Rama `feat/consumer-adoption-release-fidelity` desde `494b0fc`.
- Resultados de verificación: se completan al cerrar.
