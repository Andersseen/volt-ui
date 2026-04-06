import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltButton } from 'volt';
import { CodePanel } from '../../../components/code-panel';
import { BUTTON_SNIPPET } from '../../../lib/snippets';
import { IconChevronRight, IconMail, IconArrowRight } from '../../../icons';

@Component({
  selector: 'app-button-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltButton, CodePanel, IconChevronRight, IconMail, IconArrowRight],
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
            <icon-chevron-right class="w-4 h-4" />
          </volt-button>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-semibold text-lg">States & Icons (Slots)</h3>
        <div class="flex flex-wrap gap-4 items-center">
          <volt-button disabled>Disabled</volt-button>

          <volt-button variant="outline">
            <icon-mail slot="leading" class="w-4 h-4" />
            Login with Email
          </volt-button>

          <volt-button variant="solid">
            Continue
            <icon-arrow-right slot="trailing" class="w-4 h-4" />
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
