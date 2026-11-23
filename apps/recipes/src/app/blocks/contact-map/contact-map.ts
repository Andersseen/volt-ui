import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LmnArrowRightIcon, LmnMailIcon, LmnMapPinIcon, LmnPhoneIcon } from 'lumen-icons';
import {
  VoltAlert,
  VoltAlertDescription,
  VoltBadge,
  VoltButton,
  VoltCard,
  VoltCardContent,
  VoltError,
  VoltFormField,
  VoltInput,
  VoltLabel,
  VoltNativeButton,
  VoltTextarea,
} from 'volt';
import { CONTACT_MAP } from './contact-map.data';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Contact details and a form side by side, over a dotted map of where you work, tilted back
 * into the page so its dots run on into the footer.
 *
 * The map is not thousands of circles. It is two SVG paths from `contact-map.data.ts` (built
 * by `scripts/generate-dot-map.mjs` from Natural Earth: pick the country, the pin and the
 * bounds there), where each dot is a zero-length segment drawn with a round cap. One path is
 * the highlighted country, one is everything else. It renders on the server and costs about
 * 6 KB gzipped.
 *
 * Tilting shortens the map but not its box, so it is pulled up with a percentage margin (a
 * percentage follows the width, as the height does) and slides under the form; it takes no
 * pointer events, so it never swallows the submit button's clicks. The pin's label stands
 * upright on the tilted plane (`preserve-3d`, counter-rotated), which is why only the SVG is
 * masked: a mask on the plane would flatten it. On a phone the map keeps a readable width,
 * centred on the pin, and runs off both sides.
 */
