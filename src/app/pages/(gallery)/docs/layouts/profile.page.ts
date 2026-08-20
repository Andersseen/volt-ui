import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  VoltAvatar,
  VoltAvatarFallback,
  VoltAvatarImage,
  VoltBadge,
  VoltButton,
  VoltCard,
  VoltSeparator,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
} from 'volt';

// ==========================================
// 1. Profile Stat
// ==========================================
@Component({
  selector: 'app-profile-stat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="text-center">
      <p class="text-2xl font-bold">{{ value() }}</p>
      <p class="text-xs text-muted-foreground">{{ label() }}</p>
    </div>
  `,
})
class ProfileStat {
  readonly value = input.required<string>();
  readonly label = input.required<string>();
}

// ==========================================
// 2. Activity Item
// ==========================================
@Component({
  selector: 'app-activity-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-start gap-3">
      <div class="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <svg
          class="h-4 w-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            [attr.d]="iconPath()"
          />
        </svg>
      </div>
      <div class="flex-1">
        <p class="text-sm">
          <span class="font-medium">{{ action() }}</span>
          <span class="text-muted-foreground"> {{ target() }}</span>
        </p>
        <p class="text-xs text-muted-foreground mt-0.5">{{ time() }}</p>
      </div>
    </div>
  `,
})
class ActivityItem {
  readonly action = input.required<string>();
  readonly target = input.required<string>();
  readonly time = input.required<string>();
  readonly iconPath = input<string>('M13 10V3L4 14h7v7l9-11h-7z');
}

