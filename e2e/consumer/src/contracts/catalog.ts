import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  applyVoltTheme,
  VoltAlert,
  VoltAlertDescription,
  VoltAlertTitle,
  VoltAutofill,
  VoltAvatar,
  VoltAvatarFallback,
  VoltAvatarImage,
  VoltBadge,
  VoltBreadcrumbItem,
  VoltBreadcrumbLink,
  VoltBreadcrumbList,
  VoltBreadcrumbPage,
  VoltBreadcrumbs,
  VoltBreadcrumbSeparator,
  VoltButton,
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardHeader,
  VoltCardTitle,
  VoltEmptyState,
  VoltEmptyStateDescription,
  VoltEmptyStateTitle,
  VoltError,
  VoltFormField,
  VoltHint,
  VoltInput,
  VoltLabel,
  VoltMeter,
  VoltMeterIndicator,
  VoltMeterLabel,
  VoltMeterTrack,
  VoltMeterValue,
  VoltNativeButton,
  VoltNavigationMenu,
  VoltNavigationMenuContent,
  VoltNavigationMenuItem,
  VoltNavigationMenuLink,
  VoltNavigationMenuList,
  VoltNavigationMenuTrigger,
  VoltPagination,
  VoltPaginationButton,
  VoltPaginationNext,
  VoltPaginationPrevious,
  VoltProgress,
  VoltProgressLabel,
  VoltProgressValue,
  VoltSearch,
  VoltSearchClear,
  VoltSeparator,
  VoltSidebar,
  VoltSidebarContent,
  VoltSidebarGroup,
  VoltSidebarHeader,
  VoltSidebarItem,
  VoltSidebarService,
  VoltSkeleton,
  VoltSpinner,
  VoltTable,
  VoltTableBody,
  VoltTableCaption,
  VoltTableCell,
  VoltTableHead,
  VoltTableHeader,
  VoltTableRow,
  VoltTextarea,
} from '@voltui/components';

/**
 * Tier 1 of the contract evidence (docs/quality/headless-contract-verification.md): the public
 * families that had no real-browser assertion anywhere else (e2e/contracts, e2e/consumer*). One
 * section per family, each driven by `e2e/contracts/catalog.spec.ts` through its accessible role
 * and name. Imports only from the built `@voltui/components` package.
 */
