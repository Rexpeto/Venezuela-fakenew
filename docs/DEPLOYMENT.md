# Deployment — Portal AntiFake Venezuela

Two deployables: **backend** (Cloudflare Workers) and **frontend** (Astro,
Cloudflare adapter). Deploy the backend first — the frontend needs its URL.

---

## 1. Backend → Cloudflare Workers

From `apps/backend/`.

### 1.1 Set secrets

```bash
wrangler secret put TURSO_AUTH_TOKEN
wrangler secret put LLM_API_KEY        # sk-ant-… → Anthropic; otherwise OpenAI-compatible
wrangler secret put TAVILY_API_KEY
```

Non-secret config — either as secrets or in `wrangler.toml [vars]`:

| Var | Required | Notes |
|-----|----------|-------|
| `TURSO_DATABASE_URL` | yes | `libsql://…` — set via `wrangler secret put` (do **not** put an empty entry in `[vars]`; a `[vars]` value overrides a same-named secret on every deploy) |
| `LLM_MODEL` | recommended | e.g. `claude-haiku-4-5-20251001` or `gpt-4o-mini` |
| `LLM_BASE_URL` | optional | only for HuggingFace/Groq OpenAI-compat endpoints |
| `CORS_ORIGIN` | **yes for prod** | exact frontend origin(s), comma-separated; defaults to `*` (fail-open) |
| `CORS_ORIGIN_PATTERN` | optional | anchored regex for dynamic allows, e.g. local dev: `^http://(localhost\|127\.0\.0\.1)(:\d+)?$` |

> ⚠️ CORS defaults to `*` when **both** `CORS_ORIGIN` and `CORS_ORIGIN_PATTERN`
> are unset. Set the exact origin(s) **before** going live, or any site can call
> the API. Multiple origins are comma-separated, e.g.
> `https://verificavenezuela.com,https://staging.example.com`. Do not include a
> trailing slash — browser `Origin` headers never have one.
>
> `CORS_ORIGIN_PATTERN` lets you allow a family of origins without code changes
> (local dev on any port, per-PR preview URLs, etc.). **Keep it anchored**
> (`^…$`) — an unanchored `localhost` would also match `localhost.evil.com`.
> An invalid regex is ignored (falls back to the exact `CORS_ORIGIN` list).

### 1.2 Push the DB schema (once, before first deploy)

```bash
TURSO_DATABASE_URL=libsql://… TURSO_AUTH_TOKEN=… bun run db:push
```

Includes the `claims.user_ip` column and the `sources` table.

### 1.3 Deploy

```bash
bun run deploy   # wrangler deploy
```

`wrangler.toml` sets `compatibility_flags = ["nodejs_compat"]` — required by
the AI SDK. The DB uses `@libsql/client/http` (no native deps).

### 1.4 Smoke test

```bash
curl https://<worker>.workers.dev/health            # {"status":"ok"}
# oRPC RPCHandler uses a wire envelope: wrap input in {"json": …} and the
# response comes back the same way ({"json": {...}}). A bare {"claim": …}
# body fails validation with BAD_REQUEST.
curl -X POST https://<worker>.workers.dev/rpc/verifyClaim \
  -H 'Content-Type: application/json' \
  -d '{"json":{"claim":"Delcy anunció un aumento salarial a $800"}}'
```

---

## 2. Frontend → Cloudflare Workers (Astro SSR)

From `apps/frontend/`. The `@astrojs/cloudflare` adapter builds an SSR Worker;
`apps/frontend/wrangler.jsonc` points `main` at `./dist/_worker.js/index.js` and
serves static files via the `ASSETS` binding. `PUBLIC_*` is inlined at build time.

```bash
PUBLIC_MOCK_API=false \
PUBLIC_API_URL=https://<backend-worker>.workers.dev \
bun run build
wrangler deploy   # manual; en CI lo hace Workers Builds (ver §4)
```

