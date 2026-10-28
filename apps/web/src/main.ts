import './styles.css';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

/**
 * Injects the self-hosted Umami tracker before bootstrap.
 *
 * Values come from PUBLIC_* env vars (see vite.config.ts `envPrefix`). The Website ID is
 * public by design — it ships in the HTML of every page. When the vars are absent
 * (local dev without .env, CI without vars) the injection is skipped silently.
 */
function initUmami(): void {
  const env = import.meta.env as Record<string, string | undefined>;
  const url = env['PUBLIC_UMAMI_URL'];
  const websiteId = env['PUBLIC_UMAMI_WEBSITE_ID'];
  if (!url || !websiteId || typeof document === 'undefined') return;
  const script = document.createElement('script');
  script.defer = true;
  script.src = url;
  script.dataset['websiteId'] = websiteId;
  document.head.appendChild(script);
}

initUmami();

bootstrapApplication(App, appConfig).catch(err => console.error(err));
