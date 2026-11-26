# Plan 05 — Revisar actualizaciones conservando las modificaciones locales

**Estado:** implementado en `feat/consumer-lifecycle-reliability` (2026-11-26). **Prioridad:** P2. **Depende de:** 01–03 (cumplidas, #249 y #260).
**Hallazgo:** F14. **Entrega:** capacidad aditiva del CLI; no motor de actualizaciones.

## Problema y experiencia propuesta

Después de editar un componente copiado, el consumidor necesita ver diferencias con una
versión de Volt sin sobrescribir su trabajo. La guía actual orienta a recopia y diff
manual. Una comparación de solo lectura permite revisar correcciones con menor riesgo.

**Sintaxis implementada:** `volt diff button --path src/app/ui`
y `volt diff button --path src/app/ui --json`. Se compara contra el registro incluido en
la CLI que se está ejecutando. Ejecutar una CLI de versión determinada permite elegir
esa referencia; este comando no busca ni promete la última versión remota.

No implementar `update`, descarga de históricos, merge, aplicación de patches, borrado
de archivos, editor interactivo ni notificaciones. La transferencia del cambio es manual.

## Contexto y archivos

`cli/lib/core.js`, `cli/bin/volt`, `cli/prepare-package.js`, `cli/tests/core.spec.js`,
`CLI.md`, guías de migración/customization e infraestructura externa del plan 03.
Reusar el resolvedor y transformador del plan 01; comparar siempre con la fuente
transformada que realmente recibiría el consumidor, no con `Volt*` sin transformar.

## Fase A — Procedencia mínima y opcional

- [x] Añadir `--track` a add como capacidad opcional. Un consumidor sin ese flag sigue
      copiando código sin configuración obligatoria. Si ya hay un registro válido,
      operaciones posteriores lo mantienen coherente.
- [x] Guardar un único `.volt-ui.json` dentro del target UI: schemaVersion, versión del
      transformador y entradas por ruta relativa con hash SHA-256 de los bytes copiados,
      versión CLI/registro de origen y propietarios (componentes) del archivo.
- [x] Incluir utilidades compartidas una sola vez con todos sus propietarios. No guardar
      código fuente, paths absolutos del equipo, credenciales ni contenido del proyecto.
- [x] Escribir metadata dentro de la misma operación protegida del plan 01, después de
      calcular el contenido final. Dry-run no la crea ni modifica.
- [x] Registrar únicamente archivos efectivamente copiados o verificados idénticos.
      No convertir una modificación local preservada en la nueva base original.
- [x] Rechazar schema desconocido/corrupto de manera accionable antes de una operación que
      actualizaría ese registro. No reemplazarlo silenciosamente. El código compilado
      no depende de este archivo y debe funcionar si se elimina.

Formato exacto y versión inicial se fijan al implementar A. No introducir un catálogo
histórico de hashes ni snapshots completos para soportar un futuro merge no solicitado.

## Fase B — Comparación de solo lectura

- [x] Resolver archivos seleccionados y utilidades relacionadas; no comparar ni enumerar
      archivos ajenos a los componentes solicitados. Un componente desconocido es error.
- [x] Producir diff unificado local → fuente de referencia y resumen por archivo. Incluir
      versión de referencia y procedencia conocida/desconocida. Nunca llamar «upstream
      nuevo» a lo que simplemente difiere de una base desconocida.
- [x] Si hay procedencia, clasificar usando los hashes:

| Estado                                          | Interpretación                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------ |
| local = base, referencia = base                 | Sin cambios                                                        |
| local = base, referencia distinta               | Cambio en referencia; copia local intacta                          |
| local distinta, referencia = base               | Solo modificación local                                            |
| local = referencia, distinta de base            | Ya coincide con referencia, sin reescribir procedencia en diff     |
| local y referencia distintas entre sí y de base | Ambas cambiaron; revisión manual, no conflicto de merge demostrado |
| base ausente                                    | Diferencia observable, origen desconocido                          |

- [x] Tratar archivo local ausente, añadido/retirado en referencia y versión distinta
      del transformador explícitamente. No reconstruir cambios upstream desde un hash
      solo; sin bytes de base no existe un diff de tres vías fiable.
- [x] No seguir rutas de metadata fuera del target ni symlinks que lo abandonen. Validar
      schema y contención antes de leer; no convertir el CLI en explorador del proyecto.
- [x] Definir salida JSON con schemaVersion, referenceVersion, archivos, estados y diff;
      stdout solo JSON, diagnósticos en stderr. Exit 0 sin diferencias, 1 con diferencias,
      2 por error. Estos códigos son exclusivos del comando nuevo.
- [x] Sin metadata, permitir comparación de solo lectura con origen desconocido; no exigir
      adopción del tracking para poder usar diff en copias de v1.

## Fase C — Pruebas de propiedad del código y guía

- [x] Comparar hashes de todo el target antes/después de diff: deben ser idénticos para
      todos los estados, incluyendo errores. No actualizar ni timestamps de metadata.
- [x] Probar componente intacto, editado localmente, cambiado en referencia, ambos,
      archivo ausente, utilidad compartida, base desconocida y metadata corrupta.
- [x] Probar con el CLI empaquetado y sin conexión durante el diff. La instalación previa
      del paquete puede requerir red; distinguirla del funcionamiento del comando.
- [x] Documentar flujo concreto: copiar con tracking opcional, editar, ejecutar otra versión
      de CLI para comparar, trasladar manualmente una corrección y ejecutar tests locales.
- [x] Explicar que `--force` puede sobrescribir y no es el flujo recomendado para conservar
      personalizaciones. No insinuar que diff ha verificado compatibilidad semántica.

## Verificación y límites

Con `rtk proxy`: tests CLI dirigidos, `pnpm typecheck`, `pnpm lint`, `pnpm test:run`,
`pnpm pack:cli`, check de contexto IA y consumidor externo del plan 03.
Build de docs y tests de diccionarios si se actualizan guías. Documentar nuevo comando
en ayuda y superficies IA que enumeran comandos, con ejemplos que pasen en consumidor.

Sin nueva dependencia runtime por defecto. Si generar diffs exige una dependencia CLI,
comparar con una implementación mínima o herramienta existente y justificar alcance,
licencia y tamaño antes de añadirla. No depender obligatoriamente de tener Git instalado.

## Registro de ejecución

### 2026-11-26 — Fases A, B y C (`feat/consumer-lifecycle-reliability`)

- **SHA de entrada:** `4526886` (merge de #260; main = origin/main).
- **Schema final (`.volt-ui.json`, versión 1):** `{ schemaVersion: 1, base, files: { "<ruta/relativa>": { sha256, owners[], source: { cli, registry, transform } } } }`.
  Ruta relativa POSIX dentro del target (sin `..`, absolutas, `\\`, unidad ni NUL); hash de los bytes
  copiados con CRLF normalizado a LF (coherente con `sameContent` del plan 01); propietarios ordenados y
  únicos; campos desconocidos = registro corrupto. Escritura determinista (claves ordenadas). Validación:
  `cli/lib/provenance.js`.
- **Ciclo de vida:** solo `--track` crea el registro; si existe uno válido, cualquier `add` lo mantiene.
  Se calcula en el plan (`planProvenance`) a partir de los archivos `create`/`replace`/`reuse`; un
  `conflict` aborta la operación, así que una edición local nunca se convierte en base. Una entrada
  re-copiada con el mismo hash conserva su `source` original. Se escribe el último dentro de `applyPlan`
  (mismo journal/rollback). `--dry-run` lo muestra y no lo escribe. Registro corrupto, schema no
  soportado, symlink o base distinta → `PlanError` antes de escribir (también en dry-run).
- **`volt diff`:** `cli/lib/diff.js` + `cli/lib/unified-diff.js` (Myers O(ND), formato unificado que
  acepta `git apply`; sin dependencias nuevas). Referencia = registro del CLI ejecutado
  (`cli/package.json` + `manifest.version` + `TRANSFORM_VERSION`). Compara solo los componentes pedidos y
  las utilidades compartidas que importan; las dependencias se listan aparte. Estados: los siete del plan
  más `reference-removed` (archivo registrado que la referencia ya no trae). Procedencia
  `tracked`/`partial`/`untracked`. Contención: `realpath` del target y de cada archivo; un symlink que sale
  del target, colgante o el propio registro como symlink → exit 2 sin leerlo.
- **Salida:** texto con resumen por archivo y diff local → referencia; `--json` con `schemaVersion`,
  `referenceVersion`, `reference`, `component`/`components`, `dependencies`, `target`, `provenance`,
  `differences`, `summary`, `files[]`. Errores en JSON `{ schemaVersion, error: { code, message } }`.
  Exit 0/1/2; los errores de argumentos de `diff` también salen con 2. `process.exitCode` (no
  `process.exit`) para no truncar JSON grande en una tubería.
- **`TRANSFORM_VERSION = 1`** en `cli/lib/core.js`; `diff.spec.js` fija el hash de la salida del
  transformador para una muestra, de modo que cambiar el transform sin subir la versión falla.
- **Tests:** `cli/tests/diff.spec.js` (44): registro (sin/con `--track`, dry-run, coherencia sin flag,
  dueños compartidos, conflicto, `--force`, CLI más nuevo con y sin `--force`, cuatro tipos de registro
  corrupto en add real/track/dry-run, borrado del registro), clasificación con un segundo CLI construido
  con el layout publicado (`reference-changed`, `local-changed`, `both-changed`, `unchanged`, `missing`,
  `reference-removed`, `matches-reference`, `unknown-origin`, `partial`, transform distinto), contrato de
  salida (JSON determinista, exit 0/1/2, errores JSON, `git apply` del diff), solo lectura (hash + modo +
  tamaño + mtime de todo el árbol antes/después en todos los estados y errores), contención (symlink de
  archivo y de carpeta fuera del target, registro symlink, target symlink permitido), sin red (net, tls,
  http, https, dns y fetch bloqueados con `--require`) y sin Git en `PATH`; diff unificado (CRLF, final
  sin salto de línea, creación/borrado, hunks, 25 casos aleatorios aplicados con `git apply`).
  `cli/tests/integrity.spec.js` (+2): fallo inyectado al crear/actualizar el registro → rollback completo.
  Total CLI: **267 tests en verde**.
- **CLI empaquetado:** `scripts/check-consumer.mjs`, paso «provenance and volt diff with the installed
  binary» con el binario instalado desde el tarball: `--track --dry-run` sin escrituras; registro sin
  rutas absolutas; diff intacto → 0; edición → 1 `local-changed`; copia del paquete instalado con
  referencia modificada y versión 99.0.0 → `reference-changed` + `local-changed`; copia sin tracking →
  `unknown-origin`; registro corrupto → 2 y `add` rechazado; huella del árbol idéntica tras cada diff;
  todo con la red bloqueada. Angular 22.3.0: verde (ver plan 03/consumer).
- **Documentación:** `CLI.md` (comando, estados, JSON, schema, flujo de actualización manual y aviso
  sobre `--force`), `README.md`, introducción de la web en/es/uk, skill `volt-ui-distribution` (+ copias
  generadas y contenido del instalador), siguientes pasos de `@voltui/agent`, `VOLT_UI_PROMPT.md`, MCP
  `generate_cli_command` (`diff`, `track`, `json`).
- **Compatibilidad con copias sin tracking:** comprobada (unit y empaquetado): sin archivo nuevo, diff con
  origen desconocido.
- **Limitaciones:** sin bytes de la base no hay diff de tres vías (por diseño). La lectura actualiza
  `atime` según el sistema de archivos; contenido, modo y `mtime` no cambian. `diff` no enumera archivos
  locales extra añadidos por el consumidor dentro de la carpeta del componente.
- **Próximo paso:** ninguno en este plan; feedback de uso real antes de ampliar.
