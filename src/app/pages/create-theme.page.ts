import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  VoltBadge,
  VoltButton,
  VoltCard,
  VoltCardContent,
  VoltCardDescription,
  VoltCardHeader,
  VoltCardTitle,
  VoltInput,
  VoltSelect,
  VoltSelectContent,
  VoltSelectItem,
  VoltSelectLabel,
  VoltSlider,
  VoltSwitch,
  VoltTabs,
  VoltTabsContent,
  VoltTabsList,
  VoltTabsTrigger,
} from 'volt';
import { CopyButton } from '../components/copy-button';

type ThemeMode = 'light' | 'dark';
type PresetName = 'glacier' | 'sage' | 'ember';

type ColorToken =
  | 'background'
  | 'foreground'
  | 'surface'
  | 'surfaceForeground'
  | 'muted'
  | 'mutedForeground'
  | 'border'
  | 'input'
  | 'ring'
  | 'primary'
  | 'primaryForeground'
  | 'secondary'
  | 'secondaryForeground'
  | 'success'
  | 'successForeground'
  | 'warning'
  | 'warningForeground'
  | 'error'
  | 'errorForeground'
  | 'info'
  | 'infoForeground';

type ModePalette = Record<ColorToken, string>;

interface ThemeDraft {
  name: string;
  radius: number;
  borderWidth: number;
  ringWidth: number;
  shadowIntensity: number;
  light: ModePalette;
  dark: ModePalette;
}

interface ColorField {
  key: ColorToken;
  label: string;
  description: string;
}

const tokenNames: Record<ColorToken, string> = {
  background: 'background',
  foreground: 'foreground',
  surface: 'surface',
  surfaceForeground: 'surface-foreground',
  muted: 'muted',
  mutedForeground: 'muted-foreground',
  border: 'border',
  input: 'input',
  ring: 'ring',
  primary: 'primary',
  primaryForeground: 'primary-foreground',
  secondary: 'secondary',
  secondaryForeground: 'secondary-foreground',
  success: 'success',
  successForeground: 'success-foreground',
  warning: 'warning',
  warningForeground: 'warning-foreground',
  error: 'error',
  errorForeground: 'error-foreground',
  info: 'info',
  infoForeground: 'info-foreground',
};

const colorFields: ColorField[] = [
  { key: 'background', label: 'Background', description: 'Page canvas' },
  { key: 'foreground', label: 'Foreground', description: 'Main text' },
  { key: 'surface', label: 'Surface', description: 'Cards and panels' },
  { key: 'surfaceForeground', label: 'Surface text', description: 'Text on surfaces' },
  { key: 'muted', label: 'Muted', description: 'Subtle fills' },
  { key: 'mutedForeground', label: 'Muted text', description: 'Secondary text' },
  { key: 'border', label: 'Border', description: 'Lines and outlines' },
  { key: 'input', label: 'Input', description: 'Form borders' },
  { key: 'ring', label: 'Ring', description: 'Focus color' },
  { key: 'primary', label: 'Primary', description: 'Main action' },
  { key: 'primaryForeground', label: 'Primary text', description: 'Text on primary' },
  { key: 'secondary', label: 'Secondary', description: 'Secondary action' },
  { key: 'secondaryForeground', label: 'Secondary text', description: 'Text on secondary' },
  { key: 'success', label: 'Success', description: 'Positive state' },
  { key: 'successForeground', label: 'Success text', description: 'Text on success' },
  { key: 'warning', label: 'Warning', description: 'Caution state' },
  { key: 'warningForeground', label: 'Warning text', description: 'Text on warning' },
  { key: 'error', label: 'Error', description: 'Error state' },
  { key: 'errorForeground', label: 'Error text', description: 'Text on error' },
  { key: 'info', label: 'Info', description: 'Informational state' },
  { key: 'infoForeground', label: 'Info text', description: 'Text on info' },
];

