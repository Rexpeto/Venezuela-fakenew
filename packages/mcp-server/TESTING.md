# Cómo Probar el MCP Server con el Inspector

## Requisitos

- Node.js + Bun instalados
- Variables de entorno en `.env` (ya creado en este directorio)

## 1. Construir el servidor

```bash
cd packages/mcp-server
bun run build
```

Esto compila `src/index.ts` → `dist/index.js`.

## 2. Lanzar el Inspector

```bash
cd packages/mcp-server
bun run inspect
```

Esto ejecuta `npx @modelcontextprotocol/inspector dist/index.js`.

## 3. Conectar en el navegador

Se abrirá automáticamente `http://localhost:6274`. Si no, ve manualmente a esa URL.

En la UI del Inspector:

1. **Transport Type** → selecciona `STDIO` (ya debería estar)
2. **Command** → debe decir `dist/index.js` (ya debería estar)
3. Haz clic en **Connect**

## 4. Probar las herramientas

Una vez conectado, verás el servidor `venezuela-fakenews-mcp` versión `0.1.0`.

### Listar herramientas

Ve a la pestaña **Tools** y haz clic en **List Tools**. Deberías ver:

| Tool                        | Descripción                           |
| --------------------------- | ------------------------------------- |
| `get_fakenews_patterns`     | Patrones de desinformación (sin args) |
| `verify_claim`              | Verifica un claim con Tavily          |
| `search_official_sources`   | Busca fuentes oficiales               |
| `generate_factcheck_report` | Genera reporte estructurado           |

### Ejecutar una tool

1. Haz clic en cualquier tool de la lista
2. Si tiene parámetros, complétalos en los campos que aparecen
3. Haz clic en **Run Tool**

Ejemplo — `search_official_sources` con `topic: "terremotos junio 2026"`:

![Inspector mostrando resultados de ReliefWeb y USGS](screenshot.png)

## 5. Detener el Inspector

```bash
pkill -f "@modelcontextprotocol/inspector"
```

O simplemente cierra la terminal donde se está ejecutando.
