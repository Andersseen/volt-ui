# Plan 03 — La distribución funciona fuera del monorepo

**Estado:** no iniciado. **Prioridad:** P1. **Depende de:** 01–02.
**Hallazgos:** F04, F09–F10, F13, F15. **Entrega:** herramientas y garantías de distribución.

## Contexto y archivos

Leer `package.json`, `projects/volt/package.json`, `cli/package.json`,
`cli/prepare-package.js`, `e2e/consumer*/`, `playwright*.config.ts`,
`.github/workflows/{ci,release}.yml` y `specs/plans/v0.9.md` (auditoría de bundle previa).

Las fixtures existentes heredan dependencias y config del workspace; el paquete se
resuelve por alias a su bundle y el CLI añade todo con force. Conservar estos smokes,
pero añadir evidencia de la instalación que hace un consumidor.

## Fase A — Entorno soportado explícito

- [ ] Documentar la intersección real de Angular, Node, TypeScript, Tailwind y primitivas
      en los paquetes a distribuir. Consultar de nuevo la documentación oficial de Angular;
      los valores de la auditoría tienen fecha, no son una política perpetua.
- [ ] Mantener Angular `^21.2` como punto de partida. No ensanchar a 22/«21+» sin instalar
      y probar ese entorno. No actualizar dependencias por el mero hecho de que haya otras.
- [ ] Diferenciar Node del CLI de copia de Node para compilar Angular: documentar ambos
      requisitos si difieren. Sustituir la promesa imprecisa «Node 20 o superior» en las
      guías; valorar semver antes de restringir un campo engines publicado.
- [ ] Alinear los rangos runtime empaquetados del plan 01 con la combinación probada.
      Verificar peer dependencies y dependencias efectivas de los exports npm, no solo
      las que ya existen en el workspace.

Referencia inicial: [compatibilidad oficial](https://angular.dev/reference/versions).
El objetivo es probar rangos declarados, no mantener todas las versiones históricas.

## Fase B — Tarballs reales y consumidor aislado

- [ ] Crear un harness local y determinista que construya y empaquete CLI y librería en
      tarballs reales sin publicar. Reutilizar los hooks actuales y comprobar la limpieza
      de `cli/registry`; el pack dry-run existente no sustituye estos artefactos.
- [ ] Crear el proyecto Angular CLI en temporal fuera del árbol del repo, con su propio
      package.json, tsconfig y dependencias. Copiar una plantilla mínima versionada puede
      evitar un scaffolding remoto variable. No usar aliases a `dist`, symlinks al repo,
      NODE_PATH, node_modules heredado ni plugins Analog del sitio.
- [ ] Instalar los tarballs como paquetes y ejecutar el binario instalado. Usar pnpm en
      el harness del repositorio; no necesitar token privado de publicación.
- [ ] Ejecutar init y añadir un componente, luego otro con dependencia ya instalada,
      sin force. Probar también multi-add y segunda inicialización sobre un barrel editado.
- [ ] Generar un consumidor con todo el catálogo para compilación estricta. Verificar
      también la instalación mínima: añadir todo no prueba que las dependencias de una
      pieza aislada estén bien declaradas.
- [ ] Compilar y renderizar los ejemplos de consumo del plan 02. Resolver iconos/helpers
      solo a través de dependencias declaradas, no añadiendo el package.json entero del repo.
- [ ] Comprobar exports npm y CSS mediante nombres de paquete reales. Afirmar en navegador
      que un token/componente está estilado: una captura de texto no prueba Tailwind.
- [ ] Incorporar SSR/hidratación en una variante mínima Angular CLI: input/form-field,
      tema y dialog. Inspeccionar HTML del servidor, consola de hidratación e interacción
      posterior; no declarar SSR-safe solo porque el código contiene un guard.

**Aceptación:** instalar los tarballs generados de la revisión actual permite build
estricto e interacción sin acceso al workspace. Registrar versiones resueltas, comandos
y resolución de archivos. Una dependencia deliberadamente omitida debe hacer fallar el
harness, demostrando que no la toma accidentalmente del monorepo.

## Fase C — Gates pequeños y completos

- [ ] Definir scripts locales claros para generación/check, consumer aislado y release.
      Registrar aquí sus nombres finales antes de enlazarlos desde CI o documentación.
- [ ] Integrar contraste, completitud y ausencia de deriva en API/ejemplos al gate de PR.
      Especificar el alcance: contraste de tokens no significa accesibilidad total.
- [ ] Ejecutar en PR el consumidor aislado con una combinación soportada y Chromium.
      En release, comprobar los extremos declarados de compatibilidad y smokes relevantes
      de foco/formularios en Firefox y WebKit. No multiplicar todas las combinaciones
      Angular × Node × navegador × preset si no cubren riesgos distintos.
- [ ] Conservar las suites actuales hasta demostrar que una sustitución cubre sus contratos.
      No relajar coverage ni assertions para acomodar el nuevo harness.
- [ ] Repetir la medición histórica de bundle con entrada mínima y una composición real.
      Separar JS y CSS, producción y compresión; registrar tamaño base y variación. Un
      aumento >10% y >2 KiB gzip por artefacto debe investigarse; es un umbral propuesto
      de revisión, no un límite histórico ya medido ni motivo para ocultar accesibilidad.
- [ ] Revisar que scripts de release y CI tienen las mismas garantías exigidas, evitando
      duplicar suites innecesariamente dentro de una ejecución.

## Verificación y límites

Con `rtk proxy`: `pnpm typecheck`, `pnpm lint`, `pnpm test:run`, `pnpm build:lib`,
`pnpm build`, `pnpm check:contrast`, `pnpm check:docs-completeness`,
`pnpm check:ai-docs` y los nuevos scripts externos. Correr los E2E existentes aplicables
y el gate de release completo al cerrar el plan; registrar cada resultado.

Si faltan red o navegadores, registrar exactamente la parte no ejecutada; se puede
implementar/revisar el harness, pero no marcar la instalación o navegador como verificados.
No añadir un servicio CI externo, desplegar a Cloudflare ni cambiar el workflow de
publicación para publicar una versión. No llamar a `publish` desde el harness.

## Registro de ejecución

- Implementación: pendiente.
- Matriz y scripts finales: pendiente.
- Tarballs, versiones y prueba de aislamiento: pendiente.
- Bundle base: pendiente de medición, sin cifra inventada.
- Próximo paso: fase A.
