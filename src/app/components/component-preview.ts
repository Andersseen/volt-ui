import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  VoltAccordion,
  VoltAccordionContent,
  VoltAccordionItem,
  VoltAccordionTrigger,
  VoltAvatar,
  VoltAvatarFallback,
  VoltBadge,
  VoltBreadcrumbItem,
  VoltBreadcrumbLink,
  VoltBreadcrumbList,
  VoltBreadcrumbPage,
  VoltBreadcrumbSeparator,
  VoltBreadcrumbs,
  VoltButton,
  VoltCard,
  VoltCardContent,
  VoltCardHeader,
  VoltCardTitle,
  VoltCheckbox,
  VoltCombobox,
  VoltFileDropzone,
  VoltFormField,
  VoltHint,
  VoltInput,
  VoltInputOtp,
  VoltLabel,
  VoltListbox,
  VoltListboxOption,
  VoltMeter,
  VoltMeterIndicator,
  VoltMeterLabel,
  VoltMeterTrack,
  VoltMeterValue,
  VoltPagination,
  VoltPaginationButton,
  VoltPaginationNext,
  VoltPaginationPrevious,
  VoltProgress,
  VoltProgressLabel,
  VoltProgressValue,
  VoltRadioGroup,
  VoltRadioItem,
  VoltRangeSlider,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSeparator,
  VoltSkeleton,
  VoltSlider,
  VoltSwitch,
  VoltTable,
  VoltTableBody,
  VoltTableCell,
  VoltTableHead,
  VoltTableHeader,
  VoltTableRow,
  VoltTabs,
  VoltTabsList,
  VoltTabsTrigger,
  VoltTextarea,
  VoltToggle,
  VoltToggleGroup,
  VoltToggleGroupItem,
  VoltToolbar,
  VoltToolbarButton,
} from 'volt';
import {
  LmnBoldIcon,
  LmnCalendarIcon,
  LmnChevronDownIcon,
  LmnItalicIcon,
  LmnSearchIcon,
  LmnStarIcon,
  LmnUploadIcon,
  LmnXIcon,
} from 'lumen-icons';

/**
 * A miniature, real render of a component for the catalog cards.
 *
 * Decorative by design: the host is `pointer-events-none` and `aria-hidden`, so
 * each card stays a single link target and the preview never steals a click.
 * Real interaction lives on the component's own page.
 *
 * Portal-based components (dialog, drawer, popover, dropdown menu, tooltip) render
 * `fixed` and would escape the card, so those previews are composed from the same
 * semantic tokens the real components use instead of mounting the overlay itself.
 */
