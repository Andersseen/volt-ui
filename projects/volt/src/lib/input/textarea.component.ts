import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgpTextarea } from 'ng-primitives/textarea';

@Component({
  selector: 'textarea[volt-textarea]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: NgpTextarea, inputs: ['disabled'] }],
  host: {
    class:
      'flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
  },
  template: ``,
})
export class VoltTextarea {}
