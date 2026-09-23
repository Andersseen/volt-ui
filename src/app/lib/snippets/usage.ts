export const BUTTON_USAGE = `import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VoltButton, VoltNativeButton, VoltSpinner } from '@voltui/components';

@Component({
  imports: [RouterLink, VoltButton, VoltNativeButton, VoltSpinner],
  template: \`
    <!-- Native element: the element you write is the one that is focused and announced -->
    <button voltButton type="submit">Save</button>
    <button voltButton variant="outline" type="button">Cancel</button>

    <!-- Links styled as buttons: a real <a>, never <a><button> -->
    <a voltButton variant="outline" routerLink="/docs">Documentation</a>
    <a voltButton variant="ghost" href="https://github.com/Andersseen/volt-ui" target="_blank" rel="noopener">
      GitHub
    </a>

    <!-- Icon-only: name it with aria-label; hide the icon -->
    <button voltButton variant="ghost" size="icon" type="button" aria-label="Switch theme">
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="4" />
      </svg>
    </button>

    <!-- Loading: the text says what is happening, so the spinner is decorative -->
    <button voltButton type="button" [disabled]="saving">
      @if (saving) { <volt-spinner size="sm" /> }
      {{ saving ? 'Saving…' : 'Save' }}
    </button>

    <!-- <volt-button> is still supported; ARIA inputs are forwarded to its inner <button> -->
    <volt-button variant="destructive" aria-describedby="delete-hint">Delete</volt-button>
  \`,
})
export class MyComponent {
  saving = false;
}`;

export const BADGE_USAGE = `import { Component } from '@angular/core';
import { VoltBadge } from '@voltui/components';

@Component({
  imports: [VoltBadge],
  template: \`
    <volt-badge>Default</volt-badge>
    <volt-badge variant="secondary">Secondary</volt-badge>
    <volt-badge variant="outline">Outline</volt-badge>
    <volt-badge variant="destructive">Failed</volt-badge>

    <!-- Status -->
    <volt-badge variant="success">Connected</volt-badge>
    <volt-badge variant="warning">Needs attention</volt-badge>
    <volt-badge variant="info">Beta</volt-badge>
  \`,
})
export class MyComponent {}`;

export const CARD_USAGE = `import { Component } from '@angular/core';
import {
  VoltCard,
  VoltCardHeader,
  VoltCardTitle,
  VoltCardDescription,
  VoltCardContent,
  VoltCardFooter,
  VoltNativeButton,
} from '@voltui/components';

@Component({
  imports: [
    VoltCard,
    VoltCardHeader,
    VoltCardTitle,
    VoltCardDescription,
    VoltCardContent,
    VoltCardFooter,
    VoltNativeButton,
  ],
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
        <button voltButton type="button">Save</button>
      </volt-card-footer>
    </volt-card>

    <!-- Every part merges class with cn(): p-3 replaces the default p-6 / pt-0 -->
    <volt-card class="max-w-sm">
      <volt-card-content class="p-3 md:p-4 text-center">Compact content</volt-card-content>
      <volt-card-footer class="justify-end gap-2 border-t border-border p-3">
        <button voltButton variant="ghost" size="sm" type="button">Cancel</button>
        <button voltButton size="sm" type="button">Confirm</button>
      </volt-card-footer>
    </volt-card>
  \`,
})
export class MyComponent {}`;

export const INPUT_USAGE = `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { VoltInput } from '@voltui/components';

@Component({
  imports: [ReactiveFormsModule, VoltInput],
  template: \`
    <volt-input [formControl]="email" type="email" placeholder="Email address" aria-label="Email" />

    <!-- Density and state; class styles the native <input> -->
    <volt-input size="sm" class="w-24 font-mono" aria-label="Quantity" />
    <volt-input state="success" aria-label="Username" value="volt" />

    <!-- A touched invalid control is marked aria-invalid and drawn in the error colour -->
    <volt-input [formControl]="required" aria-label="Required field" />

    <volt-input disabled placeholder="Disabled input" aria-label="Disabled" />
  \`,
})
export class MyComponent {
  email = new FormControl('', { nonNullable: true });
  required = new FormControl('', { nonNullable: true, validators: Validators.required });
}`;

