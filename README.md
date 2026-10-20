# Biomarkers

A minimal, responsive app to log biomarkers, schedule them with plans and see trends.

## Run

```bash
npm install
npm run dev
```

Open the printed URL (also reachable from a phone/tablet on the same network).

## Structure

```
src/
  domain/      Pure logic & types — no React. (types, schedules, agenda, scoring, presets)
  storage/     Persistence boundary (StorageAdapter) + localStorage impl + migrations
  state/       App store (React context + reducer), persists through a StorageAdapter
  hooks/       useNow — live date/time that ticks every minute
  components/  Shared UI (Sheet, LineChart, BiomarkerPicker, ValueInput, …)
  features/    One folder per section: today, plans, biomarkers, statistics
  styles/      Global CSS with design tokens (light + dark)
```

Data lives in the browser's localStorage under `biomarkers-app/data`. To change
the persisted shape, bump `SCHEMA_VERSION` in `domain/types.ts` and add a step in
`storage/migrations.ts`.

## Install on a phone (PWA)

The app is an installable Progressive Web App: it has a manifest, icons and a
service worker (`public/sw.js`) so it opens full-screen from the home screen and
works offline.

Phones only offer installation for sites served over **HTTPS**, so the build has
to be hosted somewhere (the `http://192.168…` dev URL won't install). Options:

- **GitHub Pages** – push this folder to a GitHub repo, then in
  *Settings → Pages* set *Source* to **GitHub Actions**. The workflow in
  `.github/workflows/deploy.yml` builds and publishes on every push to `main`.
- **Netlify Drop** – run `npm run build` and drag the `dist` folder onto
  https://app.netlify.com/drop.

Then open the URL on the phone:

- **Android (Chrome):** menu ⋮ → *Install app* / *Add to Home screen*.
- **iPhone (Safari):** Share → *Add to Home Screen*.

Note: data is stored in each device's browser storage, so the phone and the
computer each keep their own separate data. After a deploy that changes
`public/sw.js`, bump its `VERSION` so installed copies refresh their cache.
