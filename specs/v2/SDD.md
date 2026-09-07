# SDD — Volt UI: integración y mantenimiento de código propio

**Estado:** propuesto, sin implementación. **Base:** `1.0.1` / `35e6816`.
**Motivación:** [auditoría](AUDIT.md). **Ejecución:** [seis planes](README.md).

## 1. Objetivo y usuarios

Un desarrollador Angular debe poder instalar una pieza, copiar un ejemplo que compile,
componer una tarea real, adaptar el aspecto y revisar cambios posteriores conservando
sus modificaciones. Un modelo debe poder hacer lo mismo a partir de contratos verificables.

Usuarios principales: desarrolladores de aplicaciones Angular que usan Tailwind y quieren
poseer el código; equipos pequeños que necesitan coherencia sin adoptar otro framework.
La documentación para IA es otro medio de entregar la misma API, no otro producto.

Historias que definen el alcance:

1. «Añadir sidebar y tooltip no falla porque comparten una dependencia».
2. «Pego el formulario que muestran las docs y compila fuera de este repo».
3. «Cambio el aspecto del input y conservo labels, validación y foco».
4. «Tengo una corrección upstream y puedo ver qué toca en mi copia modificada».
5. «Monto ajustes, búsqueda o una tabla incluyendo carga, error y vacío».

## 2. Decisiones de arquitectura

| Decisión                                                | Alternativa descartada o aplazada                              | Motivo y condición para revisarla                                                                                                                                                        |
| ------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D01. Mantener ng-primitives                             | Headless propio `@volt-ui/core`                                | Evita asumir foco, teclado, portales y accesibilidad de todo el catálogo. Revisar solo con bloqueos concretos que no puedan resolverse con contribución upstream o adaptación localizada |
| D02. Mantener Tailwind v4 como único destino de estilos | Segunda distribución CSS                                       | Evita duplicar garantías de estilos/variantes. Revisar cuando haya demanda concreta de varios proyectos y una prueba acotada de paridad sin bifurcar componentes                         |
| D03. Mantener copia de fuente como recorrido principal  | Convertir todo en dependencia cerrada                          | Es la identidad actual y permite adaptación local. Seguir comprobando imports npm ya soportados; no eliminarlos                                                                          |
| D04. Metadatos compartidos y ejemplos compilables       | Más tablas y prompts mantenidos a mano                         | Evita deriva en selectores, estado y versiones. Usar scripts de build existentes, sin servicio ni framework de generación                                                                |
| D05. Comparación de archivos de solo lectura            | Actualizador automático con merge de tres vías                 | Da utilidad de mantenimiento sin tomar decisiones sobre código del consumidor                                                                                                            |
| D06. Tres recetas en la documentación                   | Motor de formularios, data grid o aplicación de ejemplo enorme | Resuelve tareas completas con estado local; la aplicación conserva datos, rutas y reglas de negocio                                                                                      |
| D07. Mejorar HTML nativo caso a caso                    | Reescribir todos los selectores como directivas                | La compatibilidad v1 y la evidencia de uso pesan más que uniformidad estética de APIs                                                                                                    |

D01 y D02 cambian la recomendación del roadmap anterior, no borran su historia. Adoptar
este SDD implica corregir el roadmap en los tres idiomas mediante el plan 02. No empezar
el headless por leer la reserva histórica del nombre en `specs/SPEC.md`.

## 3. Arquitectura propuesta

Se conserva el monorepo. Los cambios se concentran en herramientas y contratos:

```text
Fuente Angular + exports + variantes ─── extracción de API ──┐
Metadatos editoriales canónicos ────────────────────────────┼─ manifiesto / docs / IA
Ejemplos reales compilables ─── adaptación de imports ───────┘
                          │
                          └─ CLI empaquetada → código local del consumidor
                                              + origen opcional de la copia

Tarballs reales → consumidor temporal aislado → build Angular + pruebas de interacción
```

### 3.1 Información canónica

- **Código:** selectors, exports, inputs, outputs y variantes se extraen de fuente Angular.
  La metadata no redefine esos contratos. Reutilizar el generador de API y endurecerlo
  donde haga falta; no parsear TypeScript con nuevas expresiones regulares ad hoc.
- **Datos editoriales:** un archivo bajo `cli/registry-metadata.json` (ruta propuesta)
  con id, categoría, estado, claves de traducción y limitaciones verificadas. No importar
  módulos de `src/app` desde la librería. El CLI puede resolver textos ingleses durante
  el empaquetado sin depender del sitio en ejecución.
- **Ejemplos:** fuente Angular compilada con todos sus imports. La web, los snippets y
  los ejemplos MCP se alimentan de esa fuente. La adaptación CLI cambia identificadores,
  selectores en templates e imports; no debe tocar texto del usuario, URLs ni CSS ajeno.
