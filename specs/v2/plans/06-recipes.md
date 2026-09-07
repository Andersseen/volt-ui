# Plan 06 — Tres recetas que resuelven tareas completas

**Estado:** no iniciado. **Prioridad:** P2. **Depende de:** 02–04; no depende de 05.
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

- [ ] Crear una plantilla documental breve: problema, componentes usados, dependencias,
      estado local, código completo y punto de conexión con datos reales.
- [ ] Ubicar ejemplos junto a las fuentes de ejemplos del plan 02 y enlazarlos desde
      guías/componentes existentes. Reutilizar CodePanel; no nueva ruta de navegación
      principal, taxonomía, registry de recetas o paquete de runtime.
- [ ] Establecer simulación asíncrona local determinista, con éxito y fallo reproducibles
      en test. Ningún botón demuestra una petición real si solo modifica un fixture.
- [ ] Mantener el ejemplo autocontenido, sin dependencias de servicios de docs ni `t()`
      del sitio dentro de la fuente copiable. La explicación exterior sí se traduce a
      en/es/uk. No introducir autenticación, API backend ni persistencia remota.

## Fase B — Ajustes con guardado y validación

**Reusar:** estructura settings, form-field, input, select, switch, button y feedback
existente. No construir un generador de formularios ni modelo de dominio compartido.

- [ ] Datos iniciales, estado pristine/dirty, validación y mensajes asociados al control.
- [ ] Submit inválido muestra errores y enfoca el primer control inválido. Submit válido
      inicia una única operación; deshabilitar reenvíos mientras está pendiente.
- [ ] Éxito confirma el guardado y actualiza la base local; fallo conserva lo editado y
      permite reintento. Cancelar restaura la última base guardada, no siempre el fixture
      inicial. Documentar política durante pending sin introducir navegación protegida.
- [ ] Test de teclado, error → reintento → éxito, cancelación/reset y ausencia de doble
      submit. El mensaje de resultado se anuncia sin robar foco innecesariamente.

**Aceptación:** un consumidor puede conectar su función de guardado sustituyendo el
simulador, sin cambiar componentes Volt ni adoptar una abstracción de formulario nueva.

## Fase C — Búsqueda asíncrona con selección

**Reusar:** combobox o la composición existente que pruebe el contrato; no inventar
inputs de loading/error en un componente que no los tiene. Esos estados pueden vivir
alrededor del componente en la receta.

- [ ] Mostrar reposo, carga, resultados, sin resultados, error y reintento.
- [ ] Evitar que una respuesta antigua sustituya a una nueva: probar consultas A y B
      con B completando antes que A. Cancelar o ignorar respuestas obsoletas sin nuevos
      paquetes; RxJS y las APIs existentes son suficientes como punto de partida.
- [ ] Mantener selección por identificador estable cuando llegan nuevas instancias de
      objetos. Definir qué pasa con una selección al limpiar la consulta.
- [ ] Teclado, label, anuncio de resultados y foco después de seleccionar funcionan;
      no perder foco cada vez que cambia loading. Liberar recursos al destruir el ejemplo.
- [ ] Explicar sustitución del simulador por servicio Angular, sin imponer formato de API.

**Aceptación:** una respuesta fuera de orden no corrompe los resultados, y el consumidor
puede recuperar un error sin borrar su selección por accidente.

## Fase D — Tabla con filtro, orden y paginación

**Reusar:** table, input/search, pagination, button y skeleton/feedback existentes.
Un único dataset acotado en memoria; no virtualización, edición inline, exportación,
columnas configurables ni motor genérico de tablas.

- [ ] Estado de filtro, orden y página explícito; cambiar filtro reinicia o ajusta la
      página para evitar quedarse en una página vacía que ya no existe.
- [ ] Diferenciar dataset vacío de filtro sin resultados; ofrecer limpiar filtro.
- [ ] Simular carga inicial, error y reintento; conservar contenido útil durante una
      recarga cuando el contrato lo permita. Mantener headers y roles de tabla accesibles.
- [ ] Expresar orden mediante controles accesibles y `aria-sort` donde corresponda.
      Mostrar que Volt aporta estructura visual; la lógica pequeña vive en la receta.
- [ ] Probar filtro → cambio de página → reducción de resultados, orden, teclado y
      contenedor estrecho con scroll accesible. No ocultar columnas críticas por clipping.

**Aceptación:** la receta permite mostrar una lista real con sus estados habituales sin
añadir ninguna API de datos a VoltTable.

## Fase E — Transferencia a consumidor y salida

- [ ] Compilar las tres recetas desde su salida copiable en el consumidor del plan 03,
      con dependencias explícitas y sin alias `volt`.
- [ ] Verificar una variante oscura, texto largo, tamaño móvil y reduced motion si la
      receta incorpora movimiento. Evitar animación decorativa como dependencia necesaria.
- [ ] Añadir enlaces desde las páginas de los componentes relevantes, sin duplicar la
      fuente ni explicaciones contradictorias entre web y MCP.
- [ ] Registrar el ejercicio manual descrito en el SDD: integrar un formulario en un
      consumidor desechable y contar correcciones manuales. Si no hay participantes
      externos, describirlo como prueba propia, no como validación de usuarios.
- [ ] Revisar salida conjunta del SDD y decidir semver de cambios reales. Si todo es
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

- Ubicación de ejemplos y enlaces: pendiente.
- Aceptación B/C/D: pendiente por receta.
- Integración externa y evaluación manual: pendiente.
- Candidatos de trabajo posterior: ninguno necesario para cerrar este plan.
- Próximo paso: fase A.