const presets: Record<PresetName, Omit<ThemeDraft, 'name'>> = {
  glacier: {
    radius: 6,
    borderWidth: 1,
    ringWidth: 2,
    shadowIntensity: 10,
    light: {
      background: '#f7fbff',
      foreground: '#172938',
      surface: '#f7fbff',
      surfaceForeground: '#172938',
      muted: '#eef6fb',
      mutedForeground: '#647888',
      border: '#d4e6ef',
      input: '#d4e6ef',
      ring: '#1896d4',
      primary: '#1896d4',
      primaryForeground: '#ffffff',
      secondary: '#32b7cf',
      secondaryForeground: '#ffffff',
      success: '#2bb891',
      successForeground: '#ffffff',
      warning: '#d9b03d',
      warningForeground: '#172938',
      error: '#d64c7a',
      errorForeground: '#ffffff',
      info: '#268ee8',
      infoForeground: '#ffffff',
    },
    dark: {
      background: '#031014',
      foreground: '#effcff',
      surface: '#071c22',
      surfaceForeground: '#effcff',
      muted: '#102a32',
      mutedForeground: '#9bb8c3',
      border: '#17323b',
      input: '#17323b',
      ring: '#28aee8',
      primary: '#28aee8',
      primaryForeground: '#ffffff',
      secondary: '#4dc4d7',
      secondaryForeground: '#ffffff',
      success: '#2cb68e',
      successForeground: '#ffffff',
      warning: '#caa43c',
      warningForeground: '#ffffff',
      error: '#dc5d86',
      errorForeground: '#ffffff',
      info: '#3aa5f2',
      infoForeground: '#ffffff',
    },
  },
  sage: {
    radius: 16,
    borderWidth: 1,
    ringWidth: 2,
    shadowIntensity: 8,
    light: {
      background: '#f7fbf8',
      foreground: '#21352d',
      surface: '#f7fbf8',
      surfaceForeground: '#21352d',
      muted: '#eef5ef',
      mutedForeground: '#667a70',
      border: '#d8e5dc',
      input: '#d8e5dc',
      ring: '#299b69',
      primary: '#299b69',
      primaryForeground: '#ffffff',
      secondary: '#35a5a0',
      secondaryForeground: '#ffffff',
      success: '#1f7d55',
      successForeground: '#ffffff',
      warning: '#c8a13d',
      warningForeground: '#21352d',
      error: '#c84f48',
      errorForeground: '#ffffff',
      info: '#3d87c8',
      infoForeground: '#ffffff',
    },
    dark: {
      background: '#06100c',
      foreground: '#eff8f2',
      surface: '#0d1b15',
      surfaceForeground: '#eff8f2',
      muted: '#16261e',
      mutedForeground: '#99aea3',
      border: '#1d3026',
      input: '#1d3026',
      ring: '#2fa66f',
      primary: '#2fa66f',
      primaryForeground: '#ffffff',
      secondary: '#37aaa4',
      secondaryForeground: '#ffffff',
      success: '#329a68',
      successForeground: '#ffffff',
      warning: '#c19d38',
      warningForeground: '#ffffff',
      error: '#d35b52',
      errorForeground: '#ffffff',
      info: '#3b8bcf',
      infoForeground: '#ffffff',
    },
  },
  ember: {
    radius: 6,
    borderWidth: 1,
    ringWidth: 2,
    shadowIntensity: 12,
    light: {
      background: '#fff9f0',
      foreground: '#3d2719',
      surface: '#fff9f0',
      surfaceForeground: '#3d2719',
      muted: '#f8ead8',
      mutedForeground: '#896c55',
      border: '#edd7bf',
      input: '#edd7bf',
      ring: '#e44e2e',
      primary: '#e44e2e',
      primaryForeground: '#ffffff',
      secondary: '#d89522',
      secondaryForeground: '#3d2719',
      success: '#50ad49',
      successForeground: '#ffffff',
      warning: '#d89522',
      warningForeground: '#3d2719',
      error: '#d9362b',
      errorForeground: '#ffffff',
      info: '#417ed4',
      infoForeground: '#ffffff',
    },
    dark: {
      background: '#140c07',
      foreground: '#fff2df',
      surface: '#21140c',
      surfaceForeground: '#fff2df',
      muted: '#332114',
      mutedForeground: '#c69c77',
      border: '#3a2819',
      input: '#3a2819',
      ring: '#f05b35',
      primary: '#f05b35',
      primaryForeground: '#ffffff',
      secondary: '#d99824',
      secondaryForeground: '#2a1a10',
      success: '#58b34f',
      successForeground: '#ffffff',
      warning: '#d99824',
      warningForeground: '#ffffff',
      error: '#e34a3d',
      errorForeground: '#ffffff',
      info: '#4b88df',
      infoForeground: '#ffffff',
    },
  },
};

