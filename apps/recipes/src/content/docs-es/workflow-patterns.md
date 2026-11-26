---
title: Patrones de flujo
description: Qué resuelven los patrones de formulario de ajustes, búsqueda asíncrona y tabla de datos, qué estado es tuyo, dónde se conectan tus servicios y cómo funcionan la carga, los errores y la recuperación.
group: Conceptos
order: 2
---

Un patrón es un comportamiento completo y probado, construido con componentes de Volt. Volt aporta los controles y su accesibilidad; **el estado y las peticiones se quedan en tu componente**, como signals normales de Angular. Cada patrón tiene una única función que sustituir por tu servicio.

## Formulario de ajustes

::demo[settings-form]

**Resuelve** la edición de un registro guardado —un perfil, unas preferencias— con validación, un único guardado a la vez y una recuperación que nunca pierde lo escrito.

**Úsalo cuando** el registro se carga, se edita y se guarda entero. Para un solo interruptor que guarda al momento, un formulario sobra.

**Se construye con** Form Field, Input, Native Select, Switch, Alert y Button.

**Tu estado**: el `FormGroup` y sus validadores, los últimos valores guardados (la referencia que decide qué son «cambios sin guardar»), si hay un guardado pendiente y el último resultado.

**Conecta** tu API sustituyendo `fakeSave`, o pasa `(value) => Promise<Settings>` al input `[save]`. Lo que devuelva pasa a ser la nueva referencia.

**Carga, errores, recuperación**: un envío no válido muestra todos los errores y lleva el foco al primer campo no válido. Mientras guarda, Guardar y Cancelar usan `aria-disabled`, así que el foco del teclado se queda donde estaba, y los campos siguen editables. Un fallo conserva lo escrito, explica qué pasó y volver a pulsar Guardar lo reintenta. Lo que se escriba durante un guardado queda como cambio sin guardar.

## Búsqueda asíncrona

::demo[async-search]

**Resuelve** la búsqueda de datos que solo el servidor sabe filtrar —por email, alias o un índice remoto— y la elección de un resultado.

**Úsalo cuando** la lista es demasiado grande para cargarla o las reglas de coincidencia están en el servidor. Si ya tienes la lista, un Combobox normal la filtra por ti.

**Se construye con** Combobox (`filterMode="manual"`), Form Field, Alert y Button.

**Tu estado**: la consulta, los resultados, la carga y el error, un turno de petición para que una respuesta lenta y antigua nunca pise a otra más nueva, y el elemento elegido, separado de los resultados para que una búsqueda fallida no lo borre.

**Conecta** tu API sustituyendo `fakeSearch`, o pasa `(query) => Promise<Person[]>` a `[search]`. Mantén `filterMode="manual"`: si no, Volt volvería a filtrar los resultados del servidor por su etiqueta.

**Carga, errores, recuperación**: la escritura tiene un pequeño retardo; el combobox muestra los textos de carga y de vacío. Una petición fallida muestra una alerta con Reintentar y conserva la selección actual. Elegir una opción nunca lanza una búsqueda nueva.

## Tabla de datos

::demo[data-table]

**Resuelve** una lista paginada con orden, filtro y todos los estados que produce un servicio real. No existe `VoltDataTable` a propósito: el comportamiento son unas pocas signals que dependen de tus datos.

**Úsalo cuando** las filas llegan de un servicio página a página. Para una lista corta y estática basta con una Table.

**Se construye con** Table, Pagination, Input, Badge, Skeleton y Alert.

**Tu estado**: la consulta (filtro, columna y sentido de orden, página, tamaño de página), las filas actuales y los totales, la carga y el error.

**Conecta** tu API sustituyendo `fakeFetch` por `(query) => Promise<InvoicePage>`. Mantén la forma de la petición, para que el orden y la paginación sigan en el servidor.

**Carga, errores, recuperación**: filas esqueleto en la primera carga; en las siguientes se mantienen las filas anteriores, atenuadas y marcadas como ocupadas. Un conjunto de datos vacío y un filtro sin coincidencias son estados distintos, cada uno con una salida. Una petición fallida muestra una alerta con Reintentar y conserva las filas ya mostradas. Cambiar el filtro vuelve a la página 1.

## Qué no cambiar

Deja la política de peticiones (retardo, gana la respuesta más reciente, un guardado a la vez) en tu componente, no dentro de un componente de Volt copiado: esos componentes están pensados para reutilizarse en otras pantallas con otras reglas.
