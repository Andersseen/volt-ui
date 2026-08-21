import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  VoltButton,
  VoltFormField,
  VoltHint,
  VoltInput,
  VoltLabel,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSeparator,
  VoltSwitch,
} from 'volt';

interface Section {
  readonly id: string;
  readonly label: string;
}

interface Preference {
  readonly id: string;
  readonly label: string;
  readonly hint: string;
  readonly enabled: boolean;
}

/**
 * Settings: a list of sections beside one column of form.
 *
 * Tabs are the other way to build this, and the profile layout uses them — which is
 * exactly why this one does not. Tabs stop working somewhere around the seventh label,
 * and settings pages only ever grow; a vertical list absorbs a tenth section without
 * anyone redesigning anything, and it survives a narrow screen by stacking.
 *
 * Groups are separated by rules rather than boxed in cards. Cards imply the groups are
 * independent things you could reorder, and settings groups are usually a sequence.
 *
 * The section list is navigation, so it is a `nav` of links in real use. Here they are
 * buttons driving local state, because a documentation page has nowhere to route to.
 */
@Component({
  selector: 'app-settings-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltFormField,
    VoltLabel,
    VoltInput,
    VoltHint,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    VoltSwitch,
    VoltSeparator,
    VoltButton,
  ],
  template: `
    <div class="h-[640px] overflow-auto bg-background">
      <header class="border-b border-border px-6 py-5">
        <h1 class="text-xl font-semibold tracking-tight">Settings</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Manage your account and how the product behaves.
        </p>
      </header>

      <div class="mx-auto grid max-w-4xl gap-8 p-6 md:grid-cols-[12rem_1fr]">
        <!-- In your app these are router links; the active one is the current URL. -->
        <nav class="flex gap-1 overflow-x-auto md:flex-col" aria-label="Settings sections">
          @for (section of sections; track section.id) {
            <button
              type="button"
              class="shrink-0 rounded-md px-3 py-2 text-left text-sm transition-colors"
              [class]="
                section.id === active()
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              "
              [attr.aria-current]="section.id === active() ? 'page' : null"
              (click)="active.set(section.id)"
            >
              {{ section.label }}
            </button>
          }
        </nav>

        <!-- One column, whatever the section. Swap what is inside; keep the column. -->
        <div class="min-w-0 space-y-8">
          <section class="space-y-5">
            <div>
              <h2 class="font-medium">Profile</h2>
              <p class="mt-1 text-sm text-muted-foreground">
                How you appear to other people in the workspace.
              </p>
            </div>

            <div class="grid gap-5 sm:grid-cols-2">
              <volt-form-field>
                <volt-label>First name</volt-label>
                <volt-input value="Ada" />
              </volt-form-field>
              <volt-form-field>
                <volt-label>Last name</volt-label>
                <volt-input value="Lovelace" />
              </volt-form-field>
            </div>

            <volt-form-field>
              <volt-label>Email</volt-label>
              <volt-input type="email" value="ada@acme.com" />
              <volt-hint>Changing this sends a confirmation to the new address.</volt-hint>
            </volt-form-field>

            <volt-form-field>
              <volt-label>Language</volt-label>
              <volt-select
                [value]="language()"
                (valueChange)="onLanguageChange($event)"
                ariaLabel="Language"
              >
                <volt-select-content>
                  @for (option of languages; track option) {
                    <volt-select-item [value]="option">{{ option }}</volt-select-item>
                  }
                </volt-select-content>
              </volt-select>
            </volt-form-field>
          </section>

          <volt-separator />

          <section class="space-y-1">
            <div class="mb-4">
              <h2 class="font-medium">Notifications</h2>
              <p class="mt-1 text-sm text-muted-foreground">
                Each of these is a separate decision, so each gets its own row.
              </p>
            </div>

            @for (preference of preferences; track preference.id; let last = $last) {
              <div class="flex items-center justify-between gap-6 py-3">
                <div class="min-w-0">
                  <label [attr.for]="preference.id" class="cursor-pointer text-sm font-medium">
                    {{ preference.label }}
                  </label>
                  <p class="mt-0.5 text-xs text-muted-foreground">{{ preference.hint }}</p>
                </div>
                <volt-switch
                  [id]="preference.id"
                  [checked]="preference.enabled"
                  [ariaLabel]="preference.label"
                />
              </div>

              @if (!last) {
                <volt-separator />
              }
            }
          </section>

          <!-- Actions belong at the end of the column, not floating over it. -->
          <div class="flex justify-end gap-2 border-t border-border pt-6">
            <volt-button variant="outline">Cancel</volt-button>
            <volt-button>Save changes</volt-button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SettingsLayout {
  protected readonly active = signal('profile');
  protected readonly language = signal('English');
  protected readonly languages = ['English', 'Español', 'Deutsch', 'Français'];

  protected readonly sections: readonly Section[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'account', label: 'Account' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'billing', label: 'Billing' },
    { id: 'security', label: 'Security' },
  ];

  protected readonly preferences: readonly Preference[] = [
    {
      id: 'notify-mentions',
      label: 'Mentions',
      hint: 'Someone names you in a comment or a thread.',
      enabled: true,
    },
    {
      id: 'notify-digest',
      label: 'Weekly digest',
      hint: 'One summary on Monday instead of a message a day.',
      enabled: true,
    },
    {
      id: 'notify-product',
      label: 'Product updates',
      hint: 'New features and the occasional deprecation notice.',
      enabled: false,
    },
  ];

  protected onLanguageChange(value: unknown): void {
    this.language.set(typeof value === 'string' ? value : 'English');
  }
}