export const CHECKBOX_USAGE = `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VoltCheckbox, VoltLabel } from '@voltui/components';

@Component({
  imports: [ReactiveFormsModule, VoltCheckbox, VoltLabel],
  template: \`
    <div class="flex items-center gap-2">
      <volt-checkbox id="terms" [formControl]="accepted" />
      <volt-label htmlFor="terms">Accept terms and conditions</volt-label>
    </div>
  \`,
})
export class MyComponent {
  accepted = new FormControl(false, { nonNullable: true });
}`;

export const SWITCH_USAGE = `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VoltSwitch, VoltLabel } from '@voltui/components';

@Component({
  imports: [ReactiveFormsModule, VoltSwitch, VoltLabel],
  template: \`
    <div class="flex items-center gap-2">
      <volt-switch id="airplane-mode" [formControl]="enabled" />
      <volt-label htmlFor="airplane-mode">Airplane Mode</volt-label>
    </div>
  \`,
})
export class MyComponent {
  enabled = new FormControl(false, { nonNullable: true });
}`;

export const TABS_USAGE = `import { Component } from '@angular/core';
import { VoltTabs, VoltTabsList, VoltTabsTrigger, VoltTabsContent } from '@voltui/components';

@Component({
  imports: [VoltTabs, VoltTabsList, VoltTabsTrigger, VoltTabsContent],
  template: \`
    <volt-tabs value="account">
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
} from '@voltui/components';

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
import { VoltAvatar, VoltAvatarImage, VoltAvatarFallback } from '@voltui/components';

@Component({
  imports: [VoltAvatar, VoltAvatarImage, VoltAvatarFallback],
  template: \`
    <volt-avatar>
      <img voltAvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
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
} from '@voltui/components';

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
      <volt-breadcrumb-list>
        <volt-breadcrumb-item>
          <volt-breadcrumb-link href="/">Home</volt-breadcrumb-link>
        </volt-breadcrumb-item>
        <volt-breadcrumb-separator />
        <volt-breadcrumb-item>
          <volt-breadcrumb-link href="/docs">Docs</volt-breadcrumb-link>
        </volt-breadcrumb-item>
        <volt-breadcrumb-separator />
        <volt-breadcrumb-item>
          <volt-breadcrumb-page>Components</volt-breadcrumb-page>
        </volt-breadcrumb-item>
      </volt-breadcrumb-list>
    </volt-breadcrumbs>
  \`,
})
export class MyComponent {}`;

export const DIALOG_USAGE = `import { Component, inject, signal, TemplateRef, viewChild } from '@angular/core';
import {
  VoltDialog,
  VoltDialogRoot,
  VoltDialogService,
  VoltDialogContent,
  VoltDialogTitle,
  VoltDialogDescription,
  VoltDialogOverlay,
  VoltNativeButton,
  type VoltDialogContext,
} from '@voltui/components';

@Component({
  imports: [
    VoltDialog,
    VoltDialogRoot,
    VoltDialogContent,
    VoltDialogTitle,
    VoltDialogDescription,
    VoltDialogOverlay,
    VoltNativeButton,
  ],
  template: \`
    <!-- 1. Trigger: the button opens the template -->
    <button voltButton [voltDialog]="infoTpl">Open dialog</button>
    <ng-template #infoTpl let-close="close">
      <div voltDialogOverlay></div>
      <div voltDialogContent>
        <h2 voltDialogTitle>Keyboard shortcuts</h2>
        <p voltDialogDescription>Press ? anywhere to open this list.</p>
        <button voltButton (click)="close()">Close</button>
      </div>
    </ng-template>

    <!-- 2. Controlled: your state decides when it is open -->
    <button voltButton variant="outline" (click)="editing.set(true)">Edit profile</button>
    <ng-template voltDialogRoot [(open)]="editing" (closed)="onEdited($event)" let-close="close">
      <div voltDialogOverlay></div>
      <form voltDialogContent (submit)="$event.preventDefault(); close('saved')">
        <h2 voltDialogTitle>Edit profile</h2>
        <p voltDialogDescription>Changes are visible to your team.</p>
        <!-- form fields… -->
        <button voltButton type="submit">Save</button>
      </form>
    </ng-template>

    <!-- 3. Confirm: open from code and await the answer -->
    <button voltButton variant="destructive" (click)="remove()">Delete project</button>
    <ng-template #confirmTpl let-close="close">
      <div voltDialogOverlay></div>
      <div voltDialogContent>
        <h2 voltDialogTitle>Delete project?</h2>
        <p voltDialogDescription>This action cannot be undone.</p>
        <button voltButton variant="outline" (click)="close(false)">Cancel</button>
        <button voltButton variant="destructive" (click)="close(true)">Delete</button>
      </div>
    </ng-template>
  \`,
})
export class MyComponent {
  private readonly dialog = inject(VoltDialogService);
  private readonly confirmTpl = viewChild.required<TemplateRef<VoltDialogContext<boolean>>>('confirmTpl');

  readonly editing = signal(false);

  onEdited(result: unknown) {
    console.log('closed with', result);
  }

  async remove() {
    const confirmed = await this.dialog.open<boolean>(this.confirmTpl(), { role: 'alertdialog' }).closed;
    if (confirmed) {
      // delete…
    }
  }
}`;

