import { marked } from 'marked'
import DOMPurify from 'dompurify'

/**
 * Convierte el Markdown que devuelve el asistente (encabezados, listas, tablas,
 * negritas, emojis) a HTML seguro para inyectar en el chat.
 *
 * El backend responde en Markdown (GFM), por lo que renderizarlo como texto
 * plano mostraba la sintaxis cruda (`#`, `**`, tablas). Se sanitiza con
 * DOMPurify porque el contenido proviene de un LLM.
 */
marked.setOptions({ gfm: true, breaks: true })

export function renderMarkdown(md: string): string {
  const html = marked.parse(md, { async: false }) as string
  return DOMPurify.sanitize(html)
}