@Component({
  selector: 'app-component-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltAccordion,
    VoltAccordionContent,
    VoltAccordionItem,
    VoltAccordionTrigger,
    VoltAvatar,
    VoltAvatarFallback,
    VoltBadge,
    VoltBreadcrumbItem,
    VoltBreadcrumbLink,
    VoltBreadcrumbList,
    VoltBreadcrumbPage,
    VoltBreadcrumbSeparator,
    VoltBreadcrumbs,
    VoltButton,
    VoltCard,
    VoltCardContent,
    VoltCardHeader,
    VoltCardTitle,
    VoltCheckbox,
    VoltCombobox,
    VoltFileDropzone,
    VoltFormField,
    VoltHint,
    VoltInput,
    VoltInputOtp,
    VoltLabel,
    VoltListbox,
    VoltListboxOption,
    VoltMeter,
    VoltMeterIndicator,
    VoltMeterLabel,
    VoltMeterTrack,
    VoltMeterValue,
    VoltPagination,
    VoltPaginationButton,
    VoltPaginationNext,
    VoltPaginationPrevious,
    VoltProgress,
    VoltProgressLabel,
    VoltProgressValue,
    VoltRadioGroup,
    VoltRadioItem,
    VoltRangeSlider,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    VoltSeparator,
    VoltSkeleton,
    VoltSlider,
    VoltSwitch,
    VoltTable,
    VoltTableBody,
    VoltTableCell,
    VoltTableHead,
    VoltTableHeader,
    VoltTableRow,
    VoltTabs,
    VoltTabsList,
    VoltTabsTrigger,
    VoltTextarea,
    VoltToggle,
    VoltToggleGroup,
    VoltToggleGroupItem,
    VoltToolbar,
    VoltToolbarButton,
    LmnBoldIcon,
    LmnCalendarIcon,
    LmnChevronDownIcon,
    LmnItalicIcon,
    LmnSearchIcon,
    LmnStarIcon,
    LmnUploadIcon,
    LmnXIcon,
  ],
  host: {
    'aria-hidden': 'true',
    class: 'pointer-events-none block w-full select-none',
  },
  template: `
    @switch (name()) {
      @case ('button') {
        <div class="flex flex-wrap items-center justify-center gap-2">
          <volt-button size="sm">Save</volt-button>
          <volt-button size="sm" variant="outline">Cancel</volt-button>
        </div>
      }

      @case ('input') {
        <volt-input class="w-full" value="you@example.com" />
      }

      @case ('search') {
        <div
          class="flex w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2"
        >
          <lmn-search [size]="14" class="shrink-0 text-muted-foreground" />
          <span class="text-sm text-muted-foreground">Search components…</span>
        </div>
      }

      @case ('autofill') {
        <div class="w-full space-y-1.5">
          <volt-input class="w-full ring-2 ring-primary/40" value="ada@lovelace.dev" />
          <p class="text-[10px] text-primary">Autofilled by the browser</p>
        </div>
      }

      @case ('textarea') {
        <volt-textarea class="w-full" [rows]="2" value="Ship it." />
      }

      @case ('form-field') {
        <volt-form-field class="w-full">
          <volt-label>Email</volt-label>
          <volt-input class="w-full" value="you@example.com" />
          <volt-hint>We only use this for updates.</volt-hint>
        </volt-form-field>
      }

      @case ('checkbox') {
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <volt-checkbox [checked]="true" />
            <span class="text-sm">Accept terms</span>
          </div>
          <div class="flex items-center gap-2">
            <volt-checkbox />
            <span class="text-sm text-muted-foreground">Send updates</span>
          </div>
        </div>
      }

      @case ('switch') {
        <div class="flex items-center gap-3">
          <volt-switch [checked]="true" />
          <span class="text-sm">Airplane mode</span>
        </div>
      }

      @case ('radio') {
        <volt-radio-group value="one" class="space-y-2">
          <div class="flex items-center gap-2">
            <volt-radio-item value="one" />
            <span class="text-sm">Monthly</span>
          </div>
          <div class="flex items-center gap-2">
            <volt-radio-item value="two" />
            <span class="text-sm text-muted-foreground">Yearly</span>
          </div>
        </volt-radio-group>
      }

      @case ('select') {
        <volt-select class="w-full" placeholder="Select a fruit" value="apple">
          <volt-select-content>
            <volt-select-item value="apple">Apple</volt-select-item>
          </volt-select-content>
        </volt-select>
      }

      @case ('combobox') {
        <volt-combobox class="w-full" placeholder="Pick a framework" [items]="frameworks">
          <ng-template let-item>{{ item }}</ng-template>
        </volt-combobox>
      }

      @case ('input-otp') {
        <volt-input-otp [length]="4" value="2468" />
      }

      @case ('file-upload') {
        <volt-file-dropzone class="w-full py-3 text-center text-xs">
          <lmn-upload [size]="16" class="mx-auto mb-1 text-muted-foreground" />
          Drop files here
        </volt-file-dropzone>
      }

      @case ('slider') {
        <volt-slider class="w-full" [value]="60" [min]="0" [max]="100" ariaLabel="Volume" />
      }

      @case ('range-slider') {
        <volt-range-slider
          class="w-full"
          [low]="25"
          [high]="75"
          [min]="0"
          [max]="100"
          ariaLabelLow="Minimum"
          ariaLabelHigh="Maximum"
        />
      }

      @case ('toggle') {
        <div class="flex items-center gap-2">
          <volt-toggle [pressed]="true" aria-label="Bold">
            <lmn-bold [size]="14" />
          </volt-toggle>
          <volt-toggle aria-label="Italic">
            <lmn-italic [size]="14" />
          </volt-toggle>
        </div>
      }

      @case ('toggle-group') {
        <volt-toggle-group [value]="toggleValue">
          <volt-toggle-group-item value="bold">
            <lmn-bold [size]="14" />
          </volt-toggle-group-item>
          <volt-toggle-group-item value="italic">
            <lmn-italic [size]="14" />
          </volt-toggle-group-item>
          <volt-toggle-group-item value="star">
            <lmn-star [size]="14" />
          </volt-toggle-group-item>
        </volt-toggle-group>
      }

      @case ('toolbar') {
        <volt-toolbar>
          <button voltToolbarButton>
            <lmn-bold [size]="14" />
          </button>
          <button voltToolbarButton>
            <lmn-italic [size]="14" />
          </button>
          <button voltToolbarButton>
            <lmn-star [size]="14" />
          </button>
        </volt-toolbar>
      }

      @case ('pagination') {
        <volt-pagination [page]="2" [pageCount]="3">
          <volt-pagination-previous />
          <volt-pagination-button [page]="1" />
          <volt-pagination-button [page]="2" />
          <volt-pagination-button [page]="3" />
          <volt-pagination-next />
        </volt-pagination>
      }

      @case ('date-picker') {
        <div class="w-full rounded-md border border-border bg-background p-2">
          <div class="mb-1.5 flex items-center justify-between px-1">
            <span class="text-[11px] font-medium">March 2026</span>
            <lmn-calendar [size]="12" class="text-muted-foreground" />
          </div>
          <div class="grid grid-cols-7 gap-0.5 text-center text-[9px] text-muted-foreground">
            @for (day of weekDays; track day) {
              <span>{{ day }}</span>
            }
          </div>
          <div class="mt-0.5 grid grid-cols-7 gap-0.5 text-center text-[10px]">
            @for (day of monthDays; track day) {
              <span
                class="rounded-sm py-0.5"
                [class]="day === 18 ? 'bg-primary text-primary-foreground' : 'text-foreground/80'"
              >
                {{ day }}
              </span>
            }
          </div>
        </div>
      }

      @case ('listbox') {
        <volt-listbox class="w-full" [value]="listboxValue">
          <volt-listbox-option value="angular">Angular</volt-listbox-option>
          <volt-listbox-option value="react">React</volt-listbox-option>
        </volt-listbox>
      }

      @case ('navigation-menu') {
        <div class="flex items-center gap-1 rounded-md border border-border bg-background p-1">
          <span class="rounded-sm bg-muted px-2 py-1 text-xs font-medium">Products</span>
          <span class="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground">
            Docs
            <lmn-chevron-down [size]="12" />
          </span>
          <span class="px-2 py-1 text-xs text-muted-foreground">Pricing</span>
        </div>
      }

      @case ('tabs') {
        <volt-tabs class="w-full" value="account">
          <volt-tabs-list>
            <volt-tabs-trigger value="account">Account</volt-tabs-trigger>
            <volt-tabs-trigger value="password">Password</volt-tabs-trigger>
          </volt-tabs-list>
        </volt-tabs>
      }

      @case ('breadcrumbs') {
        <volt-breadcrumbs>
          <volt-breadcrumb-list>
            <volt-breadcrumb-item>
              <volt-breadcrumb-link href="/">Home</volt-breadcrumb-link>
            </volt-breadcrumb-item>
            <volt-breadcrumb-separator />
            <volt-breadcrumb-item>
              <volt-breadcrumb-page>Docs</volt-breadcrumb-page>
            </volt-breadcrumb-item>
          </volt-breadcrumb-list>
        </volt-breadcrumbs>
      }

      @case ('dialog') {
        <div class="w-full rounded-lg border border-border bg-surface p-3 shadow-xl">
          <p class="text-xs font-semibold text-surface-foreground">Are you sure?</p>
          <p class="mt-1 text-[10px] text-muted-foreground">This action cannot be undone.</p>
          <div class="mt-2.5 flex justify-end gap-1.5">
            <volt-button size="sm" variant="outline">Cancel</volt-button>
            <volt-button size="sm">Confirm</volt-button>
          </div>
        </div>
      }

      @case ('drawer') {
        <div class="flex h-[76px] w-full overflow-hidden rounded-md border border-border">
          <div class="flex-1 bg-foreground/10"></div>
          <div class="w-[52%] space-y-1.5 border-l border-border bg-surface p-2.5 shadow-xl">
            <p class="text-[11px] font-semibold text-surface-foreground">Menu</p>
            <div class="h-1.5 w-full rounded-sm bg-muted"></div>
            <div class="h-1.5 w-2/3 rounded-sm bg-muted"></div>
          </div>
        </div>
      }

      @case ('popover') {
        <div
          class="w-full rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md"
        >
          <p class="text-xs font-medium">Dimensions</p>
          <p class="mt-1 text-[10px] text-muted-foreground">Set the layout dimensions.</p>
        </div>
      }

      @case ('dropdown-menu') {
        <div
          class="w-full overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <p class="px-2 py-1 text-[10px] font-semibold text-muted-foreground">My Account</p>
          <div class="-mx-1 my-1 h-px bg-border"></div>
          <p class="rounded-sm bg-muted px-2 py-1 text-xs">Profile</p>
          <p class="px-2 py-1 text-xs">Settings</p>
        </div>
      }

      @case ('tooltip') {
        <div class="flex flex-col items-center gap-1.5">
          <span
            class="rounded-sm bg-foreground px-2.5 py-1 text-[11px] font-medium leading-tight text-background shadow-md"
          >
            Add to library
          </span>
          <volt-button size="sm" variant="outline">Hover me</volt-button>
        </div>
      }

      @case ('toast') {
        <div
          class="relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-md border border-input bg-background p-3 text-foreground shadow-lg"
        >
          <div>
            <p class="text-xs font-semibold">Saved</p>
            <p class="mt-0.5 text-[10px] text-muted-foreground">Your changes have been synced.</p>
          </div>
          <span class="text-muted-foreground">
            <lmn-x [size]="12" />
          </span>
        </div>
      }

      @case ('accordion') {
        <volt-accordion class="w-full" value="item-1">
          <volt-accordion-item value="item-1">
            <volt-accordion-trigger>Is it accessible?</volt-accordion-trigger>
            <volt-accordion-content>Yes. It follows WAI-ARIA.</volt-accordion-content>
          </volt-accordion-item>
        </volt-accordion>
      }

      @case ('avatar') {
        <div class="flex items-center gap-2">
          <volt-avatar>
            <volt-avatar-fallback>CN</volt-avatar-fallback>
          </volt-avatar>
          <volt-avatar>
            <volt-avatar-fallback>AP</volt-avatar-fallback>
          </volt-avatar>
          <volt-avatar>
            <volt-avatar-fallback>+3</volt-avatar-fallback>
          </volt-avatar>
        </div>
      }

      @case ('badge') {
        <div class="flex flex-wrap items-center justify-center gap-1.5">
          <volt-badge>Default</volt-badge>
          <volt-badge variant="secondary">Secondary</volt-badge>
          <volt-badge variant="outline">Outline</volt-badge>
        </div>
      }

      @case ('card') {
        <volt-card class="w-full">
          <volt-card-header class="p-3">
            <volt-card-title class="text-xs">Total revenue</volt-card-title>
          </volt-card-header>
          <volt-card-content class="px-3 pb-3 pt-0">
            <p class="text-lg font-semibold tracking-tight">$45,231</p>
          </volt-card-content>
        </volt-card>
      }

      @case ('meter') {
        <volt-meter class="w-full" [value]="72">
          <div class="mb-1.5 flex items-center justify-between gap-3">
            <volt-meter-label class="text-xs">Capacity</volt-meter-label>
            <volt-meter-value class="text-xs">72%</volt-meter-value>
          </div>
          <volt-meter-track>
            <volt-meter-indicator />
          </volt-meter-track>
        </volt-meter>
      }

      @case ('progress') {
        <volt-progress class="w-full" [value]="64">
          <volt-progress-label class="text-xs">Uploading</volt-progress-label>
          <volt-progress-value class="text-xs">64%</volt-progress-value>
        </volt-progress>
      }

      @case ('separator') {
        <div class="w-full space-y-2 text-center">
          <p class="text-xs">Section one</p>
          <volt-separator />
          <p class="text-xs text-muted-foreground">Section two</p>
        </div>
      }

      @case ('skeleton') {
        <div class="flex w-full items-center gap-3">
          <volt-skeleton variant="circle" width="32px" height="32px" />
          <div class="space-y-1.5">
            <volt-skeleton variant="text" width="110px" height="10px" />
            <volt-skeleton variant="text" width="70px" height="10px" />
          </div>
        </div>
      }

      @case ('table') {
        <volt-table class="w-full text-[11px]">
          <volt-table-header>
            <volt-table-row>
              <volt-table-head class="h-7 px-2">Invoice</volt-table-head>
              <volt-table-head class="h-7 px-2">Status</volt-table-head>
            </volt-table-row>
          </volt-table-header>
          <volt-table-body>
            <volt-table-row>
              <volt-table-cell class="px-2 py-1 font-medium">INV001</volt-table-cell>
              <volt-table-cell class="px-2 py-1">Paid</volt-table-cell>
            </volt-table-row>
            <volt-table-row>
              <volt-table-cell class="px-2 py-1 font-medium">INV002</volt-table-cell>
              <volt-table-cell class="px-2 py-1">Pending</volt-table-cell>
            </volt-table-row>
          </volt-table-body>
        </volt-table>
      }

      @case ('resizable') {
        <div class="flex h-[70px] w-full overflow-hidden rounded-md border border-border">
          <div class="grid flex-1 place-items-center text-[10px] text-muted-foreground">Left</div>
          <div class="relative w-px bg-border">
            <span
              class="absolute left-1/2 top-1/2 h-6 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-border"
            ></span>
          </div>
          <div class="grid flex-1 place-items-center text-[10px] text-muted-foreground">Right</div>
        </div>
      }

      @default {
        <div class="h-8 w-24 rounded-md bg-muted"></div>
      }
    }
  `,
})
export class ComponentPreview {
  readonly name = input.required<string>();

  protected readonly frameworks = ['Angular', 'React', 'Vue'];
  protected readonly toggleValue = ['bold'];
  protected readonly listboxValue = ['angular'];
  protected readonly weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  protected readonly monthDays = [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
}
