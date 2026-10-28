---
title: Añadir una receta
description: Los pasos para contribuir un bloque, un layout o una receta a Volt UI Recipes.
group: Contribuir
order: 1
---

Una entrada nueva son tres piezas pequeñas; el catálogo deriva rutas, tarjetas, sitemap y redirecciones a partir de ellas.

1. **Código.** `apps/recipes/src/app/{blocks,layouts,recipes}/<nombre>/<nombre>.ts`. Importa Volt desde `'volt'` y nada de la aplicación.
2. **Metadatos.** Una entrada en el archivo `lib/*-metadata.ts` correspondiente: slug, ruta y los componentes de Volt que usa.
3. **Página.** `pages/(gallery)/<tipo>/<slug>.page.ts` con el componente showcase que corresponda.

Después ejecuta las comprobaciones que respaldan la promesa de «cópialo y funciona»:

```bash
pnpm check:copied-source
pnpm test:e2e:recipes
```

`check:copied-source` compila cada entrada contra el paquete `@voltui/components` ya construido, en un espacio de trabajo de consumidor limpio.
