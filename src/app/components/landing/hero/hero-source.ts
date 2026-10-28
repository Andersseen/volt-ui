import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  VoltBadge,
  VoltButton,
  VoltCard,
  VoltSwitch,
  VoltToggleGroup,
  VoltToggleGroupItem,
} from 'volt';
import { injectAppI18n } from '@shared/i18n/i18n';
import { SOURCE_DEMOS, codeParts, type DemoId, type SourceDemo } from './source-demos';

type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link';
type BadgeVariant = 'solid' | 'secondary' | 'outline' | 'success';

/**
 * The hero's right-hand side: Volt's whole idea in one card. Pick a component, change one
 * attribute, and both the source you would own and the real component update together — with
 * the CLI command and the file it lands in underneath.
 */
@Component({
  selector: 'app-hero-source',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoltBadge, VoltButton, VoltCard, VoltSwitch, VoltToggleGroup, VoltToggleGroupItem],
  host: { class: 'hero-source block min-w-0' },
  template: `
    <volt-card class="source-card overflow-hidden rounded-2xl bg-surface/70 p-0 backdrop-blur-xl">
      <!-- Component picker -->
      <div class="flex items-center gap-3 border-b border-border/70 px-4 py-3">
        <span class="flex gap-1.5" aria-hidden="true">
          <span class="h-2.5 w-2.5 rounded-full bg-border"></span>
          <span class="h-2.5 w-2.5 rounded-full bg-border"></span>
          <span class="h-2.5 w-2.5 rounded-full bg-border"></span>
        </span>
        <volt-toggle-group
          type="single"
          class="ml-auto h-auto border-0 bg-transparent p-0 shadow-none"
          [value]="[demo().id]"
          [allowDeselection]="false"
          (valueChange)="pick($event)"
        >
          @for (item of demos; track item.id) {
            <volt-toggle-group-item [value]="item.id" size="sm">
              <span class="font-mono text-xs">{{ item.id }}</span>
            </volt-toggle-group-item>
          }
        </volt-toggle-group>
      </div>

      <!-- The source -->
      <pre
        class="overflow-x-auto px-5 pt-5 pb-4 font-mono text-[13px] leading-6"
      ><code>{{ code()[0] }}<span class="value">{{ code()[1] }}</span>{{ code()[2] }}</code></pre>

      <!-- The one attribute to play with -->
      <div class="flex flex-wrap items-center gap-2 px-5 pb-5">
        <span class="font-mono text-xs text-muted-foreground">{{ demo().attribute }}</span>
        <volt-toggle-group
          type="single"
          class="h-auto flex-wrap"
          [value]="[value()]"
          [allowDeselection]="false"
          (valueChange)="choose($event)"
        >
          @for (option of demo().options; track option) {
            <volt-toggle-group-item [value]="option" size="sm">
              <span class="font-mono text-xs">{{ option }}</span>
            </volt-toggle-group-item>
          }
        </volt-toggle-group>
      </div>

      <!-- The real thing -->
      <div class="stage grid min-h-36 place-items-center border-t border-border/70 px-6 py-10">
        @switch (demo().id) {
          @case ('button') {
            <volt-button [variant]="buttonVariant()">{{ label() }}</volt-button>
          }
          @case ('badge') {
            <volt-badge [variant]="badgeVariant()">{{ label() }}</volt-badge>
          }
          @case ('switch') {
            <volt-switch
              [checked]="value() === 'true'"
              [aria-label]="label()"
              (checkedChange)="toggled($event)"
            />
          }
        }
      </div>

      <!-- Where it comes from -->
      <div
        class="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 bg-muted/30 px-5 py-3 font-mono text-[11px] text-muted-foreground"
      >
        <span><span class="text-primary">$</span> npx &#64;voltui/cli add {{ demo().id }}</span>
        <span>src/app/ui/{{ demo().id }}/{{ demo().id }}.ts</span>
      </div>
    </volt-card>
  `,
  styles: `
    :host {
      perspective: 1400px;
    }

    .source-card {
      box-shadow:
        0 0 0 1px color-mix(in oklch, var(--primary) 18%, transparent),
        0 30px 80px -30px color-mix(in oklch, var(--primary) 55%, transparent);
    }

    .value {
      border-radius: 4px;
      padding: 1px 3px;
      color: var(--primary);
      background: color-mix(in oklch, var(--primary) 14%, transparent);
    }

    .stage {
      background-image: radial-gradient(
        color-mix(in oklch, var(--foreground) 14%, transparent) 1px,
        transparent 1px
      );
      background-size: 16px 16px;
    }

    @media (min-width: 1024px) {
      .source-card {
        transform: rotateY(-6deg) rotateX(3deg);
        transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
      }

      :host:hover .source-card {
        transform: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .source-card,
      :host:hover .source-card {
        transform: none;
        transition: none;
      }
    }
  `,
})
export class HeroSource {
  protected readonly t = injectAppI18n().t;
  protected readonly demos = SOURCE_DEMOS;

  private readonly demoId = signal<DemoId>('button');
  /** The chosen value per demo, so switching tabs keeps each one's state. */
  private readonly values = signal<Record<DemoId, string>>({
    button: 'solid',
    badge: 'solid',
    switch: 'true',
  });

  protected readonly demo = computed<SourceDemo>(
    () => SOURCE_DEMOS.find(demo => demo.id === this.demoId()) ?? SOURCE_DEMOS[0]
  );
  readonly value = computed(() => this.values()[this.demoId()]);
  protected readonly label = computed(() => this.t(this.demo().labelKey));
  protected readonly code = computed(() => codeParts(this.demo(), this.value(), this.label()));
  protected readonly buttonVariant = computed(() => this.value() as ButtonVariant);
  protected readonly badgeVariant = computed(() => this.value() as BadgeVariant);

  pick(value: string[]): void {
    const id = value[0] as DemoId | undefined;
    if (id) {
      this.demoId.set(id);
    }
  }

  choose(value: string[]): void {
    const next = value[0];
    if (next) {
      this.values.update(values => ({ ...values, [this.demoId()]: next }));
    }
  }

  /** The rendered switch is live too: flipping it rewrites the code. */
  protected toggled(checked: boolean): void {
    this.values.update(values => ({ ...values, switch: String(checked) }));
  }
}
