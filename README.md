# Clinic Demo (`clinic-demo`)

Premium dental clinic marketing site (Bangkok-themed) plus a mock staff app — **not a real clinic**. No real patient data (PHI).

## Live demo

**https://clinic-demo.skyshine.online**

Thai routes use the `/th` prefix and English routes use `/en`; switch languages from the header.

## Requirements

- **Node.js** — version in [`.nvmrc`](.nvmrc) (use `nvm use` / `fnm use`). See [`package.json` → `engines`](package.json).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run lint    # ESLint
npm run build   # production build (includes typecheck via Next)
npm run start   # run the production build locally
```

## Features

- **Marketing:** Home, services, technology, team, gallery, branches, FAQ, booking, legal pages (privacy / terms / cookies) — **Thai and English** via [`next-intl`](https://next-intl.dev). Copy lives in `src/messages/th.json` and `src/messages/en.json`.
- **Booking:** `/booking` — requests go to an in-memory API (data may be lost after a server restart).
- **Staff:** `/app/reception` front-desk style dashboard plus stub links to other app routes (not under `[locale]`).

## Project layout

| Path | Purpose |
|------|---------|
| `src/app/[locale]/` | Marketing routes + i18n |
| `src/app/app/` | Staff app shell |
| `src/i18n/` | Routing, navigation, message loading |
| `src/messages/` | TH / EN strings |

## Images

- **Home hero:** `public/images/hero-clinic.jpg` — credits in `src/lib/hero-photo.ts` and under the image on the site.
- **Stock set:** `public/images/points/*.jpg` — Unsplash; alt text and photo links in `src/lib/stock-photos.ts` and under cards where shown.
- **SVG illustrations:** `src/components/illustrations/`

## Stack

Next.js (App Router) · React · Tailwind CSS v4 · Noto Sans Thai · next-intl

## CI/CD

- **CI:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — runs `lint` and `build` on push/PR to `main` or `master`.
- **Deploy (optional):** [`.github/workflows/deploy-vercel.yml`](.github/workflows/deploy-vercel.yml) — manual **Run workflow** from the Actions tab after setting GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (see comments in the workflow file). Connecting the repo in the Vercel dashboard also gives automatic preview/production deploys without this workflow.
- **Dependabot:** [`.github/dependabot.yml`](.github/dependabot.yml)

## Notes

Booking and queue data are kept in server process memory for demo only — not suitable for production use.
