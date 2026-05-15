import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  VoltButton,
  VoltCard,
  VoltInput,
  VoltLabel,
  VoltSeparator,
  VoltSwitch,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
  VoltAvatar,
  VoltAvatarFallback,
  VoltAvatarImage,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
} from 'volt';

// ==========================================
// 1. Settings Section Header
// ==========================================
@Component({
  selector: 'app-settings-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <div>
        <h3 class="text-lg font-medium">{{ title() }}</h3>
        <p class="text-sm text-muted-foreground">{{ description() }}</p>
      </div>
      <ng-content />
    </div>
  `,
})
class SettingsSection {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}

// ==========================================
// 2. Settings Form Row
// ==========================================
@Component({
  selector: 'app-settings-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-between py-4">
      <div class="space-y-0.5">
        <label class="text-sm font-medium">{{ label() }}</label>
        <p class="text-xs text-muted-foreground">{{ hint() }}</p>
      </div>
      <ng-content />
    </div>
  `,
})
class SettingsRow {
  readonly label = input.required<string>();
  readonly hint = input.required<string>();
}

// ==========================================
// 3. Settings Demo
// ==========================================
@Component({
  selector: 'app-settings-demo',
  imports: [
    VoltCard,
    VoltButton,
    VoltInput,
    VoltLabel,
    VoltSeparator,
    VoltSwitch,
    VoltTabs,
    VoltTabsContent,
    VoltTabsList,
    VoltTabsTrigger,
    VoltAvatar,
    VoltAvatarFallback,
    VoltAvatarImage,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    SettingsSection,
    SettingsRow,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-[700px] border border-border rounded-lg overflow-auto bg-background relative">
      <!-- Header -->
      <div class="h-14 border-b border-border flex items-center px-6">
        <h2 class="text-lg font-semibold">Settings</h2>
      </div>

      <div class="p-6">
        <volt-tabs defaultValue="profile" class="w-full">
          <volt-tabs-list class="w-full justify-start mb-6">
            <volt-tabs-trigger value="profile">Profile</volt-tabs-trigger>
            <volt-tabs-trigger value="account">Account</volt-tabs-trigger>
            <volt-tabs-trigger value="notifications">Notifications</volt-tabs-trigger>
            <volt-tabs-trigger value="appearance">Appearance</volt-tabs-trigger>
          </volt-tabs-list>

          <!-- Profile Tab -->
          <volt-tabs-content value="profile" class="space-y-6">
            <volt-card class="p-6">
              <app-settings-section
                title="Profile Information"
                description="Update your photo and personal details."
              >
                <div class="flex items-center gap-4 mb-6">
                  <volt-avatar class="h-16 w-16">
                    <img voltAvatarImage src="https://i.pravatar.cc/150?u=settings" alt="Profile" />
                    <volt-avatar-fallback>JD</volt-avatar-fallback>
                  </volt-avatar>
                  <div class="flex gap-2">
                    <volt-button size="sm">Change Photo</volt-button>
                    <volt-button variant="outline" size="sm">Remove</volt-button>
                  </div>
                </div>

                <div class="grid gap-4 md:grid-cols-2">
                  <div class="space-y-2">
                    <volt-label>First name</volt-label>
                    <volt-input value="John" />
                  </div>
                  <div class="space-y-2">
                    <volt-label>Last name</volt-label>
                    <volt-input value="Doe" />
                  </div>
                  <div class="space-y-2 md:col-span-2">
                    <volt-label>Email address</volt-label>
                    <volt-input type="email" value="john.doe@example.com" />
                  </div>
                  <div class="space-y-2 md:col-span-2">
                    <volt-label>Bio</volt-label>
                    <volt-input value="Product Designer based in San Francisco" />
                  </div>
                </div>

                <div class="flex justify-end gap-2 mt-6">
                  <volt-button variant="outline" size="sm">Cancel</volt-button>
                  <volt-button size="sm">Save Changes</volt-button>
                </div>
              </app-settings-section>
            </volt-card>
          </volt-tabs-content>

          <!-- Account Tab -->
          <volt-tabs-content value="account" class="space-y-6">
            <volt-card class="p-6">
              <app-settings-section
                title="Account Security"
                description="Manage your password and 2FA settings."
              >
                <div class="space-y-4">
                  <div class="space-y-2">
                    <volt-label>Current Password</volt-label>
                    <volt-input type="password" placeholder="Enter current password" />
                  </div>
                  <div class="space-y-2">
                    <volt-label>New Password</volt-label>
                    <volt-input type="password" placeholder="Enter new password" />
                  </div>
                  <div class="space-y-2">
                    <volt-label>Confirm Password</volt-label>
                    <volt-input type="password" placeholder="Confirm new password" />
                  </div>
                </div>
                <div class="flex justify-end mt-6">
                  <volt-button size="sm">Update Password</volt-button>
                </div>
              </app-settings-section>
            </volt-card>

            <volt-card class="p-6 border-destructive/50">
              <app-settings-section title="Danger Zone" description="Irreversible account actions.">
                <div class="flex items-center justify-between py-2">
                  <div>
                    <p class="text-sm font-medium text-destructive">Delete Account</p>
                    <p class="text-xs text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <volt-button variant="destructive" size="sm">Delete</volt-button>
                </div>
              </app-settings-section>
            </volt-card>
          </volt-tabs-content>

          <!-- Notifications Tab -->
          <volt-tabs-content value="notifications" class="space-y-6">
            <volt-card class="p-6">
              <app-settings-section
                title="Email Notifications"
                description="Choose what emails you want to receive."
              >
                <app-settings-row
                  label="Product updates"
                  hint="News about features and improvements."
                >
                  <volt-switch [checked]="true" />
                </app-settings-row>
                <volt-separator />
                <app-settings-row label="Security alerts" hint="Important security notifications.">
                  <volt-switch [checked]="true" />
                </app-settings-row>
                <volt-separator />
                <app-settings-row
                  label="Marketing emails"
                  hint="Tips, offers, and partner messages."
                >
                  <volt-switch />
                </app-settings-row>
                <volt-separator />
                <app-settings-row label="Weekly digest" hint="Summary of your activity.">
                  <volt-switch [checked]="true" />
                </app-settings-row>
              </app-settings-section>
            </volt-card>
          </volt-tabs-content>

          <!-- Appearance Tab -->
          <volt-tabs-content value="appearance" class="space-y-6">
            <volt-card class="p-6">
              <app-settings-section
                title="Interface Preferences"
                description="Customize how the app looks."
              >
                <app-settings-row label="Compact mode" hint="Reduce padding and spacing.">
                  <volt-switch />
                </app-settings-row>
                <volt-separator />
                <app-settings-row label="Show animations" hint="Enable transitions and animations.">
                  <volt-switch [checked]="true" />
                </app-settings-row>
                <volt-separator />
                <app-settings-row label="Language" hint="Select your preferred language.">
                  <volt-select value="en" class="w-32">
                    <volt-select-content>
                      <volt-select-item value="en">English</volt-select-item>
                      <volt-select-item value="es">Español</volt-select-item>
                      <volt-select-item value="fr">Français</volt-select-item>
                    </volt-select-content>
                  </volt-select>
                </app-settings-row>
              </app-settings-section>
            </volt-card>
          </volt-tabs-content>
        </volt-tabs>
      </div>
    </div>
  `,
})
class SettingsDemo {}

// ==========================================
// 4. Docs Page
// ==========================================
@Component({
  selector: 'app-docs-settings',
  imports: [SettingsDemo],
  template: `
    <div class="max-w-5xl mx-auto py-8 px-4 w-full h-full">
      <h1 class="text-3xl font-bold tracking-tight mb-2">Settings</h1>
      <p class="text-lg text-muted-foreground mb-8">
        A tabbed settings layout for managing profile, account, notifications, and appearance
        preferences.
      </p>

      <app-settings-demo />

      <div class="mt-16 space-y-4">
        <h2 class="text-xl font-bold tracking-tight">Usage</h2>
        <p class="text-muted-foreground text-sm">
          This layout uses tabs to organize different settings categories. Each tab contains form
          elements, toggles, and action buttons. Great for user preference panels, admin
          configurations, and account management.
        </p>
      </div>
    </div>
  `,
})
export default class DocsSettings {}
