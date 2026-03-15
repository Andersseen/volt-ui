import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-radio-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Radio</h1>
        <p class="text-base text-muted-foreground mt-2">
          A set of checkable buttons—known as radio buttons—where no more than one of the buttons
          can be checked at a time.
        </p>
      </div>

      <div class="w-full h-px bg-border"></div>

      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight text-foreground">Example</h2>
        <div
          class="p-8 border border-border rounded-lg bg-card/30 flex items-center justify-center min-h-[300px]"
        >
          <div volt-radio-group orientation="vertical" value="default">
            <div class="flex items-center space-x-2">
              <button volt-radio-item value="default" id="r1"></button>
              <label volt-label for="r1">Default</label>
            </div>
            <div class="flex items-center space-x-2">
              <button volt-radio-item value="comfortable" id="r2"></button>
              <label volt-label for="r2">Comfortable</label>
            </div>
            <div class="flex items-center space-x-2">
              <button volt-radio-item value="compact" id="r3"></button>
              <label volt-label for="r3">Compact</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RadioDemo {}
