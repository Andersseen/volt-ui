---
title: Introducción
description: Qué es Volt UI Recipes, qué publica y cómo se relaciona con la librería de componentes Volt UI.
group: Primeros pasos
order: 1
---

Volt UI Recipes es el sitio compañero de [Volt UI](https://voltui.dev). Volt UI documenta los **componentes**; Recipes muestra lo que puedes **construir** con ellos, como código fuente que copias en tu propio proyecto Angular.

Cada entrada tiene una vista previa en vivo, su código completo, los paquetes que necesita y enlaces a los componentes con los que está hecha.

## Qué hay aquí

- Los **bloques** son secciones terminadas de una página: un hero, precios, un pie de página.
- Los **layouts** son el armazón de una aplicación: panel, ajustes, chat. Sin marca a propósito.
- Las **recetas** son composiciones que enseñan comportamiento en el tiempo: validación, búsqueda asíncrona, tablas.

Lee [Bloques, layouts y recetas](/es/docs/blocks-layouts-recipes) para ver la diferencia y [Copiar una receta](/es/docs/copying-a-recipe) para usar una.

## No es una segunda librería

Nada de esto se publica como export de npm. Un bloque distribuido como dependencia haría que todos los productos que lo usan se vieran igual. Copias el código, cambias lo que necesites y sigues dependiendo solo de `@voltui/components`.