| Var | Effect |
|-----|--------|
| `PUBLIC_MOCK_API` | `false` → real oRPC client; anything else → in-memory mocks |
| `PUBLIC_API_URL`  | backend base URL; the client appends `/rpc` |

Leave `PUBLIC_MOCK_API` unset (or not `false`) to run the UI fully on mock data.

---

## 3. Go-live checklist

- [ ] Backend secrets set (`TURSO_AUTH_TOKEN`, `LLM_API_KEY`, `TAVILY_API_KEY`)
- [ ] `TURSO_DATABASE_URL` + `LLM_MODEL` configured
- [ ] `db:push` run against the prod Turso DB
- [ ] `CORS_ORIGIN` = exact frontend origin (not `*`)
- [ ] Backend deployed; `/health` ok
- [ ] Frontend built with `PUBLIC_MOCK_API=false` + `PUBLIC_API_URL`
- [ ] `/verificar`, `/asistente`, `/patrones` work end-to-end against the live API

---

## 4. CI/CD — Cloudflare Workers Builds

El deploy lo maneja **Cloudflare Workers Builds**: Cloudflare se conecta al repo
vía su GitHub App y buildea/despliega desde su lado. **No hay tokens ni secrets de
Cloudflare en GitHub.**

- Solo **`main`** despliega (a producción). Los builds de ramas no productivas
  quedan **deshabilitados** — no hay preview remoto.
- Para previsualizar cambios, cada quien lo corre **local** (ver §5).

### 4.1 Conectar cada worker (dashboard, una vez)

Son dos workers, así que se conecta el repo a cada uno. En Cloudflare →
**Workers & Pages → [worker] → Settings → Build → Connect** repo
`Rexpeto/Venezuela-fakenew`:

**Backend** (`backend`)
- Root directory: `apps/backend`
- Build command: `cd ../.. && bun install && bun run --filter '@repo/core' build`
- Deploy command: `bunx wrangler deploy`
- Production branch: `main` · **Non-production branch builds: deshabilitado**
- Build watch paths (include): `apps/backend/*`, `packages/core/*`

**Frontend** (`frontend-verifica-venezuela`)
- Root directory: `apps/frontend`
- Build command: `cd ../.. && bun install && bun run --filter '@repo/core' build && cd apps/frontend && bun run build`
- Build environment variables: `PUBLIC_MOCK_API=false`, `PUBLIC_API_URL=https://backend.verificavenezuela.workers.dev`
- Deploy command: `bunx wrangler deploy`
- Production branch: `main` · **Non-production branch builds: deshabilitado**
- Build watch paths (include): `apps/frontend/*`, `packages/core/*`

> `bun install` corre desde la raíz del repo (workspace) y construye `@repo/core`
> antes — sin eso los imports de `@repo/core` no resuelven. Workers Builds usa
> `bun` automáticamente al detectar `bun.lock`.

### 4.2 Secrets del backend (dashboard, una vez)

No van en GitHub. Se setean en el worker (Settings → Variables and Secrets) o con
`wrangler secret put` desde tu máquina: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`,
`LLM_API_KEY`, `TAVILY_API_KEY`, `LLM_MODEL`, `CORS_ORIGIN`. Y `db:push` contra la
Turso de prod (§1.2). El frontend no tiene secrets propios.

---

## 5. Preview local

No hay preview remoto. Para ver cambios antes de mergear, cada quien corre el
proyecto localmente:

```bash
bun install
bun run --filter '@repo/core' build     # una vez (o tras cambiar core)

# Backend (Worker) → http://localhost:8787
#   copia apps/backend/.dev.vars.example → .dev.vars y completa TURSO_*, LLM_API_KEY, TAVILY_API_KEY
bun run dev:backend

# Frontend (Astro) → http://localhost:4321
#   copia apps/frontend/.env.example → .env (ya trae PUBLIC_API_URL=http://localhost:8787)
bun run dev:frontend
```

Sin `TURSO_*` el backend no levanta; sin las keys de LLM/Tavily, verificar y chat no
responden, pero el resto de la UI funciona con el backend local.