function clonePreset(name: PresetName, themeName = 'custom-theme'): ThemeDraft {
  return structuredClone({ name: themeName, ...presets[name] });
}

function normalizeThemeName(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'custom-theme'
  );
}

function eventValue(event: Event): string {
  return (event.target as HTMLInputElement).value;
}

function indent(lines: string[]): string {
  return lines.map(line => `  ${line}`).join('\n');
}

@Component({
  selector: 'app-create-theme-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CopyButton,
    VoltBadge,
    VoltButton,
    VoltCard,
    VoltCardContent,
    VoltCardDescription,
    VoltCardHeader,
    VoltCardTitle,
    VoltInput,
    VoltSelect,
    VoltSelectContent,
    VoltSelectItem,
    VoltSelectLabel,
    VoltSlider,
    VoltSwitch,
    VoltTabs,
    VoltTabsContent,
    VoltTabsList,
    VoltTabsTrigger,
  ],
  template: `
    <main class="relative z-10 overflow-hidden pb-24">
      <section class="relative border-b border-border/50">
        <div class="theme-grid pointer-events-none absolute inset-0 -z-10"></div>
        <div
          class="pointer-events-none absolute -top-24 left-1/3 -z-10 h-72 w-72 rounded-full bg-primary/15 blur-[100px]"
        ></div>
        <div class="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div class="max-w-3xl">
            <div class="flex flex-wrap items-center gap-2">
              <volt-badge
                variant="outline"
                class="rounded-full border-primary/25 bg-background/75 text-primary backdrop-blur"
                >Theme studio</volt-badge
              >
              <span class="text-sm text-muted-foreground">Export-ready CSS variables</span>
            </div>
            <h1 class="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Design your system.
            </h1>
            <p class="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Tune every semantic token, compare light and dark modes, and export a production-ready
              Volt UI theme without leaving the browser.
            </p>
          </div>
        </div>
      </section>

      <section
        class="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:py-14"
      >
        <div class="space-y-6">
          <div class="flex items-end justify-between gap-4">
            <div>
              <p class="text-xs font-medium uppercase tracking-[0.18em] text-primary">Editor</p>
              <h2 class="mt-2 text-2xl font-semibold tracking-tight">Theme foundations</h2>
            </div>
            <span class="hidden text-xs text-muted-foreground sm:block"
              >Changes preview instantly</span
            >
          </div>

          <volt-card class="studio-card border-border/70 bg-surface/80 shadow-sm backdrop-blur">
            <volt-card-header>
              <volt-card-title>Theme Setup</volt-card-title>
              <volt-card-description
                >Name it, pick a starting palette, then tune the details.</volt-card-description
              >
            </volt-card-header>
            <volt-card-content>
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="space-y-2">
                  <label for="theme-name" class="text-sm font-medium text-foreground"
                    >Theme name</label
                  >
                  <volt-input
                    id="theme-name"
                    [value]="theme().name"
                    (valueChange)="setName($event)"
                    placeholder="acme-ocean"
                  />
                </div>

                <div class="space-y-2">
                  <span class="text-sm font-medium text-foreground">Start from</span>
                  <volt-select [(value)]="presetValue" placeholder="Choose preset">
                    <volt-select-content>
                      <volt-select-label>Presets</volt-select-label>
                      <volt-select-item value="glacier">Glacier</volt-select-item>
                      <volt-select-item value="sage">Sage</volt-select-item>
                      <volt-select-item value="ember">Ember</volt-select-item>
                    </volt-select-content>
                  </volt-select>
                </div>
              </div>
            </volt-card-content>
          </volt-card>

          <volt-card class="studio-card border-border/70 bg-surface/80 shadow-sm backdrop-blur">
            <volt-card-header>
              <volt-card-title>Color Tokens</volt-card-title>
              <volt-card-description
                >Edit light and dark palettes independently.</volt-card-description
              >
            </volt-card-header>
            <volt-card-content>
              <volt-tabs [value]="activeMode()" (valueChange)="setActiveMode($event)">
                <volt-tabs-list class="grid w-full grid-cols-2">
                  <volt-tabs-trigger value="light">Light</volt-tabs-trigger>
                  <volt-tabs-trigger value="dark">Dark</volt-tabs-trigger>
                </volt-tabs-list>

                @for (mode of modes; track mode) {
                  <volt-tabs-content [value]="mode">
                    <div class="grid gap-3 sm:grid-cols-2">
                      @for (field of colorFields; track field.key) {
                        <div
                          class="token-row flex items-center gap-3 rounded-xl border border-border/70 bg-background/70 p-3"
                        >
                          <span
                            class="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted"
                          >
                            <input
                              type="color"
                              [value]="theme()[mode][field.key]"
                              (input)="setColor(mode, field.key, $event)"
                              class="h-12 w-12 -translate-x-1 -translate-y-1 cursor-pointer border-0 bg-transparent p-0"
                              [attr.aria-label]="field.label"
                            />
                          </span>
                          <span class="min-w-0 flex-1">
                            <span class="block text-sm font-medium text-foreground">
                              {{ field.label }}
                            </span>
                            <span class="block text-xs text-muted-foreground">
                              {{ field.description }}
                            </span>
                          </span>
                          <code class="text-xs text-muted-foreground">
                            {{ theme()[mode][field.key] }}
                          </code>
                        </div>
                      }
                    </div>
                  </volt-tabs-content>
                }
              </volt-tabs>
            </volt-card-content>
          </volt-card>

          <volt-card class="studio-card border-border/70 bg-surface/80 shadow-sm backdrop-blur">
            <volt-card-header>
              <volt-card-title>Shape & Feel</volt-card-title>
              <volt-card-description
                >Adjust the structural tokens shared by both modes.</volt-card-description
              >
            </volt-card-header>
            <volt-card-content>
              <div class="grid gap-5 sm:grid-cols-2">
                <div class="space-y-2">
                  <div class="flex items-center justify-between gap-3">
                    <span class="text-sm font-medium text-foreground">Radius</span>
                    <code class="text-xs text-muted-foreground">{{ theme().radius }}px</code>
                  </div>
                  <volt-slider
                    [value]="theme().radius"
                    [min]="0"
                    [max]="24"
                    [step]="1"
                    (valueChange)="setNumber('radius', $event)"
                  />
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between gap-3">
                    <span class="text-sm font-medium text-foreground">Border</span>
                    <code class="text-xs text-muted-foreground">{{ theme().borderWidth }}px</code>
                  </div>
                  <volt-slider
                    [value]="theme().borderWidth"
                    [min]="0"
                    [max]="4"
                    [step]="1"
                    (valueChange)="setNumber('borderWidth', $event)"
                  />
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between gap-3">
                    <span class="text-sm font-medium text-foreground">Focus ring</span>
                    <code class="text-xs text-muted-foreground">{{ theme().ringWidth }}px</code>
                  </div>
                  <volt-slider
                    [value]="theme().ringWidth"
                    [min]="1"
                    [max]="5"
                    [step]="1"
                    (valueChange)="setNumber('ringWidth', $event)"
                  />
                </div>

                <div class="space-y-2">
                  <div class="flex items-center justify-between gap-3">
                    <span class="text-sm font-medium text-foreground">Shadow</span>
                    <code class="text-xs text-muted-foreground"
                      >{{ theme().shadowIntensity }}%</code
                    >
                  </div>
                  <volt-slider
                    [value]="theme().shadowIntensity"
                    [min]="0"
                    [max]="24"
                    [step]="1"
                    (valueChange)="setNumber('shadowIntensity', $event)"
                  />
                </div>
              </div>
            </volt-card-content>
          </volt-card>

          <volt-card class="studio-card border-border/70 bg-surface/80 shadow-sm backdrop-blur">
            <volt-card-header>
              <div class="flex items-center justify-between gap-3">
                <div>
                  <volt-card-title>Generated CSS</volt-card-title>
                  <volt-card-description
                    >Paste this into a Volt theme preset or app stylesheet.</volt-card-description
                  >
                </div>
                <app-copy-button [code]="generatedCss()" />
              </div>
            </volt-card-header>
            <volt-card-content>
              <pre
                class="max-h-[420px] overflow-auto rounded-xl border border-border/70 bg-foreground p-5 text-xs leading-relaxed text-background shadow-inner"
              ><code>{{ generatedCss() }}</code></pre>
            </volt-card-content>
          </volt-card>
        </div>

        <aside class="lg:sticky lg:top-20 lg:self-start">
          <div class="space-y-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.18em] text-primary">Canvas</p>
                <h2 class="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  Live preview
                </h2>
                <p class="text-sm text-muted-foreground">Scoped safely from the docs theme.</p>
              </div>
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <label for="theme-preview-dark">Dark</label>
                <volt-switch
                  id="theme-preview-dark"
                  [checked]="previewDark()"
                  (checkedChange)="setPreviewDark($event)"
                />
              </div>
            </div>

            <div
              class="preview-shell overflow-hidden rounded-2xl border border-border/70 bg-surface/75 shadow-2xl shadow-black/10 backdrop-blur"
            >
              <div
                class="flex items-center justify-between border-b border-border/60 bg-muted/35 px-4 py-3"
              >
                <div class="flex items-center gap-1.5" aria-hidden="true">
                  <span class="h-2.5 w-2.5 rounded-full bg-destructive/70"></span>
                  <span class="h-2.5 w-2.5 rounded-full bg-warning/80"></span>
                  <span class="h-2.5 w-2.5 rounded-full bg-success/70"></span>
                </div>
                <span class="font-mono text-[10px] text-muted-foreground">theme-preview.css</span>
                <volt-badge variant="secondary" class="text-[10px]">Live</volt-badge>
              </div>

              <div class="h-[680px] overflow-auto p-3 sm:p-4">
                <div
                  class="overflow-hidden rounded-xl border border-border shadow-lg transition-colors duration-300"
                  [ngStyle]="previewStyle()"
                >
                  <div class="min-h-[620px] bg-background p-5 text-foreground">
                    <div
                      class="flex items-center justify-between gap-3 border-b border-border pb-4"
                    >
                      <div>
                        <p class="text-sm text-muted-foreground">Volt UI</p>
                        <h3 class="text-2xl font-semibold">{{ normalizedName() }}</h3>
                      </div>
                      <volt-badge>Preview</volt-badge>
                    </div>

                    <div class="mt-5 grid gap-3">
                      <volt-card>
                        <volt-card-header>
                          <volt-card-title>Dashboard Card</volt-card-title>
                          <volt-card-description
                            >Surface, border, muted text, and shadow tokens.</volt-card-description
                          >
                        </volt-card-header>
                        <volt-card-content>
                          <div class="grid grid-cols-3 gap-2">
                            <div class="rounded-md bg-muted p-3">
                              <p class="text-xs text-muted-foreground">Users</p>
                              <p class="text-lg font-semibold">12k</p>
                            </div>
                            <div class="rounded-md bg-muted p-3">
                              <p class="text-xs text-muted-foreground">MRR</p>
                              <p class="text-lg font-semibold">$48k</p>
                            </div>
                            <div class="rounded-md bg-muted p-3">
                              <p class="text-xs text-muted-foreground">NPS</p>
                              <p class="text-lg font-semibold">71</p>
                            </div>
                          </div>
                        </volt-card-content>
                      </volt-card>

                      <div
                        class="rounded-lg border border-border bg-surface p-4 text-surface-foreground"
                      >
                        <span class="text-sm font-medium">Project name</span>
                        <div class="mt-2">
                          <volt-input value="Volt Studio" />
                        </div>
                        <div class="mt-4 flex flex-wrap gap-2">
                          <volt-button>Save theme</volt-button>
                          <volt-button variant="outline">Export CSS</volt-button>
                          <volt-button variant="ghost">Reset</volt-button>
                        </div>
                      </div>

                      <div class="grid grid-cols-2 gap-2">
                        <div
                          class="rounded-lg border border-border bg-success p-3 text-success-foreground"
                        >
                          Success
                        </div>
                        <div
                          class="rounded-lg border border-border bg-warning p-3 text-warning-foreground"
                        >
                          Warning
                        </div>
                        <div
                          class="rounded-lg border border-border bg-error p-3 text-error-foreground"
                        >
                          Error
                        </div>
                        <div
                          class="rounded-lg border border-border bg-info p-3 text-info-foreground"
                        >
                          Info
                        </div>
                      </div>

                      <div class="rounded-lg border border-border bg-surface p-4">
                        <div class="flex items-center justify-between">
                          <span class="text-sm font-medium">Component density</span>
                          <span class="text-xs text-muted-foreground">64%</span>
                        </div>
                        <div class="mt-4">
                          <volt-slider [value]="64" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  `,
  styles: `
    .theme-grid {
      background-image:
        linear-gradient(
          to right,
          color-mix(in oklch, var(--border) 55%, transparent) 1px,
          transparent 1px
        ),
        linear-gradient(
          to bottom,
          color-mix(in oklch, var(--border) 55%, transparent) 1px,
          transparent 1px
        );
      background-size: 48px 48px;
      mask-image: linear-gradient(to right, black, transparent 85%);
    }

    .studio-card,
    .token-row {
      transition:
        border-color 180ms ease,
        box-shadow 180ms ease,
        transform 180ms ease;
    }

    .studio-card:hover {
      border-color: color-mix(in oklch, var(--primary) 22%, var(--border));
    }

    .token-row:hover {
      border-color: color-mix(in oklch, var(--primary) 32%, var(--border));
      box-shadow: 0 10px 25px -22px var(--primary);
      transform: translateY(-1px);
    }

    .preview-shell {
      animation: preview-enter 550ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    @keyframes preview-enter {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .preview-shell {
        animation: none;
      }

      .studio-card,
      .token-row {
        transition: none;
      }
    }
  `,
})
export default class CreateThemePage {
  protected readonly modes: ThemeMode[] = ['light', 'dark'];
  protected readonly colorFields = colorFields;
  protected readonly theme = signal<ThemeDraft>(clonePreset('glacier'));
  protected readonly selectedPreset = signal<PresetName>('glacier');
  protected readonly activeMode = signal<ThemeMode>('light');
  protected readonly previewDark = signal(false);

