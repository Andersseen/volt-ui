import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VoltSlider } from 'volt';
import { CodePanel } from '../../../../components/code-panel';
import { SLIDER_SNIPPET } from '../../../../lib/snippets';

@Component({
  selector: 'app-slider-demo',
  standalone: true,
  imports: [VoltSlider, CodePanel],
  templateUrl: './slider.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SliderDemo {
  readonly sliderCode = SLIDER_SNIPPET;
  readonly value = signal(40);
}
