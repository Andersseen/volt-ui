# Plan 08 — Autoría de temas y sistemas de diseño accesibles

**Estado:** implementado en `feat/theme-authoring-accessible-design-systems` (2026-11-27). **Prioridad:** P1.
**SHA de entrada:** `bbd067c73546d8f71dd59571850829277c2280d6` (merge de #263; `origin/main` no había avanzado).
**Entrega:** una iniciativa de tamaño minor, un PR. Sin publicar, sin desplegar, sin tocar la configuración de npm.

## Contexto verificado al empezar

| Paquete              | Fuente | npm `latest` (rev. 2026-11-27) |
| -------------------- | ------ | ------------------------------ |
| `@voltui/components` | 1.4.1  | 1.3.3                          |
| `@voltui/cli`        | 1.4.0  | 1.3.3                          |
| `@voltui/agent`      | 0.6.1  | 0.6.0                          |

Las tres versiones fuente siguen sin publicar (Trusted Publishing, acción del propietario: `RELEASING.md`). Según
la política de releases, los cambios de este plan se pliegan en esas versiones pendientes: no se sube ni se salta
ningún número.

## Decisiones

1. **Nombres declarados, no un registro.** `voltCustomColor('acme')` valida y devuelve un `VoltCustomColor`
   (tipo marcado). Las API de tema aceptan `VoltThemeColor | VoltCustomColor`; un `string` cualquiera no compila.
   Nada global: dos peticiones SSR no pueden compartir estado. `VoltThemeOptions` sin argumentos de tipo no cambia
   (los lectores existentes siguen tipando igual); `VoltAnyThemeOptions` es lo que aceptan las funciones.
2. **Paleta ≠ estilo ≠ densidad.** El CSS exportado es la paleta (`data-color`) y solo las formas que el diseñador
   cambió; estilo y densidad son configuración (`provideVoltTheme`). Las formas ganan al estilo porque el archivo se
   importa después (misma especificidad): se documenta y se prueba en navegador.
3. **La vista previa pinta con el CSS exportado.** Antes usaba variables en línea; ahora el estudio inyecta su
   propia hoja (nombre privado `studio-preview`) y la mantiene la última del `<head>`, como en una app. Así los
   overlays de la vista previa heredan el tema y la vista previa coincide con una app exportada.
4. **Una sola implementación de contraste.** `packages/shared/lib/contrast.ts` (matemática y pares) la usan
   `check:contrast` (salida JSON idéntica byte a byte antes/después) y el inspector del estudio.
5. **Formato de proyecto estricto.** JSON versionado, claves y rangos exactos, colores `#rrggbb`; cualquier campo
   desconocido es un error, nunca se ignora. Sin parser CSS ni CSS arbitrario.
6. **Biblioteca local acotada.** `localStorage`, una clave, esquema versionado, 20 temas; nunca sobrescribe datos
   de una versión más nueva ni desaloja temas; JSON corrupto se copia a `:backup`.
7. **Arreglos de accesibilidad mínimos y compatibles.** Button conserva `h-control-*` (el `h-*` del consumidor
   sigue ganando) y añade `min-h-fit` + `leading-tight`; `outline-none` → `outline-hidden` en toda la librería.
8. **Localización:** dos `input()` aditivos con el texto inglés actual por defecto. Sin servicio de traducción.

## Workstream A — Contrato de tema propio

- [x] A.1 Caracterización (reproducida en un test temporal sobre la base): `applyVoltTheme` aceptaba cualquier
      cadena en tiempo de ejecución pero no en tipos; `voltThemeInitScript` **descartaba en silencio** una paleta
      propia guardada o por defecto; `persistVoltTheme` y `applyVoltTheme` escribían nombres mal formados
      (`"a'] , body{"`) en el DOM y en el almacenamiento. `[voltTheme]` solo tipaba las cinco paletas.
- [x] A.2 `voltCustomColor` / `voltCustomStyle`, `VoltAnyThemeOptions`, `customColors` / `customStyles` en el
      script de primer pintado; nombres mal formados descartados (aviso en desarrollo) y no almacenados.
      Tests: `theme.spec.ts` (+8), `theme-ssr.spec.ts` (platform-server real, dos peticiones simultáneas con temas
      distintos, sin fuga).
- [x] A.3 Fidelidad de ámbitos con la **hoja exportada** (`e2e/consumer/src/themes/acme.css`, generada desde
      `acme.theme.json` y mantenida igual al serializador por `theme-export-fixture.spec.ts`): ámbito claro y
      oscuro, propio dentro de integrado oscuro y al revés, densidad, estilo Brutal con formas propias, overlays
      (diálogo + select), página entera y script de primer pintado; Chromium, Firefox y WebKit
      (`e2e/contracts/theme-custom.spec.ts`).
- [x] A.4 Paridad de distribución: el mismo fixture pasa por la transformación del CLI (`uiCustomColor`) en
      `e2e/consumer-cli-themes.spec.ts`; manifiesto, nombres de copia, API generada, MCP y skill regenerados;
      capacidades `components.custom-themes` y `components.translatable-labels` (since 1.4.1).

## Workstream B — Theme Studio 2.0

- [x] B.1 Las cinco paletas como punto de partida, leídas de los CSS publicados (incluido `tokens.css` para
      Volt); estilo, densidad y formas separados; las formas `null` siguen al estilo. Un borrador sin tocar
      exporta exactamente el CSS de antes.
- [x] B.2 Formato de proyecto v1 (`apps/web/src/app/lib/theme-project.ts`): exportar/importar, errores con
      ruta, serialización determinista, ida y vuelta byte a byte y al mismo CSS. Importación de Palette Crafter
      intacta y separada.
- [x] B.3 Biblioteca local (`theme-library.ts`): recuperación del borrador, guardar, abrir (con confirmación si
      hay cambios), duplicar, renombrar, borrar (alertdialog), sin almacenamiento, registro corrupto, esquema
      nuevo, cuota, varias pestañas. Solo en el navegador, después del primer render.
- [x] B.4 Selector nativo + campo HEX, reset por token / paleta / borrador, deshacer/rehacer acotado (100; un
      arrastre del selector = un paso), estado sin guardar, CSS/JSON/TypeScript con copiar y descargar desde el
      mismo borrador.

## Workstream C — Inspector de contraste

- [x] C.1 37 pares + 5 por estilo + 4 tintes de alerta, por modo; umbral por función (4.5 texto, 3 no textual);
      derivados (`surface-elevated`, `track`, tarjeta, borde de campo) con la misma mezcla OKLCH que la auditoría.
      Concuerda con `check:contrast` en las 25 combinaciones paleta × estilo.
- [x] C.2 Panel accesible: par, modo, ratio, umbral, resultado en texto, función traducida; «Editar token» lleva
      el foco al campo (arreglado para que ocurra tras renderizar la pestaña); sin robar el foco al editar.
- [x] C.3 Sugerencias explícitas: menor cambio de luminosidad que conserva el tono, comprobado contra el umbral,
      vista previa del valor, deshacer; «no hay ajuste fiable» cuando no existe.
- [x] C.4 El panel dice qué no comprueba (deshabilitados, bordes decorativos, sombras, imágenes) y que no es una
      certificación WCAG; la exportación nunca se bloquea.

## Workstream D — Vista previa de aplicación real

- [x] D.1 Tres escenarios con componentes Volt reales (panel con navegación; formulario con validación;
      tabla con menú, diálogo y select), controles de escenario, modo, densidad (del borrador), ancho y estado
      (normal, deshabilitado, inválido, cargando, vacío, error).
- [x] D.2 Aislamiento: el `<html>` del sitio no cambia al editar ni al abrir/cerrar overlays; sin contenedores
      huérfanos; Escape cierra por capas y el foco vuelve al disparador (3 motores).
- [x] D.3 Ejercicio exportar → app: el consumidor aislado (paquete y copia CLI) usa el CSS y la configuración
      exportados. Comparación de estilos computados estudio ↔ consumidor (botón e input, claro y oscuro, 9
      propiedades): **10 diferencias** encontradas al principio (la hoja de la vista previa quedaba antes de la
      del sitio y Soft ganaba); tras el arreglo, **0 diferencias en 36 propiedades** en Chromium, Firefox y
      WebKit. Persistencia, SSR e hidratación: tests de A.2/A.3 y comprobaciones SSR de abajo.

## Workstream E — Accesibilidad y composición adaptable

- [x] E.1 `e2e/contracts/adaptive.spec.ts`: composición con etiquetas largas en español y ucraniano (página,
      diálogo, drawer). Reproducido en la base: 16 fallos (desbordamiento a 320 px en todos los estilos, modos
      y densidades; zoom CSS 200 % emulado; foco invisible en colores forzados). Tras los arreglos: 51 pasan,
      3 omitidos documentados (colores forzados solo en Chromium; WebKit no tabula a botones).
      **Ventana estrecha y zoom emulado se registran aparte del zoom manual, que no se hizo.**
- [x] E.2 Localización: Date Picker/Range ya usan `LOCALE_ID` (nombres de día) y `firstDayOfWeek`; los nombres
      de navegación de mes, la búsqueda y el cierre del drawer ya eran configurables; Dialog no tiene cierre
      propio; File Upload no tiene texto interno. Huecos reales: Pagination (4 nombres fijos) y Combobox
      («Toggle dropdown»): `label` y `toggleLabel`, con tests que fallaban antes. Ejemplos en/es/uk en uso.
- [ ] E.3 Evidencia manual con tecnología de apoyo: **no realizada** (ningún lector de pantalla disponible para
      el agente). Recorridos de teclado con eventos reales en tres motores: automatizados, no manuales. Ver
      `docs/quality/manual-a11y-checklist.md` (filas 13–18 añadidas, todas abiertas).

## Workstream F — Documentación y adopción

- [x] Guía Theme System (en/es/uk), `docs/theme-contract.md`, Storybook (theming), skill `volt-ui-styling`,
      `VOLT_UI_PROMPT.md`, MCP `get_theme_info.customThemes` (aditivo, con disponibilidad), traducciones del
      estudio en Glossa (186 claves × 3 idiomas, escritas por clave; paridad 1332/1332).
- [x] F.1 `check:examples` compila los bloques TypeScript de las guías de instalación, temas y personalización
      en ambos modos; fragmentos marcados `// Fragment:`; los tres idiomas con el mismo código; inventario con
      las capacidades que necesita cada ejemplo.

## Verificación

_Completada abajo con los resultados reales._

## Límites y pendientes

- Revisión con lector de pantalla y zoom manual del navegador: pendientes (E.3).
- Firefox no aplica `min-height: fit-content` a estos ítems flex: dos líneas caben en todos los motores; tres o
  más desbordan verticalmente solo en Firefox (sin recorte horizontal).
- Las formas propias en el selector de la paleta se heredan en ámbitos anidados que no fijan estilo.
- Publicación bloqueada por Trusted Publishing en npm (propietario).
