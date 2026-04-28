export const BUTTON_USAGE = `import { Component } from '@angular/core';
import { VoltButton } from 'volt';

@Component({
  imports: [VoltButton],
  template: \`
    <volt-button>Click me</volt-button>
    <volt-button variant="outline">Outline</volt-button>
    <volt-button variant="destructive">Delete</volt-button>
    <volt-button disabled>Disabled</volt-button>

    <!-- With icon slots -->
    <volt-button>
      <icon-mail slot="leading" class="w-4 h-4" />
      Login with Email
    </volt-button>
  \`,
})
export class MyComponent {}`;

export const BADGE_USAGE = `import { Component } from '@angular/core';
import { VoltBadge } from 'volt';

@Component({
  imports: [VoltBadge],
  template: \`
    <volt-badge>Default</volt-badge>
    <volt-badge variant="secondary">Secondary</volt-badge>
    <volt-badge variant="destructive">Destructive</volt-badge>
    <volt-badge variant="outline">Outline</volt-badge>
  \`,
})
export class MyComponent {}`;

export const CARD_USAGE = `import { Component } from '@angular/core';
import { VoltCard } from 'volt';

@Component({
  imports: [VoltCard],
  template: \`
    <volt-card>
      <volt-card-header>
        <volt-card-title>Card Title</volt-card-title>
        <volt-card-description>Card description goes here.</volt-card-description>
      </volt-card-header>
      <volt-card-content>
        <p>Card content</p>
      </volt-card-content>
      <volt-card-footer>
        <volt-button>Save</volt-button>
      </volt-card-footer>
    </volt-card>
  \`,
})
export class MyComponent {}`;

export const INPUT_USAGE = `import { Component } from '@angular/core';
import { VoltInput } from 'volt';

@Component({
  imports: [VoltInput],
  template: \`
    <volt-input type="text" placeholder="Enter your name" />
    <volt-input type="email" placeholder="Email address" />
    <volt-input type="password" placeholder="Password" />
    <volt-input disabled placeholder="Disabled input" />
  \`,
})
export class MyComponent {}`;

export const CHECKBOX_USAGE = `import { Component, signal } from '@angular/core';
import { VoltCheckbox, VoltLabel } from 'volt';

@Component({
  imports: [VoltCheckbox, VoltLabel],
  template: \`
    <div class="flex items-center gap-2">
      <volt-checkbox id="terms" [(checked)]="accepted" />
      <volt-label htmlFor="terms">Accept terms and conditions</volt-label>
    </div>
  \`,
})
export class MyComponent {
  accepted = signal(false);
}`;

export const SWITCH_USAGE = `import { Component, signal } from '@angular/core';
import { VoltSwitch, VoltLabel } from 'volt';

@Component({
  imports: [VoltSwitch, VoltLabel],
  template: \`
    <div class="flex items-center gap-2">
      <volt-switch id="airplane-mode" [(checked)]="enabled" />
      <volt-label htmlFor="airplane-mode">Airplane Mode</volt-label>
    </div>
  \`,
})
export class MyComponent {
  enabled = signal(false);
}`;

export const TABS_USAGE = `import { Component } from '@angular/core';
import { VoltTabs, VoltTabsList, VoltTabsTrigger, VoltTabsContent } from 'volt';

@Component({
  imports: [VoltTabs, VoltTabsList, VoltTabsTrigger, VoltTabsContent],
  template: \`
    <volt-tabs defaultValue="account">
      <volt-tabs-list>
        <volt-tabs-trigger value="account">Account</volt-tabs-trigger>
        <volt-tabs-trigger value="password">Password</volt-tabs-trigger>
      </volt-tabs-list>
      <volt-tabs-content value="account">
        Account settings here.
      </volt-tabs-content>
      <volt-tabs-content value="password">
        Password settings here.
      </volt-tabs-content>
    </volt-tabs>
  \`,
})
export class MyComponent {}`;

export const ACCORDION_USAGE = `import { Component } from '@angular/core';
import {
  VoltAccordion,
  VoltAccordionItem,
  VoltAccordionTrigger,
  VoltAccordionContent,
} from 'volt';

@Component({
  imports: [VoltAccordion, VoltAccordionItem, VoltAccordionTrigger, VoltAccordionContent],
  template: \`
    <volt-accordion>
      <volt-accordion-item value="item-1">
        <volt-accordion-trigger>Is it accessible?</volt-accordion-trigger>
        <volt-accordion-content>
          Yes. It adheres to the WAI-ARIA design pattern.
        </volt-accordion-content>
      </volt-accordion-item>
      <volt-accordion-item value="item-2">
        <volt-accordion-trigger>Is it styled?</volt-accordion-trigger>
        <volt-accordion-content>
          Yes. It comes with default styles that matches the other components.
        </volt-accordion-content>
      </volt-accordion-item>
    </volt-accordion>
  \`,
})
export class MyComponent {}`;

