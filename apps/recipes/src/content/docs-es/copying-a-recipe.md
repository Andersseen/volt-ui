---
title: Copiar una receta
description: Instala lo que necesita un bloque, layout o patrón, copia su código como paquete npm o con los componentes copiados por el CLI, y comprueba que compila en tu proyecto.
group: Primeros pasos
order: 2
---

Cada página termina con el panel de **código**. Encima del código, elige cómo usa Volt UI tu proyecto; el código, el botón de copiar y los comandos de instalación siguen esa elección.

| Modo            | Importa Volt desde                | Nombres           | Instalación                                        |
| --------------- | --------------------------------- | ----------------- | -------------------------------------------------- |
| **Paquete npm** | `@voltui/components`              | `Volt*`, `volt-*` | `pnpm add @voltui/components` + paquetes indicados |
| **Copia (CLI)** | `../ui/<componente>` (tus copias) | `Ui*`, `ui-*`     | `npx @voltui/cli add …` + paquetes indicados       |

La elección se mantiene al pasar de una página a otra. Las dos versiones de cada entrada se compilan en CI, en un proyecto limpio, con los paquetes que instala un consumidor.

## 1. Instala lo que necesita

Ejecuta los comandos que aparecen bajo el código. Se leen del propio código, así que no pueden quedarse desactualizados:

- **Paquete npm**: `@voltui/components` y cualquier otro paquete que importe la entrada (la mayoría usa `lumen-icons` para los iconos).
- **Copia (CLI)**: `npx @voltui/cli add` con todos los componentes de Volt que importa la entrada. El CLI copia también sus dependencias y lista los paquetes npm que necesitan (añade `--install` para instalarlos). Después, los demás paquetes que importe la entrada.

## 2. Copia los archivos

Usa el botón **Copiar**. Conserva el nombre del archivo y copia en la misma carpeta cualquier archivo de apoyo que aparezca debajo (por ejemplo `contact-map.data.ts`).

- **Paquete npm**: guárdalo donde tu proyecto guarda las funcionalidades, por ejemplo `src/app/pricing-tiers/pricing-tiers.ts`.
- **Copia (CLI)**: guárdalo en `src/app/<carpeta>/`. Sus imports apuntan a `../ui/<componente>`, es decir, `src/app/ui/`, donde escribe `volt add` por defecto. Si tus componentes están en otro sitio, cambia esas rutas.

## 3. Úsalo

```ts
import { PricingTiers } from './pricing-tiers/pricing-tiers';

@Component({
  imports: [PricingTiers],
  template: `<app-pricing-tiers />`,
})
export class PricingPage {}
```

## 4. Dale tu tema

Las entradas solo usan tokens del tema (`bg-primary`, `rounded-md`), así que se aplican tu tema de Volt y el modo oscuro. Nada lleva marca.

> [!NOTE]
> Los patrones incluyen una función `fake*` (`fakeSave`, `fakeSearch`, `fakeFetch`) que ocupa el lugar de tu servicio. Sustitúyela; consulta [Patrones de flujo](/es/docs/workflow-patterns).
