import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'volt-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block rounded-xl border border-border bg-surface text-surface-foreground shadow-sm',
  },
  template: `<ng-content />`,
})
export class VoltCard {}

@Component({
  selector: 'volt-card-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-1.5 p-6',
  },
  template: `<ng-content />`,
})
export class VoltCardHeader {}

@Component({
  selector: 'volt-card-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block text-lg font-semibold leading-none tracking-tight',
  },
  template: `<ng-content />`,
})
export class VoltCardTitle {}

@Component({
  selector: 'volt-card-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block text-sm text-muted-foreground',
  },
  template: `<ng-content />`,
})
export class VoltCardDescription {}

@Component({
  selector: 'volt-card-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block p-6 pt-0',
  },
  template: `<ng-content />`,
})
export class VoltCardContent {}

@Component({
  selector: 'volt-card-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex items-center p-6 pt-0',
  },
  template: `<ng-content />`,
})
export class VoltCardFooter {}
