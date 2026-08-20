import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  VoltButton,
  VoltCard,
  VoltCheckbox,
  VoltFormField,
  VoltHint,
  VoltInput,
  VoltLabel,
  VoltSeparator,
} from 'volt';

/**
 * Centred credential form.
 *
 * The point of this layout is the field composition, not the card. Each field is a
 * `volt-form-field` wrapping a label, a control and a hint: the primitive underneath
 * generates the ids and wires `for` and `aria-describedby` between them, so the label
 * targets the real input and the hint is announced with it. Writing the same three
 * elements loose and pairing them by hand is where that quietly stops being true —
 * and on a Volt control, a static `id` lands on the custom element as well as on the
 * input inside it, so a hand-written `for` resolves to the wrong one.
 *
 * Unbranded on purpose. No logo, no gradient, no background pattern, and the provider
 * buttons carry no marks: this is the shape of a login, and a login you can ship is what
 * the blocks gallery is for.
 */
@Component({
  selector: 'app-login-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltCard,
    VoltFormField,
    VoltLabel,
    VoltInput,
    VoltHint,
    VoltCheckbox,
    VoltButton,
    VoltSeparator,
  ],
  template: `
    <div class="flex min-h-[600px] items-center justify-center bg-muted/20 p-4">
      <volt-card class="w-full max-w-sm p-8">
        <div class="mb-6">
          <h1 class="text-2xl font-bold tracking-tight">Sign in</h1>
          <p class="mt-1 text-sm text-muted-foreground">Use the account you created to continue.</p>
        </div>

        <form class="space-y-5" (submit)="$event.preventDefault()">
          <!-- volt-form-field generates the id and binds label, control and hint together.
               Nothing here needs an id of its own. -->
          <volt-form-field>
            <volt-label>Email</volt-label>
            <volt-input type="email" autocomplete="email" placeholder="you@company.com" />
          </volt-form-field>

          <volt-form-field>
            <div class="flex items-baseline justify-between gap-4">
              <volt-label>Password</volt-label>
              <a href="#" class="text-xs text-primary underline-offset-4 hover:underline">
                Forgot password?
              </a>
            </div>
            <volt-input type="password" autocomplete="current-password" />
            <volt-hint>At least 8 characters.</volt-hint>
          </volt-form-field>

          <!-- The id is a binding, not a static attribute: a static one is rendered on
               the <volt-checkbox> host as well as passed to the control, and the label's
               for would resolve to the custom element, which cannot be labelled. -->
          <div class="flex items-center gap-2">
            <volt-checkbox [id]="'login-remember'" />
            <label for="login-remember" class="cursor-pointer text-sm">Keep me signed in</label>
          </div>

          <volt-button type="submit" size="lg" class="w-full">Sign in</volt-button>
        </form>

        <!-- The slot for federated sign-in. Put your provider's mark in the leading slot;
             it is left out here so the layout carries no third-party branding. -->
        <div class="my-6 flex items-center gap-3">
          <volt-separator class="shrink" />
          <span class="shrink-0 text-xs uppercase tracking-wider text-muted-foreground"> or </span>
          <volt-separator class="shrink" />
        </div>

        <div class="grid gap-2 sm:grid-cols-2">
          @for (provider of providers; track provider) {
            <volt-button variant="outline" class="w-full">{{ provider }}</volt-button>
          }
        </div>

        <p class="mt-6 text-center text-sm text-muted-foreground">
          No account yet?
          <a href="#" class="font-medium text-primary underline-offset-4 hover:underline">
            Create one
          </a>
        </p>
      </volt-card>
    </div>
  `,
})
export class LoginLayout {
  protected readonly providers = ['Google', 'GitHub'];
}
