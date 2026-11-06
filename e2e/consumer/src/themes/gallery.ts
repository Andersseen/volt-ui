import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  VoltAccordion,
  VoltAccordionContent,
  VoltAccordionItem,
  VoltAccordionTrigger,
  VoltAlert,
  VoltAlertDescription,
  VoltAlertTitle,
  VoltBadge,
  VoltButton,
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardHeader,
  VoltCardTitle,
  VoltCheckbox,
  VoltCombobox,
  VoltEmptyState,
  VoltEmptyStateDescription,
  VoltEmptyStateTitle,
  VoltError,
  VoltFormField,
  VoltInput,
  VoltLabel,
  VoltListbox,
  VoltListboxOption,
  VoltMeter,
  VoltMeterIndicator,
  VoltMeterLabel,
  VoltMeterTrack,
  VoltMeterValue,
  VoltNativeButton,
  VoltPopoverContent,
  VoltPopoverTrigger,
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
  VoltSlider,
  VoltSwitch,
  VoltTable,
  VoltTableBody,
  VoltTableCell,
  VoltTableHead,
  VoltTableHeader,
  VoltTableRow,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
  VoltTextarea,
  VoltToggle,
  VoltToggleGroup,
  VoltToggleGroupItem,
} from '@voltui/components';
import { ThemeScopeFixture } from './scope';

/**
 * Real components in the states a theme has to carry, on one screen.
 *
 * `e2e/contracts/theme-matrix.spec.ts` sets `data-color`, `data-style` and `.dark` on <html> and
 * reads computed styles from the parts marked `data-part`, then screenshots this page. It imports
 * only the public package, so the same file also runs through the CLI copy in `e2e/consumer-cli`.
 */
