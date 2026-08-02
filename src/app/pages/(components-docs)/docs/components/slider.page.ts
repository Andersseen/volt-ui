import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VoltSlider } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { ApiReference } from '../../../../components/api-reference';
import { SLIDER_SNIPPET } from '../../../../lib/snippets';
import { SLIDER_USAGE } from '../../../../lib/snippets/usage';
import { SLIDER_API } from '../../../../lib/api-reference.generated';

@Component({
  selector: 'app-slider-demo',
  standalone: true,
  imports: [VoltSlider, CodePanel, ApiReference],
  templateUrl: './slider.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SliderDemo {
  readonly sliderApi = SLIDER_API;
  readonly sliderCode = SLIDER_SNIPPET;
  readonly sliderUsage = SLIDER_USAGE;
  readonly value = signal(40);
}