export const DROPDOWN_MENU_USAGE = `import { Component } from '@angular/core';
import {
  VoltDropdownMenu,
  VoltDropdownMenuTrigger,
  VoltDropdownMenuItem,
  VoltDropdownMenuLabel,
  VoltDropdownMenuSeparator,
} from '@voltui/components';
import { VoltButton } from '@voltui/components';

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
    <button [voltDropdownMenu]="menuTpl" volt-button>
      <volt-button variant="outline">Open Menu</volt-button>
    </button>

    <ng-template #menuTpl>
      <volt-dropdown-menu>
        <volt-dropdown-menu-label>My Account</volt-dropdown-menu-label>
        <volt-dropdown-menu-separator />
        <volt-dropdown-menu-item>Profile</volt-dropdown-menu-item>
        <volt-dropdown-menu-item>Settings</volt-dropdown-menu-item>
        <volt-dropdown-menu-separator />
        <volt-dropdown-menu-item>Logout</volt-dropdown-menu-item>
      </volt-dropdown-menu>
    </ng-template>
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
} from '@voltui/components';

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
          <!-- The panel goes in as a template reference. \`content\` is a required input:
               the trigger hands the template to an overlay that renders it elsewhere,
               so projecting the content instead throws NG0950. -->
          <volt-navigation-menu-trigger [content]="gettingStarted">
            Getting Started
          </volt-navigation-menu-trigger>
          <ng-template #gettingStarted>
            <volt-navigation-menu-content>
              <a voltNavigationMenuLink href="/docs">Introduction</a>
              <a voltNavigationMenuLink href="/docs/installation">Installation</a>
            </volt-navigation-menu-content>
          </ng-template>
        </volt-navigation-menu-item>
        <volt-navigation-menu-item>
          <a voltNavigationMenuLink href="/docs/components">Components</a>
        </volt-navigation-menu-item>
      </volt-navigation-menu-list>
    </volt-navigation-menu>
  \`,
})
export class MyComponent {}`;

export const POPOVER_USAGE = `import { Component } from '@angular/core';
import { VoltPopoverTrigger, VoltPopoverContent } from '@voltui/components';
import { VoltButton } from '@voltui/components';

@Component({
  imports: [VoltButton, VoltPopoverTrigger, VoltPopoverContent],
  template: \`
    <button voltPopover [voltPopover]="popoverTpl">
      <volt-button variant="outline">Open Popover</volt-button>
    </button>

    <ng-template #popoverTpl>
      <volt-popover-content>
        <p class="text-sm">Popover content goes here.</p>
      </volt-popover-content>
    </ng-template>
  \`,
})
export class MyComponent {}`;

export const PROGRESS_USAGE = `import { Component, signal } from '@angular/core';
import { VoltProgress, VoltProgressLabel, VoltProgressValue } from '@voltui/components';

@Component({
  imports: [VoltProgress, VoltProgressLabel, VoltProgressValue],
  template: \`
    <volt-progress [value]="progress()">
      <volt-progress-label>Upload progress</volt-progress-label>
      <volt-progress-value>{{ progress() }}% complete</volt-progress-value>
    </volt-progress>
  \`,
})
export class MyComponent {
  progress = signal(60);
}`;

export const RADIO_USAGE = `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VoltRadioGroup, VoltRadioItem, VoltLabel } from '@voltui/components';

@Component({
  imports: [ReactiveFormsModule, VoltRadioGroup, VoltRadioItem, VoltLabel],
  template: \`
    <volt-radio-group [formControl]="selected">
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
  selected = new FormControl<string | null>('option1');
}`;

