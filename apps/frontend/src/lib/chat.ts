/**
 * Tipos y datos del Asistente Virtual (chat).
 *
 * El historial es estático por ahora (semilla del diseño de Stitch). Más
 * adelante se reemplaza por la llamada oRPC `chat` ({ message, sessionId }) →
 * { reply, sessionId }. Los tipos ya anticipan esa forma.
 */

export type ChatRole = 'user' | 'assistant'

export interface ChatSource {
  title: string
  url: string
  /** Icono Material Symbols representativo de la fuente. */
  icon: string
}

export interface ChatMessage {
  role: ChatRole
  /** Texto del mensaje (puede incluir <strong> en mensajes semilla de confianza). */
  content: string
  time: string
  sources?: ChatSource[]
}

export interface QuickQuestion {
  icon: string
  label: string
}

/** Atajos de "Consultas frecuentes" del panel lateral. */
export const QUICK_QUESTIONS: QuickQuestion[] = [
  { icon: 'tsunami', label: '¿Hay alerta de tsunami?' },
  { icon: 'inventory_2', label: 'Centros de acopio oficiales' },
  { icon: 'report_problem', label: 'Reportes de daños' },
  { icon: 'fact_check', label: 'Cadenas falsas detectadas' },
]
