import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  VoltAvatar,
  VoltAvatarFallback,
  VoltAvatarImage,
  VoltBadge,
  VoltButton,
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardFooter,
  VoltCardHeader,
  VoltCardTitle,
  VoltCheckbox,
  VoltInput,
  VoltLabel,
  VoltSeparator,
  VoltSwitch,
  VoltTextarea,
} from 'volt';
import {
  IconArrowRight,
  IconGithub,
  IconMoreVertical,
  IconPlus,
  IconPaperclip,
  IconSmile,
} from '../icons';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    VoltButton,
    VoltBadge,
    VoltInput,
    VoltTextarea,
    VoltLabel,
    VoltCard,
    VoltCardHeader,
    VoltCardTitle,
    VoltCardDescription,
    VoltCardContent,
    VoltCardFooter,
    VoltSeparator,
    VoltCheckbox,
    VoltSwitch,
    VoltAvatar,
    VoltAvatarImage,
    VoltAvatarFallback,
    IconArrowRight,
    IconGithub,
    IconMoreVertical,
    IconPlus,
    IconPaperclip,
    IconSmile,
  ],
  template: `
    <main
      class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-16 sm:space-y-24"
    >
      <!-- Hero Section -->
      <section class="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto py-12">
        <volt-badge
          variant="outline"
          class="rounded-full px-4 py-1.5 border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-4 flex gap-2 items-center"
        >
          <span class="relative flex h-2 w-2">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"
            ></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Volt UI Alpha is live
        </volt-badge>
        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight text-balance leading-tight">
          Modern UI building blocks for
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-primary"
            >Angular</span
          >
        </h1>
        <p class="text-lg md:text-xl text-muted-foreground text-balance">
          Beautifully designed components built with Tailwind CSS and class-variance-authority.
          Accessible. Customizable. Fast.
        </p>
        <div class="flex flex-wrap justify-center gap-3 sm:gap-4 pt-4">
          <a routerLink="/docs/introduction">
            <volt-button size="lg" class="rounded-full shadow-xl shadow-primary/20 group">
              Get Started
              <icon-arrow-right
                class="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1"
              />
            </volt-button>
          </a>
          <a routerLink="/docs/components">
            <volt-button size="lg" variant="outline" class="rounded-full"> Components </volt-button>
          </a>
          <a
            href="https://github.com/Andersseen/volt-ui"
            target="_blank"
            rel="noreferrer"
            class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-input bg-background/60 text-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-muted"
            aria-label="GitHub repository"
          >
            <icon-github class="w-5 h-5" />
          </a>
        </div>
      </section>

      <!-- Interactive Dashboard Showcase -->
      <section>
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <!-- Left Column: Settings Card + Forms -->
          <div class="md:col-span-5 space-y-6">
            <volt-card
              class="shadow-xl shadow-black/5 dark:shadow-black/40 border-border/50 bg-background/80 backdrop-blur-xl"
            >
              <volt-card-header>
                <volt-card-title>Account Configuration</volt-card-title>
                <volt-card-description
                  >Manage your team settings and preferences.</volt-card-description
                >
              </volt-card-header>

              <volt-card-content class="space-y-6">
                <div class="flex items-center space-x-4">
                  <volt-avatar>
                    <img
                      voltAvatarImage
                      src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                      alt="Jane Doe"
                    />
                    <volt-avatar-fallback>JD</volt-avatar-fallback>
                  </volt-avatar>
                  <div class="flex-1 space-y-1">
                    <p class="text-sm font-medium leading-none">Jane Doe</p>
                    <p class="text-sm text-muted-foreground">jane.doe@example.com</p>
                  </div>
                  <!-- Dropdown trigger placeholder -->
                  <volt-button variant="ghost" size="icon" class="rounded-full">
                    <icon-more-vertical class="w-4 h-4" />
                  </volt-button>
                </div>

                <volt-separator class="bg-border/50"></volt-separator>

                <div class="space-y-4">
                  <div class="space-y-2">
                    <volt-label htmlFor="team-name">Team Name</volt-label>
                    <volt-input id="team-name" value="Volt Engineers" />
                  </div>

                  <div
                    class="flex items-center justify-between space-x-2 p-3 rounded-lg border border-border/50 bg-muted/40"
                  >
                    <div class="space-y-0.5">
                      <volt-label class="text-base cursor-pointer">Preview Features</volt-label>
                      <p class="text-xs text-muted-foreground">
                        Enable experimental dashboard features.
                      </p>
                    </div>
                    <volt-switch
                      [checked]="true"
                      aria-label="Toggle preview features"
                    ></volt-switch>
                  </div>

                  <div class="flex items-center space-x-3">
                    <volt-checkbox id="terms-accept"></volt-checkbox>
                    <volt-label
                      htmlFor="terms-accept"
                      class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Accept terms and conditions
                    </volt-label>
                  </div>
                </div>
              </volt-card-content>

              <volt-card-footer class="bg-muted/30 border-t border-border/50">
                <div class="flex gap-3 w-full justify-end mt-4">
                  <volt-button variant="ghost">Cancel</volt-button>
                  <volt-button class="shadow-sm">Save changes</volt-button>
                </div>
              </volt-card-footer>
            </volt-card>

            <div class="flex flex-wrap gap-2">
              <volt-badge variant="solid">Performance</volt-badge>
              <volt-badge variant="secondary">Security</volt-badge>
              <volt-badge variant="outline" class="border-primary text-primary"
                >Pro Feature</volt-badge
              >
              <volt-badge variant="destructive">Deprecated</volt-badge>
            </div>
          </div>

          <!-- Right Column: Components Matrix -->
          <div class="md:col-span-7 space-y-6">
            <volt-card
              class="shadow-xl shadow-black/5 dark:shadow-black/40 border-border/50 bg-background/80 backdrop-blur-xl"
            >
              <volt-card-header>
                <div class="flex justify-between items-start">
                  <div>
                    <volt-card-title>Task Management</volt-card-title>
                    <volt-card-description
                      >Recently updated activity inside your workspace.</volt-card-description
                    >
                  </div>
                  <volt-button variant="outline" size="sm" class="shadow-sm">
                    <icon-plus class="mr-2 w-[14px] h-[14px]" />
                    New Task
                  </volt-button>
                </div>
              </volt-card-header>
              <volt-card-content>
                <div class="space-y-6">
                  <!-- Task item 1 -->
                  <div class="flex items-start space-x-4">
                    <volt-checkbox [checked]="true" class="mt-1"></volt-checkbox>
                    <div class="space-y-1 flex-1">
                      <p
                        class="text-sm font-medium leading-none line-through text-muted-foreground"
                      >
                        Release v0.0.1
                      </p>
                      <p class="text-sm text-muted-foreground line-through">
                        Publish the initial NPM package.
                      </p>
                    </div>
                    <div class="flex -space-x-2">
                      <volt-avatar class="ring-2 ring-background w-8 h-8">
                        <img
                          voltAvatarImage
                          src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                          alt=""
                        />
                      </volt-avatar>
                      <volt-avatar class="ring-2 ring-background w-8 h-8">
                        <img
                          voltAvatarImage
                          src="https://i.pravatar.cc/150?u=a04258114e29026702d"
                          alt=""
                        />
                      </volt-avatar>
                    </div>
                  </div>

                  <!-- Task item 2 -->
                  <div class="flex items-start space-x-4">
                    <volt-checkbox class="mt-1"></volt-checkbox>
                    <div class="space-y-1 flex-1">
                      <p class="text-sm font-medium leading-none">Implement Tabs component</p>
                      <p class="text-sm text-muted-foreground">
                        Add interactive tabs following WAI-ARIA specs.
                      </p>
                    </div>
                    <volt-avatar class="w-8 h-8">
                      <volt-avatar-fallback>AP</volt-avatar-fallback>
                    </volt-avatar>
                  </div>

                  <!-- Task item 3 -->
                  <div class="flex items-start space-x-4">
                    <volt-checkbox [disabled]="true" class="mt-1"></volt-checkbox>
                    <div class="space-y-1 flex-1">
                      <p class="text-sm font-medium leading-none opacity-50">Write Documentation</p>
                      <p class="text-sm text-muted-foreground opacity-50">
                        Locked until components are finalized.
                      </p>
                    </div>
                    <volt-badge variant="outline" class="mt-1">Blocked</volt-badge>
                  </div>
                </div>
              </volt-card-content>
            </volt-card>

            <!-- Messaging Showcase -->
            <volt-card
              class="shadow-xl shadow-black/5 dark:shadow-black/40 border-border/50 bg-background/80 backdrop-blur-xl"
            >
              <volt-card-header>
                <volt-card-title>Quick Message</volt-card-title>
              </volt-card-header>
              <volt-card-content class="space-y-4">
                <volt-textarea
                  placeholder="Type your message here..."
                  [rows]="3"
                  class="resize-none"
                ></volt-textarea>
                <div class="flex items-center justify-between">
                  <div class="flex gap-2">
                    <volt-button
                      variant="ghost"
                      size="icon"
                      class="text-muted-foreground rounded-full"
                    >
                      <icon-paperclip class="w-5 h-5" />
                    </volt-button>
                    <volt-button
                      variant="ghost"
                      size="icon"
                      class="text-muted-foreground rounded-full"
                    >
                      <icon-smile class="w-5 h-5" />
                    </volt-button>
                  </div>
                  <volt-button size="sm" class="shadow-sm">Send Message</volt-button>
                </div>
              </volt-card-content>
            </volt-card>
          </div>
        </div>
      </section>
    </main>
  `,
})
export default class Home {}
