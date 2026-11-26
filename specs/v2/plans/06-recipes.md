# Plan 06 — Tres recetas que resuelven tareas completas

**Estado:** ejecutado en `feat/consumer-lifecycle-reliability` (2026-11-26). Las tres recetas ya existían en `apps/recipes/src/app/patterns/`; se auditaron contra estos criterios, se reprodujeron seis fallos con tests y se corrigieron sin reescribirlas. Sin cuarta receta. **Prioridad:** P2. **Depende de:** 02–04; no depende de 05.
**Entrega:** tres composiciones copiables, sin ampliar el catálogo primitivo.

## Contexto y decisión

El proyecto ya tiene bloques de marketing, login y dashboard, y layouts de ajustes,
perfil y aplicación. No necesita otra galería. Sí puede aumentar la utilidad mostrando
cómo componer componentes con validación, trabajo asíncrono y recuperación de errores.

Leer `src/app/layouts/settings/`, `src/app/blocks/{auth-login,app-dashboard}/`,
`src/app/lib/{blocks-metadata,layouts-metadata}.ts` y snippets. Mantener la distinción
actual: un layout es estructura; un bloque es una sección terminada. Una receta explica
un comportamiento y puede usar esa estructura sin convertir el layout base en producto.

## Fase A — Contrato común de una receta

- [x] Crear una plantilla documental breve: problema, componentes usados, dependencias,
      estado local, código completo y punto de conexión con datos reales.
- [x] Ubicar ejemplos junto a las fuentes de ejemplos del plan 02 y enlazarlos desde
      guías/componentes existentes. Reutilizar CodePanel; no nueva ruta de navegación
      principal, taxonomía, registry de recetas o paquete de runtime.
- [x] Establecer simulación asíncrona local determinista, con éxito y fallo reproducibles
      en test. Ningún botón demuestra una petición real si solo modifica un fixture.
- [x] Mantener el ejemplo autocontenido, sin dependencias de servicios de docs ni `t()`
      del sitio dentro de la fuente copiable. La explicación exterior sí se traduce a
      en/es/uk. No introducir autenticación, API backend ni persistencia remota.

## Fase B — Ajustes con guardado y validación

**Reusar:** estructura settings, form-field, input, select, switch, button y feedback
existente. No construir un generador de formularios ni modelo de dominio compartido.

- [x] Datos iniciales, estado pristine/dirty, validación y mensajes asociados al control.
- [x] Submit inválido muestra errores y enfoca el primer control inválido. Submit válido
      inicia una única operación; deshabilitar reenvíos mientras está pendiente.
- [x] Éxito confirma el guardado y actualiza la base local; fallo conserva lo editado y
      permite reintento. Cancelar restaura la última base guardada, no siempre el fixture
      inicial. Documentar política durante pending sin introducir navegación protegida.
- [x] Test de teclado, error → reintento → éxito, cancelación/reset y ausencia de doble
      submit. El mensaje de resultado se anuncia sin robar foco innecesariamente.

**Aceptación:** un consumidor puede conectar su función de guardado sustituyendo el
simulador, sin cambiar componentes Volt ni adoptar una abstracción de formulario nueva.

## Fase C — Búsqueda asíncrona con selección

**Reusar:** combobox o la composición existente que pruebe el contrato; no inventar
inputs de loading/error en un componente que no los tiene. Esos estados pueden vivir
alrededor del componente en la receta.

- [x] Mostrar reposo, carga, resultados, sin resultados, error y reintento.
- [x] Evitar que una respuesta antigua sustituya a una nueva: probar consultas A y B
      con B completando antes que A. Cancelar o ignorar respuestas obsoletas sin nuevos
      paquetes; RxJS y las APIs existentes son suficientes como punto de partida.
- [x] Mantener selección por identificador estable cuando llegan nuevas instancias de
      objetos. Definir qué pasa con una selección al limpiar la consulta.
- [x] Teclado, label, anuncio de resultados y foco después de seleccionar funcionan;
      no perder foco cada vez que cambia loading. Liberar recursos al destruir el ejemplo.
- [x] Explicar sustitución del simulador por servicio Angular, sin imponer formato de API.

**Aceptación:** una respuesta fuera de orden no corrompe los resultados, y el consumidor
puede recuperar un error sin borrar su selección por accidente.

## Fase D — Tabla con filtro, orden y paginación

**Reusar:** table, input/search, pagination, button y skeleton/feedback existentes.
Un único dataset acotado en memoria; no virtualización, edición inline, exportación,
columnas configurables ni motor genérico de tablas.

- [x] Estado de filtro, orden y página explícito; cambiar filtro reinicia o ajusta la
      página para evitar quedarse en una página vacía que ya no existe.
- [x] Diferenciar dataset vacío de filtro sin resultados; ofrecer limpiar filtro.
- [x] Simular carga inicial, error y reintento; conservar contenido útil durante una
      recarga cuando el contrato lo permita. Mantener headers y roles de tabla accesibles.
- [x] Expresar orden mediante controles accesibles y `aria-sort` donde corresponda.
      Mostrar que Volt aporta estructura visual; la lógica pequeña vive en la receta.
- [x] Probar filtro → cambio de página → reducción de resultados, orden, teclado y
      contenedor estrecho con scroll accesible. No ocultar columnas críticas por clipping.

**Aceptación:** la receta permite mostrar una lista real con sus estados habituales sin
añadir ninguna API de datos a VoltTable.

## Fase E — Transferencia a consumidor y salida

- [x] Compilar las tres recetas desde su salida copiable en el consumidor del plan 03,
      con dependencias explícitas y sin alias `volt`.
