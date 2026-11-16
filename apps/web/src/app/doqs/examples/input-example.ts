import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { VoltInput, VoltLabel, VoltTextarea } from '@voltui/components';

@Component({
  selector: 'app-input-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltInput, VoltLabel, VoltTextarea],
  template: `
    <div class="mx-auto max-w-sm space-y-6">
      <div class="space-y-2">
        <volt-label htmlFor="email">Email</volt-label>
        <volt-input id="email" type="email" autocomplete="email" placeholder="you@example.com" />
      </div>

      <div class="space-y-2">
        <volt-label htmlFor="quantity">Quantity</volt-label>
        <div class="flex items-center gap-2">
          <volt-input id="quantity" size="sm" class="w-24 font-mono" [(value)]="quantity" />
          <volt-input size="md" aria-label="Medium input" placeholder="md" />
          <volt-input size="lg" aria-label="Large input" placeholder="lg" />
        </div>
      </div>

      <div class="space-y-2">
        <volt-label htmlFor="username">Username</volt-label>
        <volt-input id="username" state="success" value="volt" />
        <volt-input state="error" aria-label="Invalid username" value="v!" />
      </div>

      <div class="space-y-2">
        <volt-label htmlFor="message">Message</volt-label>
        <volt-textarea id="message" placeholder="Type your message here." [rows]="3" />
      </div>
    </div>
  `,
})
export class InputExample {
  readonly quantity = signal('12');
}
