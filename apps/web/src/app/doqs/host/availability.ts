import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AvailabilityNote } from '@shared/components/availability-note';

/*
 * Version notices for the Markdown pages (`::demo[availability-…]`). A Doqs demo takes no inputs,
 * so each group of capabilities is its own tiny host block; the notice renders nothing once npm
 * serves everything it lists (packages/shared/lib/release-capabilities.ts).
 */

/** `volt diff`, `--track` and `--path` (Introduction, CLI option). */
@Component({
  selector: 'app-cli-availability',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvailabilityNote],
  template: `<app-availability-note [capabilities]="['cli.path', 'cli.track', 'cli.diff']" />`,
})
export class CliAvailability {}

/** The experimental `@voltui/components/quartz` entry point. */
@Component({
  selector: 'app-quartz-availability',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvailabilityNote],
  template: `<app-availability-note [capabilities]="['components.quartz']" />`,
})
export class QuartzAvailability {}

/** A consumer `aria-describedby` reaching the native Input/Textarea control. */
@Component({
  selector: 'app-input-describedby-availability',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvailabilityNote],
  template: `<app-availability-note [capabilities]="['components.input-describedby']" />`,
})
export class InputDescribedByAvailability {}

/** `provideVoltTheme({ density })` (Introduction, Theme System). */
@Component({
  selector: 'app-theme-density-availability',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvailabilityNote],
  template: `<app-availability-note [capabilities]="['components.theme-density']" />`,
})
export class ThemeDensityAvailability {}

/** `voltCustomColor()` and the custom-theme contract (Theme System). */
@Component({
  selector: 'app-custom-themes-availability',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvailabilityNote],
  template: `<app-availability-note [capabilities]="['components.custom-themes']" />`,
})
export class CustomThemesAvailability {}
