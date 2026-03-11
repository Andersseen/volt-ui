# VoltUi

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Deploy to Cloudflare Pages

This repository is configured to deploy to Cloudflare Pages using Wrangler.

### Local deploy

```bash
pnpm run deploy:cf
```

Production deploy to the `master` branch target:

```bash
pnpm run deploy
```

### Required Cloudflare auth

Wrangler needs these environment variables:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### GitHub Actions auto deploy

When `master` is updated, GitHub Actions runs `.github/workflows/deploy-cloudflare-pages.yml` and deploys automatically.

Configure these repository secrets in GitHub:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

If your Cloudflare Pages project is not named `volt-ui`, update:

- `wrangler.toml`
- `package.json` scripts `deploy:cf` and `deploy:cf:master`
