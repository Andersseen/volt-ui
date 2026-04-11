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

export const CARD_SNIPPET = `// card.component.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'volt-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rounded-lg border bg-card text-card-foreground shadow-sm block',
  },
  template: \`<ng-content />\`,
})
export class VoltCard {}

// card-header.ts, card-title.ts, card-description.ts, card-content.ts, card-footer.ts
@Component({
  selector: 'volt-card-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col space-y-1.5 p-6' },
  template: \`<ng-content />\`,
})
export class VoltCardHeader {}

@Component({
  selector: 'volt-card-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'text-2xl font-semibold leading-none tracking-tight' },
  template: \`<ng-content />\`,
})
export class VoltCardTitle {}

@Component({
  selector: 'volt-card-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'text-sm text-muted-foreground' },
  template: \`<ng-content />\`,
})
export class VoltCardDescription {}

@Component({
  selector: 'volt-card-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'p-6 pt-0' },
  template: \`<ng-content />\`,
})
export class VoltCardContent {}

@Component({
  selector: 'volt-card-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex items-center p-6 pt-0' },
  template: \`<ng-content />\`,
})
export class VoltCardFooter {}`;

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
      class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  \`,
})
export class VoltInput {
  readonly type = input<string>('text');
  readonly placeholder = input<string>('');
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
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

export const TABS_SNIPPET = `// tabs.component.ts
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NgpTabset, provideTabsetState } from 'ng-primitives/tabs';

