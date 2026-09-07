# Plan 05 — Revisar actualizaciones conservando las modificaciones locales

**Estado:** no iniciado. **Prioridad:** P2. **Depende de:** 01–03.
**Hallazgo:** F14. **Entrega:** capacidad aditiva del CLI; no motor de actualizaciones.

## Problema y experiencia propuesta

Después de editar un componente copiado, el consumidor necesita ver diferencias con una
versión de Volt sin sobrescribir su trabajo. La guía actual orienta a recopia y diff
manual. Una comparación de solo lectura permite revisar correcciones con menor riesgo.

**Sintaxis propuesta, todavía no implementada:** `volt diff button --path src/app/ui`
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

- [ ] Añadir `--track` a add como capacidad opcional. Un consumidor sin ese flag sigue
      copiando código sin configuración obligatoria. Si ya hay un registro válido,
      operaciones posteriores lo mantienen coherente.
- [ ] Guardar un único `.volt-ui.json` dentro del target UI: schemaVersion, versión del
      transformador y entradas por ruta relativa con hash SHA-256 de los bytes copiados,
      versión CLI/registro de origen y propietarios (componentes) del archivo.
- [ ] Incluir utilidades compartidas una sola vez con todos sus propietarios. No guardar
      código fuente, paths absolutos del equipo, credenciales ni contenido del proyecto.
- [ ] Escribir metadata dentro de la misma operación protegida del plan 01, después de
      calcular el contenido final. Dry-run no la crea ni modifica.
- [ ] Registrar únicamente archivos efectivamente copiados o verificados idénticos.
      No convertir una modificación local preservada en la nueva base original.
- [ ] Rechazar schema desconocido/corrupto de manera accionable antes de una operación que
      actualizaría ese registro. No reemplazarlo silenciosamente. El código compilado
      no depende de este archivo y debe funcionar si se elimina.

Formato exacto y versión inicial se fijan al implementar A. No introducir un catálogo
histórico de hashes ni snapshots completos para soportar un futuro merge no solicitado.

## Fase B — Comparación de solo lectura

- [ ] Resolver archivos seleccionados y utilidades relacionadas; no comparar ni enumerar
      archivos ajenos a los componentes solicitados. Un componente desconocido es error.
- [ ] Producir diff unificado local → fuente de referencia y resumen por archivo. Incluir
      versión de referencia y procedencia conocida/desconocida. Nunca llamar «upstream
      nuevo» a lo que simplemente difiere de una base desconocida.
- [ ] Si hay procedencia, clasificar usando los hashes:

| Estado                                          | Interpretación                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------ |
| local = base, referencia = base                 | Sin cambios                                                        |
| local = base, referencia distinta               | Cambio en referencia; copia local intacta                          |
| local distinta, referencia = base               | Solo modificación local                                            |
| local = referencia, distinta de base            | Ya coincide con referencia, sin reescribir procedencia en diff     |
| local y referencia distintas entre sí y de base | Ambas cambiaron; revisión manual, no conflicto de merge demostrado |
| base ausente                                    | Diferencia observable, origen desconocido                          |

- [ ] Tratar archivo local ausente, añadido/retirado en referencia y versión distinta
      del transformador explícitamente. No reconstruir cambios upstream desde un hash
      solo; sin bytes de base no existe un diff de tres vías fiable.
- [ ] No seguir rutas de metadata fuera del target ni symlinks que lo abandonen. Validar
      schema y contención antes de leer; no convertir el CLI en explorador del proyecto.
- [ ] Definir salida JSON con schemaVersion, referenceVersion, archivos, estados y diff;
      stdout solo JSON, diagnósticos en stderr. Exit 0 sin diferencias, 1 con diferencias,
      2 por error. Estos códigos son exclusivos del comando nuevo.
- [ ] Sin metadata, permitir comparación de solo lectura con origen desconocido; no exigir
      adopción del tracking para poder usar diff en copias de v1.

## Fase C — Pruebas de propiedad del código y guía

- [ ] Comparar hashes de todo el target antes/después de diff: deben ser idénticos para
      todos los estados, incluyendo errores. No actualizar ni timestamps de metadata.
- [ ] Probar componente intacto, editado localmente, cambiado en referencia, ambos,
      archivo ausente, utilidad compartida, base desconocida y metadata corrupta.
- [ ] Probar con el CLI empaquetado y sin conexión durante el diff. La instalación previa
      del paquete puede requerir red; distinguirla del funcionamiento del comando.
- [ ] Documentar flujo concreto: copiar con tracking opcional, editar, ejecutar otra versión
      de CLI para comparar, trasladar manualmente una corrección y ejecutar tests locales.
- [ ] Explicar que `--force` puede sobrescribir y no es el flujo recomendado para conservar
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

- Implementación y schema final: pendiente.
- Prueba de cero escrituras: pendiente.
- Compatibilidad con copias sin tracking: pendiente.
- Preguntas abiertas: ninguna que impida A; no se planifica merge automático.
- Próximo paso: fase A.
