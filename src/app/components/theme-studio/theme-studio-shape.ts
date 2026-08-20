import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardHeader,
  VoltCardTitle,
  VoltSlider,
} from 'volt';
import { ThemeStudioStore } from '../../services/theme-studio-store';

/** The structural tokens both modes share: radius, borders, focus ring, shadow. */
@Component({
  selector: 'app-theme-studio-shape',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltCard,
    VoltCardContent,
    VoltCardDescription,
    VoltCardHeader,
    VoltCardTitle,
    VoltSlider,
  ],
  template: `
    <volt-card
      class="border-border/70 bg-surface/80 shadow-sm backdrop-blur transition-colors duration-200 hover:border-primary/25"
    >
      <volt-card-header>
        <volt-card-title>Shape & Feel</volt-card-title>
        <volt-card-description
          >Adjust the structural tokens shared by both modes.</volt-card-description
        >
      </volt-card-header>
      <volt-card-content>
        <div class="grid gap-5 sm:grid-cols-2">
          @for (control of controls; track control.key) {
            <div class="space-y-2">
              <div class="flex items-center justify-between gap-3">
                <span class="text-sm font-medium text-foreground">{{ control.label }}</span>
                <code class="text-xs text-muted-foreground">
                  {{ store.theme()[control.key] }}{{ control.unit }}
                </code>
              </div>
              <volt-slider
                [value]="store.theme()[control.key]"
                [min]="control.min"
                [max]="control.max"
                [step]="1"
                (valueChange)="store.setNumber(control.key, $event)"
              />
            </div>
          }
        </div>
      </volt-card-content>
    </volt-card>
  `,
})
export class ThemeStudioShape {
  protected readonly store = inject(ThemeStudioStore);

  /** Four sliders that differ only in label and range, so they are data, not markup. */
  protected readonly controls = [
    { key: 'radius', label: 'Radius', unit: 'px', min: 0, max: 24 },
    { key: 'borderWidth', label: 'Border', unit: 'px', min: 0, max: 4 },
    { key: 'ringWidth', label: 'Focus ring', unit: 'px', min: 1, max: 5 },
    { key: 'shadowIntensity', label: 'Shadow', unit: '%', min: 0, max: 24 },
  ] as const;
}
