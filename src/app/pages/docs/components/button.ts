import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltButton } from 'volt';
import { CodePanel } from '../../../components/code-panel';
import { BUTTON_SNIPPET } from '../../../lib/snippets';

@Component({
  selector: 'app-button-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltButton, CodePanel],
  template: `
    <div class="space-y-10">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Button</h1>
        <p class="text-lg text-muted-foreground mt-2">
          Displays a button or a component that looks like a button.
        </p>
      </div>

      <div class="space-y-4">
        <h3 class="font-semibold text-lg">Variants</h3>
        <div
          class="border rounded-xl border-border/50 p-6 md:p-10 flex items-center justify-center bg-background/50 relative overflow-hidden"
        >
          <div
            class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
          ></div>

          <div class="relative z-10 flex flex-wrap gap-4 items-center">
            <volt-button variant="solid">Solid</volt-button>
            <volt-button variant="outline">Outline</volt-button>
            <volt-button variant="ghost">Ghost</volt-button>
            <volt-button variant="link">Link</volt-button>
            <volt-button variant="destructive">Destructive</volt-button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-semibold text-lg">Sizes</h3>
        <div class="flex flex-wrap gap-4 items-center">
          <volt-button size="sm">Small (sm)</volt-button>
          <volt-button size="md">Default (md)</volt-button>
          <volt-button size="lg">Large (lg)</volt-button>
          <volt-button size="icon" aria-label="Icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-chevron-right"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </volt-button>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-semibold text-lg">States & Icons (Slots)</h3>
        <div class="flex flex-wrap gap-4 items-center">
          <volt-button disabled>Disabled</volt-button>

          <volt-button variant="outline">
            <svg
              slot="leading"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-mail"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            Login with Email
          </volt-button>

          <volt-button variant="solid">
            Continue
            <svg
              slot="trailing"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-arrow-right"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </volt-button>
        </div>
      </div>

      <!-- Source Code Section -->
      <app-code-panel
        title="Component Source"
        [code]="buttonCode"
        cliCommand="npx github:Andersseen/volt-ui add button"
        description="Copy this code to your project. The component uses ng-primitives and class-variance-authority."
      />
    </div>
  `,
})
export default class ButtonDemo {
  readonly buttonCode = BUTTON_SNIPPET;
}