- **Salidas:** manifiesto, tablas técnicas y secciones de contexto IA son generadas o
  validadas de forma determinista. La prosa explicativa sigue siendo editorial.
- `COMPONENT_STATUS.md` conserva los motivos humanos de estabilidad; su tabla se genera
  o verifica contra la misma metadata. No mantener una segunda lista de estados.

No cambiar el esquema público del manifiesto incompatiblemente en v1. Se permiten campos
aditivos; los lectores viejos deben seguir funcionando. Identificar qué consumidor usa
cada campo antes de eliminar o renombrar nada.

### 3.2 CLI

Separar internamente **resolver → planificar → validar → escribir** dentro del CLI actual.
Un único plan contiene todos los componentes solicitados, dependencias compartidas,
utilidades y cambios del barrel. `--dry-run` usa exactamente ese plan y no escribe.

`init` conserva un archivo existente. `add` no convierte un conflicto de dependencia
idéntica en necesidad de `--force`. Prevalidar todos los conflictos antes de la primera
escritura. No prometer una transacción resistente a cortes de corriente: la garantía
inicial cubre errores previsibles y fallos de escritura gestionados con rollback.
Instalar paquetes es una fase posterior; un fallo del gestor debe indicar qué fuente
ya se copió y cómo reintentar, sin fingir atomicidad con el gestor de paquetes.

Añadir `--path` explícito de forma compatible; mantener el destino posicional v1 durante
la línea 1.x. Desambiguar su documentación y emitir orientación ante nombres dudosos.

La información de versiones probadas acompaña al registro distribuido. No convertir
un `add` sencillo en un asistente obligatorio ni instalar dependencias sin `--install`.

### 3.3 Calidad desde el consumidor

Las fixtures actuales siguen siendo rápidas y útiles. Añadir una instalación externa
que no herede `tsconfig`, aliases, node_modules ni plugins de Analog del repositorio.
Debe instalar tarballs reales de componentes y CLI en un directorio temporal externo,
usar Angular CLI y verificar tanto copia local como exports npm.

El gate prueba compilación de templates, carga de CSS/tokens, formularios y overlays.
Mantener una matriz pequeña: versión Angular declarada, entorno Node soportado, Chromium
para el recorrido completo; smoke relevante en Firefox/WebKit en el gate de release.
SSR/hidratación tiene una fixture acotada, no una segunda aplicación de demostración.

La versión mínima y el extremo superior del rango publicado se validan antes de ampliar
compatibilidad. No decir «Angular 21+» si lo probado y publicado es `^21.2`.

### 3.4 Contratos del componente

Cada familia declara dónde viven clase, id, nombre accesible, estado y foco. Las pruebas
observan el elemento interactivo, no solo el custom element exterior.

- Forms: write/reset, cambio único, touched en el momento correcto, disabled, error
  asociado, label funcional, valor nulo documentado y `updateOn: 'blur'` donde corresponda.
- Acciones/enlaces: nombre accesible del control real, submit nativo, ausencia de doble
  foco y enlace real cuando hay navegación. No fabricar navegación con `div (click)`.
- Overlays: portales, foco de entrada/salida, Escape del nivel superior y composición
  dentro de formularios/drawer. No cambiar una semántica correcta para hacer pasar tests.
- Apariencia: override de clases con destino inequívoco, tokens coherentes, foco visible,
  modo oscuro, reduced motion y texto largo. El sitio traducido no demuestra que fechas
  o controles tengan una API de locale correcta: eso se revisa por separado.

No imponer CVA a file upload ni a wrappers estructurales que hoy exponen otro contrato.
No mezclar un cambio de API mayor con un arreglo visual pequeño.

### 3.5 Mantenimiento de copias

El plan 05 propone `volt diff` y un registro local de procedencia. La operación compara
archivos contra la versión del registro incluida en la CLI ejecutada: no significa
«última versión de npm». No necesita servidor, login ni conexión en el propio diff.

La salida identifica diferencias y procedencia conocida/desconocida. No promete un
merge semántico ni aplica parches. La fuente copiada funciona aunque se elimine el registro
de procedencia. Una corrección puede trasladarse manualmente a un solo componente.

### 3.6 Recetas

Tres composiciones, alojadas con los ejemplos existentes y sin exports nuevos de runtime:
ajustes con guardado, búsqueda asíncrona y tabla con filtros/paginación. Estado y datos
simulados viven en el ejemplo. Cada receta incluye los estados de error y recuperación,
dependencias explícitas y una nota corta sobre dónde conectar el servicio del consumidor.

No añadir otra galería ni otra taxonomía pública: enlazar desde guías/componentes y
reutilizar el catálogo actual cuando corresponda.