// ==========================================
// 3. Profile Demo
// ==========================================
@Component({
  selector: 'app-profile-demo',
  imports: [
    VoltAvatar,
    VoltAvatarFallback,
    VoltAvatarImage,
    VoltBadge,
    VoltButton,
    VoltCard,
    VoltSeparator,
    VoltTabs,
    VoltTabsContent,
    VoltTabsList,
    VoltTabsTrigger,
    ProfileStat,
    ActivityItem,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-[700px] border border-border rounded-lg overflow-auto bg-background relative">
      <!-- Cover Image -->
      <div class="h-32 bg-gradient-to-r from-primary/20 to-primary/10 relative">
        <volt-button variant="outline" size="sm" class="absolute bottom-3 right-4 bg-background/80">
          <svg class="h-3.5 w-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Change Cover
        </volt-button>
      </div>

      <!-- Profile Header -->
      <div class="px-6 pb-6">
        <div class="flex flex-col sm:flex-row sm:items-end -mt-12 mb-4 gap-4">
          <div class="relative">
            <volt-avatar class="h-24 w-24 border-4 border-background">
              <img voltAvatarImage src="https://i.pravatar.cc/150?u=profile" alt="Profile" />
              <volt-avatar-fallback>JD</volt-avatar-fallback>
            </volt-avatar>
            <button
              class="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center hover:bg-accent"
            >
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
              </svg>
            </button>
          </div>
          <div class="flex-1 mb-1">
            <h2 class="text-2xl font-bold">John Doe</h2>
            <p class="text-sm text-muted-foreground">Senior Product Designer at Acme Inc.</p>
            <div class="flex items-center gap-2 mt-2">
              <volt-badge variant="secondary">Design</volt-badge>
              <volt-badge variant="outline">San Francisco, CA</volt-badge>
            </div>
          </div>
          <div class="flex gap-2">
            <volt-button variant="outline" size="sm">Message</volt-button>
            <volt-button size="sm">Follow</volt-button>
          </div>
        </div>

        <!-- Stats -->
        <div class="flex items-center gap-6 py-4 border-y border-border">
          <app-profile-stat value="1.2K" label="Followers" />
          <volt-separator orientation="vertical" class="h-8" />
          <app-profile-stat value="482" label="Following" />
          <volt-separator orientation="vertical" class="h-8" />
          <app-profile-stat value="86" label="Projects" />
          <volt-separator orientation="vertical" class="h-8" />
          <app-profile-stat value="4.9" label="Rating" />
        </div>
      </div>

      <!-- Tabs Content -->
      <div class="px-6 pb-6">
        <volt-tabs defaultValue="about">
          <volt-tabs-list class="w-full justify-start mb-6">
            <volt-tabs-trigger value="about">About</volt-tabs-trigger>
            <volt-tabs-trigger value="projects">Projects</volt-tabs-trigger>
            <volt-tabs-trigger value="activity">Activity</volt-tabs-trigger>
          </volt-tabs-list>

          <!-- About Tab -->
          <volt-tabs-content value="about" class="space-y-6">
            <div class="grid gap-6 lg:grid-cols-3">
              <div class="lg:col-span-2 space-y-6">
                <volt-card class="p-5">
                  <h3 class="font-semibold mb-3">About</h3>
                  <p class="text-sm text-muted-foreground leading-relaxed">
                    Product designer with 8+ years of experience building digital products.
                    Passionate about creating intuitive user experiences and design systems.
                    Previously worked at Stripe, Figma, and Airbnb.
                  </p>
                </volt-card>

                <volt-card class="p-5">
                  <h3 class="font-semibold mb-3">Skills</h3>
                  <div class="flex flex-wrap gap-2">
                    <volt-badge variant="secondary">UI Design</volt-badge>
                    <volt-badge variant="secondary">UX Research</volt-badge>
                    <volt-badge variant="secondary">Design Systems</volt-badge>
                    <volt-badge variant="secondary">Figma</volt-badge>
                    <volt-badge variant="secondary">Prototyping</volt-badge>
                    <volt-badge variant="secondary">User Testing</volt-badge>
                    <volt-badge variant="secondary">HTML/CSS</volt-badge>
                    <volt-badge variant="secondary">Angular</volt-badge>
                  </div>
                </volt-card>
              </div>

              <div class="space-y-6">
                <volt-card class="p-5">
                  <h3 class="font-semibold mb-3">Contact</h3>
                  <div class="space-y-3">
                    <div class="flex items-center gap-2 text-sm">
                      <svg
                        class="h-4 w-4 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <span class="text-muted-foreground">john.doe@example.com</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm">
                      <svg
                        class="h-4 w-4 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                      <span class="text-muted-foreground">johndoe.com</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm">
                      <svg
                        class="h-4 w-4 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span class="text-muted-foreground">San Francisco, CA</span>
                    </div>
                  </div>
                </volt-card>

                <volt-card class="p-5">
                  <h3 class="font-semibold mb-3">Links</h3>
                  <div class="space-y-2">
                    <a
                      href="#"
                      class="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                        />
                      </svg>
                      GitHub
                    </a>
                    <a
                      href="#"
                      class="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                        />
                      </svg>
                      LinkedIn
                    </a>
                    <a
                      href="#"
                      class="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
                        />
                      </svg>
                      Twitter
                    </a>
                  </div>
                </volt-card>
              </div>
            </div>
          </volt-tabs-content>

          <!-- Projects Tab -->
          <volt-tabs-content value="projects" class="space-y-4">
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              @for (project of projects; track project.name) {
                <volt-card class="p-4">
                  <div class="h-24 rounded-md bg-muted/50 mb-3 flex items-center justify-center">
                    <svg
                      class="h-8 w-8 text-muted-foreground/50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h4 class="font-medium text-sm">{{ project.name }}</h4>
                  <p class="text-xs text-muted-foreground mt-1">{{ project.description }}</p>
                  <div class="flex items-center gap-2 mt-3">
                    <volt-badge [variant]="project.status === 'Live' ? 'solid' : 'secondary'">{{
                      project.status
                    }}</volt-badge>
                    <span class="text-xs text-muted-foreground">{{ project.year }}</span>
                  </div>
                </volt-card>
              }
            </div>
          </volt-tabs-content>

          <!-- Activity Tab -->
          <volt-tabs-content value="activity" class="space-y-4">
            <volt-card class="p-5">
              <h3 class="font-semibold mb-4">Recent Activity</h3>
              <div class="space-y-4">
                <app-activity-item
                  action="Created project"
                  target="Design System v2"
                  time="2 hours ago"
                  iconPath="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
                <volt-separator />
                <app-activity-item
                  action="Published article"
                  target="Building accessible components"
                  time="Yesterday"
                  iconPath="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
                <volt-separator />
                <app-activity-item
                  action="Joined team"
                  target="Acme Design"
                  time="3 days ago"
                  iconPath="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
                <volt-separator />
                <app-activity-item
                  action="Updated profile"
                  target="Added new skills"
                  time="1 week ago"
                  iconPath="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </div>
            </volt-card>
          </volt-tabs-content>
        </volt-tabs>
      </div>
    </div>
  `,
})
class ProfileDemo {
  readonly projects = [
    {
      name: 'Design System',
      description: 'Comprehensive component library',
      status: 'Live',
      year: '2024',
    },
    {
      name: 'Mobile App',
      description: 'iOS and Android redesign',
      status: 'In Progress',
      year: '2024',
    },
    {
      name: 'Dashboard v3',
      description: 'Analytics platform refresh',
      status: 'In Progress',
      year: '2023',
    },
    { name: 'E-commerce', description: 'Checkout flow optimization', status: 'Live', year: '2023' },
    { name: 'Landing Page', description: 'Marketing site rebuild', status: 'Live', year: '2022' },
    {
      name: 'Internal Tools',
      description: 'Admin panel improvements',
      status: 'Archived',
      year: '2022',
    },
  ];
}

// ==========================================
// 4. Docs Page
// ==========================================
@Component({
  selector: 'app-docs-profile',
  imports: [ProfileDemo],
  template: `
    <div class="max-w-5xl mx-auto py-8 px-4 w-full h-full">
      <h1 class="text-3xl font-bold tracking-tight mb-2">Profile</h1>
      <p class="text-lg text-muted-foreground mb-8">
        A user profile layout with cover image, avatar, stats, tabs, and activity feed.
      </p>

      <app-profile-demo />

      <div class="mt-16 space-y-4">
        <h2 class="text-xl font-bold tracking-tight">Usage</h2>
        <p class="text-muted-foreground text-sm">
          This layout features a cover image header, large avatar with edit action, profile stats
          row, tabbed content (About, Projects, Activity), skills badges, and social links. Great
          for team directories, portfolios, and social profiles.
        </p>
      </div>
    </div>
  `,
})
export default class DocsProfile {}
