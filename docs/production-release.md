# Production and future AR work

`main` is the production website. Try On / Lash Mirror stays on
`feat/premium-lash-try-on` until the client approves that feature for release.

Bring shared design changes across selectively. Do not merge the entire AR
branch into production. Production has no Try On links, route, components,
camera code, MediaPipe dependency, models, workers, or WASM assets.

`npm run build` checks source before building and the static `out` directory
after building. Both checks must pass before deployment.

Build and deploy from this production checkout, never the AR checkout:

```sh
npm ci
npm run lint
npm run build
firebase deploy --only hosting --project prolash-ec7ba --non-interactive
```
