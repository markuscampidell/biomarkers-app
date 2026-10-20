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

## Install the app

Open **https://markuscampidell.github.io/biomarkers-app/** on your phone and tap
**Install app** in the banner at the top. On iPhone the banner shows how: Share →
**Add to Home Screen**. The app then opens full-screen from the home screen and
works offline. Your data stays on your own device.

## Publishing (maintainer only)

The site is hosted on GitHub Pages. Every push to `main` builds and publishes it
automatically via `.github/workflows/deploy.yml` — nothing else to do.

It's an installable Progressive Web App (manifest, icons, service worker in
`public/sw.js`). After a change to `public/sw.js`, bump its `VERSION` so
installed copies refresh their cache.
