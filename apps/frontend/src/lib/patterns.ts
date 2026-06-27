/**
 * Datos del Catálogo de Patrones de Desinformación.
 *
 * Por ahora son estáticos (portados del diseño de Stitch). Más adelante
 * se reemplazan por la llamada oRPC `getAllPatterns`. El tipo es más rico
 * que el `Pattern` de @repo/core (que solo tiene id/name/description/examples);
 * conviene alinear el tipo del core con estos campos cuando se conecte el backend.
 */

export type RiskLevel = 'alta' | 'media' | 'baja'

export interface PatternIndicator {
  /** Nombre del icono Material Symbols. */
  icon: string
  text: string
}

export interface DisinfoPattern {
  id: string
  /** Familia del patrón: ESTRUCTURAL, MULTIMEDIA, DE AUTORIDAD, PSICOLÓGICO… */
  category: string
  title: string
  description: string
  risk: RiskLevel
  indicators: PatternIndicator[]
  caseStudy: string
}

export const PATTERNS: DisinfoPattern[] = [
  {
    id: 'replica-masiva',
    category: 'Estructural',
    title: 'Supuesta Réplica Masiva',
    description:
      'Distribución artificial y coordinada de contenido idéntico a través de múltiples canales en un corto periodo de tiempo para simular consenso.',
    risk: 'alta',
    indicators: [
      { icon: 'schedule', text: 'Marcas de tiempo idénticas o secuenciales.' },
      { icon: 'smart_toy', text: 'Comportamiento automatizado (Bot-like behavior).' },
    ],
    caseStudy:
      'Cadenas de WhatsApp sobre desabastecimiento generalizado en 24 estados.',
  },
  {
    id: 'descontextualizacion-visual',
    category: 'Multimedia',
    title: 'Descontextualización Visual',
    description:
      'Uso de material audiovisual real pero perteneciente a un evento, fecha o ubicación geográfica distinta para ilustrar una narrativa falsa.',
    risk: 'alta',
    indicators: [
      { icon: 'image_search', text: 'Fotografías antiguas o de archivo.' },
      { icon: 'info', text: 'Metadatos alterados o eliminados (EXIF data).' },
    ],
    caseStudy:
      'Videos de incendios forestales de 2019 usados como evidencia de ataques en 2024.',
  },
  {
    id: 'suplantacion-identidad',
    category: 'De Autoridad',
    title: 'Suplantación de Identidad',
    description:
      'Clonación de elementos visuales de instituciones oficiales o medios de comunicación para otorgar credibilidad a documentos apócrifos.',
    risk: 'media',
    indicators: [
      { icon: 'link', text: 'Dominios visualmente similares (typosquatting).' },
      { icon: 'text_fields', text: 'Uso de tipografías no oficiales o logos deformados.' },
    ],
    caseStudy:
      'Falsas Gacetas Oficiales circuladas en PDF con anuncios de expropiaciones.',
  },
  {
    id: 'sesgo-autoridad-inexistente',
    category: 'Psicológico',
    title: 'Sesgo de Autoridad Inexistente',
    description:
      'Atribución de afirmaciones a expertos, científicos o instituciones de prestigio que no existen o que no han emitido tal declaración.',
    risk: 'media',
    indicators: [
      { icon: 'person_search', text: 'Referencias vagas a "expertos internacionales".' },
      { icon: 'format_quote', text: 'Ausencia de fuentes citadas o enlaces a estudios.' },
    ],
    caseStudy:
      'Audio atribuido a un médico inexistente del Hospital Vargas alertando sobre virus letales.',
  },
]