  protected readonly normalizedName = computed(() => normalizeThemeName(this.theme().name));

  protected readonly activePalette = computed(() =>
    this.previewDark() ? this.theme().dark : this.theme().light
  );

  protected readonly previewStyle = computed(() => {
    const palette = this.activePalette();
    const theme = this.theme();

    return {
      ...this.paletteStyleVars(palette),
      '--radius': `${theme.radius}px`,
      '--border-width': `${theme.borderWidth}px`,
      '--ring-width': `${theme.ringWidth}px`,
      '--shadow-sm': `0 1px 2px 0 rgb(0 0 0 / ${theme.shadowIntensity / 400})`,
      '--shadow': `0 2px 8px 0 rgb(0 0 0 / ${theme.shadowIntensity / 300})`,
      '--shadow-md': `0 8px 20px 0 rgb(0 0 0 / ${theme.shadowIntensity / 260})`,
      '--shadow-lg': `0 18px 38px 0 rgb(0 0 0 / ${theme.shadowIntensity / 220})`,
      '--scrollbar-track': 'color-mix(in oklch, var(--background) 88%, var(--surface))',
      '--scrollbar-thumb': 'color-mix(in oklch, var(--primary) 42%, var(--border))',
      '--scrollbar-thumb-hover': 'color-mix(in oklch, var(--primary) 64%, var(--border))',
    };
  });

