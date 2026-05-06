# ClinicOps (`clinic-demo`)

[![CI](https://github.com/SkyShineTH/Clinic-Demo/actions/workflows/ci.yml/badge.svg)](https://github.com/SkyShineTH/Clinic-Demo/actions/workflows/ci.yml)

Production-style Next.js application used to demonstrate CI/CD, Dockerized deployment, environment management, and operational readiness.

Live demo: https://clinic-demo.skyshine.online

ClinicOps is a bilingual dental clinic demo for Thai and English users. It has public marketing pages, a lightweight booking flow, and a staff dashboard shell, but it is not a real clinic system and must not be used with real patient data.

## Why This App Exists

This repository is positioned as a DevOps-focused portfolio project. The product surface stays intentionally small so the operational work is easy to inspect:

- CI quality gates for linting, type checking, production builds, Docker builds, and smoke checks.
- Production-style Docker packaging with Next.js standalone output.
- Environment-driven database and staff API behavior with safe local fallbacks.
- Lightweight health and readiness endpoints for container platforms.
- Operational documentation for local development, deployment, release, and rollback.

## Tech Stack

- Next.js 16 App Router and React 19
- TypeScript
- Tailwind CSS v4
- `next-intl` for Thai and English routes
- PostgreSQL for production-like booking and staff demo persistence
- Docker and Docker Compose
- GitHub Actions and Dependabot

## Architecture Summary

| Area | Path | Notes |
| --- | --- | --- |
| Marketing app | `src/app/[locale]/` | Thai routes use `/th`; English routes use `/en`. |
| Staff app shell | `src/app/app/` | Demo operational dashboards only. |
| API routes | `src/app/api/` | Booking, catalog, availability, staff demo APIs, health, readiness. |
| Storage | `src/lib/*store.ts` | PostgreSQL when `DATABASE_URL` is set, memory fallback otherwise. |
| Database migrations | `database/migrations/` | Applied by Compose init or `npm run db:migrate`. |
| CI/CD | `.github/workflows/` | CI quality gates and optional manual Vercel deploy. |
| Container runtime | `Dockerfile`, `docker-compose.yml` | Standalone Next.js app plus local PostgreSQL. |

## Local Development

Requirements:

- Node.js from [`.nvmrc`](.nvmrc)
- npm

Install and run:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Quality commands:

```bash
npm run lint
npm run typecheck
npm run build
```

Database migration for an external PostgreSQL database:

```bash
DATABASE_URL=postgres://user:password@localhost:5432/clinicops npm run db:migrate
```

PowerShell equivalent:

```powershell
$env:DATABASE_URL = "postgres://user:password@localhost:5432/clinicops"
npm run db:migrate
```

## Docker Workflow

Build the production image:

```bash
docker build -t clinicops:local .
```

Run the app container without PostgreSQL. This uses the safe in-memory demo store:

```bash
docker run --rm -p 3000:3000 clinicops:local
```

Run the production-like local stack with PostgreSQL:

```bash
docker compose up --build
```

Run detached and wait for health checks:

```bash
docker compose up --detach --build --wait
```

Stop and remove local volumes:

```bash
docker compose down --volumes --remove-orphans
```

PowerShell port override:

```powershell
$env:APP_PORT = "3100"
docker compose up --build
```

The Docker image uses `output: "standalone"` from [next.config.ts](next.config.ts), copies only the runtime output, runs as a non-root user, exposes port `3000`, and includes a container health check for `/api/health`.

## CI/CD Pipeline

CI runs on push and pull request events targeting `main` or `master`. It also supports manual `workflow_dispatch`.

The CI workflow in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs:

```text
npm ci
npm run lint
npm run typecheck
npm run build
docker build --tag clinicops:${{ github.sha }} .
docker compose up --detach --build --wait
GET /api/ready
npm run smoke:staff
docker compose down --volumes --remove-orphans
```

There is no broad unit test suite yet. The current smoke coverage is intentionally small: the Compose stack must become ready and the staff demo mutation flow must pass against a running app.

Optional deployment is defined in [`.github/workflows/deploy-vercel.yml`](.github/workflows/deploy-vercel.yml). It is manual and requires these GitHub Actions secrets:

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

Dependabot is configured in [`.github/dependabot.yml`](.github/dependabot.yml) for npm dependencies and GitHub Actions updates.

## Deployment Notes

Recommended deployment options:

- Docker platform: build the image from `Dockerfile`, provide production environment variables, and route traffic to port `3000`.
- Vercel: connect the repository in Vercel or run the manual GitHub Actions deployment workflow.

Operational expectations:

- Set `DATABASE_URL` for persistent booking and staff demo data.
- Set `STAFF_API_TOKEN` in production so staff mutation endpoints fail closed unless callers send `x-staff-demo-token`.
- Use `/api/health` for process health and `/api/ready` for database readiness.
- Do not store real PHI or production clinic data in this demo.

## Environment Variables

Start from [.env.example](.env.example). It contains non-secret local defaults only.

| Variable | Required | Purpose | Safe default |
| --- | --- | --- | --- |
| `DATABASE_URL` | No | Enables PostgreSQL-backed booking and staff demo storage. | Empty means memory store. |
| `DATABASE_CONNECT_TIMEOUT_SECONDS` | No | PostgreSQL connection timeout. | `5` |
| `DATABASE_IDLE_TIMEOUT_SECONDS` | No | PostgreSQL idle connection timeout. | `20` |
| `DATABASE_POOL_MAX` | No | PostgreSQL connection pool size. | `5` |
| `DATABASE_SSL` | No | Uses required SSL when set to `true`. | `false` |
| `STAFF_API_TOKEN` | Production yes | Protects staff mutation endpoints with `x-staff-demo-token`. | Empty in local dev. |
| `APP_PORT` | No | Host port for Docker Compose app service. | `3000` |
| `POSTGRES_PORT` | No | Host port for Docker Compose PostgreSQL. | `5433` |
| `POSTGRES_DB` | No | Compose database name. | `clinicops` |
| `POSTGRES_USER` | No | Compose database user. | `clinicops` |
| `POSTGRES_PASSWORD` | No | Compose local database password. | Local demo value only. |
| `SMOKE_BASE_URL` | No | Target URL for `npm run smoke:staff`. | `http://localhost:3000` |

## Health Check

Process health:

```bash
curl http://localhost:3000/api/health
```

Example response:

```json
{
  "status": "ok",
  "app": "clinic-demo",
  "service": "ClinicOps",
  "timestamp": "2026-05-06T00:00:00.000Z",
  "version": "0.1.0",
  "uptime": {
    "seconds": 42,
    "startedAt": "2026-05-05T23:59:18.000Z"
  },
  "runtime": {
    "node": "v22.0.0",
    "environment": "production"
  }
}
```

Readiness:

```bash
curl http://localhost:3000/api/ready
```

`/api/ready` returns `503` when a configured database cannot be reached. If `DATABASE_URL` is not set, the database check is skipped and the app remains usable with in-memory demo data.

API requests receive an `x-request-id` response header. API traffic emits structured JSON logs, and booking API handlers emit booking-specific structured events with action, status, duration, storage mode, path, method, and request ID.

## Release And Rollback Strategy

1. Open a pull request and wait for CI to pass.
2. Merge to `main` after review.
3. Deploy using the target platform:
   - Docker: build and tag an immutable image, for example `clinicops:<git-sha>`.
   - Vercel: run the manual deployment workflow or use Vercel Git integration.
4. Verify `/api/health`, `/api/ready`, key marketing routes, and the booking form.
5. Roll back by redeploying the previous known-good image tag or using the previous Vercel deployment.
6. Database changes should be additive. If a rollback needs schema changes, ship a new forward migration rather than editing an applied migration.

## Scope Control

This is not a hospital or clinic management system. Clinical features stay lightweight:

- Public marketing pages
- Thai and English content
- Booking form and booking API
- Staff dashboard shell and demo operational modules

## Future Improvements

- Add a small API smoke script for the public booking flow.
- Add preview deployment comments on pull requests.
- Publish Docker images to a registry from CI.
- Add container vulnerability scanning.
- Add basic OpenTelemetry traces if the deployment target supports it.
- Add backup and restore documentation for the PostgreSQL demo database.

## Image Credits

- Home hero: `public/images/hero-clinic.jpg`
- Stock image set: `public/images/points/*.jpg`
- Metadata and credits are maintained in `src/lib/hero-photo.ts` and `src/lib/stock-photos.ts`.
