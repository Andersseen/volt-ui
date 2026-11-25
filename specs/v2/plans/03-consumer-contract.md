# Plan 03 — La distribución funciona fuera del monorepo

**Estado:** fases A, B y C implementadas en `feat/consumer-distribution-dx` (entrada `72cb016`). **Prioridad:** P1. **Depende de:** 01–02.
**Hallazgos:** F04, F09–F10, F13, F15. **Entrega:** herramientas y garantías de distribución.

## Contexto y archivos

Leer `package.json`, `projects/volt/package.json`, `cli/package.json`,
`cli/prepare-package.js`, `e2e/consumer*/`, `playwright*.config.ts`,
`.github/workflows/{ci,release}.yml` y `specs/plans/v0.9.md` (auditoría de bundle previa).

Las fixtures existentes heredan dependencias y config del workspace; el paquete se
resuelve por alias a su bundle y el CLI añade todo con force. Conservar estos smokes,
pero añadir evidencia de la instalación que hace un consumidor.

## Fase A — Entorno soportado explícito

- [x] Documentar la intersección real de Angular, Node, TypeScript, Tailwind y primitivas
      en los paquetes a distribuir. Consultar de nuevo la documentación oficial de Angular;
      los valores de la auditoría tienen fecha, no son una política perpetua.
- [x] Mantener Angular `^21.2` como punto de partida. No ensanchar a 22/«21+» sin instalar
      y probar ese entorno. No actualizar dependencias por el mero hecho de que haya otras.
- [x] Diferenciar Node del CLI de copia de Node para compilar Angular: documentar ambos
      requisitos si difieren. Sustituir la promesa imprecisa «Node 20 o superior» en las
      guías; valorar semver antes de restringir un campo engines publicado.
- [x] Alinear los rangos runtime empaquetados del plan 01 con la combinación probada.
      Verificar peer dependencies y dependencias efectivas de los exports npm, no solo
      las que ya existen en el workspace.