@Component({
  selector: 'app-theme-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ThemeScopeFixture,
    VoltAccordion,
    VoltAccordionContent,
    VoltAccordionItem,
    VoltAccordionTrigger,
    VoltAlert,
    VoltAlertDescription,
    VoltAlertTitle,
    VoltBadge,
    VoltButton,
    VoltCard,
    VoltCardContent,
    VoltCardDescription,
    VoltCardHeader,
    VoltCardTitle,
    VoltCheckbox,
    VoltCombobox,
    VoltEmptyState,
    VoltEmptyStateDescription,
    VoltEmptyStateTitle,
    VoltError,
    VoltFormField,
    VoltInput,
    VoltLabel,
    VoltListbox,
    VoltListboxOption,
    VoltMeter,
    VoltMeterIndicator,
    VoltMeterLabel,
    VoltMeterTrack,
    VoltMeterValue,
    VoltNativeButton,
    VoltPopoverContent,
    VoltPopoverTrigger,
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
    VoltSlider,
    VoltSwitch,
    VoltTable,
    VoltTableBody,
    VoltTableCell,
    VoltTableHead,
    VoltTableHeader,
    VoltTableRow,
    VoltTabs,
    VoltTabsContent,
    VoltTabsList,
    VoltTabsTrigger,
    VoltTextarea,
    VoltToggle,
    VoltToggleGroup,
    VoltToggleGroupItem,
  ],
  template: `
    @if (scope) {
      <app-theme-scope />
    } @else {
      <main class="grid grid-cols-3 items-start gap-6 p-6" style="width: 1240px">
        <section class="grid gap-4" aria-label="Actions">
          <div class="flex flex-wrap items-center gap-2">
            <volt-button data-part="button-solid">Solid</volt-button>
            <volt-button data-part="button-outline" variant="outline">Outline</volt-button>
            <volt-button variant="ghost">Ghost</volt-button>
            <volt-button variant="destructive">Delete</volt-button>
            <volt-button [disabled]="true">Disabled</volt-button>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <volt-button size="sm" data-part="button-sm">Small</volt-button>
            <volt-button size="lg" data-part="button-lg">Large</volt-button>
            <button voltButton variant="outline" data-part="popover-trigger" [voltPopover]="panel">
              Popover
            </button>
            <ng-template #panel>
              <volt-popover-content data-part="popover">Popover body</volt-popover-content>
            </ng-template>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <volt-badge data-part="badge">Solid</volt-badge>
            <volt-badge variant="secondary">Secondary</volt-badge>
            <volt-badge variant="outline">Outline</volt-badge>
            <volt-badge variant="success">Success</volt-badge>
            <volt-badge variant="warning">Warning</volt-badge>
            <volt-badge variant="destructive">Error</volt-badge>
            <volt-badge variant="info">Info</volt-badge>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <volt-toggle variant="outline" [pressed]="true" data-part="toggle-on">On</volt-toggle>
            <volt-toggle variant="outline" data-part="toggle-off">Off</volt-toggle>
            <volt-toggle-group type="single" [value]="['a']" aria-label="Alignment">
              <volt-toggle-group-item value="a" data-part="toggle-group-on"
                >Left</volt-toggle-group-item
              >
              <volt-toggle-group-item value="b">Right</volt-toggle-group-item>
            </volt-toggle-group>
          </div>
          <volt-tabs value="a">
            <volt-tabs-list data-part="tabs-list">
              <volt-tabs-trigger value="a">Selected</volt-tabs-trigger>
              <volt-tabs-trigger value="b">Other</volt-tabs-trigger>
            </volt-tabs-list>
            <volt-tabs-content value="a">Tab panel text</volt-tabs-content>
            <volt-tabs-content value="b">Other panel</volt-tabs-content>
          </volt-tabs>
          <volt-accordion type="single" value="a">
            <volt-accordion-item value="a" data-part="accordion-item">
              <volt-accordion-trigger>Accordion item</volt-accordion-trigger>
              <volt-accordion-content>Accordion body</volt-accordion-content>
            </volt-accordion-item>
            <volt-accordion-item value="b">
              <volt-accordion-trigger>Second item</volt-accordion-trigger>
              <volt-accordion-content>Second body</volt-accordion-content>
            </volt-accordion-item>
          </volt-accordion>
          <volt-separator data-part="separator" />
          <volt-listbox [value]="['a']" aria-label="Listbox" data-part="listbox">
            <volt-listbox-option value="a">Selected option</volt-listbox-option>
            <volt-listbox-option value="b">Other option</volt-listbox-option>
          </volt-listbox>
        </section>

        <section class="grid gap-4" aria-label="Forms">
          <volt-form-field data-part="form-field">
            <volt-label>Name</volt-label>
            <volt-input data-part="input" value="Ada Lovelace" />
          </volt-form-field>
          <volt-form-field>
            <volt-label>Workspace</volt-label>
            <volt-input data-part="input-invalid" [formControl]="invalid" />
            <volt-error>Workspace is required</volt-error>
          </volt-form-field>
          <volt-input aria-label="Disabled input" [disabled]="true" value="Disabled" />
          <volt-textarea aria-label="Notes" data-part="textarea" value="Multiple lines" />
          <volt-select aria-label="Fruit" placeholder="Pick a fruit" data-part="select">
            <volt-select-content>
              <volt-select-item value="apple">Apple</volt-select-item>
              <volt-select-item value="pear">Pear</volt-select-item>
            </volt-select-content>
          </volt-select>
          <volt-combobox
            aria-label="City"
            placeholder="Pick a city"
            data-part="combobox"
            [items]="cities"
          />
          <div class="flex items-center gap-4">
            <volt-checkbox [checked]="true" aria-label="Checked" data-part="checkbox-on" />
            <volt-checkbox aria-label="Unchecked" data-part="checkbox-off" />
            <volt-switch [checked]="true" aria-label="On" data-part="switch-on" />
            <volt-switch aria-label="Off" data-part="switch-off" />
          </div>
          <volt-radio-group value="a" aria-label="Plan" class="flex gap-4" data-part="radio">
            <volt-radio-item value="a">Monthly</volt-radio-item>
            <volt-radio-item value="b">Yearly</volt-radio-item>
          </volt-radio-group>
          <volt-slider [value]="40" ariaLabel="Volume" data-part="slider" />
          <volt-range-slider
            [low]="20"
            [high]="70"
            ariaLabelLow="Minimum"
            ariaLabelHigh="Maximum"
            data-part="range-slider"
          />
        </section>

        <section class="grid gap-4" aria-label="Surfaces">
          <volt-card data-part="card">
            <volt-card-header>
              <volt-card-title>Card title</volt-card-title>
              <volt-card-description>Card description text</volt-card-description>
            </volt-card-header>
            <volt-card-content>
              <volt-progress [value]="progress()" data-part="progress">
                <volt-progress-label>Uploading</volt-progress-label>
                <volt-progress-value>{{ progress() }}%</volt-progress-value>
              </volt-progress>
            </volt-card-content>
          </volt-card>
          <volt-meter [value]="72">
            <volt-meter-label>Capacity</volt-meter-label>
            <volt-meter-value>72%</volt-meter-value>
            <volt-meter-track data-part="meter-track"><volt-meter-indicator /></volt-meter-track>
          </volt-meter>
          <volt-alert variant="info" data-part="alert">
            <volt-alert-title>Heads up</volt-alert-title>
            <volt-alert-description>Informational message.</volt-alert-description>
          </volt-alert>
          <volt-alert variant="destructive">
            <volt-alert-title>Payment failed</volt-alert-title>
            <volt-alert-description>Update your card.</volt-alert-description>
          </volt-alert>
          <volt-empty-state data-part="empty-state">
            <volt-empty-state-title>No projects</volt-empty-state-title>
            <volt-empty-state-description>Create your first project.</volt-empty-state-description>
          </volt-empty-state>
          <volt-table data-part="table">
            <volt-table-header>
              <volt-table-row>
                <volt-table-head>Invoice</volt-table-head>
                <volt-table-head>Amount</volt-table-head>
              </volt-table-row>
            </volt-table-header>
            <volt-table-body>
              <volt-table-row>
                <volt-table-cell>INV001</volt-table-cell>
                <volt-table-cell>$250.00</volt-table-cell>
              </volt-table-row>
            </volt-table-body>
          </volt-table>
        </section>
      </main>
    }
  `,
})
export class ThemeGallery {
  /** `themes.html#scope` shows the scope and override fixture instead of the gallery. */
  protected readonly scope = location.hash === '#scope';
  protected readonly progress = signal(64);
  protected readonly cities = ['Madrid', 'Kyiv', 'Lima'];
  protected readonly invalid = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  constructor() {
    this.invalid.markAsTouched();
  }
}
