# Plan 01 — CLI que conserva el código del consumidor

**Estado:** fases A y B en #249 (mergeada, `72cb016`); fase C implementada en `feat/consumer-distribution-dx`. **Prioridad:** P0/P1. **Depende de:** nada.
**Hallazgos:** F01–F04. **Entrega:** correcciones compatibles primero; opciones nuevas en minor.

## Contexto y archivos

Leer `cli/bin/volt`, `cli/lib/core.js`, `cli/tests/core.spec.js`, `CLI.md`,
`cli/prepare-package.js` y `cli/generate-manifest.js`. El comando recorre cada nombre y
copia por separado; sidebar depende de tooltip. `initProject` escribe el barrel sin
comprobar existencia. Las dependencias runtime se instalan por nombre sin versión.

No reescribir el CLI ni sustituir su distribución local por un registro remoto.

## Fase A — Reproducción y corrección urgente

- [x] Verificar estado de git y ejecutar `rtk proxy pnpm exec vitest run cli/tests/core.spec.js`.
- [x] Añadir regresión con barrel editado, segundo init y comparación exacta de bytes.
- [x] Hacer init idempotente: directorio ausente se crea, barrel ausente se crea,
      barrel existente se conserva incluso si tiene comentarios/exports personalizados.
- [x] Añadir casos init vacío, init repetido y error de permisos con mensaje accionable.

**Aceptación:** volver a iniciar un proyecto nunca elimina código existente. Esta fase
se puede entregar sin esperar a las siguientes.

## Fase B — Un plan para toda la operación add

- [x] Reproducir mediante el binario real `add tooltip sidebar <destino temporal>`.
- [x] Resolver la unión de dependencias y utilidades una vez; deduplicar por ruta final.
- [x] Transformar y validar todos los archivos antes de escribir. Resolver barrel como
      parte del mismo plan, preservando exports y comentarios existentes.
- [x] Definir y probar archivos existentes: idéntico al resultado esperado = reutilizar;
      distinto = conflicto y cero escrituras salvo `--force` explícito.
- [x] Utilidades compartidas modificadas: no sobreescribir sin force; si difieren de la
      fuente esperada, informar y detener la operación con explicación. No dejarlas
      silenciosamente desactualizadas ni marcarlas idénticas.
- [x] `--dry-run` usa el plan real y comunica los mismos conflictos. No crea directorios,
      metadatos, archivos, lockfiles ni ejecuta instalaciones.
- [x] Simular fallo de escritura: restituir archivos tocados y quitar solo los nuevos
      de esta operación; no borrar directorios ajenos. No prometer atomicidad del gestor
      de paquetes. Si este falla después, informar del estado y del reintento.

**Casos mínimos:** orden `tooltip sidebar` y `sidebar tooltip`, nombres repetidos,
dependencia idéntica preexistente, dependencia editada, fuente faltante, barrel editado,
dry-run y force. Probar por CLI real además de funciones internas.

## Fase C — Destino y versiones predecibles

- [x] Añadir `--path=<directorio>` y `--path <directorio>` sin retirar destinos v1
      posicionales. Con path explícito, un componente desconocido falla antes de escribir.
- [x] Mantener `add button custom-ui` como destino válido de v1. Informar que se ha
      interpretado como ruta y recomendar `--path` para evitar ambigüedad. No inferir
      permisos para retirar esa sintaxis en un patch.
- [x] Definir error por flags desconocidos, opciones sin valor y argumentos sobrantes;
      revisar compatibilidad antes de cambiar salidas usadas por scripts.
- [x] Resolver raíz del proyecto y gestor desde el directorio seleccionado, ascendiendo
      a su package.json/lockfile. Probar ejecución desde subcarpeta y workspaces; en caso
      ambiguo requerir ruta explícita, no instalar en otro paquete por accidente.
- [x] Incluir versiones/rangos runtime probados en el registro empaquetado, empezando
      por la versión exacta de ng-primitives usada para validar la copia. No hardcodear
      una segunda tabla desconectada del origen de versiones.
- [x] Instalar una sola vez con `--install`. Conservar versiones existentes compatibles;
      ante incompatibilidad, explicarla sin actualizar Angular ni reescribir dependencias
      ajenas automáticamente. Derivar la política final del plan 03.
- [x] Actualizar ayuda, CLI.md y ejemplos relevantes en los tres idiomas.

