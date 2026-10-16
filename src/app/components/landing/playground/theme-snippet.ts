import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ColorPreset, StylePreset } from '../../../lib/theme-presets';
import { CodeWindow } from '../code-window';

/** The one line of app config that produces the preset pair currently on screen. */
@Component({
  selector: 'app-theme-snippet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeWindow],
  template: `
    <app-code-window file="app.config.ts">
      <pre
        class="font-mono"
      >provideVoltTheme({{ '{' }} color: '<span class="text-primary">{{ color() }}</span>', style: '<span class="text-primary">{{ shape() }}</span>' {{ '}' }})</pre>
    </app-code-window>
  `,
})
export class ThemeSnippet {
  readonly color = input.required<ColorPreset>();
  readonly shape = input.required<StylePreset>();
}
