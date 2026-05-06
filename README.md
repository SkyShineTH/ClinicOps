# ClinicOps (`clinic-demo`)

[![CI](https://github.com/SkyShineTH/Clinic-Demo/actions/workflows/ci.yml/badge.svg)](https://github.com/SkyShineTH/Clinic-Demo/actions/workflows/ci.yml)

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

```powershell
$env:STAFF_API_TOKEN = "local-staff-token"
docker compose up --build
```

This is the preferred local production-style run path because the Docker image uses Next.js standalone output and starts with `node server.js`.

Health and readiness checks:

```text
http://localhost:3000/api/health
http://localhost:3000/api/ready
```

API observability:

- API requests receive an `x-request-id` response header. If the caller sends `x-request-id`, the app preserves it; otherwise it generates one.
- API traffic writes structured JSON logs that can be searched in Docker, Vercel, or external log drains.

Example log:

```json
{"event":"api_request","method":"GET","path":"/api/ready","requestId":"...","timestamp":"2026-05-06T00:00:00.000Z"}
```

Demo backend endpoints:

```text
GET    /api/catalog
GET    /api/availability/slots?branchId=siam&providerId=any
GET    /api/appointments?start=2026-05-01&end=2026-05-07
GET    /api/booking-requests?branchId=siam&serviceId=veneers&status=pending
POST   /api/booking-requests
GET    /api/booking-requests/:id
PATCH  /api/booking-requests/:id
DELETE /api/booking-requests/:id
GET    /api/staff/inventory
POST   /api/staff/inventory
PATCH  /api/staff/inventory/:id
DELETE /api/staff/inventory/:id
GET    /api/staff/pipeline
POST   /api/staff/pipeline
PATCH  /api/staff/pipeline/:id
DELETE /api/staff/pipeline/:id
GET    /api/staff/marketing
POST   /api/staff/marketing
PATCH  /api/staff/marketing/:id
DELETE /api/staff/marketing/:id
GET    /api/staff/schedule
POST   /api/staff/schedule
PATCH  /api/staff/schedule/:id
DELETE /api/staff/schedule/:id
GET    /api/staff/clinical-visits
POST   /api/staff/clinical-visits
DELETE /api/staff/clinical-visits/:id
PATCH  /api/staff/clinical-visits/:id/note
GET    /api/staff/users
POST   /api/staff/users
DELETE /api/staff/users/:id
GET    /api/staff/permissions
PATCH  /api/staff/permissions/:userId/:capability
GET    /api/staff/audit
```

Database commands:

```bash
npm run db:migrate
npm run smoke:staff   # run against an already-running app, defaults to http://localhost:3000
```

`npm run db:migrate` expects `DATABASE_URL` to be set in the shell. It records applied files in the `schema_migrations` table with a SHA-256 checksum and skips migrations that already match. If an applied migration file changes later, the command fails and expects a new migration file instead.

`docker compose up --build` starts PostgreSQL on host port `5433`, initializes `database/migrations/*.sql` on first database volume creation, and runs the app with `DATABASE_URL` pointed at the compose database. For an existing database, use `npm run db:migrate` to apply new migration files. The compose password is for local development only; override `POSTGRES_PASSWORD` and `DATABASE_URL` in real environments.

Staff demo modules use PostgreSQL-backed persistence when `DATABASE_URL` is configured and fall back to server memory otherwise. Mutating staff endpoints are open in local development unless `STAFF_API_TOKEN` is set. In `NODE_ENV=production`, staff mutations fail closed unless `STAFF_API_TOKEN` is configured; clients then need to send the same value in the `x-staff-demo-token` header. The built-in staff UI assumes no token for local `npm run dev` demo use.

If port `3000` is already busy, set `APP_PORT` before running compose, for example `APP_PORT=3100 docker compose up --build`.

CI now verifies lint, a production Next.js build, a Docker image build, and a Docker Compose full-stack smoke test against `/api/ready` plus the staff demo mutation flow.

CI quality gates:

```text
npm ci
npm run lint
npm run build
docker build
docker compose up --detach --build --wait
GET /api/ready
npm run smoke:staff
docker compose down --volumes --remove-orphans
```

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
