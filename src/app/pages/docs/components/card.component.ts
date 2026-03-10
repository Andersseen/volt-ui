import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  VoltCard,
  VoltCardHeader,
  VoltCardTitle,
  VoltCardDescription,
  VoltCardContent,
  VoltCardFooter,
} from 'volt';
import { VoltButton } from 'volt';

@Component({
  selector: 'app-card-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltCard,
    VoltCardHeader,
    VoltCardTitle,
    VoltCardDescription,
    VoltCardContent,
    VoltCardFooter,
    VoltButton
  ],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Card</h1>
        <p class="text-lg text-muted-foreground mt-2">
          Displays a card with header, content, and footer.
        </p>
      </div>

      <div class="border rounded-xl border-border/50 p-6 md:p-10 flex items-center justify-center bg-background/50 relative overflow-hidden min-h-[400px]">
        <div class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div class="relative z-10 w-[350px]">
          <volt-card>
            <volt-card-header>
              <volt-card-title>Create project</volt-card-title>
              <volt-card-description>Deploy your new project in one-click.</volt-card-description>
            </volt-card-header>
            <volt-card-content>
              <form>
                <div class="grid w-full items-center gap-4">
                  <div class="flex flex-col space-y-1.5">
                    <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="name">Name</label>
                    <input class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" id="name" placeholder="Name of your project">
                  </div>
                </div>
              </form>
            </volt-card-content>
            <volt-card-footer class="flex justify-between">
              <button volt-button variant="outline">Cancel</button>
              <button volt-button>Deploy</button>
            </volt-card-footer>
          </volt-card>
        </div>
      </div>
    </div>
  `
})
export class CardDemoComponent {}