export const AVATAR_USAGE = `import { Component } from '@angular/core';
import { VoltAvatar, VoltAvatarImage, VoltAvatarFallback } from 'volt';

@Component({
  imports: [VoltAvatar, VoltAvatarImage, VoltAvatarFallback],
  template: \`
    <volt-avatar>
      <volt-avatar-image src="https://github.com/shadcn.png" alt="@shadcn" />
      <volt-avatar-fallback>CN</volt-avatar-fallback>
    </volt-avatar>
  \`,
})
export class MyComponent {}`;

export const BREADCRUMBS_USAGE = `import { Component } from '@angular/core';
import {
  VoltBreadcrumbs,
  VoltBreadcrumbsList,
  VoltBreadcrumbsItem,
  VoltBreadcrumbsLink,
  VoltBreadcrumbsPage,
  VoltBreadcrumbsSeparator,
} from 'volt';

@Component({
  imports: [
    VoltBreadcrumbs,
    VoltBreadcrumbsList,
    VoltBreadcrumbsItem,
    VoltBreadcrumbsLink,
    VoltBreadcrumbsPage,
    VoltBreadcrumbsSeparator,
  ],
  template: \`
    <volt-breadcrumbs>
      <volt-breadcrumbs-list>
        <volt-breadcrumbs-item>
          <volt-breadcrumbs-link href="/">Home</volt-breadcrumbs-link>
        </volt-breadcrumbs-item>
        <volt-breadcrumbs-separator />
        <volt-breadcrumbs-item>
          <volt-breadcrumbs-link href="/docs">Docs</volt-breadcrumbs-link>
        </volt-breadcrumbs-item>
        <volt-breadcrumbs-separator />
        <volt-breadcrumbs-item>
          <volt-breadcrumbs-page>Components</volt-breadcrumbs-page>
        </volt-breadcrumbs-item>
      </volt-breadcrumbs-list>
    </volt-breadcrumbs>
  \`,
})
export class MyComponent {}`;

export const DIALOG_USAGE = `import { Component, signal } from '@angular/core';
import {
  VoltDialog,
  VoltDialogContent,
  VoltDialogTitle,
  VoltDialogDescription,
  VoltDialogOverlay,
} from 'volt';
import { VoltButton } from 'volt';

@Component({
  imports: [VoltDialog, VoltDialogContent, VoltDialogTitle, VoltDialogDescription, VoltDialogOverlay, VoltButton],
  template: \`
    <volt-button (click)="open.set(true)">Open Dialog</volt-button>

    <volt-dialog [(open)]="open">
      <volt-dialog-overlay />
      <volt-dialog-content>
        <volt-dialog-title>Are you sure?</volt-dialog-title>
        <volt-dialog-description>
          This action cannot be undone.
        </volt-dialog-description>
        <volt-button (click)="open.set(false)">Confirm</volt-button>
      </volt-dialog-content>
    </volt-dialog>
  \`,
})
export class MyComponent {
  open = signal(false);
}`;

export const DROPDOWN_MENU_USAGE = `import { Component } from '@angular/core';
import {
  VoltDropdownMenu,
  VoltDropdownMenuTrigger,
  VoltDropdownMenuItem,
  VoltDropdownMenuLabel,
  VoltDropdownMenuSeparator,
} from 'volt';
import { VoltButton } from 'volt';

@Component({
  imports: [
    VoltButton,
    VoltDropdownMenu,
    VoltDropdownMenuTrigger,
    VoltDropdownMenuItem,
    VoltDropdownMenuLabel,
    VoltDropdownMenuSeparator,
  ],
  template: \`
    <volt-dropdown-menu>
      <volt-dropdown-menu-trigger>
        <volt-button variant="outline">Open Menu</volt-button>
      </volt-dropdown-menu-trigger>
      <volt-dropdown-menu-label>My Account</volt-dropdown-menu-label>
      <volt-dropdown-menu-separator />
      <volt-dropdown-menu-item>Profile</volt-dropdown-menu-item>
      <volt-dropdown-menu-item>Settings</volt-dropdown-menu-item>
      <volt-dropdown-menu-separator />
      <volt-dropdown-menu-item>Logout</volt-dropdown-menu-item>
    </volt-dropdown-menu>
  \`,
})
export class MyComponent {}`;

export const NAVIGATION_MENU_USAGE = `import { Component } from '@angular/core';
import {
  VoltNavigationMenu,
  VoltNavigationMenuList,
  VoltNavigationMenuItem,
  VoltNavigationMenuTrigger,
  VoltNavigationMenuContent,
  VoltNavigationMenuLink,
} from 'volt';

@Component({
  imports: [
    VoltNavigationMenu,
    VoltNavigationMenuList,
    VoltNavigationMenuItem,
    VoltNavigationMenuTrigger,
    VoltNavigationMenuContent,
    VoltNavigationMenuLink,
  ],
  template: \`
    <volt-navigation-menu>
      <volt-navigation-menu-list>
        <volt-navigation-menu-item>
          <volt-navigation-menu-trigger>Getting Started</volt-navigation-menu-trigger>
          <volt-navigation-menu-content>
            <volt-navigation-menu-link href="/docs">Introduction</volt-navigation-menu-link>
            <volt-navigation-menu-link href="/docs/installation">Installation</volt-navigation-menu-link>
          </volt-navigation-menu-content>
        </volt-navigation-menu-item>
        <volt-navigation-menu-item>
          <volt-navigation-menu-link href="/docs/components">Components</volt-navigation-menu-link>
        </volt-navigation-menu-item>
      </volt-navigation-menu-list>
    </volt-navigation-menu>
  \`,
})
export class MyComponent {}`;

