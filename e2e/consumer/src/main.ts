import { Component, provideZonelessChangeDetection } from '@angular/core';
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  VoltAvatar,
  VoltAvatarFallback,
  VoltButton,
  VoltCheckbox,
  VoltDialog,
  VoltDialogContent,
  VoltDialogDescription,
  VoltDialogOverlay,
  VoltDialogTitle,
  VoltDrawer,
  VoltDrawerContent,
  VoltDrawerDescription,
  VoltDrawerOverlay,
  VoltDrawerTitle,
  VoltDropdownMenu,
  VoltDropdownMenuItem,
  VoltDropdownMenuTrigger,
  VoltMeter,
  VoltMeterIndicator,
  VoltMeterTrack,
  VoltPopoverContent,
  VoltPopoverTrigger,
  VoltProgress,
  VoltRadioGroup,
  VoltRadioItem,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSeparator,
  VoltSlider,
  VoltSwitch,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
  VoltTooltip,
  VoltTooltipContent,
} from '@voltui/components';

import './styles.css';

@Component({
  selector: 'app-consumer',
  standalone: true,
  imports: [
    VoltAvatar,
    VoltAvatarFallback,
    VoltButton,
    VoltCheckbox,
    VoltDialog,
    VoltDialogContent,
    VoltDialogDescription,
    VoltDialogOverlay,
    VoltDialogTitle,
    VoltDrawer,
    VoltDrawerContent,
    VoltDrawerDescription,
    VoltDrawerOverlay,
    VoltDrawerTitle,
    VoltDropdownMenu,
    VoltDropdownMenuItem,
    VoltDropdownMenuTrigger,
    VoltMeter,
    VoltMeterIndicator,
    VoltMeterTrack,
    VoltPopoverContent,
    VoltPopoverTrigger,
    VoltProgress,
    VoltRadioGroup,
    VoltRadioItem,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    VoltSeparator,
    VoltSlider,
    VoltSwitch,
    VoltTabs,
    VoltTabsContent,
    VoltTabsList,
    VoltTabsTrigger,
    VoltTooltip,
    VoltTooltipContent,
  ],
  template: `
    <main class="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <h1 class="text-2xl font-semibold">Volt Consumer Fixture</h1>

      <section aria-label="meters" class="grid gap-4">
        <volt-slider data-testid="slider" [value]="10" [min]="0" [max]="24" [step]="1" />

        <volt-progress data-testid="progress" [value]="45" />

        <volt-meter data-testid="meter" [value]="60">
          <volt-meter-track data-testid="meter-track">
            <volt-meter-indicator data-testid="meter-indicator" />
          </volt-meter-track>
        </volt-meter>
      </section>

      <section aria-label="controls" class="flex flex-wrap items-center gap-4">
        <volt-switch data-testid="switch" [checked]="true" />
        <volt-checkbox data-testid="checkbox" [checked]="true" />
        <volt-radio-group data-testid="radio-group" value="one">
          <volt-radio-item data-testid="radio-one" value="one">One</volt-radio-item>
          <volt-radio-item data-testid="radio-two" value="two">Two</volt-radio-item>
        </volt-radio-group>
        <volt-avatar data-testid="avatar">
          <volt-avatar-fallback>VP</volt-avatar-fallback>
        </volt-avatar>
      </section>

      <volt-separator data-testid="separator" />

      <section aria-label="interactive overlays" class="flex flex-wrap items-center gap-4">
        <volt-select data-testid="select" placeholder="Pick one">
          <volt-select-content>
            <volt-select-item value="alpha">Alpha</volt-select-item>
            <volt-select-item value="beta">Beta</volt-select-item>
          </volt-select-content>
        </volt-select>

        <button type="button" [voltPopover]="popoverTpl" data-testid="popover-trigger">
          Open popover
        </button>
        <ng-template #popoverTpl>
          <volt-popover-content data-testid="popover-content">Popover content</volt-popover-content>
        </ng-template>

        <button type="button" [voltDropdownMenu]="menuTpl" data-testid="dropdown-trigger">
          Open menu
        </button>
        <ng-template #menuTpl>
          <volt-dropdown-menu data-testid="dropdown-menu">
            <volt-dropdown-menu-item>First action</volt-dropdown-menu-item>
            <volt-dropdown-menu-item>Second action</volt-dropdown-menu-item>
          </volt-dropdown-menu>
        </ng-template>

        <button voltTooltip [voltTooltip]="tooltipTpl" data-testid="tooltip-trigger">
          Tooltip target
        </button>
        <ng-template #tooltipTpl>
          <volt-tooltip-content data-testid="tooltip-content">Tooltip content</volt-tooltip-content>
        </ng-template>
      </section>

      <section aria-label="layered components" class="flex flex-wrap items-center gap-4">
        <button type="button" [voltDialog]="dialogTpl" data-testid="dialog-trigger">
          Open dialog
        </button>
        <ng-template #dialogTpl>
          <div voltDialogOverlay></div>
          <div voltDialogContent data-testid="dialog-content">
            <h2 voltDialogTitle>Dialog title</h2>
            <p voltDialogDescription>Dialog description</p>
          </div>
        </ng-template>

        <button type="button" [voltDrawer]="drawerTpl" data-testid="drawer-trigger">
          Open drawer
        </button>
        <ng-template #drawerTpl>
          <div voltDrawerOverlay></div>
          <div voltDrawerContent data-testid="drawer-content">
            <h2 voltDrawerTitle>Drawer title</h2>
            <p voltDrawerDescription>Drawer description</p>
          </div>
        </ng-template>
      </section>

      <volt-tabs value="one" data-testid="tabs">
        <volt-tabs-list data-testid="tabs-list">
          <volt-tabs-trigger value="one">One</volt-tabs-trigger>
          <volt-tabs-trigger value="two">Two</volt-tabs-trigger>
        </volt-tabs-list>
        <volt-tabs-content value="one" data-testid="tabs-content">First tab</volt-tabs-content>
        <volt-tabs-content value="two">Second tab</volt-tabs-content>
      </volt-tabs>
    </main>
  `,
})
class ConsumerApp {}

bootstrapApplication(ConsumerApp, {
  providers: [provideZonelessChangeDetection()],
}).catch(error => {
  console.error(error);
});