## 4. Límites que mantienen pequeño el proyecto

- Cero nuevos paquetes publicados para esta ruta. No headless propio, DSL de formularios,
  table engine, backend, cuentas, telemetría obligatoria, editor visual ni marketplace.
- Cero nuevas dependencias de runtime como objetivo. Una excepción requiere motivo y
  alternativa descartada en el plan; las herramientas de test no se envían al consumidor.
- Mantener los cinco colores y cinco estilos. Mejorar las garantías antes de ampliar
  combinaciones. No extraer temas a otro paquete en esta iniciativa.
- Hasta tres recetas nuevas. Reutilizar componentes existentes; un hueco encontrado
  empieza como composición local, no como nuevo export automático.
- Hasta un archivo local de procedencia para el diff. Sin base de datos, daemon,
  sincronización remota ni caché de todas las versiones.
- No refactor general por estilo. Una fase solo toca lo necesario para su aceptación.

## 5. Métricas y salida

| Resultado               | Criterio verificable                                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Integridad de copia     | Repetir init preserva bytes; multi-add con dependencia compartida pasa; conflicto no deja cambios parciales             |
| Ejemplos fiables        | Todos los ejemplos oficiales declarados copiables compilan en su modo de consumo, sin alias `volt` ni imports faltantes |
| Coherencia              | Un cambio de estado/selector se refleja en las salidas o falla el gate; cero discrepancias conocidas F05–F08            |
| Instalación real        | Tarballs de esta revisión pasan build Angular y smoke fuera del monorepo; sin resolución accidental desde el workspace  |
| Composición             | Casos prioritarios del plan 04 pasan en DOM/navegador y las limitaciones restantes están enumeradas                     |
| Actualización revisable | `diff` no cambia ningún archivo y distingue procedencia conocida/desconocida; cambios locales permanecen intactos       |
| Utilidad                | Tres recetas compilables con éxito, carga, vacío/error y recuperación, según la tarea                                   |
| Coste                   | Sin paquetes publicados nuevos, sin ampliación del catálogo primitivo y sin segundo runtime de estilos                  |

Además, probar manualmente dos proyectos desechables independientes: completar un
formulario desde cero y trasladar una corrección a una copia personalizada. Registrar
pasos, errores y minutos como baseline. Objetivo orientativo: primer ejemplo en menos
de diez minutos excluyendo descargas. No presentar ese tiempo como conseguido ni añadir
analítica para medirlo. Pedir feedback de consumidores reales cuando exista acceso a ellos.

## 6. Entregas y semver

Arreglos de corrupción/coherencia pueden entregarse antes de completar todos los planes.
Cada PR registra si es corrección, capacidad aditiva o ruptura. Un requisito mínimo de
entorno más estricto necesita valorar compatibilidad aunque corrija documentación.

**No hay un breaking change aprobado por este SDD.** Si los contratos mejoran con APIs
aditivas, todo puede entregarse como v1.x. Si para un caso probado hace falta retirar un
selector, cambiar propagación de clases/valores o eliminar el destino posicional, crear
un inventario antes/después con guía de migración y fase específica de major. No usar
“v2” como excusa para reescribir la librería.

Salida de release: comandos de calidad exigidos por AGENTS, build de docs para templates
y traducciones, checks de generación/contraste, empaquetado e integración externa, pruebas
de consumidor relevantes. `release:check` actual no ejecuta todos los E2E: no sustituye
la lista completa. Guardar los comandos concretos cuando el plan 03 los implemente.

Publicar/deploy no forma parte de estos planes. Preparar cambios y evidencia no implica
alterar versiones o publicar automáticamente al terminar una fase.

## 7. Riesgos y decisiones pendientes

| Riesgo                                    | Respuesta acotada                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| Generar todo crea otro framework          | Solo datos técnicos repetidos; scripts existentes; mantener prosa manual |
| La validación externa encarece CI         | Una matriz pequeña, fixtures desechables y separación de smoke/release   |
| Mejorar wrappers rompe CSS del consumidor | Caracterización de clase/DOM primero; API aditiva o major explícito      |
| El diff parece un actualizador completo   | Solo lectura y documentación del origen exacto; sin merges               |
| Recetas se convierten en producto         | Tres casos, datos locales, sin servicios compartidos de negocio          |
| Confundir aspiración y bug                | Usar IDs de AUDIT; reproducir H antes de atribuir un fallo               |

Pendiente al ejecutar: forma mínima de exponer personalización/nombre accesible en cada
wrapper, baseline de bundles medido en consumidor y demanda de Angular posterior a 21.
Esas preguntas no bloquean los planes 01–03 ni autorizan ampliar el alcance.
