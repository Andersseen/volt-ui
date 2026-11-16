import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ApiReference } from '../../components/api-reference';
import {
  CHECKBOX_API,
  FORM_FIELD_API,
  INPUT_API,
  SELECT_API,
} from '../../lib/api-reference.generated';

/*
 * API tables for the Markdown component pages, registered as Doqs demos (`::demo[api-input]`).
 *
 * They render the same generated metadata as the host pages (`pnpm generate:api-reference`, read
 * from the library's public entry point), so a migrated page and an unmigrated one can never
 * disagree about an input, and there is one generator rather than two. A Doqs demo is created
 * without inputs, which is why each table is its own tiny component.
 */

@Component({
  selector: 'app-form-field-api',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ApiReference],
  template: `<app-api-reference [data]="data" />`,
})
export class FormFieldApi {
  protected readonly data = FORM_FIELD_API;
}

@Component({
  selector: 'app-input-api',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ApiReference],
  template: `<app-api-reference [data]="data" />`,
})
export class InputApi {
  protected readonly data = INPUT_API;
}

@Component({
  selector: 'app-checkbox-api',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ApiReference],
  template: `<app-api-reference [data]="data" />`,
})
export class CheckboxApi {
  protected readonly data = CHECKBOX_API;
}

@Component({
  selector: 'app-select-api',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ApiReference],
  template: `<app-api-reference [data]="data" />`,
})
export class SelectApi {
  protected readonly data = SELECT_API;
}
