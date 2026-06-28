# Venezuela FakeNews — Portal de Verificación + Chatbot Sismo

Monorepo para combatir desinformación sobre Venezuela, enfocado en el sismo de junio 2026. Incluye un portal web de verificación de claims (Verdadero/Falso/Dudoso), un chatbot temático, y un servidor MCP para asistentes de IA.

## Key Features

- **Portal de verificación** — Ingresá un claim, obtené veredicto con nivel de confianza, explicación, patrones detectados y fuentes oficiales
- **Chatbot del sismo** — Respondé preguntas sobre daños, víctimas, ayuda humanitaria y desinformación detectada
- **6+ patrones de desinformación** implementados y detectables (videos descontextualizados, contenido IA, usurpación de canales, falsos anuncios, operaciones YouTube, desinformación salarial)
- **Servidor MCP** para que asistentes de IA consuman la misma base de conocimiento
- **Búsqueda Tavily opcional** — consultas en tiempo real a fuentes confiables
- **Historial de verificaciones** persistido en SQLite

## Tech Stack

| Capa       | Tecnología                                                  |
| ---------- | ----------------------------------------------------------- |
| Frontend   | Astro o Next.js (decisión pendiente)                        |
| Backend    | Hono + Bun                                                  |
| ORM        | Drizzle                                                      |
| Base datos | SQLite                                                       |
| API        | oRPC (type-safe)                                            |
| Búsqueda   | Tavily Search API                                            |
| Validación | Zod                                                          |
| Monorepo   | Bun workspaces                                               |
| MCP Server | `@modelcontextprotocol/sdk` + TypeScript                     |

## Architecture

```
venezuela-fakenew/
├── apps/
│   ├── frontend/         ← Portal web (Astro o Next.js)
│   └── backend/          ← API Hono + oRPC + Drizzle
├── packages/
│   ├── core/             ← Lógica compartida (PATTERNS, verify, key facts)
│   └── mcp-server/       ← Servidor MCP para asistentes IA
└── docs/                 ← Notas e investigación
```

El backend expone procedures oRPC (`verifyClaim`, `getPatterns`, `chat`, `searchSources`, `getKeyFacts`) que consume el frontend y potencialmente el MCP.

## Equipo

| Nombre             | Rol                        | Contacto                                   |
| ------------------ | -------------------------- | ------------------------------------------ |
| Michel Novellino   | Frontend (Diseño)          | michelnovellino.programador@gmail.com      |
| Carlos Gallardo    | Frontend                   | carlosdanielgallardoparra16@gmail.com      |
| Stephan Calderín   | Backend + Deployment       | stephancalderin@gmail.com                  |
| Blure              | Backend + BD               | rpindv@gmail.com                           |
| José Alejandro Castro | Coordinación + MCP/Core | a.j.castro.b@gmail.com                     |

## Project Status

**Fase 1 — Definición y Diseño** (27 de junio 2026). Decisiones pendientes:
- Stack frontend (Astro vs Next.js)
- Integración LLM (Tavily + reglas vs LLM real)
- Plataforma de deploy
- Nombre del producto

---

## Servidor MCP (packages/mcp-server)

El servidor MCP se ejecuta como subproceso del host (opencode, Claude Desktop, etc.) vía STDIO.

### Prerequisites

- Node.js 18+ (20+ recomendado)
- (Opcional) API key de [Tavily](https://tavily.com)

### Getting Started

```bash
bun install
bun run build
bun run inspect   # Probar con inspector MCP
```

### Herramientas expuestas

| Tool | Input | Output |
|------|-------|--------|
| `get_fakenews_patterns` | Ninguno | Lista de 6 patrones con ejemplos y detección |
| `verify_claim` | `claim`, `context?` | Análisis + patrones coincidentes + búsqueda web |
| `search_official_sources` | `topic`, `max_results?` | Fuentes confiables (USGS, IOM, Reuters, etc.) |
| `generate_factcheck_report` | `topic` | Reporte estructurado con datos del cuaderno |

### Configuración en OpenCode

```json
{
  "mcpServers": {
    "venezuela-fakenews": {
      "command": "node",
      "args": ["<path>/packages/mcp-server/dist/index.js"]
    }
  }
}
```

## Variables de entorno

Cada paquete trae su archivo de ejemplo — cópialo y rellená los valores.

| Paquete | Archivo ejemplo | Copiar a |
|---------|-----------------|----------|
| `apps/backend` | `.dev.vars.example` | `.dev.vars` (local) · `wrangler secret put` (prod) |
| `apps/frontend` | `.env.example` | `.env` |
| `packages/mcp-server` | `.env.example` | `.env` |

### Backend (`apps/backend`)

En local viven en `.dev.vars`; en producción se setean como secrets del Worker (`bunx wrangler secret put <NOMBRE>`). **Nunca** los pongas en `[vars]` de `wrangler.toml` — se escriben en texto plano y pisan el secret.

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `TURSO_DATABASE_URL` | Sí | URL de la base libSQL/Turso (`libsql://...`). |
| `TURSO_AUTH_TOKEN` | Sí | Token de auth de Turso. |
| `LLM_API_KEY` | Sí | Key del LLM. Una `sk-ant-…` enruta al proveedor nativo de Anthropic; cualquier otra usa el endpoint OpenAI-compatible. |
| `LLM_MODEL` | No | Modelo a usar. Default: `claude-haiku-4-5-20251001` (Anthropic) o `gpt-4o-mini` (OpenAI-compat). |
| `LLM_BASE_URL` | No | Base URL OpenAI-compatible (Groq, HuggingFace…). Omitir para Anthropic/OpenAI. |
| `TAVILY_API_KEY` | Sí | Key de Tavily para búsqueda en tiempo real. |
| `CORS_ORIGIN` | Sí (prod) | Orígenes exactos permitidos, separados por coma. **Si esto y `CORS_ORIGIN_PATTERN` quedan vacíos, CORS abre a `*` (fail-open) — fijalo antes de producción.** |
| `CORS_ORIGIN_PATTERN` | No | Regex anclado para orígenes dinámicos (p. ej. cualquier puerto de localhost en dev). |

### Frontend (`apps/frontend`)

Astro: solo las variables con prefijo `PUBLIC_` llegan al cliente.

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `PUBLIC_API_URL` | Sí | URL base del backend; el cliente le añade `/rpc`. Default: `http://localhost:8787`. |
| `PUBLIC_MOCK_API` | No | `false` usa el backend real; cualquier otro valor (o ausente) sirve datos mock. |

### MCP server (`packages/mcp-server`)

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `TAVILY_API_KEY` | No | Sin ella, `verify_claim` y `search_official_sources` usan solo el conocimiento base (sin búsqueda web). |

## License

MIT