export const SELECT_USAGE = `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSelectLabel,
  VoltSelectSeparator,
} from '@voltui/components';

@Component({
  imports: [
    ReactiveFormsModule,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    VoltSelectLabel,
    VoltSelectSeparator,
  ],
  template: \`
    <volt-select placeholder="Select a fruit" [formControl]="selected">
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
  selected = new FormControl<string | undefined>(undefined, { nonNullable: true });
}`;

export const SEPARATOR_USAGE = `import { Component } from '@angular/core';
import { VoltSeparator } from '@voltui/components';

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

export const SLIDER_USAGE = `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VoltSlider } from '@voltui/components';

@Component({
  imports: [ReactiveFormsModule, VoltSlider],
  template: \`
    <volt-slider [formControl]="volume" [min]="0" [max]="100" [step]="1" />
    <p>Volume: {{ volume.value }}</p>
  \`,
})
export class MyComponent {
  volume = new FormControl(50, { nonNullable: true });
}`;

export const NATIVE_SELECT_USAGE = `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VoltNativeSelect } from '@voltui/components';

@Component({
  imports: [ReactiveFormsModule, VoltNativeSelect],
  template: \`
    <select voltNativeSelect [formControl]="fruit" aria-label="Fruit">
      <option value="apple">Apple</option>
      <option value="banana">Banana</option>
      <option value="blueberry">Blueberry</option>
    </select>

    <!-- class merges with cn(), so h-8 replaces the default h-10 -->
    <select voltNativeSelect class="h-8 w-40 text-xs" aria-label="Sort by">
      <option>Newest</option>
      <option>Oldest</option>
    </select>
  \`,
})
export class MyComponent {
  fruit = new FormControl('apple', { nonNullable: true });
}`;

export const RANGE_SLIDER_USAGE = `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VoltRangeSlider } from '@voltui/components';

@Component({
  imports: [ReactiveFormsModule, VoltRangeSlider],
  template: \`
    <volt-range-slider
      [formControl]="priceRange"
      [min]="0"
      [max]="500"
      ariaLabelLow="Minimum price"
      ariaLabelHigh="Maximum price"
    />
    <p>{{ priceRange.value[0] }} - {{ priceRange.value[1] }}</p>
  \`,
})
export class MyComponent {
  priceRange = new FormControl<[number, number]>([50, 300], { nonNullable: true });
}`;

export const TOGGLE_USAGE = `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VoltToggle } from '@voltui/components';

@Component({
  imports: [ReactiveFormsModule, VoltToggle],
  template: \`
    <volt-toggle [formControl]="bold" aria-label="Toggle bold">
      <lmn-bold [size]="16" />
    </volt-toggle>
  \`,
})
export class MyComponent {
  bold = new FormControl(false, { nonNullable: true });
}`;

export const TOOLTIP_USAGE = `import { Component } from '@angular/core';
import { VoltTooltip, VoltTooltipContent } from '@voltui/components';
import { VoltButton } from '@voltui/components';

@Component({
  imports: [VoltButton, VoltTooltip, VoltTooltipContent],
  template: \`
    <button voltTooltip [voltTooltip]="tooltipTpl">
      <volt-button variant="outline">Hover me</volt-button>
    </button>

    <ng-template #tooltipTpl>
      <volt-tooltip-content>
        <p>This is a tooltip</p>
      </volt-tooltip-content>
    </ng-template>
  \`,
})
export class MyComponent {}`;

export const TEXTAREA_USAGE = `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VoltTextarea } from '@voltui/components';

@Component({
  imports: [ReactiveFormsModule, VoltTextarea],
  template: \`
    <volt-textarea [formControl]="message" rows="4" aria-label="Message" />

    <!-- variant, size, state and class all style the native <textarea> -->
    <volt-textarea variant="filled" size="sm" state="success" class="font-mono" aria-label="Notes" />
  \`,
})
export class MyComponent {
  message = new FormControl('', { nonNullable: true });
}`;

export const FORM_FIELD_USAGE = `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { VoltFormField, VoltLabel, VoltHint, VoltError, VoltInput } from '@voltui/components';

@Component({
  imports: [ReactiveFormsModule, VoltFormField, VoltLabel, VoltHint, VoltError, VoltInput],
  template: \`
    <!-- Inside a form field the label, hint and error are wired to the control: no ids needed -->
    <volt-form-field>
      <volt-label>Email</volt-label>
      <volt-input [formControl]="email" type="email" placeholder="you@example.com" />
      <volt-hint>We'll only use this for account updates.</volt-hint>
      @if (email.touched && email.invalid) {
        <volt-error>Enter a valid email address.</volt-error>
      }
    </volt-form-field>

    <!-- Outside one, point the label at the control with htmlFor -->
    <volt-label htmlFor="team" class="text-xs uppercase">Team</volt-label>
    <volt-input id="team" size="sm" />
  \`,
})
export class MyComponent {
  email = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });
}`;

export const TOGGLE_GROUP_USAGE = `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VoltToggleGroup, VoltToggleGroupItem } from '@voltui/components';

@Component({
  imports: [ReactiveFormsModule, VoltToggleGroup, VoltToggleGroupItem],
  template: \`
    <volt-toggle-group [formControl]="formatting">
      <volt-toggle-group-item value="bold">Bold</volt-toggle-group-item>
      <volt-toggle-group-item value="italic">Italic</volt-toggle-group-item>
      <volt-toggle-group-item value="underline">Underline</volt-toggle-group-item>
    </volt-toggle-group>
  \`,
})
export class MyComponent {
  formatting = new FormControl<string[]>(['bold'], { nonNullable: true });
}`;

export const METER_USAGE = `import { Component } from '@angular/core';
import { VoltMeter, VoltMeterTrack, VoltMeterIndicator, VoltMeterLabel, VoltMeterValue } from '@voltui/components';

@Component({
  imports: [VoltMeter, VoltMeterTrack, VoltMeterIndicator, VoltMeterLabel, VoltMeterValue],
  template: \`
    <volt-meter [value]="72">
      <div class="mb-2 flex items-center justify-between gap-3">
        <volt-meter-label>Capacity</volt-meter-label>
        <volt-meter-value>72 of 100 capacity</volt-meter-value>
      </div>
      <volt-meter-track>
        <volt-meter-indicator />
      </volt-meter-track>
    </volt-meter>
  \`,
})
export class MyComponent {}`;

export const PAGINATION_USAGE = `import { Component, signal } from '@angular/core';
import {
  VoltPagination,
  VoltPaginationPrevious,
  VoltPaginationButton,
  VoltPaginationNext,
} from '@voltui/components';

@Component({
  imports: [VoltPagination, VoltPaginationPrevious, VoltPaginationButton, VoltPaginationNext],
  template: \`
    <volt-pagination [(page)]="page" [pageCount]="5">
      <volt-pagination-previous />
      <volt-pagination-button [page]="1" />
      <volt-pagination-button [page]="2" />
      <volt-pagination-button [page]="3" />
      <volt-pagination-next />
    </volt-pagination>
  \`,
})
export class MyComponent {
  page = signal(1);
}`;

export const TOAST_USAGE = `import { Component, inject } from '@angular/core';
import { VoltNativeButton, VoltToastService } from '@voltui/components';

@Component({
  imports: [VoltNativeButton],
  template: \`
    <button voltButton (click)="save()">Save</button>
    <button voltButton variant="outline" (click)="copy()">Copy link</button>
    <button voltButton variant="destructive" (click)="fail()">Fail</button>
  \`,
})
export class MyComponent {
  private readonly toast = inject(VoltToastService);

  save() {
    this.toast.show({ title: 'Changes saved', description: 'Your workspace has been updated.' });
  }

  copy() {
    this.toast.success('Copied to clipboard');
  }

  fail() {
    // error toasts are announced with role="alert"
    this.toast.error('Could not save', { description: 'Check your connection and try again.' });
  }
}

// Optional, app-wide defaults:
// bootstrapApplication(App, { providers: [provideVoltToast({ placement: 'top-end', duration: 5000 })] });`;

export const INPUT_OTP_USAGE = `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VoltInputOtp } from '@voltui/components';

@Component({
  imports: [ReactiveFormsModule, VoltInputOtp],
  template: \`
    <volt-input-otp [formControl]="code" [length]="6" />
  \`,
})
export class MyComponent {
  code = new FormControl('', { nonNullable: true });
}`;

export const FILE_UPLOAD_USAGE = `import { Component } from '@angular/core';
import { VoltFileDropzone } from '@voltui/components';

@Component({
  imports: [VoltFileDropzone],
  template: \`
    <volt-file-dropzone multiple>
      Drop files here or click to upload
    </volt-file-dropzone>
  \`,
})
export class MyComponent {}`;

export const COMBOBOX_USAGE = `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VoltCombobox } from '@voltui/components';

@Component({
  imports: [ReactiveFormsModule, VoltCombobox],
  template: \`
    <volt-combobox [formControl]="framework" [items]="frameworks">
      <ng-template let-item>{{ item }}</ng-template>
    </volt-combobox>
  \`,
})
export class MyComponent {
  framework = new FormControl<string | null>(null);
  frameworks = ['Angular', 'React', 'Vue', 'Svelte'];
}`;

export const DATE_PICKER_USAGE = `import { Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  NgpDatePickerCellRender,
  NgpDatePickerRowRender,
  VoltDatePicker,
  VoltDatePickerCell,
  VoltDatePickerDateButton,
  VoltDatePickerGrid,
  VoltDatePickerLabel,
  VoltDatePickerNextMonth,
  VoltDatePickerPreviousMonth,
} from '@voltui/components';

@Component({
  imports: [
    ReactiveFormsModule,
    VoltDatePicker,
    VoltDatePickerCell,
    VoltDatePickerDateButton,
    VoltDatePickerGrid,
    VoltDatePickerLabel,
    VoltDatePickerNextMonth,
    VoltDatePickerPreviousMonth,
    NgpDatePickerCellRender,
    NgpDatePickerRowRender,
  ],
  template: \`
    <volt-date-picker [formControl]="date" [(focusedDate)]="focusedDate">
      <div class="flex items-center justify-between">
        <volt-date-picker-previous-month aria-label="Previous month">
          ‹
        </volt-date-picker-previous-month>
        <volt-date-picker-label>{{ label() }}</volt-date-picker-label>
        <volt-date-picker-next-month aria-label="Next month">
          ›
        </volt-date-picker-next-month>
      </div>

      <volt-date-picker-grid>
        <div class="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          @for (day of weekDays; track day) {
            <span class="py-1">{{ day }}</span>
          }
        </div>
        <div *ngpDatePickerRowRender class="grid grid-cols-7 gap-1">
          <volt-date-picker-cell *ngpDatePickerCellRender="let day">
            <volt-date-picker-date-button>
              {{ day.getDate() }}
            </volt-date-picker-date-button>
          </volt-date-picker-cell>
        </div>
      </volt-date-picker-grid>
    </volt-date-picker>
  \`,
})
export class MyComponent {
  date = new FormControl<Date | null>(new Date());
  focusedDate = signal(new Date());
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  label = computed(() =>
    this.focusedDate().toLocaleString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  );
}`;

export const LISTBOX_USAGE = `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { VoltListbox, VoltListboxOption } from '@voltui/components';

@Component({
  imports: [ReactiveFormsModule, VoltListbox, VoltListboxOption],
  template: \`
    <volt-listbox [formControl]="selected">
      <volt-listbox-option value="angular">Angular</volt-listbox-option>
      <volt-listbox-option value="react">React</volt-listbox-option>
      <volt-listbox-option value="vue">Vue</volt-listbox-option>
    </volt-listbox>
  \`,
})
export class MyComponent {
  selected = new FormControl(['angular'], { nonNullable: true });
}`;

export const TOOLBAR_USAGE = `import { Component } from '@angular/core';
import { VoltToolbar, VoltToolbarButton } from '@voltui/components';

@Component({
  imports: [VoltToolbar, VoltToolbarButton],
  template: \`
    <volt-toolbar>
      <button voltToolbarButton>Bold</button>
      <button voltToolbarButton>Italic</button>
      <button voltToolbarButton>Save</button>
    </volt-toolbar>
  \`,
})
export class MyComponent {}`;

export const SKELETON_USAGE = `import { Component } from '@angular/core';
import { VoltSkeleton } from '@voltui/components';

@Component({
  imports: [VoltSkeleton],
  template: \`
    <div class="flex items-center gap-4">
      <volt-skeleton variant="circle" width="40px" height="40px" />
      <div class="space-y-2">
        <volt-skeleton variant="text" width="120px" height="16px" />
        <volt-skeleton variant="text" width="80px" height="14px" />
      </div>
    </div>
  \`,
})
export class MyComponent {}`;

export const TABLE_USAGE = `import { Component } from '@angular/core';
import {
  VoltTable,
  VoltTableHeader,
  VoltTableBody,
  VoltTableRow,
  VoltTableHead,
  VoltTableCell,
  VoltTableCaption,
} from '@voltui/components';

@Component({
  imports: [VoltTable, VoltTableHeader, VoltTableBody, VoltTableRow, VoltTableHead, VoltTableCell, VoltTableCaption],
  template: \`
    <volt-table>
      <volt-table-caption>A list of your recent invoices.</volt-table-caption>
      <volt-table-header>
        <volt-table-row>
          <volt-table-head>Invoice</volt-table-head>
          <volt-table-head>Status</volt-table-head>
          <volt-table-head>Method</volt-table-head>
          <volt-table-head class="text-right">Amount</volt-table-head>
        </volt-table-row>
      </volt-table-header>
      <volt-table-body>
        <volt-table-row>
          <volt-table-cell class="font-medium">INV001</volt-table-cell>
          <volt-table-cell>Paid</volt-table-cell>
          <volt-table-cell>Credit Card</volt-table-cell>
          <volt-table-cell class="text-right">$250.00</volt-table-cell>
        </volt-table-row>
      </volt-table-body>
    </volt-table>
  \`,
})
export class MyComponent {}`;

export const DRAWER_USAGE = `import { Component } from '@angular/core';
import {
  VoltDrawer,
  VoltDrawerContent,
  VoltDrawerTitle,
  VoltDrawerDescription,
  VoltDrawerOverlay,
  VoltDrawerClose,
  VoltButton,
} from '@voltui/components';

@Component({
  imports: [VoltDrawer, VoltDrawerContent, VoltDrawerTitle, VoltDrawerDescription, VoltDrawerOverlay, VoltDrawerClose, VoltButton],
  template: \`
    <button volt-button [voltDrawer]="drawerTpl">Open Drawer</button>

    <ng-template #drawerTpl let-close="close">
      <div voltDrawerOverlay></div>
      <div voltDrawerContent side="right">
        <div class="flex items-center justify-between p-4 border-b border-border">
          <h2 voltDrawerTitle>Menu</h2>
          <volt-drawer-close>
            <lmn-x [size]="16" />
          </volt-drawer-close>
        </div>
        <nav class="p-4" voltDrawerDescription>
          <ul class="space-y-2">
            <li><a href="#" class="block px-3 py-2 rounded-md text-sm hover:bg-muted">Home</a></li>
            <li><a href="#" class="block px-3 py-2 rounded-md text-sm hover:bg-muted">Settings</a></li>
          </ul>
        </nav>
      </div>
    </ng-template>
  \`,
})
export class MyComponent {}`;

export const RESIZABLE_USAGE = `import { Component } from '@angular/core';
import { VoltResizable, VoltResizablePanel, VoltResizableHandle } from '@voltui/components';

@Component({
  imports: [VoltResizable, VoltResizablePanel, VoltResizableHandle],
  template: \`
    <volt-resizable orientation="horizontal" class="h-64 rounded-lg border border-border">
      <volt-resizable-panel class="p-4">
        <p>Left panel</p>
      </volt-resizable-panel>
      <volt-resizable-handle />
      <volt-resizable-panel class="p-4">
        <p>Right panel</p>
      </volt-resizable-panel>
    </volt-resizable>
  \`,
})
export class MyComponent {}`;

export const SEARCH_USAGE = `import { Component } from '@angular/core';
import { VoltInput, VoltSearch, VoltSearchClear } from '@voltui/components';

@Component({
  imports: [VoltInput, VoltSearch, VoltSearchClear],
  template: \`
    <volt-search class="flex items-center gap-2">
      <volt-input type="search" placeholder="Search..." />
      <volt-search-clear>Clear</volt-search-clear>
    </volt-search>
  \`,
})
export class MyComponent {}`;

export const AUTOFILL_USAGE = `import { Component, signal } from '@angular/core';
import { VoltAutofill } from '@voltui/components';

@Component({
  imports: [VoltAutofill],
  template: \`
    <input
      voltAutofill
      type="email"
      autocomplete="email"
      placeholder="Email address"
      (autofillChange)="autofilled.set($event)"
    />
  \`,
})
export class MyComponent {
  autofilled = signal(false);
}`;

export const SIDEBAR_USAGE = `import { Component, inject } from '@angular/core';
import {
  VoltSidebar,
  VoltSidebarHeader,
  VoltSidebarContent,
  VoltSidebarGroup,
  VoltSidebarItem,
  VoltSidebarFooter,
  VoltSidebarService,
} from '@voltui/components';

@Component({
  imports: [
    VoltSidebar,
    VoltSidebarHeader,
    VoltSidebarContent,
    VoltSidebarGroup,
    VoltSidebarItem,
    VoltSidebarFooter,
  ],
  template: \`
    <!-- width/collapsedWidth take any CSS length; omit them for 18rem / 4rem -->
    <volt-sidebar width="20rem" collapsedWidth="4.5rem">
      <volt-sidebar-header>My App</volt-sidebar-header>

      <volt-sidebar-content>
        <volt-sidebar-group label="Main">
          <volt-sidebar-item routerLink="/" label="Home" [exact]="true">
            <!-- slot="icon" stays rendered in both collapsed and expanded modes -->
            <lucide-icon name="house" slot="icon" class="h-4 w-4" />
          </volt-sidebar-item>
          <volt-sidebar-item routerLink="/inbox" label="Inbox">
            <lucide-icon name="mail" slot="icon" class="h-4 w-4" />
            <!-- slot="trailing" only renders while expanded -->
            <span slot="trailing" class="ml-auto text-xs">3</span>
          </volt-sidebar-item>
        </volt-sidebar-group>
      </volt-sidebar-content>

      <volt-sidebar-footer>
        <button (click)="sidebarService.toggleCollapse()">Toggle</button>
      </volt-sidebar-footer>
    </volt-sidebar>
  \`,
})
export class MyComponent {
  protected readonly sidebarService = inject(VoltSidebarService);
}`;

export const SIDEBAR_WIDTH_USAGE = `<!-- 1. Inputs — any CSS length, per instance -->
<volt-sidebar width="20rem" collapsedWidth="4.5rem">...</volt-sidebar>

<!-- 2. Custom properties — app-wide, responsive, or driven by a drag handle -->
<style>
  :root {
    --volt-sidebar-width: 20rem;
    --volt-sidebar-collapsed-width: 4.5rem;
  }

  @media (min-width: 1536px) {
    :root {
      --volt-sidebar-width: 22rem;
    }
  }
</style>

<!-- 3. Resizable: write the custom property from a drag handle -->
<volt-sidebar [style.--volt-sidebar-width.px]="dragWidth()">...</volt-sidebar>

<!--
  Precedence: input > custom property > default (18rem expanded, 4rem collapsed).
  You no longer need global CSS reaching into the internal <aside> to resize it.
-->`;

export const ALERT_USAGE = `import { Component } from '@angular/core';
import { VoltAlert, VoltAlertTitle, VoltAlertDescription, VoltNativeButton } from '@voltui/components';

@Component({
  imports: [VoltAlert, VoltAlertTitle, VoltAlertDescription, VoltNativeButton],
  template: \`
    <volt-alert variant="warning">
      <svg slot="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>
      <volt-alert-title>Connection needs attention</volt-alert-title>
      <volt-alert-description>Reconnect your Cloudflare account.</volt-alert-description>
      <button slot="action" voltButton variant="outline" size="sm">Reconnect</button>
    </volt-alert>

    <!-- Static content has no live-region role. Opt in when the alert appears after an action: -->
    <volt-alert variant="success" role="status">
      <volt-alert-title>Deployment finished</volt-alert-title>
    </volt-alert>
    <volt-alert variant="destructive" role="alert">
      <volt-alert-title>Payment failed</volt-alert-title>
      <volt-alert-description>Update your card to keep the workspace active.</volt-alert-description>
    </volt-alert>
    <volt-alert variant="info">
      <volt-alert-title>New version available</volt-alert-title>
    </volt-alert>
  \`,
})
export class MyComponent {}`;

export const SPINNER_USAGE = `import { Component } from '@angular/core';
import { VoltSpinner, VoltNativeButton } from '@voltui/components';

@Component({
  imports: [VoltSpinner, VoltNativeButton],
  template: \`
    <!-- Decorative: the surrounding text already says what is happening -->
    <button voltButton disabled>
      <volt-spinner size="sm" />
      Saving…
    </button>

    <!-- Standalone status: announced politely as "Loading projects" -->
    <div class="grid place-items-center py-12" aria-busy="true">
      <volt-spinner size="lg" label="Loading projects" />
    </div>

    <!-- Inline, in the current text colour -->
    <p class="text-muted-foreground"><volt-spinner size="sm" /> Syncing</p>
  \`,
})
export class MyComponent {}`;
