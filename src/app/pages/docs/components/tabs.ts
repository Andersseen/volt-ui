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
    VoltLabel,
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
              <volt-tabs-trigger value="account">Account</volt-tabs-trigger>
              <volt-tabs-trigger value="password">Password</volt-tabs-trigger>
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
                    <volt-label htmlFor="name">Name</volt-label>
                    <volt-input id="name" value="Jane Doe" />
                  </div>
                  <div class="space-y-2">
                    <volt-label htmlFor="username">Username</volt-label>
                    <volt-input id="username" value="@janedoe" />
                  </div>
                </volt-card-content>
                <volt-card-footer>
                  <volt-button>Save changes</volt-button>
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
                    <volt-label htmlFor="current">Current password</volt-label>
                    <volt-input id="current" type="password" />
                  </div>
                  <div class="space-y-2">
                    <volt-label htmlFor="new">New password</volt-label>
                    <volt-input id="new" type="password" />
                  </div>
                </volt-card-content>
                <volt-card-footer>
                  <volt-button>Save password</volt-button>
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
