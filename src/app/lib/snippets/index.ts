export const BUTTON_SNIPPET = `import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  booleanAttribute,
} from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer select-none',
  {
    variants: {
      variant: {
        solid:
          'bg-primary text-primary-foreground shadow-sm data-[hover]:bg-primary/90 data-[press]:scale-[0.98]',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm data-[hover]:bg-destructive/90 data-[press]:scale-[0.98]',
        outline:
          'border border-input bg-background shadow-sm data-[hover]:bg-accent data-[hover]:text-accent-foreground',
        ghost: 'data-[hover]:bg-accent data-[hover]:text-accent-foreground',
        link: 'text-primary underline-offset-4 data-[hover]:underline',
      },
      size: {
        sm: 'h-8 rounded-md px-3 text-xs',
        md: 'h-10 rounded-md px-4 text-sm',
        lg: 'h-11 rounded-md px-8 text-base',
        icon: 'h-9 w-9 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'md',
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

@Component({
  selector: 'volt-button',
  imports: [NgpButton],
  template: \
\    <button
      ngpButton
      [disabled]="disabled()"
      [class]="classes()"
      [attr.data-variant]="variant()"
      [attr.data-size]="size()"
    >
      <ng-content select="[slot=leading]" />
      <ng-content />
      <ng-content select="[slot=trailing]" />
    </button>
  \,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoltButton {
  readonly variant = input<ButtonVariants['variant']>('solid');
  readonly size = input<ButtonVariants['size']>('md');
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  protected readonly classes = computed(() =>
    buttonVariants({ variant: this.variant(), size: this.size() }),
  );
}`;

export const BADGE_SNIPPET = `import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

@Component({
  selector: 'volt-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex',
    '[class]': 'classes()',
  },
  template: \`<ng-content />\`,
})
export class VoltBadge {
  readonly variant = input<BadgeVariants['variant']>('default');

  protected readonly classes = computed(() => badgeVariants({ variant: this.variant() }));
}`;

export const NAVIGATION_MENU_SNIPPET = `// navigation-menu.ts
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import {
  NgpNavigationMenu,
  provideNavigationMenuState,
} from 'ng-primitives/navigation-menu';

@Component({
  selector: 'volt-navigation-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNavigationMenuState()],
  host: {
    class: 'relative flex max-w-max flex-1 items-center justify-center',
    role: 'navigation',
  },
  hostDirectives: [
    {
      directive: NgpNavigationMenu,
      inputs: [
        'ngpNavigationMenuOrientation: orientation',
        'ngpNavigationMenuShowDelay: showDelay',
        'ngpNavigationMenuHideDelay: hideDelay',
        'ngpNavigationMenuValue: value',
      ],
      outputs: ['ngpNavigationMenuValueChange: valueChange'],
    },
  ],
  template: \`<ng-content />\`,
})
export class VoltNavigationMenu {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly showDelay = input<number>(200);
  readonly hideDelay = input<number>(150);
  readonly value = model<string | null>(null);
}

// navigation-menu-trigger.ts
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  input,
} from '@angular/core';
import {
  NgpNavigationMenuTrigger,
  provideNavigationMenuTriggerState,
} from 'ng-primitives/navigation-menu';

@Component({
  selector: 'volt-navigation-menu-trigger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNavigationMenuTriggerState()],
  host: {
    class:
      'group/trigger inline-flex h-9 items-center justify-center gap-1 rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[open]:bg-accent/50',
  },
  hostDirectives: [
    {
      directive: NgpNavigationMenuTrigger,
      inputs: [
        'ngpNavigationMenuTrigger: content',
        'ngpNavigationMenuTriggerPlacement: placement',
        'ngpNavigationMenuTriggerOffset: offset',
        'ngpNavigationMenuTriggerFlip: flip',
        'ngpNavigationMenuTriggerDisabled: disabled',
        'ngpNavigationMenuTriggerCooldown: cooldown',
      ],
    },
  ],
  template: \`
    <ng-content />
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="h-4 w-4 transition-transform duration-200 group-data-[open]/trigger:rotate-180"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  \`,
})
export class VoltNavigationMenuTrigger {
  readonly content = input.required<TemplateRef<unknown>>();
  readonly placement = input<'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'>('bottom-start');
  readonly offset = input<number>(4);
  readonly flip = input<boolean>(true);
  readonly disabled = input<boolean>(false);
  readonly cooldown = input<number>(300);
}

// navigation-menu-content.ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  NgpNavigationMenuContent,
  provideNavigationMenuContentState,
} from 'ng-primitives/navigation-menu';

@Component({
  selector: 'volt-navigation-menu-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNavigationMenuContentState()],
  host: {
    class:
      'fixed z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-md hidden data-[open]:block',
  },
  hostDirectives: [
    {
      directive: NgpNavigationMenuContent,
      inputs: [
        'ngpNavigationMenuContentOrientation: orientation',
        'ngpNavigationMenuContentWrap: wrap',
      ],
    },
  ],
  template: \`<ng-content />\`,
})
export class VoltNavigationMenuContent {
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  readonly wrap = input<boolean>(false);
}`;

