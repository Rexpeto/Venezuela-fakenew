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
| `TURSO_DATABASE_URL` | yes | `libsql://…` (currently empty in `[vars]` — fill it) |
| `LLM_MODEL` | recommended | e.g. `claude-haiku-4-5-20251001` or `gpt-4o-mini` |
| `LLM_BASE_URL` | optional | only for HuggingFace/Groq OpenAI-compat endpoints |
| `CORS_ORIGIN` | **yes for prod** | exact frontend origin; defaults to `*` (fail-open) |

> ⚠️ `CORS_ORIGIN` defaults to `*`. Set it to the exact frontend domain
> **before** going live, or any site can call the API.

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
curl -X POST https://<worker>.workers.dev/rpc/verifyClaim \
  -H 'Content-Type: application/json' \
  -d '{"claim":"Delcy anunció un aumento salarial a $800"}'
```

---

## 2. Frontend → static host (Cloudflare Pages / etc.)

From `apps/frontend/`. Build-time env (Astro inlines `PUBLIC_*`):

```bash
PUBLIC_MOCK_API=false \
PUBLIC_API_URL=https://<worker>.workers.dev \
bun run build
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