@Component({
  selector: 'app-contact-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    VoltAlert,
    VoltAlertDescription,
    VoltBadge,
    VoltButton,
    VoltCard,
    VoltCardContent,
    VoltError,
    VoltFormField,
    VoltInput,
    VoltLabel,
    VoltNativeButton,
    VoltTextarea,
    LmnArrowRightIcon,
    LmnMailIcon,
    LmnMapPinIcon,
    LmnPhoneIcon,
  ],
  host: { class: 'block' },
  template: `
    <section
      class="@container overflow-x-clip bg-background pt-20 @2xl:pt-28"
      aria-labelledby="contact-map-title"
    >
      <div
        class="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-4 @2xl:px-6 @4xl:grid-cols-2 @4xl:gap-16"
      >
        <div class="flex flex-col gap-6">
          <span
            class="inline-flex size-12 items-center justify-center self-start rounded-2xl bg-muted text-foreground"
            aria-hidden="true"
          >
            <lmn-mail [size]="24" />
          </span>
          <h2
            id="contact-map-title"
            class="text-balance text-3xl font-bold tracking-tight @2xl:text-5xl"
          >
            Tell us about the site
          </h2>
          <p class="max-w-lg text-base leading-relaxed text-muted-foreground @2xl:text-lg">
            Where it is, what you plan to build and when. We reply within two working days with a
            first idea of what the survey needs.
          </p>
          <ul class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <li>
              <a
                voltButton
                variant="link"
                class="h-auto gap-2 p-0 text-foreground"
                href="mailto:hello@fieldline.example"
              >
                <lmn-mail [size]="16" />hello&#64;fieldline.example
              </a>
            </li>
            <li>
              <a
                voltButton
                variant="link"
                class="h-auto gap-2 p-0 text-foreground"
                href="tel:+41000000000"
              >
                <lmn-phone [size]="16" />+41 00 000 00 00
              </a>
            </li>
            <li class="flex items-center gap-2 text-muted-foreground">
              <lmn-map-pin [size]="16" />Bern, Switzerland
            </li>
          </ul>
        </div>

        <volt-card class="form-card relative overflow-hidden rounded-3xl p-6 shadow-lg @2xl:p-8">
          <volt-card-content class="relative p-0">
            <form class="grid gap-4" novalidate (submit)="submit($event)">
              <volt-form-field>
                <volt-label>Name</volt-label>
                <volt-input
                  name="name"
                  autocomplete="name"
                  required
                  placeholder="Ada Lovelace"
                  [state]="showErrors() && !nameValid() ? 'error' : 'default'"
                  [(value)]="name"
                />
                @if (showErrors() && !nameValid()) {
                  <volt-error>Tell us who to reply to.</volt-error>
                }
              </volt-form-field>
              <volt-form-field>
                <volt-label>Email</volt-label>
                <volt-input
                  type="email"
                  name="email"
                  autocomplete="email"
                  required
                  placeholder="ada@company.com"
                  [state]="showErrors() && !emailValid() ? 'error' : 'default'"
                  [(value)]="email"
                />
                @if (showErrors() && !emailValid()) {
                  <volt-error>Enter an email address we can reply to.</volt-error>
                }
              </volt-form-field>
              <volt-form-field>
                <volt-label>About the site</volt-label>
                <volt-textarea
                  name="message"
                  required
                  [rows]="5"
                  placeholder="Where it is, what you plan and when."
                  [state]="showErrors() && !messageValid() ? 'error' : 'default'"
                  [(value)]="message"
                />
                @if (showErrors() && !messageValid()) {
                  <volt-error>A sentence or two is enough.</volt-error>
                }
              </volt-form-field>
              <volt-button type="submit" class="w-full">
                Send
                <lmn-arrow-right slot="trailing" [size]="16" />
              </volt-button>
              @if (sent()) {
                <volt-alert variant="success" role="status">
                  <volt-alert-description>
                    Thanks — we will be in touch within two working days.
                  </volt-alert-description>
                </volt-alert>
              }
            </form>
          </volt-card-content>
        </volt-card>
      </div>

      <!-- Full width at the end of the page: the dots run on into the footer. -->
      <div
        class="map mx-auto mt-12 max-w-7xl px-4 @2xl:mt-16"
        role="img"
        aria-label="Map of Europe with Switzerland highlighted, where the studio is based"
      >
        <div class="tilt" [style.--pin-x]="pinX">
          <div class="plane">
            <svg [attr.viewBox]="'0 0 ' + map.width + ' ' + map.height" aria-hidden="true">
              <path class="rest" [attr.d]="map.rest" />
              <path class="highlight" [attr.d]="map.highlight" />
              <circle class="pulse" [attr.cx]="map.pin.x" [attr.cy]="map.pin.y" r="1.5" />
              <circle class="pin" [attr.cx]="map.pin.x" [attr.cy]="map.pin.y" r="1.5" />
            </svg>
            <!-- Anchored to the pin inside the tilted plane, then stood back upright. -->
            <span
              class="anchor"
              [style.left.%]="pinX * 100"
              [style.top.%]="(map.pin.y / map.height) * 100"
              aria-hidden="true"
            >
              <volt-badge variant="outline" class="label">
                <span class="font-semibold">We are here</span>
                <span class="font-normal text-muted-foreground">Bern</span>
              </volt-badge>
            </span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    /* A faint square grid behind the form, fading towards the bottom. */
    .form-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(
          to right,
          color-mix(in oklab, var(--foreground) 6%, transparent) 1px,
          transparent 1px
        ),
        linear-gradient(
          to bottom,
          color-mix(in oklab, var(--foreground) 6%, transparent) 1px,
          transparent 1px
        );
      background-size: 2.5rem 2.5rem;
      mask-image: linear-gradient(to bottom, black, transparent 70%);
      pointer-events: none;
    }

    /* Decorative, and it slides under the form: it must never take a click. */
    .map {
      position: relative;
      pointer-events: none;
    }

    .tilt {
      perspective: 1400px;
      /* Tilting back shortens the map but not its box: pull it up by the difference. A
         percentage margin follows the width, as the map's height does. */
      margin-top: -24%;
      padding-top: 3.5rem;
    }

    /* On a phone the whole map would be a smudge: keep it readable, centred on the pin, and
       let the sides run off. */
    @container (max-width: 40rem) {
      .map {
        overflow: clip;
      }

      .tilt {
        width: 44rem;
        margin-top: calc(-0.24 * 44rem);
        margin-left: calc(50% - var(--pin-x) * 44rem);
      }
    }

    .plane {
      position: relative;
      transform: rotateX(42deg);
      transform-origin: 50% 100%;
      transform-style: preserve-3d;
    }

    svg {
      display: block;
      width: 100%;
      height: auto;
      overflow: visible;
      /* On the svg only (a mask on the plane flattens the 3D label). The top and the sides fade;
         the bottom edge stays solid so the dots run on into the footer. */
      mask-image:
        linear-gradient(to bottom, transparent, black 30%),
        linear-gradient(to right, transparent, black 12%, black 88%, transparent);
      mask-composite: intersect;
    }

    path {
      fill: none;
      stroke-linecap: round;
      stroke-width: 0.9;
    }

    .rest {
      stroke: color-mix(in oklab, var(--foreground) 20%, transparent);
    }

    .highlight {
      stroke: color-mix(in oklab, var(--foreground) 85%, transparent);
      stroke-width: 1.15;
    }

    .pin,
    .pulse {
      fill: var(--foreground);
    }

    .pulse {
      opacity: 0;
      transform-box: fill-box;
      transform-origin: center;
    }

    .anchor {
      position: absolute;
      width: 0;
      height: 0;
      transform-style: preserve-3d;
    }

    /* Stood upright on the pin: counter-rotated by the plane's tilt. */
    .label {
      position: absolute;
      bottom: 0;
      left: 0;
      flex-direction: column;
      gap: 0.125rem;
      margin-bottom: 2.75rem;
      padding: 0.375rem 0.75rem;
      background: var(--background);
      line-height: 1.2;
      white-space: nowrap;
      transform: translateX(-50%) rotateX(-42deg);
      transform-origin: 50% calc(100% + 2.75rem);
    }

    .label::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      width: 1px;
      height: 2.75rem;
      background: linear-gradient(var(--foreground), transparent);
    }

    @keyframes pulse {
      from {
        opacity: 0.7;
        scale: 1;
      }
      to {
        opacity: 0;
        scale: 6;
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      .pulse {
        animation: pulse 2200ms ease-out infinite;
      }
    }
  `,
})
export class ContactMap {
  protected readonly map = CONTACT_MAP;
  /** The pin's share of the map's width, for centring the phone crop on it. */
  protected readonly pinX = CONTACT_MAP.pin.x / CONTACT_MAP.width;

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly message = signal('');
  protected readonly showErrors = signal(false);
  protected readonly sent = signal(false);

  protected readonly nameValid = computed(() => this.name().trim().length > 0);
  protected readonly emailValid = computed(() => EMAIL.test(this.email().trim()));
  protected readonly messageValid = computed(() => this.message().trim().length > 0);

  protected submit(event: Event): void {
    event.preventDefault();
    this.sent.set(false);

    if (!this.nameValid() || !this.emailValid() || !this.messageValid()) {
      this.showErrors.set(true);
      // Send the visitor to the first field that needs them.
      const form = event.target as HTMLFormElement;
      const fields = [this.nameValid(), this.emailValid(), this.messageValid()];
      form.querySelectorAll<HTMLElement>('input, textarea')[fields.indexOf(false)]?.focus();
      return;
    }

    // Replace with your request. The form clears and the confirmation is announced.
    this.showErrors.set(false);
    this.name.set('');
    this.email.set('');
    this.message.set('');
    this.sent.set(true);
  }
}
