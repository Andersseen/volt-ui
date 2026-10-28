import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  VoltAvatar,
  VoltAvatarFallback,
  VoltBadge,
  VoltButton,
  VoltCard,
  VoltSeparator,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
} from 'volt';

interface Fact {
  readonly label: string;
  readonly value: string;
}

interface ActivityEntry {
  readonly action: string;
  readonly target: string;
  readonly when: string;
}

/**
 * Profile: an identity header over tabbed detail.
 *
 * The split is the whole idea. The header answers "who is this and what can I do about
 * them", and it stays put; the tabs answer "what do you want to know", and they are the
 * only thing that changes. Putting the actions inside a tab hides them two thirds of the
 * time, which is how you end up with three "Message" buttons.
 *
 * Tabs earn their place here — unlike on the settings layout — because these are views of
 * one subject rather than a growing list of unrelated sections.
 */
@Component({
  selector: 'app-profile-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltAvatar,
    VoltAvatarFallback,
    VoltBadge,
    VoltButton,
    VoltCard,
    VoltSeparator,
    VoltTabs,
    VoltTabsList,
    VoltTabsTrigger,
    VoltTabsContent,
  ],
  template: `
    <div class="h-[640px] overflow-auto bg-background">
      <!-- Identity header. No cover image: a decorative banner is the first thing every
           team replaces, and it makes the layout look finished when it is not. -->
      <header class="border-b border-border px-6 py-8">
        <div class="mx-auto flex max-w-4xl flex-col gap-6 sm:flex-row sm:items-start">
          <volt-avatar class="h-20 w-20 shrink-0">
            <volt-avatar-fallback class="text-xl">AL</volt-avatar-fallback>
          </volt-avatar>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="text-2xl font-bold tracking-tight">Ada Lovelace</h1>
              <volt-badge variant="secondary">Admin</volt-badge>
            </div>
            <p class="mt-1 text-sm text-muted-foreground">
              Principal Engineer · Barcelona · Joined March 2024
            </p>
            <p class="mt-3 max-w-xl text-sm leading-6">
              Works on the platform team. Owns the deploy pipeline and most of the reasons it is
              fast.
            </p>
          </div>

          <!-- Actions live in the header, where they are reachable from every tab. -->
          <div class="flex shrink-0 gap-2">
            <volt-button variant="outline">Message</volt-button>
            <volt-button>Edit profile</volt-button>
          </div>
        </div>
      </header>

      <div class="mx-auto max-w-4xl p-6">
        <volt-tabs value="overview">
          <volt-tabs-list>
            <volt-tabs-trigger value="overview">Overview</volt-tabs-trigger>
            <volt-tabs-trigger value="activity">Activity</volt-tabs-trigger>
            <volt-tabs-trigger value="access">Access</volt-tabs-trigger>
          </volt-tabs-list>

          <volt-tabs-content value="overview" class="pt-6">
            <div class="grid gap-4 sm:grid-cols-3">
              @for (fact of facts; track fact.label) {
                <volt-card class="p-4">
                  <p class="text-xs uppercase tracking-wider text-muted-foreground">
                    {{ fact.label }}
                  </p>
                  <p class="mt-1.5 text-lg font-semibold tracking-tight">{{ fact.value }}</p>
                </volt-card>
              }
            </div>
          </volt-tabs-content>

          <volt-tabs-content value="activity" class="pt-6">
            <ol class="space-y-1">
              @for (entry of activity; track entry.when; let last = $last) {
                <li class="flex flex-wrap items-baseline gap-x-2 gap-y-1 py-3 text-sm">
                  <span class="font-medium">{{ entry.action }}</span>
                  <span class="text-muted-foreground">{{ entry.target }}</span>
                  <span class="ml-auto text-xs text-muted-foreground">{{ entry.when }}</span>
                </li>
                @if (!last) {
                  <volt-separator />
                }
              }
            </ol>
          </volt-tabs-content>

          <volt-tabs-content value="access" class="pt-6">
            <volt-card class="divide-y divide-border">
              @for (scope of scopes; track scope) {
                <div class="flex items-center justify-between gap-4 p-4">
                  <span class="text-sm">{{ scope }}</span>
                  <volt-badge variant="outline">Granted</volt-badge>
                </div>
              }
            </volt-card>
          </volt-tabs-content>
        </volt-tabs>
      </div>
    </div>
  `,
})
export class ProfileLayout {
  protected readonly facts: readonly Fact[] = [
    { label: 'Deploys', value: '1,204' },
    { label: 'Reviews', value: '318' },
    { label: 'On call', value: '2 weeks' },
  ];

  protected readonly activity: readonly ActivityEntry[] = [
    { action: 'Deployed', target: 'storefront to production', when: '2 hours ago' },
    { action: 'Approved', target: 'pull request #4821', when: 'Yesterday' },
    { action: 'Opened', target: 'incident INC-233', when: '3 days ago' },
    { action: 'Joined', target: 'the platform team', when: 'March 2024' },
  ];

  protected readonly scopes: readonly string[] = [
    'Production deploys',
    'Billing and invoices',
    'Member management',
    'Audit log',
  ];
}
