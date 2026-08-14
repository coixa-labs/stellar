# Publishing @coixa/stellar

This package currently lives inside `coixa-mobile` at `packages/stellar` so Coixa can dogfood it. To open-source:

1. Create a dedicated repo (suggested: `coixa/stellar`).
2. Copy this folder to the repo root (or keep a `packages/stellar` monorepo layout).
3. Replace the placeholder `repository.url` in `package.json`.
4. Ensure npm org `@coixa` exists (or rename the package to `coixa-stellar`).
5. `npm publish --access public` from a clean tag (`v0.1.0`).
6. Point Coixa mobile at the published version instead of `file:packages/stellar`.

Do **not** publish Coixa wallet secrets, SecureStore code, or app-only services with this package.