@Component({
  selector: 'volt-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideTabsetState()],
  host: { class: 'w-full block' },
  hostDirectives: [
    {
      directive: NgpTabset,
      inputs: ['ngpTabsetValue: value', 'ngpTabsetOrientation: orientation'],
      outputs: ['ngpTabsetValueChange: valueChange'],
    },
  ],
  template: \`<ng-content />\`,
})
export class VoltTabs {
  readonly value = model<string>('');
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
}

// tabs-list.component.ts
import { NgpTabList, provideTabListState } from 'ng-primitives/tabs';
import { provideRovingFocusGroupState } from 'ng-primitives/roving-focus';

@Component({
  selector: 'volt-tabs-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideTabListState(), provideRovingFocusGroupState()],
  host: {
    class: 'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
  },
  hostDirectives: [NgpTabList],
  template: \`<ng-content />\`,
})
export class VoltTabsList {}

// tabs-trigger.component.ts
import { NgpTabButton, injectTabButtonState, provideTabButtonState } from 'ng-primitives/tabs';

@Component({
  selector: 'volt-tabs-trigger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideTabButtonState()],
  host: {
    class: 'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
    '[attr.data-state]': "tabButtonState().active() ? 'active' : 'inactive'",
  },
  hostDirectives: [{ directive: NgpTabButton, inputs: ['ngpTabButtonValue: value'] }],
  template: \`<ng-content />\`,
})
export class VoltTabsTrigger {
  readonly value = input.required<string>();
  protected readonly tabButtonState = injectTabButtonState();
}

// tabs-content.component.ts
import { NgpTabPanel, injectTabPanelState, provideTabPanelState } from 'ng-primitives/tabs';

@Component({
  selector: 'volt-tabs-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideTabPanelState()],
  host: {
    class: 'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=inactive]:hidden',
    '[attr.data-state]': "tabPanelState().active() ? 'active' : 'inactive'",
  },
  hostDirectives: [{ directive: NgpTabPanel, inputs: ['ngpTabPanelValue: value'] }],
  template: \`<ng-content />\`,
})
export class VoltTabsContent {
  readonly value = input.required<string>();
  protected readonly tabPanelState = injectTabPanelState();
}`;

export const TOOLTIP_SNIPPET = `// tooltip.ts
import { Directive, input } from '@angular/core';
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
}

// tooltip-content.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpTooltip } from 'ng-primitives/tooltip';

@Component({
  selector: 'volt-tooltip-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpTooltip],
  host: {
    class: 'fixed z-50 max-w-xs select-none overflow-hidden rounded-[var(--radius-sm)] bg-[var(--foreground)] px-3 py-1.5 text-xs leading-tight font-[var(--font-weight-label)] text-[var(--background)] shadow-[var(--shadow-md)]',
  },
  template: \`<ng-content />\`,
})
export class VoltTooltipContent {}`;

export const RADIO_SNIPPET = `// radio-group.ts
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NgpRadioGroup, provideRadioGroupState } from 'ng-primitives/radio';

@Component({
  selector: 'volt-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideRadioGroupState()],
  host: {
    class: 'grid gap-2',
    '[class.flex-col]': 'orientation() === "vertical"',
    '[class.flex-row]': 'orientation() === "horizontal"',
  },
  hostDirectives: [
    {
      directive: NgpRadioGroup,
      inputs: ['ngpRadioGroupValue: value', 'ngpRadioGroupOrientation: orientation'],
      outputs: ['ngpRadioGroupValueChange: valueChange'],
    },
  ],
  template: \`<ng-content />\`,
})
export class VoltRadioGroup {
  readonly value = model<string>('');
  readonly orientation = input<'horizontal' | 'vertical'>('vertical');
}

// radio-item.ts
import { NgpRadioItem, injectRadioItemState } from 'ng-primitives/radio';

@Component({
  selector: 'volt-radio-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex items-center space-x-2 cursor-pointer',
  },
  hostDirectives: [{ directive: NgpRadioItem, inputs: ['ngpRadioItemValue: value'] }],
  template: \`
    <button
      ngpRadioItem
      class="aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span class="flex items-center justify-center">
        @if (state().checked()) {
          <span class="h-2.5 w-2.5 rounded-full bg-current"></span>
        }
      </span>
    </button>
    <ng-content />
  \`,
})
export class VoltRadioItem {
  readonly value = input.required<string>();
  protected readonly state = injectRadioItemState();
}`;

export const SEPARATOR_SNIPPET = `import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgpSeparator } from 'ng-primitives/separator';

@Component({
  selector: 'volt-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpSeparator],
  host: {
    class: 'shrink-0 bg-border',
    '[class.h-px.w-full]': 'orientation() === "horizontal"',
    '[class.h-full.w-px]': 'orientation() === "vertical"',
  },
  hostDirectives: [{ directive: NgpSeparator, inputs: ['ngpSeparatorOrientation: orientation'] }],
  template: \`<ng-content />\`,
})
export class VoltSeparator {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
}`;

export const TOGGLE_SNIPPET = `import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { NgpToggle } from 'ng-primitives/toggle';

const toggleVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[pressed]:bg-accent data-[pressed]:text-accent-foreground',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-3',
        sm: 'h-9 px-2.5',
        lg: 'h-11 px-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ToggleVariants = VariantProps<typeof toggleVariants>;

@Component({
  selector: 'volt-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpToggle],
  host: {
    class: 'inline-flex',
  },
  template: \`
    <button
      ngpToggle
      [pressed]="pressed()"
      (ngpToggleChange)="pressed.set($event)"
      [disabled]="disabled()"
      [class]="classes()"
    >
      <ng-content />
    </button>
  \`,
})
export class VoltToggle {
  readonly pressed = model<boolean>(false);
  readonly variant = input<ToggleVariants['variant']>('default');
  readonly size = input<ToggleVariants['size']>('default');
  readonly disabled = input<boolean>(false);

  protected classes = computed(() => toggleVariants({ variant: this.variant(), size: this.size() }));
}`;

export const SELECT_SNIPPET = `// select.component.ts
import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { NgpSelect, NgpSelectPortal, provideSelectState } from 'ng-primitives/select';

@Component({
  selector: 'volt-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpSelect, NgpSelectPortal],
  providers: [provideSelectState()],
  template: \`
    <button
      ngpSelect
      [ngpSelectValue]="value()"
      [ngpSelectDisabled]="disabled()"
      [ngpSelectMultiple]="multiple()"
      (ngpSelectValueChange)="value.set($event); valueChange.emit($event)"
      class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span class="block text-left truncate flex-1 pointer-events-none">
        @if (value(); as selected) {
          {{ selected }}
        } @else {
          <span class="text-muted-foreground">{{ placeholder() }}</span>
        }
      </span>
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
        class="h-4 w-4 opacity-50 shrink-0 pointer-events-none"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <ng-template ngpSelectPortal>
      <ng-content />
    </ng-template>
  \`,
})
export class VoltSelect {
  readonly placeholder = input('Select an option');
  readonly value = model<unknown>(undefined);
  readonly disabled = input(false);
  readonly multiple = input(false);
  readonly valueChange = output<unknown>();
}

// select-content.component.ts
import { NgpSelectDropdown } from 'ng-primitives/select';

@Component({
  selector: 'volt-select-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpSelectDropdown],
  template: \`
    <div
      ngpSelectDropdown
      class="absolute block z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface text-surface-foreground shadow-md"
    >
      <div class="p-1 w-full flex flex-col">
        <ng-content />
      </div>
    </div>
  \`,
})
export class VoltSelectContent {}`;

export const AVATAR_SNIPPET = `// avatar.ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpAvatar } from 'ng-primitives/avatar';

@Component({
  selector: 'volt-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpAvatar],
  host: {
    class: 'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
  },
  hostDirectives: [NgpAvatar],
  template: \`<ng-content />\`,
})
export class VoltAvatar {}

// avatar-image.ts
import { Directive } from '@angular/core';
import { NgpAvatarImage } from 'ng-primitives/avatar';

@Directive({
  selector: 'img[voltAvatarImage]',
  hostDirectives: [NgpAvatarImage],
  host: {
    class: 'aspect-square h-full w-full',
  },
})
export class VoltAvatarImage {}

// avatar-fallback.ts
import { Component } from '@angular/core';
import { NgpAvatarFallback } from 'ng-primitives/avatar';

@Component({
  selector: 'volt-avatar-fallback',
  hostDirectives: [NgpAvatarFallback],
  host: {
    class: 'flex h-full w-full items-center justify-center rounded-full bg-muted',
  },
  template: \`<ng-content />\`,
})
export class VoltAvatarFallback {}`;

export const POPOVER_SNIPPET = `import { ChangeDetectionStrategy, Component, Directive, input, output } from '@angular/core';
import { NgpPopoverTrigger } from 'ng-primitives/popover';
import { NgpPopover } from 'ng-primitives/popover';
import type { NgpPopoverPlacement } from 'ng-primitives/popover';

@Directive({
  selector: '[voltPopover]',
  hostDirectives: [
    {
      directive: NgpPopoverTrigger,
      inputs: [
        'ngpPopoverTrigger: voltPopover',
        'ngpPopoverTriggerPlacement: placement',
        'ngpPopoverTriggerOffset: offset',
        'ngpPopoverTriggerDisabled: disabled',
        'ngpPopoverTriggerCloseOnOutsideClick: closeOnOutsideClick',
        'ngpPopoverTriggerCloseOnEscape: closeOnEscape',
      ],
      outputs: ['ngpPopoverTriggerOpenChange: openChange'],
    },
  ],
})
export class VoltPopoverTrigger {
  readonly placement = input<NgpPopoverPlacement>('bottom');
  readonly offset = input<number>(8);
  readonly disabled = input<boolean>(false);
  readonly closeOnOutsideClick = input<boolean>(true);
  readonly closeOnEscape = input<boolean>(true);
  readonly openChange = output<boolean>();
}

@Component({
  selector: 'volt-popover-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpPopover],
  host: {
    class:
      'z-50 w-72 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none',
  },
  template: \`<ng-content />\`,
})
export class VoltPopoverContent {}`;

export const DROPDOWN_MENU_SNIPPET = `import { ChangeDetectionStrategy, Component, Directive, input } from '@angular/core';
import { NgpMenuTrigger, NgpMenu, NgpMenuItem } from 'ng-primitives/menu';
import type { NgpMenuPlacement } from 'ng-primitives/menu';

@Directive({
  selector: '[voltDropdownMenu]',
  hostDirectives: [
    {
      directive: NgpMenuTrigger,
      inputs: [
        'ngpMenuTrigger: voltDropdownMenu',
        'ngpMenuTriggerPlacement: placement',
        'ngpMenuTriggerOffset: offset',
        'ngpMenuTriggerDisabled: disabled',
      ],
    },
  ],
})
export class VoltDropdownMenuTrigger {
  readonly placement = input<NgpMenuPlacement>('bottom-start');
  readonly offset = input<number>(4);
  readonly disabled = input<boolean>(false);
}

@Component({
  selector: 'volt-dropdown-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [NgpMenu],
  host: {
    class:
      'z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md',
  },
  template: \`<ng-content />\`,
})
export class VoltDropdownMenu {}

@Component({
  selector: 'volt-dropdown-menu-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpMenuItem],
  host: { class: 'block w-full' },
  template: \`
    <button
      ngpMenuItem
      type="button"
      class="relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[hover]:bg-accent data-[hover]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
    >
      <ng-content />
    </button>
  \`,
})
export class VoltDropdownMenuItem {}

@Component({
  selector: 'volt-dropdown-menu-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: '-mx-1 my-1 h-px bg-border', role: 'separator' },
  template: \`\`,
})
export class VoltDropdownMenuSeparator {}

@Component({
  selector: 'volt-dropdown-menu-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'px-2 py-1.5 text-xs font-semibold text-muted-foreground' },
  template: \`<ng-content />\`,
})
export class VoltDropdownMenuLabel {}`;

export const PROGRESS_SNIPPET = `import { ChangeDetectionStrategy, Component, input, numberAttribute } from '@angular/core';
import {
  NgpProgress,
  NgpProgressIndicator,
  NgpProgressTrack,
  provideProgressState,
} from 'ng-primitives/progress';

@Component({
  selector: 'volt-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideProgressState()],
  hostDirectives: [
    {
      directive: NgpProgress,
      inputs: ['ngpProgressValue: value', 'ngpProgressMin: min', 'ngpProgressMax: max'],
    },
  ],
  host: { class: 'block w-full' },
  imports: [NgpProgressTrack, NgpProgressIndicator],
  template: \`
    <div ngpProgressTrack class="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div
        ngpProgressIndicator
        class="h-full rounded-full bg-primary transition-[width] duration-300 ease-in-out"
      ></div>
    </div>
  \`,
})
export class VoltProgress {
  readonly value = input<number | null, number | null>(null, { transform: numberAttribute as never });
  readonly min = input<number, number>(0, { transform: numberAttribute });
  readonly max = input<number, number>(100, { transform: numberAttribute });
}`;

export const SLIDER_SNIPPET = `import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import {
  NgpSlider,
  NgpSliderRange,
  NgpSliderThumb,
  NgpSliderTrack,
  provideSliderState,
} from 'ng-primitives/slider';
import type { NgpOrientation } from 'ng-primitives/common';

@Component({
  selector: 'volt-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideSliderState()],
  hostDirectives: [
    {
      directive: NgpSlider,
      inputs: [
        'ngpSliderValue: value',
        'ngpSliderMin: min',
        'ngpSliderMax: max',
        'ngpSliderStep: step',
        'ngpSliderDisabled: disabled',
        'ngpSliderOrientation: orientation',
      ],
      outputs: ['ngpSliderValueChange: valueChange'],
    },
  ],
  host: {
    class: 'relative flex w-full touch-none select-none items-center',
  },
  imports: [NgpSliderTrack, NgpSliderRange, NgpSliderThumb],
  template: \`
    <div ngpSliderTrack class="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <div ngpSliderRange class="absolute h-full rounded-full bg-primary"></div>
    </div>
    <div
      ngpSliderThumb
      class="absolute top-1/2 block h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[press]:cursor-grabbing"
    ></div>
  \`,
})
export class VoltSlider {
  readonly value = input<number, number>(0, { transform: numberAttribute });
  readonly min = input<number, number>(0, { transform: numberAttribute });
  readonly max = input<number, number>(100, { transform: numberAttribute });
  readonly step = input<number, number>(1, { transform: numberAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly orientation = input<NgpOrientation>('horizontal');
  readonly valueChange = output<number>();
}`;

export const BREADCRUMBS_SNIPPET = `import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  NgpBreadcrumbs,
  NgpBreadcrumbList,
  NgpBreadcrumbItem,
  NgpBreadcrumbLink,
  NgpBreadcrumbPage,
  NgpBreadcrumbSeparator,
  NgpBreadcrumbEllipsis,
} from 'ng-primitives/breadcrumbs';

@Component({
  selector: 'volt-breadcrumbs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpBreadcrumbs],
  template: \`<nav ngpBreadcrumbs aria-label="breadcrumb"><ng-content /></nav>\`,
})
export class VoltBreadcrumbs {}

@Component({
  selector: 'volt-breadcrumb-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpBreadcrumbList],
  template: \`
    <ol ngpBreadcrumbList class="flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5">
      <ng-content />
    </ol>
  \`,
})
export class VoltBreadcrumbList {}

@Component({
  selector: 'volt-breadcrumb-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpBreadcrumbItem],
  template: \`<li ngpBreadcrumbItem class="inline-flex items-center gap-1.5"><ng-content /></li>\`,
})
export class VoltBreadcrumbItem {}

@Component({
  selector: 'volt-breadcrumb-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpBreadcrumbLink],
  template: \`<a ngpBreadcrumbLink [href]="href()" class="transition-colors hover:text-foreground"><ng-content /></a>\`,
})
export class VoltBreadcrumbLink {
  readonly href = input<string>('#');
}

@Component({
  selector: 'volt-breadcrumb-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpBreadcrumbPage],
  template: \`<span ngpBreadcrumbPage class="font-normal text-foreground"><ng-content /></span>\`,
})
export class VoltBreadcrumbPage {}

@Component({
  selector: 'volt-breadcrumb-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpBreadcrumbSeparator],
  template: \`
    <li ngpBreadcrumbSeparator aria-hidden="true" class="[&>svg]:w-3.5 [&>svg]:h-3.5">
      <ng-content>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </ng-content>
    </li>
  \`,
})
export class VoltBreadcrumbSeparator {}

@Component({
  selector: 'volt-breadcrumb-ellipsis',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgpBreadcrumbEllipsis],
  host: { class: 'inline-flex items-center' },
  template: \`
    <span ngpBreadcrumbEllipsis class="flex h-9 w-9 items-center justify-center" aria-label="More">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true">
        <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
      </svg>
    </span>
  \`,
})
export class VoltBreadcrumbEllipsis {}`;