export const POPOVER_USAGE = `import { Component, signal } from '@angular/core';
import { VoltPopoverTrigger, VoltPopoverContent } from 'volt';
import { VoltButton } from 'volt';

@Component({
  imports: [VoltButton, VoltPopoverTrigger, VoltPopoverContent],
  template: \`
    <volt-popover-trigger>
      <volt-button variant="outline">Open Popover</volt-button>
    </volt-popover-trigger>
    <volt-popover-content>
      <p class="text-sm">Popover content goes here.</p>
    </volt-popover-content>
  \`,
})
export class MyComponent {}`;

export const PROGRESS_USAGE = `import { Component, signal } from '@angular/core';
import { VoltProgress } from 'volt';

@Component({
  imports: [VoltProgress],
  template: \`
    <volt-progress [value]="progress()" />
  \`,
})
export class MyComponent {
  progress = signal(60);
}`;

export const RADIO_USAGE = `import { Component, signal } from '@angular/core';
import { VoltRadioGroup, VoltRadioItem, VoltLabel } from 'volt';

@Component({
  imports: [VoltRadioGroup, VoltRadioItem, VoltLabel],
  template: \`
    <volt-radio-group [(value)]="selected">
      <div class="flex items-center gap-2">
        <volt-radio-item id="option-1" value="option1" />
        <volt-label htmlFor="option-1">Option 1</volt-label>
      </div>
      <div class="flex items-center gap-2">
        <volt-radio-item id="option-2" value="option2" />
        <volt-label htmlFor="option-2">Option 2</volt-label>
      </div>
    </volt-radio-group>
  \`,
})
export class MyComponent {
  selected = signal('option1');
}`;

export const SELECT_USAGE = `import { Component, signal } from '@angular/core';
import {
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSelectLabel,
  VoltSelectSeparator,
} from 'volt';

@Component({
  imports: [VoltSelect, VoltSelectContent, VoltSelectItem, VoltSelectLabel, VoltSelectSeparator],
  template: \`
    <volt-select placeholder="Select a fruit" [(value)]="selected">
      <volt-select-content>
        <volt-select-label>Fruits</volt-select-label>
        <volt-select-item value="apple">Apple</volt-select-item>
        <volt-select-item value="banana">Banana</volt-select-item>
        <volt-select-separator />
        <volt-select-label>Vegetables</volt-select-label>
        <volt-select-item value="carrot">Carrot</volt-select-item>
      </volt-select-content>
    </volt-select>
  \`,
})
export class MyComponent {
  selected = signal('');
}`;

export const SEPARATOR_USAGE = `import { Component } from '@angular/core';
import { VoltSeparator } from 'volt';

@Component({
  imports: [VoltSeparator],
  template: \`
    <div>
      <p>Section one</p>
      <volt-separator />
      <p>Section two</p>
    </div>

    <!-- Vertical separator -->
    <div class="flex h-8 items-center gap-2">
      <span>Left</span>
      <volt-separator orientation="vertical" />
      <span>Right</span>
    </div>
  \`,
})
export class MyComponent {}`;

export const SLIDER_USAGE = `import { Component, signal } from '@angular/core';
import { VoltSlider } from 'volt';

@Component({
  imports: [VoltSlider],
  template: \`
    <volt-slider [(value)]="volume" [min]="0" [max]="100" [step]="1" />
    <p>Volume: {{ volume() }}</p>
  \`,
})
export class MyComponent {
  volume = signal(50);
}`;

export const TOGGLE_USAGE = `import { Component, signal } from '@angular/core';
import { VoltToggle } from 'volt';

@Component({
  imports: [VoltToggle],
  template: \`
    <volt-toggle [(pressed)]="bold" aria-label="Toggle bold">
      <icon-bold class="w-4 h-4" />
    </volt-toggle>
  \`,
})
export class MyComponent {
  bold = signal(false);
}`;

export const TOOLTIP_USAGE = `import { Component } from '@angular/core';
import { VoltTooltip, VoltTooltipContent } from 'volt';
import { VoltButton } from 'volt';

@Component({
  imports: [VoltButton, VoltTooltip, VoltTooltipContent],
  template: \`
    <volt-tooltip>
      <volt-button variant="outline">Hover me</volt-button>
      <volt-tooltip-content>
        <p>This is a tooltip</p>
      </volt-tooltip-content>
    </volt-tooltip>
  \`,
})
export class MyComponent {}`;