  protected readonly generatedCss = computed(() => {
    const theme = this.theme();
    const name = this.normalizedName();
    const shape = [
      `--radius: ${theme.radius}px;`,
      `--border-width: ${theme.borderWidth}px;`,
      `--border-style: solid;`,
      `--ring-width: ${theme.ringWidth}px;`,
      `--ring-offset-width: 2px;`,
      `--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / ${theme.shadowIntensity / 400});`,
      `--shadow: 0 2px 8px 0 rgb(0 0 0 / ${theme.shadowIntensity / 300});`,
      `--shadow-md: 0 8px 20px 0 rgb(0 0 0 / ${theme.shadowIntensity / 260});`,
      `--shadow-lg: 0 18px 38px 0 rgb(0 0 0 / ${theme.shadowIntensity / 220});`,
    ];

    return `:root[data-color='${name}'] {\n${indent([
      ...this.paletteCssLines(theme.light),
      ...shape,
    ])}\n}\n\n.dark[data-color='${name}'] {\n${indent(this.paletteCssLines(theme.dark))}\n}`;
  });

  protected setName(value: unknown): void {
    if (typeof value !== 'string') return;
    this.theme.update(theme => ({ ...theme, name: value }));
  }

  protected get presetValue(): PresetName {
    return this.selectedPreset();
  }

