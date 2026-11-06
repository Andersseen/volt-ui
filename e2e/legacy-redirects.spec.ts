import { expect, test } from '@playwright/test';
import { CATALOG } from '../apps/recipes/src/app/lib/catalog';

/**
 * The old gallery URLs on voltui.dev redirect permanently to Volt UI Recipes. The redirects are
 * Cloudflare Pages `_redirects` rules, so only the built worker serves them:
 *
 *   pnpm build && E2E_SERVER=wrangler E2E_PORT=8799 playwright test e2e/legacy-redirects.spec.ts
 */
test.skip(process.env['E2E_SERVER'] !== 'wrangler', 'needs the built worker (E2E_SERVER=wrangler)');

const redirect = async (request: import('@playwright/test').APIRequestContext, url: string) => {
  const response = await request.get(url, { maxRedirects: 0 });
  return { status: response.status(), location: response.headers()['location'] };
};

for (const entry of CATALOG) {
  // The Patterns category was published as /docs/recipes on the docs site.
  const old = `/docs${entry.path.replace(/^\/patterns/, '/recipes')}`;
  test(`${old} -> ${entry.path} on recipes.voltui.dev`, async ({ request }) => {
    const { status, location } = await redirect(request, old);
    expect(status).toBe(301);
    expect(location).toBe(`https://recipes.voltui.dev${entry.path}`);
  });
}

test('preserves the locale and the query string', async ({ request }) => {
  const { status, location } = await redirect(request, '/es/docs/layouts/kanban?ref=nav');
  expect(status).toBe(301);
  expect(location).toBe('https://recipes.voltui.dev/es/layouts/kanban?ref=nav');
});

test('leaves unrelated documentation routes alone', async ({ request }) => {
  for (const path of ['/docs/components/button', '/docs/introduction', '/create-theme']) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(200);
  }
});
