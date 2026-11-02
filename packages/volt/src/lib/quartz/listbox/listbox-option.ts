import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { ListboxDirective, ListboxOptionDirective } from '@quartz-headless/primitives';
import {
  listboxOptionVariants,
  type ListboxOptionVariants,
} from '../../components/listbox/variants';
import { replaceQuartzIds, VoltQuartzIds } from '../../quartz-ids';
import { cn } from '../../utils';
import { VoltListbox } from './listbox';

/*
 * `data-selected` / `data-active` / `data-disabled` are written here so Volt's option classes
 * (`data-[selected]:…`) never depend on Quartz's `data-qz-*`. Like ng-primitives, an option is
 * only `data-active` while the listbox has focus.
 *
 * Quartz numbers option ids with a module-level counter; the wrapper assigns an application-scoped
 * id (or the consumer's static `id`) before Quartz registers the option. A bound `[id]` is applied
 * in `ngOnInit` by registering the option again under its new id; it is read once.
 */
@Component({
  selector: 'volt-listbox-option',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: ListboxOptionDirective,
      inputs: ['qzListboxOption: value', 'qzListboxOptionDisabled: disabled'],
    },
  ],
  host: {
    '[class]': 'classes()',
    '[attr.data-selected]': 'quartz.selected() ? "" : null',
    '[attr.data-active]': 'listbox.focused() && quartz.active() ? "" : null',
    '[attr.data-disabled]': 'quartz.optionDisabled() || listbox.isDisabled() ? "" : null',
  },
  template: `<ng-content />`,
})
export class VoltListboxOption<T = unknown> implements OnInit {
  protected readonly quartz = inject<ListboxOptionDirective<T>>(ListboxOptionDirective, {
    self: true,
  });
  private readonly engine = inject<ListboxDirective<T>>(ListboxDirective);
  protected readonly listbox = inject(VoltListbox);

  readonly id = input<string>();
  readonly value = input.required<T>();
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly inset = input<ListboxOptionVariants['inset']>(false);

  readonly class = input<string>('');
  protected readonly classes = computed(() =>
    cn(listboxOptionVariants({ inset: this.inset() }), this.class())
  );

  constructor() {
    replaceQuartzIds(this.quartz, { id: inject(VoltQuartzIds).generate('volt-listbox-option') });
  }

  ngOnInit(): void {
    const id = this.id();
    if (!id || id === this.quartz.id) return;
    this.engine.unregister(this.quartz);
    replaceQuartzIds(this.quartz, { id });
    this.engine.register(this.quartz);
  }
}
