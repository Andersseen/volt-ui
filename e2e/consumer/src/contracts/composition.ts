import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Dir } from '@angular/cdk/bidi';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  VoltButton,
  VoltRadioGroup,
  VoltRadioItem,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
  VoltToggleGroup,
  VoltToggleGroupItem,
  VoltToolbar,
  VoltToolbarButton,
} from '@voltui/components';

/**
 * Composites nested inside composites: each owns the arrow keys and the tab stop of its own items.
 * A gallery (tabs → single and multiple toggle groups, one mounted on demand), a settings tabset
 * (vertical → vertical toggle group, radio group bound to a FormControl, a toolbar), a tabset in a
 * tab panel, and a right-to-left gallery.
 */
@Component({
  selector: 'app-nested-composites',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Dir,
    ReactiveFormsModule,
    VoltButton,
    VoltRadioGroup,
    VoltRadioItem,
    VoltTabs,
    VoltTabsContent,
    VoltTabsList,
    VoltTabsTrigger,
    VoltToggleGroup,
    VoltToggleGroupItem,
    VoltToolbar,
    VoltToolbarButton,
  ],
  template: `
    <button voltButton variant="outline" id="before">Before</button>

    <section aria-label="Gallery">
      <volt-tabs [(value)]="tab">
        <volt-tabs-list aria-label="Media">
          <volt-tabs-trigger value="photos">Photos</volt-tabs-trigger>
          <volt-tabs-trigger value="videos">Videos</volt-tabs-trigger>
          <volt-tabs-trigger value="files">Files</volt-tabs-trigger>
        </volt-tabs-list>
        <volt-tabs-content value="photos">
          <volt-toggle-group aria-label="Thumbnail" [(value)]="thumb">
            <volt-toggle-group-item value="one">One</volt-toggle-group-item>
            <volt-toggle-group-item value="two" disabled>Two</volt-toggle-group-item>
            <volt-toggle-group-item value="three">Three</volt-toggle-group-item>
            <volt-toggle-group-item value="four">Four</volt-toggle-group-item>
          </volt-toggle-group>
          <volt-toggle-group aria-label="Filters" type="multiple" [(value)]="filters">
            <volt-toggle-group-item value="mono">Mono</volt-toggle-group-item>
            <volt-toggle-group-item value="warm">Warm</volt-toggle-group-item>
          </volt-toggle-group>
          @if (sizeShown()) {
            <volt-toggle-group aria-label="Size" [(value)]="size">
              <volt-toggle-group-item value="s">Small</volt-toggle-group-item>
              <volt-toggle-group-item value="l">Large</volt-toggle-group-item>
            </volt-toggle-group>
          }
        </volt-tabs-content>
        <volt-tabs-content value="videos">Videos panel</volt-tabs-content>
        <volt-tabs-content value="files">Files panel</volt-tabs-content>
      </volt-tabs>
      <output id="gallery-state"
        >{{ tab() }}|{{ thumb().join(',') }}|{{ filters().join(',') }}</output
      >
      <button voltButton variant="outline" id="toggle-size" (click)="sizeShown.set(!sizeShown())">
        Toggle size group
      </button>
      <button voltButton variant="outline" id="pick-four" (click)="thumb.set(['four'])">
        Pick four
      </button>
    </section>

    <section aria-label="Settings" class="mt-6">
      <volt-tabs value="plan" orientation="vertical">
        <volt-tabs-list aria-label="Settings sections">
          <volt-tabs-trigger value="plan">Plan</volt-tabs-trigger>
          <volt-tabs-trigger value="layout">Layout</volt-tabs-trigger>
        </volt-tabs-list>
        <volt-tabs-content value="plan">
          <volt-radio-group aria-label="Plan" [formControl]="plan">
            <volt-radio-item value="free">Free</volt-radio-item>
            <volt-radio-item value="pro">Pro</volt-radio-item>
            <volt-radio-item value="team">Team</volt-radio-item>
          </volt-radio-group>
          <output id="plan-state">{{ planState() }}</output>
          <volt-toolbar aria-label="Plan actions">
            <button voltToolbarButton type="button">Compare</button>
            <button voltToolbarButton type="button">Upgrade</button>
          </volt-toolbar>
        </volt-tabs-content>
        <volt-tabs-content value="layout">
          <volt-toggle-group aria-label="Density" orientation="vertical" [value]="['cosy']">
            <volt-toggle-group-item value="compact">Compact</volt-toggle-group-item>
            <volt-toggle-group-item value="cosy">Cosy</volt-toggle-group-item>
            <volt-toggle-group-item value="roomy">Roomy</volt-toggle-group-item>
          </volt-toggle-group>
        </volt-tabs-content>
      </volt-tabs>
    </section>

    <section aria-label="Nested tabs" class="mt-6">
      <volt-tabs [(value)]="outer">
        <volt-tabs-list aria-label="Outer">
          <volt-tabs-trigger value="a">Outer A</volt-tabs-trigger>
          <volt-tabs-trigger value="b">Outer B</volt-tabs-trigger>
        </volt-tabs-list>
        <volt-tabs-content value="a">
          <volt-tabs [(value)]="inner">
            <volt-tabs-list aria-label="Inner">
              <volt-tabs-trigger value="x">Inner X</volt-tabs-trigger>
              <volt-tabs-trigger value="y">Inner Y</volt-tabs-trigger>
            </volt-tabs-list>
            <volt-tabs-content value="x">X panel</volt-tabs-content>
            <volt-tabs-content value="y">Y panel</volt-tabs-content>
          </volt-tabs>
        </volt-tabs-content>
        <volt-tabs-content value="b">B panel</volt-tabs-content>
      </volt-tabs>
      <output id="nested-state">{{ outer() }}|{{ inner() }}</output>
    </section>

    <section aria-label="Right to left" class="mt-6" dir="rtl">
      <volt-tabs value="r1">
        <volt-tabs-list aria-label="RTL tabs">
          <volt-tabs-trigger value="r1">First</volt-tabs-trigger>
          <volt-tabs-trigger value="r2">Second</volt-tabs-trigger>
        </volt-tabs-list>
        <volt-tabs-content value="r1">
          <volt-toggle-group aria-label="RTL choice">
            <volt-toggle-group-item value="alpha">Alpha</volt-toggle-group-item>
            <volt-toggle-group-item value="beta">Beta</volt-toggle-group-item>
          </volt-toggle-group>
        </volt-tabs-content>
        <volt-tabs-content value="r2">Second panel</volt-tabs-content>
      </volt-tabs>
    </section>

    <button voltButton variant="outline" id="after">After</button>
  `,
})
export class NestedCompositesFixture {
  protected readonly tab = signal('photos');
  protected readonly thumb = signal<string[]>(['three']);
  protected readonly filters = signal<string[]>([]);
  protected readonly size = signal<string[]>(['l']);
  protected readonly sizeShown = signal(false);
  protected readonly plan = new FormControl<string | null>('pro');
  /** value|touched|dirty, read through `events` so an OnPush template repaints on touched too. */
  protected readonly planState = signal('pro|false|false');
  protected readonly outer = signal('a');
  protected readonly inner = signal('x');

  constructor() {
    this.plan.events.subscribe(() =>
      this.planState.set(`${this.plan.value}|${this.plan.touched}|${this.plan.dirty}`)
    );
  }
}
