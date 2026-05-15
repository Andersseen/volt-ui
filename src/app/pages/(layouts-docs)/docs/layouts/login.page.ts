import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VoltButton, VoltCard, VoltCheckbox, VoltInput, VoltLabel, VoltSeparator } from 'volt';

// ==========================================
// 1. Social Login Button
// ==========================================
@Component({
  selector: 'app-social-button',
  imports: [VoltButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <volt-button variant="outline" class="w-full" size="md">
      <ng-content select="[slot=icon]" />
      <ng-content />
    </volt-button>
  `,
})
class SocialButton {}

// ==========================================
// 2. Login Form
// ==========================================
@Component({
  selector: 'app-login-form',
  imports: [VoltCard, VoltInput, VoltLabel, VoltCheckbox, VoltButton, VoltSeparator, SocialButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <volt-card class="w-full max-w-sm p-8 shadow-lg">
      <!-- Header -->
      <div class="text-center mb-6">
        <div
          class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-4"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h2 class="text-2xl font-bold tracking-tight">Welcome back</h2>
        <p class="text-sm text-muted-foreground mt-1">
          Enter your credentials to access your account
        </p>
      </div>

      <!-- Form -->
      <div class="space-y-4">
        <div class="space-y-2">
          <volt-label>Email</volt-label>
          <volt-input type="email" placeholder="name@company.com" />
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <volt-label>Password</volt-label>
            <a href="#" class="text-xs text-primary hover:underline">Forgot password?</a>
          </div>
          <volt-input type="password" placeholder="Enter your password" />
        </div>

        <div class="flex items-center gap-2">
          <volt-checkbox id="remember" />
          <volt-label htmlFor="remember" class="text-sm font-normal"
            >Remember me for 30 days</volt-label
          >
        </div>

        <volt-button class="w-full" size="lg">Sign In</volt-button>
      </div>

      <!-- Divider -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-border"></div>
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <!-- Social Buttons -->
      <div class="grid grid-cols-2 gap-3">
        <app-social-button>
          <svg slot="icon" class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </app-social-button>
        <app-social-button>
          <svg slot="icon" class="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
          GitHub
        </app-social-button>
      </div>

      <!-- Footer -->
      <p class="text-center text-sm text-muted-foreground mt-6">
        Don't have an account?
        <a href="#" class="text-primary font-medium hover:underline">Sign up</a>
      </p>
    </volt-card>
  `,
})
class LoginForm {}

// ==========================================
// 3. Login Page Demo
// ==========================================
@Component({
  selector: 'app-login-demo',
  imports: [LoginForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-[700px] flex items-center justify-center bg-muted/30 relative p-4">
      <!-- Background pattern -->
      <div
        class="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"
      ></div>
      <app-login-form />
    </div>
  `,
})
class LoginDemo {}

// ==========================================
// 4. Docs Page
// ==========================================
@Component({
  selector: 'app-docs-login',
  imports: [LoginDemo],
  template: `
    <div class="max-w-5xl mx-auto py-8 px-4 w-full h-full">
      <h1 class="text-3xl font-bold tracking-tight mb-2">Login</h1>
      <p class="text-lg text-muted-foreground mb-8">
        A centered authentication layout with email/password form, social login options, and
        password recovery.
      </p>

      <app-login-demo />

      <div class="mt-16 space-y-4">
        <h2 class="text-xl font-bold tracking-tight">Usage</h2>
        <p class="text-muted-foreground text-sm">
          This layout features a centered card with email/password inputs, remember-me checkbox,
          social authentication buttons (Google, GitHub), and links for password recovery and
          sign-up. Copy the code and adapt it to your authentication flow.
        </p>
      </div>
    </div>
  `,
})
export default class DocsLogin {}
