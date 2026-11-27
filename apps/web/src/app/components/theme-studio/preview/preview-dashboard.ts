import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import {
  VoltAlert,
  VoltAlertDescription,
  VoltAlertTitle,
  VoltBadge,
  VoltCard,
  VoltCardContent,
  VoltCardHeader,
  VoltCardTitle,
  VoltEmptyState,
  VoltEmptyStateDescription,
  VoltEmptyStateTitle,
  VoltInput,
  VoltNativeButton,
  VoltProgress,
  VoltProgressLabel,
  VoltProgressValue,
  VoltSkeleton,
} from 'volt';
import type { PreviewState } from './preview-state';

/** Sample application: navigation, a search, KPI cards and a project list. Specimen copy. */
@Component({
  selector: 'app-preview-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltAlert,
    VoltAlertDescription,
    VoltAlertTitle,
    VoltBadge,
    VoltCard,
    VoltCardContent,
    VoltCardHeader,
    VoltCardTitle,
    VoltEmptyState,
    VoltEmptyStateDescription,
    VoltEmptyStateTitle,
    VoltInput,
    VoltNativeButton,
    VoltProgress,
    VoltProgressLabel,
    VoltProgressValue,
    VoltSkeleton,
  ],
  template: `
    <div class="flex min-h-[560px] flex-col @[34rem]:flex-row">
      <nav
        aria-label="Workspace"
        class="border-b border-border p-3 @[34rem]:w-44 @[34rem]:border-r @[34rem]:border-b-0"
      >
        <p class="px-2 pb-2 text-xs font-medium text-muted-foreground">Acme Inc.</p>
        <ul class="flex flex-wrap gap-1 @[34rem]:flex-col">
          @for (item of nav; track item) {
            <li>
              <a
                voltButton
                href="#"
                size="sm"
                [variant]="item === current() ? 'solid' : 'ghost'"
                class="w-full justify-start"
                [attr.aria-current]="item === current() ? 'page' : null"
                (click)="$event.preventDefault(); current.set(item)"
                >{{ item }}</a
              >
            </li>
          }
        </ul>
      </nav>

      <main class="min-w-0 flex-1 space-y-4 p-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-lg font-semibold">{{ current() }}</h3>
          <div class="flex flex-wrap gap-2">
            <volt-input
              class="w-44"
              placeholder="Search projects"
              ariaLabel="Search projects"
              [disabled]="state() === 'disabled'"
            />
            <button
              voltButton
              size="sm"
              [disabled]="state() === 'disabled' || state() === 'loading'"
            >
              New project
            </button>
          </div>
        </div>

        @if (state() === 'error') {
          <volt-alert variant="destructive" role="alert">
            <volt-alert-title>Metrics are unavailable</volt-alert-title>
            <volt-alert-description
              >The analytics service did not answer. Try again in a minute.</volt-alert-description
            >
            <button slot="action" voltButton variant="outline" size="sm">Retry</button>
          </volt-alert>
        }

        <div class="grid gap-3 @[30rem]:grid-cols-3">
          @for (kpi of kpis; track kpi.label) {
            <volt-card>
              <volt-card-content class="space-y-1 pt-4">
                <p class="text-xs text-muted-foreground">{{ kpi.label }}</p>
                @if (state() === 'loading') {
                  <volt-skeleton variant="text" width="64px" height="24px" />
                } @else {
                  <p class="text-2xl font-semibold">{{ state() === 'empty' ? '0' : kpi.value }}</p>
                  <volt-badge [variant]="kpi.trend">{{ kpi.delta }}</volt-badge>
                }
              </volt-card-content>
            </volt-card>
          }
        </div>

        <volt-card>
          <volt-card-header><volt-card-title>Projects</volt-card-title></volt-card-header>
          <volt-card-content>
            @if (state() === 'empty') {
              <volt-empty-state>
                <volt-empty-state-title>No projects yet</volt-empty-state-title>
                <volt-empty-state-description
                  >Create your first project to see it here.</volt-empty-state-description
                >
              </volt-empty-state>
            } @else {
              <ul class="space-y-4">
                @for (project of projects; track project.name) {
                  <li>
                    @if (state() === 'loading') {
                      <volt-skeleton variant="text" width="100%" height="32px" />
                    } @else {
                      <volt-progress [value]="project.done">
                        <volt-progress-label>{{ project.name }}</volt-progress-label>
                        <volt-progress-value>{{ project.done }}%</volt-progress-value>
                      </volt-progress>
                    }
                  </li>
                }
              </ul>
            }
          </volt-card-content>
        </volt-card>
      </main>
    </div>
  `,
})
export class PreviewDashboard {
  readonly state = input<PreviewState>('default');

  protected readonly nav = ['Overview', 'Projects', 'Billing', 'Settings'];
  protected readonly current = signal('Overview');
  protected readonly kpis = [
    { label: 'Active users', value: '12,480', delta: '+8%', trend: 'success' as const },
    { label: 'Revenue', value: '$48.2k', delta: '+3%', trend: 'info' as const },
    { label: 'Churn', value: '2.1%', delta: '+0.4%', trend: 'warning' as const },
  ];
  protected readonly projects = [
    { name: 'Mobile onboarding', done: 72 },
    { name: 'Billing migration', done: 38 },
  ];
}