## Verificación y límites

Ejecutar los tests CLI, `pnpm typecheck`, `pnpm lint`, `pnpm test:run` y `pnpm pack:cli`
con `rtk proxy`. Si cambia el manifiesto, regenerar y verificar `pnpm check:ai-docs`.
Build de docs cuando cambien templates/textos tipados. Plan 03 añadirá la instalación
externa del tarball; el dry-run de pack por sí solo no cierra esa garantía.

Sin nuevos comandos update/doctor, wizard de configuración, cambios de componentes ni
publicación. Nuevas flags son capacidades propuestas, no comandos disponibles hoy.

## Registro de ejecución

### 2026-11-25 — Fases A y B (`fix/cli-integrity`)

- **SHA de entrada:** `228debdd42c8b811b9fcd2bc6cd79225688b1a2d` (main = origin/main, CI de main verde;
  el workflow Release sigue fallando por la configuración OIDC de npm, fuera de alcance).
- **Reproducción previa:** `initProject` hacía `writeFileSync` del barrel siempre; `bin/volt` llamaba a
  `copyComponent` por nombre, y cada llamada validaba solo su propio conjunto, así que
  `add tooltip sidebar` copiaba tooltip y luego rechazaba sidebar porque `tooltip/*` ya existía.
  `copySharedFileIfNeeded` devolvía sin comparar si la utilidad ya existía.
- **Garantías implementadas:**
  - `init`: crea directorio y barrel si faltan; un `index.ts` existente se conserva byte a byte
    (escritura con `wx`); idempotente; errores de permisos con mensaje accionable.
  - `add`: un plan para toda la petición (`cli/lib/add-plan.js`): resolver → recoger dependencias
    transitivas → deduplicar por ruta final → transformar → comparar con disco → barrel. Orden
    determinista: solicitados en el orden dado, luego dependencias según se descubren; utilidades en el
    orden de `SHARED_LIB_FILES`.
  - Archivo ausente = `create`; idéntico (ignorando CRLF/LF) = `reuse`; distinto = `conflict`, o
    `replace` con `--force`. Igual para componentes y utilidades compartidas.
  - Conflicto, componente desconocido, fuente ausente, base no soportada, destino que no es
    archivo/directorio o colisión de rutas → error antes de la primera escritura.
  - Escritura (`cli/lib/apply-plan.js`): crea con `wx`, guarda el contenido original antes de
    reemplazar y registra directorios creados; ante un fallo restaura, borra solo lo creado y solo
    directorios vacíos creados por la operación. El barrel se escribe el último.
  - Barrel (`cli/lib/barrel.js`): solo añade `export * from './x';` que falten; reconoce exports
    existentes en cualquier comilla, con `/index` o extensión, o `export { … } from`; ignora exports
    comentados; conserva EOL. Solo elimina el marcador `export {};` de `init` cuando está solo en su línea.
  - `--dry-run` imprime el mismo plan (solicitados, dependencias, utilidades, acción por archivo,
    exports del barrel) y sale con 1 si la ejecución real se detendría. No crea nada ni escribe
    `volt.json` ni instala.
  - `--install` instala una vez tras escribir; si falla, informa de que los archivos quedan y del
    comando manual.
- **Archivos cambiados:** `cli/bin/volt`, `cli/lib/core.js`, `cli/lib/add-plan.js` (nuevo),
  `cli/lib/apply-plan.js` (nuevo), `cli/lib/barrel.js` (nuevo), `cli/tests/integrity.spec.js` (nuevo),
  `cli/tests/core.spec.js`, `e2e/consumer-cli/generate.mjs`, `CLI.md`, `README.md`, `CHANGELOG.md`,
  `cli/agent/skills/volt-ui-distribution/SKILL.md` (+ copias generadas).
- **Tests:** `cli/tests/integrity.spec.js` ejecuta el binario real en proyectos temporales: init
  (nuevo, repetido, barrel vacío/generado/personalizado/CRLF, destino archivo, permisos), add simple
  (reutilizar, conflicto, force, nombre repetido), multi-add en ambos órdenes, utilidades
  (reutilizar, rechazar, force, CRLF), seguridad ante fallos (conflicto tardío, base no soportada,
  fuente ausente, fallo de escritura inyectado, fallo del barrel, fallo real por permisos en el
  binario) y dry-run (sin efectos, concordancia con la ejecución real, conflicto, force). Una mutación
  que desactiva el rollback hace fallar los tres tests de recuperación.
