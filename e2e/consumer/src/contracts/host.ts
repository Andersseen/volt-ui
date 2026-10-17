import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ComboboxFixtures,
  DatePickerFixture,
  FileUploadFixture,
  InputOtpFixture,
  ListboxFixture,
  OverlayFixtures,
  RadioFixture,
  ResizableFixture,
  SelectFixture,
  SliderFixtures,
  StaticValueFixture,
  TabsAccordionFixture,
  ToggleGroupToolbarFixture,
  VisualStateFixture,
} from './fixtures';

/**
 * One fixture per hash (`/contracts.html#radio`), so each browser test loads exactly the
 * component it is about and nothing else on the page can steal focus or move the geometry.
 * Everything is imported from the built `@voltui/components` package, never from library source.
 */
@Component({
  selector: 'app-contracts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ComboboxFixtures,
    DatePickerFixture,
    FileUploadFixture,
    InputOtpFixture,
    ListboxFixture,
    OverlayFixtures,
    RadioFixture,
    ResizableFixture,
    SelectFixture,
    SliderFixtures,
    StaticValueFixture,
    TabsAccordionFixture,
    ToggleGroupToolbarFixture,
    VisualStateFixture,
  ],
  template: `
    <main class="mx-auto max-w-xl p-6">
      @switch (name) {
        @case ('static') {
          <app-static-value />
        }
        @case ('radio') {
          <app-radio />
        }
        @case ('toggle-toolbar') {
          <app-toggle-toolbar />
        }
        @case ('tabs-accordion') {
          <app-tabs-accordion />
        }
        @case ('select') {
          <app-select />
        }
        @case ('listbox') {
          <app-listbox />
        }
        @case ('combobox') {
          <app-combobox />
        }
        @case ('sliders') {
          <app-sliders />
        }
        @case ('resizable') {
          <app-resizable />
        }
        @case ('otp') {
          <app-otp />
        }
        @case ('file-upload') {
          <app-file-upload />
        }
        @case ('date-picker') {
          <app-date-picker />
        }
        @case ('overlays') {
          <app-overlays />
        }
        @case ('visual') {
          <app-visual />
        }
      }
    </main>
  `,
})
export class ContractsHost {
  protected readonly name = location.hash.slice(1);
}
