# TaskLuid Frontend Deploy Guardrails

This document captures the minimum controls required to prevent production drift and auth routing regressions.

## 1) GitHub Branch Protection (manual)

Configure branch protection on `main` with:

- Require a pull request before merging
- Require approvals (at least 1)
- Require status checks to pass:
  - `🏗️ Build Frontend`
  - `🚀 Deploy Frontend`
- Require review from Code Owners
- Restrict who can push to matching branches

These controls prevent direct changes to deployment files without review.

## 2) Protected Files (CODEOWNERS)

The following files are treated as critical:

- `.github/workflows/*`
- `docker-compose.yml`
- `nginx.conf`
- `docker-entrypoint.sh`
- `Dockerfile`
- `scripts/check-nginx-routing.sh`
- `scripts/check-runtime-deploy.sh`

## 3) CI/CD Runtime Checks

Deploy pipeline now validates:

- `docker compose config` resolves successfully
- Backend network exists: `task-luid-backend_app-network` (or `BACKEND_DOCKER_NETWORK`)
- Frontend container is attached to backend network
- Frontend container resolves and reaches backend:
  - DNS: `getent hosts task-luid-backend`
  - HTTP: `curl http://task-luid-backend:8000/auth/status`
- Runtime nginx config does not contain unresolved `${BACKEND_HOST}`
- Public smoke checks:
  - `https://taskluid.com/auth/status` returns 200 JSON
  - `https://taskluid.com/auth/callback?...` returns 200 HTML (not 502 JSON)

## 4) Emergency Verification (manual on server)

From `/opt/task-luid/task-luid-web`:

```bash
BACKEND_DOCKER_NETWORK=task-luid-backend_app-network \
  ./scripts/check-runtime-deploy.sh
```

## 5) Drift Repair (manual)

If server drift is suspected:

```bash
cd /opt/task-luid/task-luid-web
git fetch origin
git reset --hard origin/main
docker compose pull taskluid-frontend
docker compose up -d --force-recreate taskluid-frontend
```

Then re-run runtime verification script.