- **Cambio de test existente:** «should fail when adding over an existing component» esperaba que
  re-añadir un componente idéntico fallara; ahora edita el archivo antes, que es la protección que
  pide este plan (re-añadir idéntico = reutilizar).
- **Fixture consumer-cli:** `generate.mjs` borra su salida generada (`src/ui/`, ignorada por git)
  antes de regenerar, porque `init` ya no reinicia el barrel, y añade el catálogo completo en una sola
  operación **sin** `--force`.
- **Fase B restante:** ninguna tarea abierta.
- **Fase C (aplazada, sin tocar):** `--path`, rediseño de argumentos y flags desconocidos, raíz de
  proyecto/workspaces y detección del gestor, versiones runtime en el registro, política de instalación,
  ayuda en tres idiomas.
- **Limitaciones conocidas:**
  - El rollback no es a prueba de caídas del proceso; si la restauración falla, el error lista las rutas.
  - Entre el plan y la escritura otro proceso podría editar un archivo planificado como `replace`; un
    archivo que aparece donde se planificó `create` sí se detecta (`wx`) y provoca rollback.
  - `volt add button nope ./ui` sigue interpretando `nope` como destino (sintaxis posicional v1, fase C).
  - `writeConfig` (`volt.json`) se escribe tras copiar con éxito y queda fuera del rollback.
- **Preguntas abiertas:** comportamiento exacto en varios package.json/lockfiles (fase C).
- **Próximo paso:** fase C.

### 2026-11-25 — Fase C (`feat/consumer-distribution-dx`)

- **SHA de entrada:** `72cb0160` (merge de #249; main = origin/main).
- **Implementado:**
  - `cli/lib/args.js`: parser por comando. Flags desconocidas (con sugerencia), flags de valor sin
    valor o vacías, valor en flag booleana, repetición contradictoria, posicionales sobrantes y comando
    desconocido → error y salida 1. `--path=<dir>` y `--path <dir>`.
  - `volt add`: con `--path` todos los posicionales son componentes (desconocido → error antes de
    escribir). Sin `--path` se mantiene el destino posicional v1; un nombre sin aspecto de ruta se
    explica y se recomienda `--path`; argumentos tras el destino son error (antes se ignoraban).
  - `cli/lib/project.js`: paquete = `package.json` más cercano al destino; workspace pnpm/npm/Yarn/Bun
    que lo incluye; gestor por campo `packageManager` o lockfile; lockfiles de dos gestores = ambiguo.
    Destino por defecto: `src/app/ui` del paquete (también desde subcarpetas); raíz de workspace sin
    destino → error con las apps candidatas. `volt.json` junto al `package.json` del destino.
  - Manifiesto: `runtime.packages` (rango de `packages/volt/package.json` + versión probada del lockfile),
    `runtime.angular` (peers) y `packages` por componente (cierre transitivo). Sin tabla manual.
  - `cli/lib/dependencies.js` + `cli/lib/semver.js` (sin dependencias nuevas): estados keep/add/declare/
    install/problem; `--install` bloquea antes de escribir ante incompatibilidad, Angular ausente, gestor
    ambiguo, sin `package.json` o el propio repo Volt; instala una vez y verifica después.
- **Decisiones:** comando desconocido pasa de ayuda+0 a error+1 (documentado en CHANGELOG). Un paquete
  presente solo transitivamente se declara (no se confía en el hoisting).
- **Tests:** `cli/tests/args.spec.js` (parser y semver, 32), `cli/tests/destination.spec.js` (binario real,
  gestor falso en PATH: destinos, subcarpeta, fuera del cwd, workspaces pnpm/npm, 5 lockfiles, ambigüedad,
  repo Volt, política de instalación, 34). Total CLI: 178 en verde. Instalación real del tarball:
  `scripts/check-consumer.mjs` (plan 03).
- **Documentación:** `CLI.md`, `README.md`, skill `volt-ui-distribution` (+ copias generadas y contenido
  del instalador), roadmap en/es/uk.
- **Limitaciones:** no se valida que `@angular/cdk` añadido exista en la misma minor que core si Angular
  publica minors desacompasadas; Yarn Berry vs 1 se distingue por `.yarnrc.yml`.