  protected set presetValue(value: unknown) {
    if (!this.isPresetName(value)) return;
    this.selectedPreset.set(value);
    this.theme.set(clonePreset(value, this.theme().name));
  }

  protected setActiveMode(value: unknown): void {
    if (value === 'light' || value === 'dark') {
      this.activeMode.set(value);
      this.previewDark.set(value === 'dark');
    }
  }

  protected setPreviewDark(value: unknown): void {
    if (typeof value === 'boolean') {
      this.previewDark.set(value);
    }
  }

  protected setColor(mode: ThemeMode, key: ColorToken, event: Event): void {
    const value = eventValue(event);
    this.theme.update(theme => ({
      ...theme,
      [mode]: {
        ...theme[mode],
        [key]: value,
      },
    }));
  }

  protected setNumber(
    key: 'radius' | 'borderWidth' | 'ringWidth' | 'shadowIntensity',
    value: unknown
  ): void {
    if (typeof value !== 'number') return;
    this.theme.update(theme => ({ ...theme, [key]: value }));
  }

  private isPresetName(value: unknown): value is PresetName {
    return value === 'glacier' || value === 'sage' || value === 'ember';
  }

  private paletteStyleVars(palette: ModePalette): Record<string, string> {
    return Object.fromEntries(
      Object.entries(tokenNames).map(([key, tokenName]) => [
        `--${tokenName}`,
        palette[key as ColorToken],
      ])
    );
  }

  private paletteCssLines(palette: ModePalette): string[] {
    return Object.entries(tokenNames).map(
      ([key, tokenName]) => `--${tokenName}: ${palette[key as ColorToken]};`
    );
  }
}
