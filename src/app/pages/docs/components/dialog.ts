import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  NgpDialog,
  NgpDialogDescription,
  NgpDialogOverlay,
  NgpDialogTitle,
  NgpDialogTrigger,
} from 'ng-primitives/dialog';
import { CodePanel } from '../../../components/code-panel';

@Component({
  selector: 'app-dialog-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgpDialog,
    NgpDialogTrigger,
    NgpDialogOverlay,
    NgpDialogTitle,
    NgpDialogDescription,
    CodePanel,
  ],
  template: `
    <div class="space-y-10">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Dialog</h1>
        <p class="text-lg text-muted-foreground mt-2">
          A window overlaid on either the primary window or another dialog window. Supports modal
          dialogs and drawers.
        </p>
      </div>

      <!-- Default Dialog -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Default Dialog</h2>
        <div
          class="border rounded-xl border-border/50 p-6 md:p-10 flex items-center justify-center bg-background/50 relative overflow-hidden min-h-[300px]"
        >
          <div
            class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
          ></div>

          <div class="relative z-10">
            <button
              [ngpDialogTrigger]="defaultDialogTpl"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Open Dialog
            </button>

            <ng-template #defaultDialogTpl let-close="close">
              <div
                ngpDialogOverlay
                class="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
              ></div>
              <div
                ngpDialog
                class="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
              >
                <div class="flex flex-col space-y-1.5 text-center sm:text-left">
                  <h2 ngpDialogTitle class="text-lg font-semibold leading-none tracking-tight">
                    Edit Profile
                  </h2>
                  <p ngpDialogDescription class="text-sm text-muted-foreground">
                    Make changes to your profile here. Click save when you're done.
                  </p>
                </div>
                <div class="grid gap-4 py-4">
                  <div class="grid grid-cols-4 items-center gap-4">
                    <label class="text-right text-sm font-medium">Name</label>
                    <input
                      class="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value="Jane Doe"
                    />
                  </div>
                  <div class="grid grid-cols-4 items-center gap-4">
                    <label class="text-right text-sm font-medium">Email</label>
                    <input
                      class="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value="jane@example.com"
                    />
                  </div>
                </div>
                <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                  <button
                    (click)="close()"
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mt-2 sm:mt-0"
                  >
                    Cancel
                  </button>
                  <button
                    (click)="close()"
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    Save changes
                  </button>
                </div>
              </div>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- Drawer Right -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Drawer (Right)</h2>
        <div
          class="border rounded-xl border-border/50 p-6 md:p-10 flex items-center justify-center bg-background/50 relative overflow-hidden min-h-[300px]"
        >
          <div
            class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
          ></div>

          <div class="relative z-10">
            <button
              [ngpDialogTrigger]="drawerRightTpl"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Open Drawer
            </button>

            <ng-template #drawerRightTpl let-close="close">
              <div
                ngpDialogOverlay
                class="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
              ></div>
              <div
                ngpDialog
                class="fixed inset-y-0 right-0 z-50 h-full w-[300px] max-w-[85vw] border-l border-border bg-background shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300"
              >
                <div class="flex h-full flex-col">
                  <div class="flex items-center justify-between border-b border-border p-4">
                    <h2 ngpDialogTitle class="text-lg font-semibold">Menu</h2>
                    <button
                      (click)="close()"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                  <nav class="flex-1 overflow-auto p-4" ngpDialogDescription>
                    <ul class="space-y-2">
                      <li>
                        <a href="#" class="block px-3 py-2 rounded-md text-sm hover:bg-muted"
                          >Home</a
                        >
                      </li>
                      <li>
                        <a href="#" class="block px-3 py-2 rounded-md text-sm hover:bg-muted"
                          >About</a
                        >
                      </li>
                      <li>
                        <a href="#" class="block px-3 py-2 rounded-md text-sm hover:bg-muted"
                          >Services</a
                        >
                      </li>
                      <li>
                        <a href="#" class="block px-3 py-2 rounded-md text-sm hover:bg-muted"
                          >Contact</a
                        >
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- Drawer Left -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Drawer (Left)</h2>
        <div
          class="border rounded-xl border-border/50 p-6 md:p-10 flex items-center justify-center bg-background/50 relative overflow-hidden min-h-[300px]"
        >
          <div
            class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
          ></div>

          <div class="relative z-10">
            <button
              [ngpDialogTrigger]="drawerLeftTpl"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Open Left Drawer
            </button>

            <ng-template #drawerLeftTpl let-close="close">
              <div
                ngpDialogOverlay
                class="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
              ></div>
              <div
                ngpDialog
                class="fixed inset-y-0 left-0 z-50 h-full w-[300px] max-w-[85vw] border-r border-border bg-background shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-300"
              >
                <div class="flex h-full flex-col">
                  <div class="flex items-center justify-between border-b border-border p-4">
                    <h2 ngpDialogTitle class="text-lg font-semibold">Settings</h2>
                    <button
                      (click)="close()"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                  <div class="flex-1 overflow-auto p-4" ngpDialogDescription>
                    <div class="space-y-4">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium">Dark Mode</span>
                        <button
                          class="relative inline-flex h-6 w-11 items-center rounded-full bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <span
                            class="inline-block h-4 w-4 rounded-full bg-background shadow-lg translate-x-1"
                          ></span>
                        </button>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium">Notifications</span>
                        <button
                          class="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <span
                            class="inline-block h-4 w-4 rounded-full bg-background shadow-lg translate-x-6"
                          ></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ng-template>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="text-xl font-semibold tracking-tight">Features</h2>
        <ul class="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Keyboard navigation with Escape key to close</li>
          <li>Click outside to close (configurable)</li>
          <li>Focus trap for accessibility</li>
          <li>Smooth animations and transitions</li>
          <li>Support for modal dialogs and side drawers</li>
          <li>ARIA attributes for screen readers</li>
        </ul>
      </div>

      <!-- Source Code Section -->
      <app-code-panel
        title="Component Source"
        [code]="dialogCode"
        cliCommand="npx github:Andersseen/volt-ui add dialog"
        description="Copy this code to your project. The component uses ng-primitives/dialog."
      />
    </div>
  `,
})
export default class DialogDemo {
  readonly dialogCode = `import { Directive } from '@angular/core';
import { 
  NgpDialogTrigger, 
  NgpDialog, 
  NgpDialogOverlay, 
  NgpDialogTitle, 
  NgpDialogDescription 
} from 'ng-primitives/dialog';

// Trigger
@Directive({
  selector: '[voltDialog]',
  hostDirectives: [NgpDialogTrigger],
})
export class VoltDialog {}

// Overlay
@Directive({
  selector: '[voltDialogOverlay]',
  hostDirectives: [NgpDialogOverlay],
})
export class VoltDialogOverlay {}

// Content
@Directive({
  selector: '[voltDialogContent]',
  hostDirectives: [NgpDialog],
})
export class VoltDialogContent {}

// Title
@Directive({
  selector: '[voltDialogTitle]',
  hostDirectives: [NgpDialogTitle],
})
export class VoltDialogTitle {}

// Description
@Directive({
  selector: '[voltDialogDescription]',
  hostDirectives: [NgpDialogDescription],
})
export class VoltDialogDescription {}`;
}
