# ClinicOps (`clinic-demo`)

Production-style DevOps portfolio project built from a premium dental clinic marketing site (Bangkok-themed) plus a mock staff app — **not a real clinic**. No real patient data (PHI).

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

## DevOps / Production Readiness

Milestone 1, **Containerized Production App**, demonstrates a production-oriented Next.js build that can run as a Docker container, expose a Kubernetes/Docker-friendly health endpoint, and pass CI checks before deployment.

Milestone 2, **Persistent Data Layer**, adds PostgreSQL-backed booking requests for containerized environments. The app still falls back to the in-memory demo store when `DATABASE_URL` is not set, so normal local frontend work remains simple.

Local development:

```bash
npm install
npm run dev
```

Build, lint, and production start:

```bash
npm run lint
npm run build
npm run start
```

Docker build:

```bash
docker build -t clinicops:milestone-2 .
```

Docker run:

```bash
docker run --rm -p 3000:3000 clinicops:milestone-2
```

Docker Compose with PostgreSQL:

```bash
docker compose up --build
```

Health and readiness checks:

```text
http://localhost:3000/api/health
http://localhost:3000/api/ready
```

Database commands:

```bash
npm run db:migrate
```

`npm run db:migrate` expects `DATABASE_URL` to be set in the shell. `docker compose up --build` starts PostgreSQL on host port `5433`, initializes `database/migrations/*.sql`, and runs the app with `DATABASE_URL` pointed at the compose database. The compose password is for local development only; override `POSTGRES_PASSWORD` and `DATABASE_URL` in real environments.

If port `3000` is already busy, set `APP_PORT` before running compose, for example `APP_PORT=3100 docker compose up --build`.

CI now verifies lint, a production Next.js build, a Docker image build, and a Docker Compose smoke test against `/api/ready`.

## Features

- **Marketing:** Home, services, technology, team, gallery, branches, FAQ, booking, legal pages (privacy / terms / cookies) — **Thai and English** via [`next-intl`](https://next-intl.dev). Copy lives in `src/messages/th.json` and `src/messages/en.json`.
- **Booking:** `/booking` — requests are stored in PostgreSQL when `DATABASE_URL` is configured, with an in-memory fallback for no-DB local demo work.
- **Staff:** `/app/reception` front-desk style dashboard plus stub links to other app routes (not under `[locale]`).

## Project layout

| Path | Purpose |
|------|---------|
| `src/app/[locale]/` | Marketing routes + i18n |
| `src/app/app/` | Staff app shell |
| `src/i18n/` | Routing, navigation, message loading |
| `src/messages/` | TH / EN strings |
| `database/migrations/` | PostgreSQL schema and seed data for containerized local testing |

## Images

- **Home hero:** `public/images/hero-clinic.jpg` — credits in `src/lib/hero-photo.ts` and under the image on the site.
- **Stock set:** `public/images/points/*.jpg` — Unsplash; alt text and photo links in `src/lib/stock-photos.ts` and under cards where shown.
- **SVG illustrations:** `src/components/illustrations/`

## Stack

Next.js (App Router) · React · Tailwind CSS v4 · Noto Sans Thai · next-intl · PostgreSQL

## CI/CD

- **CI:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — runs `lint`, `build`, a Docker image build, and a Docker Compose readiness smoke test on push/PR to `main` or `master`.
- **Deploy (optional):** [`.github/workflows/deploy-vercel.yml`](.github/workflows/deploy-vercel.yml) — manual **Run workflow** from the Actions tab after setting GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (see comments in the workflow file). Connecting the repo in the Vercel dashboard also gives automatic preview/production deploys without this workflow.
- **Dependabot:** [`.github/dependabot.yml`](.github/dependabot.yml)

## Notes

Without `DATABASE_URL`, booking and queue data are kept in server process memory for demo-only local development. With Docker Compose, booking requests are stored in PostgreSQL.