Referencia inicial: [compatibilidad oficial](https://angular.dev/reference/versions).
El objetivo es probar rangos declarados, no mantener todas las versiones históricas.

## Fase B — Tarballs reales y consumidor aislado

- [x] Crear un harness local y determinista que construya y empaquete CLI y librería en
      tarballs reales sin publicar. Reutilizar los hooks actuales y comprobar la limpieza
      de `cli/registry`; el pack dry-run existente no sustituye estos artefactos.
- [x] Crear el proyecto Angular CLI en temporal fuera del árbol del repo, con su propio
      package.json, tsconfig y dependencias. Copiar una plantilla mínima versionada puede
      evitar un scaffolding remoto variable. No usar aliases a `dist`, symlinks al repo,
      NODE_PATH, node_modules heredado ni plugins Analog del sitio.
- [x] Instalar los tarballs como paquetes y ejecutar el binario instalado. Usar pnpm en
      el harness del repositorio; no necesitar token privado de publicación.
- [x] Ejecutar init y añadir un componente, luego otro con dependencia ya instalada,
      sin force. Probar también multi-add y segunda inicialización sobre un barrel editado.
- [x] Generar un consumidor con todo el catálogo para compilación estricta. Verificar
      también la instalación mínima: añadir todo no prueba que las dependencias de una
      pieza aislada estén bien declaradas.
- [x] Compilar y renderizar los ejemplos de consumo del plan 02. Resolver iconos/helpers
      solo a través de dependencias declaradas, no añadiendo el package.json entero del repo.
- [x] Comprobar exports npm y CSS mediante nombres de paquete reales. Afirmar en navegador
      que un token/componente está estilado: una captura de texto no prueba Tailwind.
- [x] Incorporar SSR/hidratación en una variante mínima Angular CLI: input/form-field,
      tema y dialog. Inspeccionar HTML del servidor, consola de hidratación e interacción
      posterior; no declarar SSR-safe solo porque el código contiene un guard.

**Aceptación:** instalar los tarballs generados de la revisión actual permite build
estricto e interacción sin acceso al workspace. Registrar versiones resueltas, comandos
y resolución de archivos. Una dependencia deliberadamente omitida debe hacer fallar el
harness, demostrando que no la toma accidentalmente del monorepo.

## Fase C — Gates pequeños y completos

- [x] Definir scripts locales claros para generación/check, consumer aislado y release.
      Registrar aquí sus nombres finales antes de enlazarlos desde CI o documentación.
- [x] Integrar contraste, completitud y ausencia de deriva en API/ejemplos al gate de PR.
      Especificar el alcance: contraste de tokens no significa accesibilidad total.
- [x] Ejecutar en PR el consumidor aislado con una combinación soportada y Chromium.
      En release, comprobar los extremos declarados de compatibilidad y smokes relevantes
      de foco/formularios en Firefox y WebKit. No multiplicar todas las combinaciones
      Angular × Node × navegador × preset si no cubren riesgos distintos.
- [x] Conservar las suites actuales hasta demostrar que una sustitución cubre sus contratos.
      No relajar coverage ni assertions para acomodar el nuevo harness.
- [x] Repetir la medición histórica de bundle con entrada mínima y una composición real.
      Separar JS y CSS, producción y compresión; registrar tamaño base y variación. Un
      aumento >10% y >2 KiB gzip por artefacto debe investigarse; es un umbral propuesto
      de revisión, no un límite histórico ya medido ni motivo para ocultar accesibilidad.
- [x] Revisar que scripts de release y CI tienen las mismas garantías exigidas, evitando
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

### 2026-11-25 — Fases A, B y C

**Entorno soportado (fase A, comprobado contra los manifiestos publicados):**

| Pieza                                | Declarado                                                                                          | Probado en esta rama                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Angular (`@voltui/components` peers) | `^21.2.0 \|\| ^22.0.0` (sin cambios)                                                               | 21.2.0 exacto y 22.3.0                                                       |
| Node para compilar Angular           | lo que pide cada major: 21 → `^20.19 \|\| ^22.12 \|\| >=24`; 22 → `^22.22.3 \|\| ^24.15 \|\| >=26` | Node 22.23.1                                                                 |
| Node para el CLI                     | sin `engines` (no se restringe en un patch); sin requisitos propios                                | Node 22.23.1                                                                 |
| TypeScript                           | el que exige `@angular/compiler-cli` de cada major (npm lo resuelve)                               | 5.9 (21.2), 6.0 (22)                                                         |
| Tailwind CSS                         | v4 (`tailwindcss` + `@tailwindcss/postcss` ^4)                                                     | 4.x                                                                          |
| ng-primitives                        | `^0.131.4` (probado 0.131.4)                                                                       | 0.131.4                                                                      |
| Quartz Headless                      | peer opcional `^0.16.0`; Quartz 0.16 declara peers `@angular/*: ^21`                               | 21.2.0 estricto; 22 solo con `--legacy-peer-deps` (no se declara compatible) |

`README.md` sustituye «Node 20 o superior» por los rangos por major. No se ensanchó ningún peer.

**Scripts finales:**

| Script                                                                | Qué prueba                                                                      |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `pnpm check:examples`                                                 | todos los ejemplos en modo paquete (dist/volt) y copia CLI, templates estrictos |
| `pnpm check:consumer [--angular=<v>] [--project=…]`                   | tarballs reales en un proyecto aislado (abajo)                                  |
| `scripts/lib/pack.mjs`                                                | `npm pack` de components, cli y agent; limpia `cli/registry` aunque falle       |
| `pnpm check:angular-compat <major>`, `pnpm check:quartz-consumer <v>` | se conservan; el de Quartz copia ahora con el binario del tarball del CLI       |

**`scripts/check-consumer.mjs` (fase B):** proyecto en el temporal del sistema, `package.json`, lockfile y
tsconfig propios (strict, strictTemplates, strictInjectionParameters, strictInputAccessModifiers,
diagnósticos extendidos como error, zoneless); entorno sin `npm_*`/`pnpm_*`/`NODE_PATH`; se comprueba que
cada paquete resuelve fuera del repo. Pasos: binario `volt` instalado (ayuda, errores, dry-run, init
repetido sobre barrel editado, add desde subcarpeta, add repetido, multi-add en ambos órdenes, `--path` en
las dos formas, `--base=quartz`, catálogo completo con `--install`); fixture `e2e/consumer-tarball` en modo
paquete y copia, prerender SSR + hidratación; 119 ejemplos y catálogo de 155 directivas compilados con el
`ngc` del consumidor en ambos modos; aislamiento; agente instalado; tamaños; navegador.

**Prueba de aislamiento:** proyecto solo con el CLI. `volt add card` sin `--install` → el build FALLA por
`clsx`/`tailwind-merge` ausentes (no se toman del monorepo). `volt add card --install` añade exactamente
`clsx@^2.1.1` y `tailwind-merge@^3.7.1`, no toca Angular ni otras declaraciones, y el build pasa.
Versiones y rutas de resolución: `dist/consumer-report.json` (artefacto de CI).

**Navegador (`e2e/consumer-tarball/consumer.spec.ts`):** HTML del servidor con label/for e `ngh`,
hidratación sin errores ni warnings de consola, ids únicos y conservados; color computado del botón =
`--primary` del tema; cambio de preset y modo oscuro en runtime; form field (label enfoca, hint y error en
la descripción accesible, `aria-invalid`), checkbox con teclado y valor del formulario; dialog con teclado
(nombre/descripción accesibles, foco inicial, trap, Escape, foco devuelto). En modo paquete y copia CLI.

**Resultados locales:** Angular 21.2.0 → todo verde, Chromium 8/8. Angular 22.3.0 → todo verde, Chromium,
Firefox y WebKit 24/24.

**Bundle (fase C), producción, salida de navegador, `specs/v2/bundle-baseline.json`:**

| Angular | Artefacto             | JS raw    | JS gzip   | CSS raw  | CSS gzip |
| ------- | --------------------- | --------- | --------- | -------- | -------- |
| 21.2.0  | mínimo (un botón)     | 170.7 KiB | 54.5 KiB  | 60.3 KiB | 10.4 KiB |
| 21.2.0  | composición (fixture) | 420.5 KiB | 126.3 KiB | 60.4 KiB | 10.4 KiB |
| 22.3.0  | mínimo                | 171.6 KiB | 54.8 KiB  | 60.3 KiB | 10.4 KiB |
| 22.3.0  | composición           | 461.7 KiB | 140.2 KiB | 60.4 KiB | 10.4 KiB |

Primera medición (no hay baseline histórica). Se compara por Angular major.minor; >10 % y >2 KiB gzip por
artefacto falla y exige `--update-baseline` explicado en el PR. Una minor nueva de Angular sin baseline se
registra y no se compara.

**CI (fase C):** job `packages` añade `pnpm check:examples`; job nuevo `consumer`: PR → Angular 21.2.0
exacto en Chromium; push a main y semanal → 21.2.0 y 22 en Chromium, Firefox y WebKit; añadido a
`verify`. `release:check` añade `build:lib` + `check:examples`. Se conservan todos los jobs anteriores.
Release/OIDC sin tocar.

**Limitaciones:** el harness necesita red (npm). La baseline de 22 es por minor. Quartz en Angular 22
sigue con el hueco de peers upstream.
