import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import type { ComponentApi } from '../lib/api-reference.generated';
import { Translations } from '../i18n/translations';

@Component({
  selector: 'app-api-reference',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      @for (directive of data().directives; track directive.className) {
        <div class="space-y-3">
          @if (data().directives.length > 1) {
            <h4 class="font-mono text-sm text-muted-foreground">
              {{ directive.className }}
              @if (directive.selector) {
                <span class="text-xs">— {{ directive.selector }}</span>
              }
            </h4>
          }

          @if (directive.inputs.length > 0) {
            <div class="rounded-lg border border-border bg-muted/30 overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-muted-foreground border-b border-border">
                    <th class="p-3 font-medium">{{ t('ui.api.input') }}</th>
                    <th class="p-3 font-medium">{{ t('ui.api.type') }}</th>
                    <th class="p-3 font-medium">{{ t('ui.api.default') }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (input of directive.inputs; track input.name) {
                    <tr class="border-b border-border/50 last:border-0">
                      <td class="p-3 font-mono text-xs">
                        {{ input.name }}
                        @if (input.required) {
                          <span class="text-destructive">*</span>
                        }
                      </td>
                      <td class="p-3 font-mono text-xs text-muted-foreground">{{ input.type }}</td>
                      <td class="p-3 font-mono text-xs text-muted-foreground">
                        {{ input.default ?? '—' }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @if (directive.outputs.length > 0) {
            <div class="rounded-lg border border-border bg-muted/30 overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-muted-foreground border-b border-border">
                    <th class="p-3 font-medium">{{ t('ui.api.output') }}</th>
                    <th class="p-3 font-medium">{{ t('ui.api.type') }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (output of directive.outputs; track output.name) {
                    <tr class="border-b border-border/50 last:border-0">
                      <td class="p-3 font-mono text-xs">{{ output.name }}</td>
                      <td class="p-3 font-mono text-xs text-muted-foreground">{{ output.type }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

      @if (data().variants; as variants) {
        <div class="space-y-3">
          <h4 class="font-mono text-sm text-muted-foreground">{{ t('ui.api.variants') }}</h4>
          <div class="rounded-lg border border-border bg-muted/30 overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-muted-foreground border-b border-border">
                  <th class="p-3 font-medium">{{ t('ui.api.prop') }}</th>
                  <th class="p-3 font-medium">{{ t('ui.api.options') }}</th>
                  <th class="p-3 font-medium">{{ t('ui.api.default') }}</th>
                </tr>
              </thead>
              <tbody>
                @for (group of variants; track group.name) {
                  <tr class="border-b border-border/50 last:border-0">
                    <td class="p-3 font-mono text-xs">{{ group.name }}</td>
                    <td class="p-3 font-mono text-xs text-muted-foreground">
                      {{ group.options.join(' | ') }}
                    </td>
                    <td class="p-3 font-mono text-xs text-muted-foreground">
                      {{ group.default ?? '—' }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class ApiReference {
  private readonly translations = inject(Translations);

  protected readonly t = this.translations.t;

  readonly data = input.required<ComponentApi>();
}
