# Volt UI después de v1: utilidad sin convertirse en plataforma

**Fecha:** 2026-09-07 · **Base revisada:** `35e6816`, paquetes `1.0.1`.
**Estado:** propuesta de diseño; implementación no iniciada.

La siguiente etapa debería hacer que Volt sea fácil de instalar, componer, adaptar y
mantener en una aplicación real. El catálogo ya es suficientemente amplio para demostrar
ese valor. La prioridad es cerrar la distancia entre «funciona en la demo» y «puedo
usarlo y mantener mis cambios en mi proyecto».

Estos documentos responden a la petición de crítica y planificación, sin implementar
código. **“v2” nombra el horizonte de producto, no obliga a publicar un major.** Los
arreglos compatibles deben llegar en patches de v1; las capacidades aditivas, en minors.

## Documentos y orden de lectura

| Documento                                                    | Para qué sirve                                                      |
| ------------------------------------------------------------ | ------------------------------------------------------------------- |
| [AUDIT.md](AUDIT.md)                                         | Valoración, evolución, fallos reproducidos y límites de la revisión |
| [SDD.md](SDD.md)                                             | Diseño propuesto, decisiones, límites y criterios de salida         |
| [01-cli-integrity.md](plans/01-cli-integrity.md)             | Evitar pérdida de código y operaciones parciales al copiar          |
| [02-trustworthy-docs.md](plans/02-trustworthy-docs.md)       | Hacer coincidir código, ejemplos, CLI, web y contexto para IA       |
| [03-consumer-contract.md](plans/03-consumer-contract.md)     | Probar paquetes e instalación fuera del monorepo                    |
| [04-component-contracts.md](plans/04-component-contracts.md) | Mejorar composición, HTML nativo, accesibilidad y personalización   |
| [05-safe-diff.md](plans/05-safe-diff.md)                     | Comparar versiones sin sobrescribir las modificaciones locales      |
| [06-recipes.md](plans/06-recipes.md)                         | Resolver tres tareas reales con componentes existentes              |

## Hoja de ruta

| Orden | Entrega y resultado visible                                       | Prioridad | Tamaño relativo | Dependencia          |
| ----- | ----------------------------------------------------------------- | --------- | --------------- | -------------------- |
| 1     | `init` repetible y `add` coherente para varios componentes        | P0        | S–M             | Ninguna              |
| 2     | Ejemplos utilizables y una sola declaración de cada API/estado    | P1        | M               | 1 para validar copia |
| 3     | Un consumidor limpio instala, compila y funciona                  | P1        | M               | 1–2                  |
| 4     | Controles que se integran bien en formularios, enlaces y overlays | P1        | M, por familia  | 3                    |
| 5     | El consumidor puede revisar qué cambió sin perder su código       | P2        | M               | 1–3                  |
| 6     | Ajustes, búsqueda asíncrona y tabla con estados completos         | P2        | M, por receta   | 2–4                  |

S significa una modificación localizada; M requiere varios cambios revisables. No son
estimaciones de días. Ejecutar una fase por PR cuando sea posible. No hace falta esperar
a terminar toda la hoja de ruta para entregar el arreglo del paso 1.

**Versión mínima de esta iniciativa:** completar 1–3. Ya resuelve fallos reales y aumenta
la confianza sin ampliar el runtime. Si el mantenimiento disponible es escaso, detenerse
ahí y evaluar uso real antes de empezar 4–6.

## Instrucciones para el siguiente modelo

> Lee `AGENTS.md`, `specs/GUARDRAILS.md`, `specs/v2/SDD.md` y el plan que te indique.
> Verifica el commit y el estado de trabajo actuales: la auditoría describe una base
> concreta, no garantiza que los fallos sigan presentes. Ejecuta la primera fase sin
> completar de ese plan. Reproduce primero el problema; si ya está resuelto, registra
> la evidencia y continúa. Conserva cambios ajenos y la API pública v1. Usa los patrones
> de `specs/patterns/` contrastándolos con el código actual. No ejecutes otros planes,
> no publiques ni despliegues. Actualiza las casillas y el registro de ejecución con
> archivos, comandos, resultados, limitaciones y siguiente paso. No marques un criterio
> como cumplido por haber escrito el test: debe haber pasado.

Los comandos de verificación se ejecutan con el prefijo `rtk` según las instrucciones
del repositorio. Los comandos etiquetados como **propuestos** aún no existen.

## Relación con los planes anteriores

`specs/SPEC.md`, `specs/plans/v*.md` y el SDD raíz documentan la trayectoria de v1.
Esta propuesta recomienda cambiar la prioridad post-v1: **aplazar el headless propio y
la distribución sin Tailwind**. Esa recomendación está motivada en el nuevo SDD; no es
una afirmación de que el roadmap público ya haya cambiado. El plan 02 incluye actualizar
la comunicación correspondiente al adoptar esta ruta. No reabrir fases históricas ni
reimplementar contratos que ya funcionan.

La petición actual autoriza estos documentos; la implementación se inicia con una tarea
posterior del usuario. Ninguna casilla de implementación está completada.
