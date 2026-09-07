# Plan 01 — CLI que conserva el código del consumidor

**Estado:** no iniciado. **Prioridad:** P0/P1. **Depende de:** nada.
**Hallazgos:** F01–F04. **Entrega:** correcciones compatibles primero; opciones nuevas en minor.

## Contexto y archivos

Leer `cli/bin/volt`, `cli/lib/core.js`, `cli/tests/core.spec.js`, `CLI.md`,
`cli/prepare-package.js` y `cli/generate-manifest.js`. El comando recorre cada nombre y
copia por separado; sidebar depende de tooltip. `initProject` escribe el barrel sin
comprobar existencia. Las dependencias runtime se instalan por nombre sin versión.

No reescribir el CLI ni sustituir su distribución local por un registro remoto.

## Fase A — Reproducción y corrección urgente

- [ ] Verificar estado de git y ejecutar `rtk proxy pnpm exec vitest run cli/tests/core.spec.js`.
- [ ] Añadir regresión con barrel editado, segundo init y comparación exacta de bytes.
- [ ] Hacer init idempotente: directorio ausente se crea, barrel ausente se crea,
      barrel existente se conserva incluso si tiene comentarios/exports personalizados.
- [ ] Añadir casos init vacío, init repetido y error de permisos con mensaje accionable.

**Aceptación:** volver a iniciar un proyecto nunca elimina código existente. Esta fase
se puede entregar sin esperar a las siguientes.

## Fase B — Un plan para toda la operación add

- [ ] Reproducir mediante el binario real `add tooltip sidebar <destino temporal>`.
- [ ] Resolver la unión de dependencias y utilidades una vez; deduplicar por ruta final.
- [ ] Transformar y validar todos los archivos antes de escribir. Resolver barrel como
      parte del mismo plan, preservando exports y comentarios existentes.
- [ ] Definir y probar archivos existentes: idéntico al resultado esperado = reutilizar;
      distinto = conflicto y cero escrituras salvo `--force` explícito.
- [ ] Utilidades compartidas modificadas: no sobreescribir sin force; si difieren de la
      fuente esperada, informar y detener la operación con explicación. No dejarlas
      silenciosamente desactualizadas ni marcarlas idénticas.
- [ ] `--dry-run` usa el plan real y comunica los mismos conflictos. No crea directorios,
      metadatos, archivos, lockfiles ni ejecuta instalaciones.
- [ ] Simular fallo de escritura: restituir archivos tocados y quitar solo los nuevos
      de esta operación; no borrar directorios ajenos. No prometer atomicidad del gestor
      de paquetes. Si este falla después, informar del estado y del reintento.

**Casos mínimos:** orden `tooltip sidebar` y `sidebar tooltip`, nombres repetidos,
dependencia idéntica preexistente, dependencia editada, fuente faltante, barrel editado,
dry-run y force. Probar por CLI real además de funciones internas.

## Fase C — Destino y versiones predecibles

- [ ] Añadir `--path=<directorio>` y `--path <directorio>` sin retirar destinos v1
      posicionales. Con path explícito, un componente desconocido falla antes de escribir.
- [ ] Mantener `add button custom-ui` como destino válido de v1. Informar que se ha
      interpretado como ruta y recomendar `--path` para evitar ambigüedad. No inferir
      permisos para retirar esa sintaxis en un patch.
- [ ] Definir error por flags desconocidos, opciones sin valor y argumentos sobrantes;
      revisar compatibilidad antes de cambiar salidas usadas por scripts.
- [ ] Resolver raíz del proyecto y gestor desde el directorio seleccionado, ascendiendo
      a su package.json/lockfile. Probar ejecución desde subcarpeta y workspaces; en caso
      ambiguo requerir ruta explícita, no instalar en otro paquete por accidente.
- [ ] Incluir versiones/rangos runtime probados en el registro empaquetado, empezando
      por la versión exacta de ng-primitives usada para validar la copia. No hardcodear
      una segunda tabla desconectada del origen de versiones.
- [ ] Instalar una sola vez con `--install`. Conservar versiones existentes compatibles;
      ante incompatibilidad, explicarla sin actualizar Angular ni reescribir dependencias
      ajenas automáticamente. Derivar la política final del plan 03.
- [ ] Actualizar ayuda, CLI.md y ejemplos relevantes en los tres idiomas.

## Verificación y límites

Ejecutar los tests CLI, `pnpm typecheck`, `pnpm lint`, `pnpm test:run` y `pnpm pack:cli`
con `rtk proxy`. Si cambia el manifiesto, regenerar y verificar `pnpm check:ai-docs`.
Build de docs cuando cambien templates/textos tipados. Plan 03 añadirá la instalación
externa del tarball; el dry-run de pack por sí solo no cierra esa garantía.

Sin nuevos comandos update/doctor, wizard de configuración, cambios de componentes ni
publicación. Nuevas flags son capacidades propuestas, no comandos disponibles hoy.

## Registro de ejecución

- Implementación: pendiente.
- Evidencia de aceptación: pendiente.
- Preguntas abiertas: comportamiento exacto en varios package.json/lockfiles se decide
  con fixtures, manteniendo el destino explícito como salida conservadora.
- Próximo paso: fase A.