- [x] Verificar una variante oscura, texto largo, tamaño móvil y reduced motion si la
      receta incorpora movimiento. Evitar animación decorativa como dependencia necesaria.
- [x] Añadir enlaces desde las páginas de los componentes relevantes, sin duplicar la
      fuente ni explicaciones contradictorias entre web y MCP.
- [x] Registrar el ejercicio manual descrito en el SDD: integrar un formulario en un
      consumidor desechable y contar correcciones manuales. Si no hay participantes
      externos, describirlo como prueba propia, no como validación de usuarios.
      Hecho en el plan 07 (2026-11-26): ejercicio interno, no investigación con usuarios.
- [x] Revisar salida conjunta del SDD y decidir semver de cambios reales. Si todo es
      compatible, conservar v1.x: terminar las recetas no obliga a una versión 2.0.

## Verificación y límites

Tests de comportamiento por receta, compilación de snippets, consumidor externo y
E2E del recorrido visible. Con `rtk proxy`: `pnpm typecheck`, `pnpm lint`,
`pnpm test:run`, `pnpm build:lib`, `pnpm build`, checks de docs/IA y nuevos scripts del
plan 03. Ejecutar los tests de diccionarios y copy existentes; no relajar excepciones
de traducción para incorporar prosa de documentación en ejemplos.

**Límite de salida:** tres recetas. Cualquier otra idea se registra como feedback para
después, no se implementa durante este plan. No auth real, dashboard SaaS completo,
form schema, table engine, servicios compartidos de negocio ni publicación.

## Registro de ejecución

### 2026-11-26 — Auditoría y cierre (`feat/consumer-lifecycle-reliability`)

- **SHA de entrada:** `4526886`. Las recetas existían (#247 y anteriores); no se reescribieron.
- **Plantilla y ubicación (A):** cada receta es un archivo autocontenido con un bloque de cabecera
  (qué enseña, decisiones, «REPLACE ME» con el punto de conexión: `fakeSave`, `fakeSearch`,
  `fakeFetch` inyectables por `input()`), simulación asíncrona determinista (éxito/fallo por
  `@fail.test`, `boom`, `error`) y sin `t()` ni servicios del sitio. La página de Recipes muestra
  demo, fuente, instalación y componentes relacionados. La prosa traducida alrededor sigue aplazada
  (`docs/recipes-app.md`, «Deferred»), sin cambio aquí.
- **Fallos reproducidos con un test que fallaba antes del arreglo:**
  1. Settings: lo escrito mientras el guardado estaba pendiente se perdía al llegar el éxito
     (`form.reset(saved)`). Ahora la respuesta del servidor es la base y, si el usuario editó durante la
     petición, sus valores se conservan como no guardados. Política documentada en la cabecera.
  2. Settings: Cancelar se deshabilitaba a sí mismo (`[disabled]`) al limpiar el formulario y podía
     soltar el foco; pasa a `aria-disabled` con guarda, como Guardar.
  3. Async search: «Retry» vive en la alerta que desaparece al reintentar → el foco caía a `<body>`;
     ahora vuelve al combobox.
  4. Data table: «Retry» igual que 3; vuelve al filtro.
  5. Data table: «Clear filter» vive en el estado vacío que desaparece → foco al filtro, que queda vacío.
  6. Data table: el test de «clamp» existente no ejercitaba el recorte (un cambio de filtro ya vuelve a
     la página 1). Nuevo test: la carga de la página 2 falla, se borran filas, Retry → página 1. El
     código ya lo hacía bien; el hueco era de cobertura.
- **Comportamientos ya correctos, ahora con test explícito:** selección estable por id cuando la
  búsqueda devuelve objetos nuevos (`aria-selected`), ninguna petición tras destruir con debounce
  pendiente. El resto (pristine/dirty respecto a lo guardado, foco al primer inválido, un solo
  guardado pendiente, reintento, Cancelar a la última base, live region; reposo/carga/resultados/
  vacío/error, respuestas fuera de orden, selección que sobrevive a limpiar/vacío/error; vacío vs sin
  resultados, recarga con filas atenuadas y `aria-busy`, `aria-sort`, región desplazable con
  `tabindex=0` y nombre) ya estaba cubierto por los specs existentes, que pasan.
- **Tests:** `apps/recipes/src/app/patterns/{settings-form,async-search,data-table}/*.spec.ts`:
  32 tests en verde (+8). Todos los patterns: 56/56.
- **Enlaces (E):** las tres recetas de flujo se movieron a `packages/shared/lib/workflow-recipes.ts`
  (una lista), que leen el catálogo de Recipes y el shell de docs de voltui.dev; cada página de
  componente usado enlaza a sus recetas (`ui.docs.recipes`, en/es/uk en Glossa). Test en
  `docs-shell.spec.ts`.
- **Consumidor (E):** la fuente copiable se compila sin alias `volt`, con `strictTemplates`, contra el
  paquete construido (`pnpm check:copied-source`); tema oscuro, 375 px, contraste y desbordamiento por
  receta en `e2e/recipes/recipes-themes.spec.ts` (`pnpm test:e2e:recipes:ci`). Resultados de esta
  ejecución en el registro del PR. Ninguna receta usa animación necesaria.
- **Ejercicio manual del SDD:** realizado como ejercicio interno en el plan 07 (registro allí); sin
  participantes externos.
- **Semver:** las recetas no se publican (fuente copiable de recipes.voltui.dev); sin cambios de API.
- **Candidatos posteriores:** ninguno necesario para cerrar este plan.
