import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  VoltButton,
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardFooter,
  VoltCardHeader,
  VoltCardTitle,
  VoltInput,
  VoltLabel,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
} from 'volt';

@Component({
  selector: 'app-tabs-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltTabs,
    VoltTabsList,
    VoltTabsTrigger,
    VoltTabsContent,
    VoltButton,
    VoltInput,

    VoltCard,
    VoltCardHeader,
    VoltCardTitle,
    VoltCardDescription,
    VoltCardContent,
    VoltCardFooter,
  ],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Tabs</h1>
        <p class="text-lg text-muted-foreground mt-2">
          A set of layered sections of content—known as tab panels—that are displayed one at a time.
        </p>
      </div>

      <div
        class="border rounded-xl border-border/50 p-6 md:p-10 flex flex-col items-center justify-center bg-background/50 relative overflow-hidden min-h-[500px]"
      >
        <div
          class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        ></div>

        <div class="relative z-10 w-full max-w-[400px]">
          <volt-tabs value="account">
            <volt-tabs-list class="grid w-full grid-cols-2">
              <button volt-tabs-trigger value="account">Account</button>
              <button volt-tabs-trigger value="password">Password</button>
            </volt-tabs-list>

            <volt-tabs-content value="account">
              <volt-card>
                <volt-card-header>
                  <volt-card-title>Account</volt-card-title>
                  <volt-card-description
                    >Make changes to your account here. Click save when you're
                    done.</volt-card-description
                  >
                </volt-card-header>
                <volt-card-content class="space-y-4">
                  <div class="space-y-2">
                    <label volt-label htmlFor="name">Name</label>
                    <input volt-input id="name" defaultValue="Jane Doe" />
                  </div>
                  <div class="space-y-2">
                    <label volt-label htmlFor="username">Username</label>
                    <input volt-input id="username" defaultValue="@janedoe" />
                  </div>
                </volt-card-content>
                <volt-card-footer>
                  <button volt-button>Save changes</button>
                </volt-card-footer>
              </volt-card>
            </volt-tabs-content>

            <volt-tabs-content value="password">
              <volt-card>
                <volt-card-header>
                  <volt-card-title>Password</volt-card-title>
                  <volt-card-description
                    >Change your password here. After saving, you'll be logged
                    out.</volt-card-description
                  >
                </volt-card-header>
                <volt-card-content class="space-y-4">
                  <div class="space-y-2">
                    <label volt-label htmlFor="current">Current password</label>
                    <input volt-input id="current" type="password" />
                  </div>
                  <div class="space-y-2">
                    <label volt-label htmlFor="new">New password</label>
                    <input volt-input id="new" type="password" />
                  </div>
                </volt-card-content>
                <volt-card-footer>
                  <button volt-button>Save password</button>
                </volt-card-footer>
              </volt-card>
            </volt-tabs-content>
          </volt-tabs>
        </div>
      </div>
    </div>
  `,
})
export class TabsDemo {}
