import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VoltRangeSlider } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { RANGE_SLIDER_SNIPPET } from '../../../../lib/snippets';
import { RANGE_SLIDER_USAGE } from '../../../../lib/snippets/usage';
import { RANGE_SLIDER_API } from '../../../../lib/api-reference.generated';

@Component({
  selector: 'app-range-slider-demo',
  standalone: true,
  imports: [VoltRangeSlider, CodePanel, ApiReference],
  templateUrl: './range-slider.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RangeSliderDemo {
  readonly rangeSliderApi = RANGE_SLIDER_API;
  readonly rangeSliderCode = RANGE_SLIDER_SNIPPET;
  readonly rangeSliderUsage = RANGE_SLIDER_USAGE;
  readonly low = signal(20);
  readonly high = signal(80);
}
