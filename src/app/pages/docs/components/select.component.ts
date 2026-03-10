import { Component, ChangeDetectionStrategy } from '@angular/core';
import { VoltSelect, VoltSelectContent, VoltSelectItem, VoltSelectLabel, VoltSelectSeparator } from 'volt';

@Component({
  selector: 'app-select-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltSelect, VoltSelectContent, VoltSelectItem, VoltSelectLabel, VoltSelectSeparator],
  template: `
    <div class="px-6 py-12 max-w-3xl mx-auto space-y-12">
      <div>
        <h1 class="text-3xl font-bold tracking-tight mb-2">Select</h1>
        <p class="text-muted-foreground text-lg">
          Displays a list of options for the user to pick from—triggered by a button.
        </p>
      </div>

      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Preview</h2>
        <div class="p-12 flex justify-center items-center rounded-xl border bg-card/30 backdrop-blur-sm shadow-sm ring-1 ring-border/50">
          <div class="w-full max-w-xs">
            <volt-select [(value)]="selectedFruit" placeholder="Select a fruit">
              <volt-select-content>
                <volt-select-label>Fruits</volt-select-label>
                <volt-select-item value="apple">Apple</volt-select-item>
                <volt-select-item value="banana">Banana</volt-select-item>
                <volt-select-item value="blueberry">Blueberry</volt-select-item>
                <volt-select-item value="grapes">Grapes</volt-select-item>
                <volt-select-item value="pineapple">Pineapple</volt-select-item>
                
                <volt-select-separator></volt-select-separator>
                
                <volt-select-label>Vegetables</volt-select-label>
                <volt-select-item value="carrot">Carrot</volt-select-item>
                <volt-select-item value="broccoli">Broccoli</volt-select-item>
                <volt-select-item value="spinach" disabled="true">Spinach</volt-select-item>
              </volt-select-content>
            </volt-select>
          </div>
        </div>
        <p class="text-sm text-muted-foreground text-center">Selected value: <span class="font-medium text-foreground">{{ selectedFruit }}</span></p>
      </div>
    </div>
  `
})
export class SelectDemoComponent {
  selectedFruit = '';
}
