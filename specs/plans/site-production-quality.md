# Site production quality

Status: implemented; pull request pending

## Baseline

- Started from clean `main` at `ece03b5ed18d04bbca6718ed5904b9cec8fa2491`, fast-forwarded from `origin/main`, and worked on `feat/site-production-quality`.
- Verified package versions: `@voltui/components` and `@voltui/cli` 1.3.2; `@voltui/agent` 0.6.0. The catalog contains 44 components.
- Production Lighthouse (desktop): Accessibility 89, Best Practices 88, SEO 100. Mobile (390×844, reduced motion): Accessibility 96, Best Practices 88, SEO 100. These were new measurements, not the supplied historical scores.
- Desktop exposed focusable descendants under `aria-hidden` component previews and invalid `menubar` child semantics in the route navigation. Mobile also reported paste prevention on a demo OTP field. The paste warning is a Lighthouse false positive for a non-interactive exhibit.
- One initial desktop contrast audit caught content while reveal animations were in progress; reduced-motion/mobile and local repeat audits passed. No animation change was justified.
- Production root response was 200 HTML with Brotli compression and Cloudflare, but the observed response lacked security headers. Observed assets and analytics requests succeeded; no console errors were captured.
- Three unthrottled mobile traces measured LCP 855–866 ms (TTFB 743–764 ms, render delay 99–113 ms), CLS 0.00. These are lab runs without field data and do not justify speculative performance changes.
- Unknown routes return 200 with `noindex, follow` in production and the local worker. This matches the existing documented Cloudflare Pages/SSR behavior; status-changing work was deferred because route and localization redirect interactions are broader.

## Changes

- Component previews now use `inert` along with `aria-hidden`, preventing keyboard focus and interaction with exhibit controls.
- The site header now uses ordinary route anchors in a labelled native navigation landmark, styled with Volt's existing `voltButton` directive. Current routes expose `aria-current="page"`; the gallery link is current for both Blocks and Layouts.
- Added server middleware for `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, and a restrictive camera/microphone/geolocation `Permissions-Policy`. No CSP was added because a correct policy needs a separate inventory of inline and third-party resources.
- Extended browser, component, and SEO response checks. Regenerated the dogfood inventory to reflect native route navigation.
- Fixed two test cleanup leaks: reveal and dashboard specs now restore only their `IntersectionObserver` stub instead of removing all stubbed globals, which had also removed the shared fetch fixture.

## Evidence after changes

- Local production-equivalent Cloudflare worker Lighthouse (desktop and mobile, reduced motion): Accessibility 100, Best Practices 88, SEO 100, Agentic Browsing 100. Remaining paste-preventing-inputs audit points into the inert OTP exhibit and is treated as a false positive. Scores compare different origins/environments and are not guarantees.
- `pnpm check:seo` passes against the built worker, including the four security response headers, eight representative page responses, crawler files and social image.
- Focused home/navigation/blocks browser checks pass. See verification below for full suite results.

## Verification

Passed: `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test:coverage` (114 files, 1035 tests), `pnpm check:generated`, `pnpm check:dogfood`, `pnpm check:ai-docs`, `pnpm check:docs-completeness`, `pnpm check:contrast`, `pnpm build:lib`, `pnpm check:seo`, all four `pnpm check:ssr --shard N/4` shards, `pnpm typecheck:storybook`, `pnpm check:storybook`, `pnpm build:storybook`, `pnpm test:storybook` (29), `pnpm test:e2e:consumer` (26), `pnpm test:e2e:consumer-cli` (20), `pnpm test:e2e:contracts` (197 passed, 7 skipped), `pnpm check:angular-compat 21`, `pnpm check:angular-compat 22`, `node scripts/check-copied-source.mjs`, `pnpm pack:lib`, `pnpm pack:cli`, and `pnpm pack:agent`.

Docs browser E2E passed in the two CI-style single-worker shards (49 passed/2 skipped and 49 passed/27 skipped); focused home/navigation/blocks passed 17. SSR gallery passed 26. A parallel multi-worker docs run had two locale-switch timing failures; each passed in isolation and in the single-worker shard. The consumer E2E first hit a transient Vite 504 optimization error and passed in CI mode on retry.

`pnpm format:check` reports only the known pre-existing formatting mismatches in untouched `cli/bin/volt` and `public/web-editor-lite.min.js`; all touched files pass targeted Prettier checking. Storybook completed despite an upstream docgen `EMFILE` warning and bundle-size warning.

## Deferred

- No measurable effect lifecycle, LCP, or CLS regression was found, so hero/playground/reveal rendering was left intact.
- Unknown-route status remains 200 with `noindex`; safe status behavior needs a separate SSR/redirect design.
- No Content Security Policy was introduced without a verified resource allowlist.
- Lighthouse Best Practices remained 88; the changes target confirmed semantics and server headers, not score thresholds.
