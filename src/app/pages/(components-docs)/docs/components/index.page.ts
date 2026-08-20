import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ComponentPreview } from '../../../../components/component-preview';
import { MOTION } from '../../../../lib/motion';
import {
  COMPONENT_GROUPS,
  type ComponentMetadata,
  type ComponentStability,
} from '../../../../lib/component-metadata';
import { Reveal } from '../../../../components/reveal';

@Component({
  selector: 'app-components-index-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ComponentPreview, Reveal],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Components</h1>
        <p class="text-lg text-muted-foreground mt-2">
          A collection of reusable, accessible components built with Angular and Tailwind CSS. Each
          component includes source code that you can copy and customize.
        </p>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-lg border border-border bg-muted/20 p-4">
          <div class="text-sm font-medium text-success">Stable</div>
          <p class="mt-1 text-xs text-muted-foreground">
            Recommended for production use. APIs are settled.
          </p>
        </div>
        <div class="rounded-lg border border-border bg-muted/20 p-4">
          <div class="text-sm font-medium text-info">Beta</div>
          <p class="mt-1 text-xs text-muted-foreground">
            Usable today, with more forms, keyboard, or edge-case coverage planned.
          </p>
        </div>
      </div>

      <div class="w-full h-px bg-border"></div>

      <div class="p-4 rounded-lg border border-border bg-muted/30">
        <p class="text-sm">
          <span class="font-medium">Quick install:</span>
          <code class="px-1.5 py-0.5 bg-muted rounded mx-1"
            >npx &#64;voltui/cli add [component]</code
          >
          or browse below to copy source code.
          <a routerLink="/docs/introduction" class="text-primary hover:underline ml-1"
            >Learn more -></a
          >
        </p>
      </div>

      <div class="space-y-8">
        @for (group of groups; track group.title) {
          <section class="space-y-4">
            <h2 class="text-lg font-semibold">{{ group.title }}</h2>
            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              @for (item of group.components; track item.path; let i = $index) {
                <a
                  [routerLink]="item.path"
                  [appReveal]="(i % 3) * stagger"
                  class="group flex flex-col overflow-hidden rounded-lg border border-border transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div
                    class="flex h-28 items-center justify-center overflow-hidden border-b border-border bg-muted/20 px-4 transition-colors group-hover:bg-muted/35"
                  >
                    <app-component-preview [name]="item.name" />
                  </div>
                  <div class="p-3">
                    <div class="flex items-center justify-between gap-2">
                      <h3 class="font-medium group-hover:text-primary">{{ item.label }}</h3>
                      <span
                        class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none"
                        [class]="stabilityClass(item.stability)"
                      >
                        {{ stabilityLabel(item.stability) }}
                      </span>
                    </div>
                    <p class="text-xs text-muted-foreground">{{ item.description }}</p>
                  </div>
                </a>
              }
            </div>
          </section>
        }
      </div>
    </div>
  `,
})
export default class ComponentsIndexPage {
  readonly groups = COMPONENT_GROUPS;

  protected readonly stagger = MOTION.stagger;

  protected stabilityLabel(stability: ComponentMetadata['stability']): string {
    return stability === 'experimental' ? 'experimental' : stability;
  }

  protected stabilityClass(stability: ComponentStability): string {
    switch (stability) {
      case 'stable':
        return 'bg-success/15 text-success';
      case 'beta':
        return 'bg-info/15 text-info';
      case 'experimental':
        return 'bg-warning/20 text-warning';
    }
  }
}
