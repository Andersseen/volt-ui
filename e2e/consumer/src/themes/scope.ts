import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  VoltButton,
  VoltCombobox,
  VoltDialog,
  VoltDialogContent,
  VoltDialogOverlay,
  VoltDialogTitle,
  VoltDropdownMenu,
  VoltDropdownMenuItem,
  VoltDropdownMenuTrigger,
  VoltInput,
  VoltNativeButton,
  VoltPopoverContent,
  VoltPopoverTrigger,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltTheme,
  VoltTooltip,
  VoltTooltipContent,
  type VoltThemeOptions,
} from '@voltui/components';

/** A themed island between two untouched neighbours, with every kind of portalled overlay inside. */
@Component({
  selector: 'app-theme-scope',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltButton,
    VoltCombobox,
    VoltDialog,
    VoltDialogContent,
    VoltDialogOverlay,
    VoltDialogTitle,
    VoltDropdownMenu,
    VoltDropdownMenuItem,
    VoltDropdownMenuTrigger,
    VoltInput,
    VoltNativeButton,
    VoltPopoverContent,
    VoltPopoverTrigger,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    VoltTheme,
    VoltTooltip,
    VoltTooltipContent,
  ],
  template: `
    <div class="grid gap-6 p-6">
      <div id="before"><volt-button>Before</volt-button></div>

      <section id="island" class="grid gap-3 p-4" [voltTheme]="island()">
        <volt-button id="inside">Inside</volt-button>
        <volt-input aria-label="Scoped input" />
        <div class="flex flex-wrap gap-2">
          <button voltButton variant="outline" [voltPopover]="popover">Open popover</button>
          <button voltButton variant="outline" [voltDropdownMenu]="menu">Open menu</button>
          <button voltButton variant="outline" [voltTooltip]="tip">Hover tip</button>
          <button voltButton variant="outline" [voltDialog]="dialog">Open dialog</button>
        </div>
        <volt-select aria-label="Scoped fruit" placeholder="Pick">
          <volt-select-content>
            <volt-select-item value="apple">Apple</volt-select-item>
          </volt-select-content>
        </volt-select>
        <volt-combobox aria-label="Scoped city" placeholder="City" [items]="cities" />

        <ng-template #popover>
          <volt-popover-content data-scoped="popover">Popover body</volt-popover-content>
        </ng-template>
        <ng-template #menu>
          <volt-dropdown-menu data-scoped="menu">
            <volt-dropdown-menu-item>Item</volt-dropdown-menu-item>
          </volt-dropdown-menu>
        </ng-template>
        <ng-template #tip>
          <volt-tooltip-content data-scoped="tip">Tip</volt-tooltip-content>
        </ng-template>
        <ng-template #dialog>
          <div voltDialogOverlay></div>
          <div voltDialogContent data-scoped="dialog">
            <h2 voltDialogTitle>Scoped dialog</h2>
          </div>
        </ng-template>
      </section>

      <div id="after"><volt-button>After</volt-button></div>

      <div id="overrides" class="grid gap-3">
        <volt-button class="h-14 rounded-none border-4 px-2">Override</volt-button>
        <volt-input
          aria-label="Override input"
          class="h-14 rounded-none border-4 focus-visible:ring-8"
        />
      </div>

      <button voltButton variant="outline" id="flip" (click)="flip()">Flip island</button>
    </div>
  `,
})
export class ThemeScopeFixture {
  protected readonly cities = ['Madrid', 'Kyiv'];
  protected readonly island = signal<VoltThemeOptions>({
    color: 'ember',
    style: 'brutal',
    dark: true,
    density: 'compact',
  });

  protected flip(): void {
    this.island.update(theme => ({ ...theme, color: 'glacier', style: 'soft', dark: false }));
  }
}
