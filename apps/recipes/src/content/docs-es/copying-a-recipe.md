---
title: Copiar una receta
description: Instala los paquetes que necesita un bloque, layout o receta, copia su código y comprueba que compila en tu proyecto.
group: Primeros pasos
order: 2
---

Cada página termina con el panel de **código** y un comando de instalación. El código ya está reescrito para un proyecto normal: importa Volt desde `@voltui/components`, nunca desde un alias privado.

## 1. Instala los paquetes

```bash
pnpm add @voltui/components
```

El comando bajo el código lista cualquier otro paquete que importe esa entrada. Se lee del propio código, así que no puede quedarse desactualizado.

## 2. Copia el archivo

Usa el botón **Copiar** y guarda el componente donde tu proyecto guarda las funcionalidades, por ejemplo `src/app/blocks/pricing-tiers/pricing-tiers.ts`. Un bloque o layout es un único componente standalone.

## 3. Úsalo

```ts
import { PricingTiers } from './blocks/pricing-tiers/pricing-tiers';

@Component({
  imports: [PricingTiers],
  template: `<app-pricing-tiers />`,
})
export class PricingPage {}
```

## 4. Aplica tu tema

Las entradas usan solo tokens de tema (`bg-primary`, `rounded-md`), así que se aplican tu tema de Volt y el modo oscuro. Nada lleva marca.

> [!NOTE]
> Si prefieres ser dueño también de los componentes de Volt, `npx @voltui/cli add <componente>` los copia a tu proyecto en lugar de instalar el paquete.