@Component({
  selector: 'app-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    VoltAlert,
    VoltAlertDescription,
    VoltAlertTitle,
    VoltAutofill,
    VoltAvatar,
    VoltAvatarFallback,
    VoltAvatarImage,
    VoltBadge,
    VoltBreadcrumbItem,
    VoltBreadcrumbLink,
    VoltBreadcrumbList,
    VoltBreadcrumbPage,
    VoltBreadcrumbs,
    VoltBreadcrumbSeparator,
    VoltButton,
    VoltCard,
    VoltCardContent,
    VoltCardDescription,
    VoltCardHeader,
    VoltCardTitle,
    VoltEmptyState,
    VoltEmptyStateDescription,
    VoltEmptyStateTitle,
    VoltError,
    VoltFormField,
    VoltHint,
    VoltInput,
    VoltLabel,
    VoltMeter,
    VoltMeterIndicator,
    VoltMeterLabel,
    VoltMeterTrack,
    VoltMeterValue,
    VoltNativeButton,
    VoltNavigationMenu,
    VoltNavigationMenuContent,
    VoltNavigationMenuItem,
    VoltNavigationMenuLink,
    VoltNavigationMenuList,
    VoltNavigationMenuTrigger,
    VoltPagination,
    VoltPaginationButton,
    VoltPaginationNext,
    VoltPaginationPrevious,
    VoltProgress,
    VoltProgressLabel,
    VoltProgressValue,
    VoltSearch,
    VoltSearchClear,
    VoltSeparator,
    VoltSidebar,
    VoltSidebarContent,
    VoltSidebarGroup,
    VoltSidebarHeader,
    VoltSidebarItem,
    VoltSkeleton,
    VoltSpinner,
    VoltTable,
    VoltTableBody,
    VoltTableCaption,
    VoltTableCell,
    VoltTableHead,
    VoltTableHeader,
    VoltTableRow,
    VoltTextarea,
  ],
  template: `
    <div class="flex flex-col gap-6">
      <section aria-label="Button family">
        <button voltButton (click)="clicks.set(clicks() + 1)">Count click</button>
        <button voltButton disabled (click)="clicks.set(clicks() + 100)">Disabled action</button>
        <volt-button variant="outline" (click)="clicks.set(clicks() + 10)">Volt button</volt-button>
        <output id="clicks">{{ clicks() }}</output>
      </section>

      <section aria-label="Badge family">
        <volt-badge variant="secondary">Beta badge</volt-badge>
        <volt-badge variant="destructive">Error badge</volt-badge>
      </section>

      <section aria-label="Alert family">
        <volt-alert variant="destructive" role="alert">
          <volt-alert-title>Payment failed</volt-alert-title>
          <volt-alert-description>Update your card.</volt-alert-description>
        </volt-alert>
        <volt-alert variant="info">
          <volt-alert-title>Static note</volt-alert-title>
        </volt-alert>
      </section>

      <section aria-label="Card family">
        <volt-card>
          <volt-card-header>
            <volt-card-title>Plan card</volt-card-title>
            <volt-card-description>Billing summary</volt-card-description>
          </volt-card-header>
          <volt-card-content>Card body text</volt-card-content>
        </volt-card>
      </section>

      <section aria-label="Avatar family">
        <volt-avatar>
          <img voltAvatarImage src="/missing-avatar-image.png" alt="Ada Lovelace" />
          <volt-avatar-fallback>AL</volt-avatar-fallback>
        </volt-avatar>
      </section>

      <section aria-label="Breadcrumbs family">
        <volt-breadcrumbs>
          <volt-breadcrumb-list>
            <volt-breadcrumb-item>
              <volt-breadcrumb-link href="#catalog">Home crumb</volt-breadcrumb-link>
            </volt-breadcrumb-item>
            <volt-breadcrumb-separator />
            <volt-breadcrumb-item>
              <volt-breadcrumb-page>Current crumb</volt-breadcrumb-page>
            </volt-breadcrumb-item>
          </volt-breadcrumb-list>
        </volt-breadcrumbs>
      </section>

      <section aria-label="Separator family">
        <span>Above</span>
        <volt-separator />
        <span>Below</span>
      </section>

      <section aria-label="Skeleton family">
        <volt-skeleton variant="text" width="120px" height="16px" />
      </section>

      <section aria-label="Spinner family">
        <volt-spinner label="Loading projects" />
        <volt-spinner />
      </section>

      <section aria-label="Progress family">
        <volt-progress [value]="progress()">
          <volt-progress-label>Upload progress</volt-progress-label>
          <volt-progress-value>{{ progress() }}% complete</volt-progress-value>
        </volt-progress>
        <button voltButton variant="outline" (click)="progress.set(90)">Advance upload</button>
      </section>

      <section aria-label="Meter family">
        <volt-meter [value]="72">
          <volt-meter-label>Capacity</volt-meter-label>
          <volt-meter-value>72 of 100</volt-meter-value>
          <volt-meter-track><volt-meter-indicator /></volt-meter-track>
        </volt-meter>
      </section>

      <section aria-label="Table family">
        <volt-table>
          <volt-table-caption>Recent invoices</volt-table-caption>
          <volt-table-header>
            <volt-table-row>
              <volt-table-head>Invoice</volt-table-head>
              <volt-table-head>Amount</volt-table-head>
            </volt-table-row>
          </volt-table-header>
          <volt-table-body>
            <volt-table-row>
              <volt-table-cell>INV001</volt-table-cell>
              <volt-table-cell>$250.00</volt-table-cell>
            </volt-table-row>
          </volt-table-body>
        </volt-table>
      </section>

      <section aria-label="Empty state family">
        <volt-empty-state>
          <volt-empty-state-title>No projects yet</volt-empty-state-title>
          <volt-empty-state-description>Create your first project.</volt-empty-state-description>
          <div slot="actions"><button voltButton>Create project</button></div>
        </volt-empty-state>
      </section>

      <section aria-label="Form field family">
        <volt-form-field>
          <volt-label>Display name</volt-label>
          <volt-input [(ngModel)]="name" placeholder="Your name" />
          <volt-hint>Shown on your profile</volt-hint>
        </volt-form-field>
        <output id="name-value">{{ name }}</output>
        <volt-form-field>
          <volt-label>Biography</volt-label>
          <volt-textarea [(ngModel)]="bio" />
        </volt-form-field>
        <output id="bio-value">{{ bio }}</output>
        <volt-form-field>
          <volt-label>Workspace</volt-label>
          <volt-input [formControl]="workspace" />
          <volt-error>Workspace is required</volt-error>
        </volt-form-field>
      </section>

      <section aria-label="Search family">
        <volt-search class="flex items-center gap-2">
          <volt-input type="search" aria-label="Search docs" placeholder="Search..." />
          <volt-search-clear aria-label="Clear search">×</volt-search-clear>
        </volt-search>
      </section>

      <section aria-label="Autofill family">
        <input
          voltAutofill
          aria-label="Email address"
          type="email"
          autocomplete="email"
          (autofillChange)="autofilled.set($event)"
        />
        <output id="autofilled">{{ autofilled() }}</output>
      </section>

      <section aria-label="Pagination family">
        <volt-pagination [(page)]="page" [pageCount]="3">
          <volt-pagination-previous />
          <volt-pagination-button [page]="1" />
          <volt-pagination-button [page]="2" />
          <volt-pagination-button [page]="3" />
          <volt-pagination-next />
        </volt-pagination>
        <output id="page">{{ page() }}</output>
      </section>

      <section aria-label="Navigation menu family">
        <volt-navigation-menu>
          <volt-navigation-menu-list>
            <volt-navigation-menu-item>
              <volt-navigation-menu-trigger [content]="started"
                >Getting started</volt-navigation-menu-trigger
              >
              <ng-template #started>
                <volt-navigation-menu-content>
                  <a voltNavigationMenuLink href="#catalog">Introduction link</a>
                </volt-navigation-menu-content>
              </ng-template>
            </volt-navigation-menu-item>
            <volt-navigation-menu-item>
              <a voltNavigationMenuLink href="#catalog">Components link</a>
            </volt-navigation-menu-item>
          </volt-navigation-menu-list>
        </volt-navigation-menu>
      </section>

      <!-- Reproduces an ng-primitives 0.131.2 defect (catalog.spec.ts): a long showDelay makes the
           hover timer that click / Escape fail to cancel observable on purpose. -->
      <section aria-label="Navigation menu hover timer">
        <volt-navigation-menu [showDelay]="1000">
          <volt-navigation-menu-list>
            <volt-navigation-menu-item>
              <volt-navigation-menu-trigger [content]="hover"
                >Hover menu</volt-navigation-menu-trigger
              >
              <ng-template #hover>
                <volt-navigation-menu-content>
                  <a voltNavigationMenuLink href="#catalog">Hover panel link</a>
                </volt-navigation-menu-content>
              </ng-template>
            </volt-navigation-menu-item>
          </volt-navigation-menu-list>
        </volt-navigation-menu>
      </section>

      <section aria-label="Sidebar family" class="h-64">
        <volt-sidebar>
          <volt-sidebar-header>Console</volt-sidebar-header>
          <volt-sidebar-content>
            <volt-sidebar-group label="Workspace">
              <volt-sidebar-item routerLink="/projects" label="Projects" />
            </volt-sidebar-group>
          </volt-sidebar-content>
        </volt-sidebar>
        <button voltButton variant="outline" (click)="sidebar.toggleCollapse()">
          Collapse sidebar
        </button>
      </section>

      <section aria-label="Theme family">
        <button voltButton variant="outline" (click)="theme()">Apply ember brutal</button>
      </section>
    </div>
  `,
})
export class CatalogFixture {
  protected readonly sidebar = inject(VoltSidebarService);
  protected readonly clicks = signal(0);
  protected readonly progress = signal(40);
  protected readonly page = signal(1);
  protected readonly autofilled = signal(false);
  protected readonly workspace = new FormControl('', Validators.required);
  protected name = '';
  protected bio = '';

  protected theme(): void {
    applyVoltTheme({ color: 'ember', style: 'brutal' });
  }
}