export const CARD_SNIPPET = `import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva('rounded-lg border bg-card text-card-foreground shadow-sm', {
  variants: {
    variant: {
      default: '',
      outline: 'border-2',
      ghost: 'border-none shadow-none',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type CardVariants = VariantProps<typeof cardVariants>;

@Component({
  selector: 'volt-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
    '[class]': 'classes()',
  },
  template: \`<ng-content />\`,
})
export class VoltCard {
  readonly variant = input<CardVariants['variant']>('default');

  protected readonly classes = computed(() => cardVariants({ variant: this.variant() }));
}`;

export const INPUT_SNIPPET = `import { ChangeDetectionStrategy, Component, input, booleanAttribute } from '@angular/core';
import { NgpInput } from 'ng-primitives/input';

@Component({
  selector: 'volt-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpInput],
  template: \`
    <input
      ngpInput
      [type]="type()"
      [disabled]="disabled()"
      [placeholder]="placeholder()"
      [value]="value()"
      (input)="onInput($event)"
      class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  \`,
})
export class VoltInput {
  readonly type = input<string>('text');
  readonly placeholder = input<string>('');
  readonly value = input<string>('');
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }
}`;

export const CHECKBOX_SNIPPET = `import { ChangeDetectionStrategy, Component, input, model, booleanAttribute } from '@angular/core';
import { NgpCheckbox } from 'ng-primitives/checkbox';

@Component({
  selector: 'volt-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpCheckbox],
  host: {
    class: 'inline-flex items-center space-x-2',
  },
  template: \`
    <button
      ngpCheckbox
      [checked]="checked()"
      (ngpCheckboxChange)="checked.set($event)"
      [disabled]="disabled()"
      class="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
    >
      @if (checked()) {
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      }
    </button>
    <ng-content />
  \`,
})
export class VoltCheckbox {
  readonly checked = model<boolean>(false);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
}`;

export const SWITCH_SNIPPET = `import { ChangeDetectionStrategy, Component, input, model, booleanAttribute } from '@angular/core';
import { NgpSwitch } from 'ng-primitives/switch';

@Component({
  selector: 'volt-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpSwitch],
  host: {
    class: 'inline-flex items-center',
  },
  template: \`
    <button
      ngpSwitch
      [checked]="checked()"
      (ngpSwitchChange)="checked.set($event)"
      [disabled]="disabled()"
      class="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[checked=true]:bg-primary data-[checked=false]:bg-input"
    >
      <span
        class="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[checked=true]:translate-x-5 data-[checked=false]:translate-x-0"
      ></span>
    </button>
    <ng-content />
  \`,
})
export class VoltSwitch {
  readonly checked = model<boolean>(false);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
}`;

export const ACCORDION_SNIPPET = `import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NgpAccordion, NgpAccordionItem, NgpAccordionTrigger, NgpAccordionContent } from 'ng-primitives/accordion';

@Component({
  selector: 'volt-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpAccordion],
  template: \`<ng-content />\`,
})
export class VoltAccordion {}

@Component({
  selector: 'volt-accordion-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpAccordionItem],
  template: \`<ng-content />\`,
})
export class VoltAccordionItem {
  readonly value = input.required<string>();
  readonly expanded = model<boolean>(false);
}

@Component({
  selector: 'volt-accordion-trigger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpAccordionTrigger],
  template: \`
    <button ngpAccordionTrigger class="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline">
      <ng-content />
      <svg class="h-4 w-4 shrink-0 transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  \`,
})
export class VoltAccordionTrigger {}

@Component({
  selector: 'volt-accordion-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpAccordionContent],
  template: \`
    <div ngpAccordionContent class="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
      <div class="pb-4 pt-0">
        <ng-content />
      </div>
    </div>
  \`,
})
export class VoltAccordionContent {}`;

export const TABS_SNIPPET = `import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NgpTabset } from 'ng-primitives/tabs';

@Component({
  selector: 'volt-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpTabset],
  template: \`<ng-content />\`,
})
export class VoltTabs {
  readonly value = model<string>('');
}`;

export const TOOLTIP_SNIPPET = `import { Directive, input } from '@angular/core';
import { NgpTooltipTrigger } from 'ng-primitives/tooltip';
import type { NgpTooltipPlacement } from 'ng-primitives/tooltip';

@Directive({
  selector: '[voltTooltip]',
  hostDirectives: [
    {
      directive: NgpTooltipTrigger,
      inputs: [
        'ngpTooltipTrigger: voltTooltip',
        'ngpTooltipTriggerPlacement: placement',
        'ngpTooltipTriggerOffset: offset',
        'ngpTooltipTriggerShowDelay: delay',
        'ngpTooltipTriggerHideDelay: closeDelay',
        'ngpTooltipTriggerDisabled: disabled',
      ],
    },
  ],
})
export class VoltTooltip {
  readonly placement = input<NgpTooltipPlacement>('top');
  readonly offset = input<number>(8);
  readonly delay = input<number>(300);
  readonly closeDelay = input<number>(100);
  readonly disabled = input<boolean>(false);
}`;
