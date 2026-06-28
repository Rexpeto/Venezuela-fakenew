/* ─── Tipos compartidos (mientras packages/core se puebla) ──── */

import {
  MOCK_RECENT_PATTERN_PREVIEWS,
  type RecentPatternPreview,
} from './recent-pattern-previews'

export type Verdict = 'verdadero' | 'falso' | 'dudoso'

export type Pattern = {
  id: string
  name: string
  description: string
  examples: string[]
  detection: string
  severity: 'alta' | 'media' | 'baja'
}

export type KeyFact = {
  id: string
  claim: string
  verdict: Verdict
  source: string
  explanation: string
}

export type Source = {
  id: string
  url: string
  title: string
  topic: string
  verified: boolean
  lastChecked: string
}

export type VerificationResult = {
  verdict: Verdict
  confidence: number
  explanation: string
  patterns: string[]
  sources: string[]
}

export type ChatResponse = {
  reply: string
  sessionId: string
}

/* ─── 6 patrones de desinformación (del cuaderno) ──────────── */

export const MOCK_PATTERNS: Pattern[] = [
  {
    id: 'p-1',
    name: 'Videos descontextualizados',
    description:
      'Videos reales de desastres en otros países (Turquía 2023, México 2017, etc.) compartidos como si fueran del sismo de Venezuela 2026. Suelen mostrar edificios colapsados, tsunamis o escenas de pánico.',
    examples: [
      'Video de edificio colapsando en Turquía 2023 compartido como "Caracas destruida"',
      'Supuesto tsunami en La Guaira con imágenes del tsunami de Japón 2011',
    ],
    detection:
      'Búsqueda inversa de fotogramas clave. Los videos de otros desastres suelen tener marcas de agua o resoluciones distintas.',
    severity: 'alta',
  },
  {
    id: 'p-2',
    name: 'Contenido generado por IA',
    description:
      'Imágenes y audios sintéticos creados con herramientas de IA (Midjourney, ElevenLabs, etc.) que simulan escenas del desastre o declaraciones falsas de autoridades.',
    examples: [
      'Imagen generada por IA de una estatua de la Virgen intacta entre escombros',
      'Audio falso del presidente Maduro declarando "toque de queda indefinido" generado con clonación de voz',
    ],
    detection:
      'Las imágenes IA suelen tener artefactos en manos, ojos y texturas. Los audios clonados tienen falta de respiración natural y pausas.',
    severity: 'alta',
  },
  {
    id: 'p-3',
    name: 'Usurpación de canales de comunicación',
    description:
      'Cuentas falsas en X/TikTok/Telegram que suplantan a medios oficiales (VTV, TeleSur) o cuentas de emergencia (Inameh, Funvisis) para difundir desinformación.',
    examples: [
      'Cuenta falsa @SomosVTV_VE (con guion bajo) que publicó "réplica de 8.0 en preparación"',
      'Cadena de WhatsApp suplantando a Defensa Civil pidiendo no usar el teléfono',
    ],
    detection:
      'Verificar la fecha de creación de la cuenta y el número de seguidores. Las cuentas oficiales tienen check azul verificado.',
    severity: 'media',
  },
  {
    id: 'p-4',
    name: 'Falsos anuncios oficiales',
    description:
      'Cadenas, decretos presidenciales o comunicados oficiales falsos que circulan como PDF o capturas de pantalla. Suelen anunciar medidas extremas o beneficios económicos.',
    examples: [
      'Supuesto decreto de "estado de excepción por 90 días" con membrete oficial falsificado',
      'Falso comunicado de la OPS declarando "epidemia de cólera" en los refugios',
    ],
    detection:
      'Cruzar con las cuentas oficiales del gobierno. Los PDFs falsos suelen tener errores de ortografía, sellos de baja resolución o fechas incorrectas.',
    severity: 'media',
  },
  {
    id: 'p-5',
    name: 'Operaciones de desinformación en YouTube',
    description:
      'Canales de YouTube que publican contenido sensacionalista con títulos alarmistas sobre el sismo. Usan thumbnails trucados y descripciones con enlaces a sitios de desinformación.',
    examples: [
      'Canal "Noticias Venezuela 24/7" publicó "VIDEO: Así se partió la tierra en El Valle" mostrando una grieta generada por IA',
      'Transmisión en vivo fake con título "EN VIVO: réplicas en tiempo real" que en realidad es un loop de video de 2018',
    ],
    detection:
      'Revisar el historial del canal: si subía contenido no relacionado antes del sismo, es sospechoso. Los títulos con MAYÚSCULAS y emojis excesivos son bandera roja.',
    severity: 'baja',
  },
  {
    id: 'p-6',
    name: 'Desinformación económica y social',
    description:
      'Noticias falsas sobre ayudas económicas, bonos, salarios o condiciones de los refugios. Explotan la necesidad y desesperación de la población.',
    examples: [
      '"Gobierno otorgará bono de $500 a todas las familias afectadas" — falso, no hay tal bono',
      '"Delcy Rodríguez anuncia aumento del salario mínimo a $800" — desmentido por el MPPE',
    ],
    detection:
      'Verificar en las cuentas oficiales del MPPE, BCV y MinFinanzas. Las ayudas extraordinarias siempre se anuncian por Gaceta Oficial.',
    severity: 'media',
  },
]

/* ─── Key facts del sismo junio 2026 ──────────────────────── */

export const MOCK_KEY_FACTS: KeyFact[] = [
  {
    id: 'kf-1',
    claim: 'El sismo del 26 de junio de 2026 tuvo magnitud 7.3',
    verdict: 'verdadero',
    source: 'USGS — United States Geological Survey',
    explanation:
      'El sismo ocurrió el 26 de junio de 2026 a las 11:47 a.m. hora local, con epicentro en el estado La Guaira, magnitud 7.3 Mw, profundidad 10 km.',
  },
  {
    id: 'kf-2',
    claim: 'Hubo más de 5,000 víctimas fatales en Caracas',
    verdict: 'dudoso',
    source: 'Observatorio Venezolano de Fake News',
    explanation:
      'Las cifras oficiales aún están en recopilación. Reportes parciales indican centenares de fallecidos, pero 5,000 no ha sido confirmado por ninguna autoridad.',
  },
  {
    id: 'kf-3',
    claim: 'Un tsunami arrasó la costa de La Guaira',
    verdict: 'falso',
    source: 'Funvisis / USGS',
    explanation:
      'No se registró actividad sísmica submarina que generara un tsunami. Las imágenes de olas gigantes que circularon corresponden al tsunami de Japón 2011.',
  },
  {
    id: 'kf-4',
    claim: 'El Palacio de Miraflores colapsó completamente',
    verdict: 'falso',
    source: 'VTV / Presidencia',
    explanation:
      'El Palacio de Miraflores sufrió daños estructurales menores (fisuras en fachada), pero no colapsó. Las imágenes del edificio derrumbado son del terremoto de México 2017.',
  },
  {
    id: 'kf-5',
    claim: 'La ayuda humanitaria internacional está llegando a todos los estados afectados',
    verdict: 'dudoso',
    source: 'OCHA / Cruz Roja Venezolana',
    explanation:
      'La ayuda ha comenzado a llegar pero la distribución es desigual. Los estados La Guaira, Miranda y Caracas reciben la mayor parte. Falta información de Falcón, Yaracuy y Lara.',
  },
  {
    id: 'kf-6',
    claim: 'Los sismos se pueden predecir con horas de anticipación',
    verdict: 'falso',
    source: 'Funvisis / USGS',
    explanation:
      'NO existe método científico comprobado para predecir sismos con precisión de horas o días. Las alertas de "réplica inminente" que circulan en WhatsApp son falsas.',
  },
]

/* ─── Fuentes confiables ──────────────────────────────────── */

export const MOCK_SOURCES: Source[] = [
  {
    id: 'src-1',
    url: 'https://www.usgs.gov',
    title: 'USGS — Earthquake Hazards Program',
    topic: 'sismología',
    verified: true,
    lastChecked: '2026-06-27T18:00:00Z',
  },
  {
    id: 'src-2',
    url: 'https://www.funvisis.gob.ve',
    title: 'Funvisis — Fundación Venezolana de Investigaciones Sismológicas',
    topic: 'sismología',
    verified: true,
    lastChecked: '2026-06-27T17:30:00Z',
  },
  {
    id: 'src-3',
    url: 'https://www.factchequeado.com',
    title: 'Factchequeado — Verificación de noticias',
    topic: 'verificación',
    verified: true,
    lastChecked: '2026-06-27T16:45:00Z',
  },
  {
    id: 'src-4',
    url: 'https://cotejo.info',
    title: 'Cotejo.info — Observatorio Venezolano de Fake News',
    topic: 'verificación',
    verified: true,
    lastChecked: '2026-06-27T16:00:00Z',
  },
  {
    id: 'src-5',
    url: 'https://www.who.int',
    title: 'WHO — Emergencias y desastres',
    topic: 'salud',
    verified: true,
    lastChecked: '2026-06-27T15:00:00Z',
  },
  {
    id: 'src-6',
    url: 'https://www.iom.int',
    title: 'IOM — Organización Internacional para las Migraciones',
    topic: 'desplazamiento',
    verified: true,
    lastChecked: '2026-06-26T20:00:00Z',
  },
]

/* ─── Lógica de verificación (matching simple) ────────────── */

const CLAIM_KEYWORDS: Record<string, { patternId: string; keywords: string[] }> = {
  tsunami: { patternId: 'p-1', keywords: ['tsunami', 'ola gigante', 'inundación costa', 'mar salido', 'La Guaira inundada'] },
  prediccion: { patternId: 'p-3', keywords: ['réplica', 'predecir', 'aviso', 'alerta', 'próximas horas', '8.0', '9.0'] },
  ia: { patternId: 'p-2', keywords: ['ia', 'inteligencia artificial', 'generado', 'deepfake', 'clonado', 'sintético'] },
  video_falso: { patternId: 'p-1', keywords: ['video', 'edificio colapsado', 'derrumbado', 'destruido', 'escombros'] },
  economico: { patternId: 'p-6', keywords: ['bono', 'salario', 'aumento', 'dólares', '$', 'ayuda económica', 'pago'] },
  salud: { patternId: 'p-4', keywords: ['cólera', 'epidemia', 'enfermedad', 'hospital colapsado', 'vacuna'] },
  youtube: { patternId: 'p-5', keywords: ['youtube', 'transmisión', 'en vivo', 'canal', 'suscribete'] },
}

function detectPatterns(claim: string): string[] {
  const lower = claim.toLowerCase()
  const found: string[] = []

  for (const [, mapping] of Object.entries(CLAIM_KEYWORDS)) {
    if (mapping.keywords.some((kw) => lower.includes(kw))) {
      if (!found.includes(mapping.patternId)) found.push(mapping.patternId)
    }
  }

  return found
}

function findKeyFacts(claim: string): KeyFact[] {
  const lower = claim.toLowerCase()
  return MOCK_KEY_FACTS.filter((kf) => {
    const words = kf.claim.toLowerCase().split(' ')
    return words.some((w) => w.length > 4 && lower.includes(w))
  })
}

function generateExplanation(claim: string, verdict: Verdict, patterns: string[]): string {
  const facts = findKeyFacts(claim)

  let explanation = ''

  if (verdict === 'verdadero') {
    explanation = `La afirmación coincide con fuentes verificadas.`
  } else if (verdict === 'falso') {
    explanation = `No se encontró evidencia que respalde esta afirmación.`
  } else {
    explanation = `No hay suficiente información para determinar la veracidad de esta afirmación.`
  }

  if (facts.length > 0) {
    explanation += `\n\nHechos relacionados encontrados:\n${facts.map((f) => `• ${f.claim} (${f.verdict}) — ${f.source}`).join('\n')}`
  }

  if (patterns.length > 0) {
    const pNames = patterns.map((id) => MOCK_PATTERNS.find((p) => p.id === id)?.name ?? id)
    explanation += `\n\nPatrones de desinformación detectados:\n${pNames.map((n) => `• ${n}`).join('\n')}`
  }

  return explanation
}

function generateReply(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('víctima') || lower.includes('fallecido') || lower.includes('muerto')) {
    return 'Las cifras oficiales de víctimas aún están siendo recopiladas por las autoridades. organismos como la OCHA y la Cruz Roja Venezolana están publicando reportes periódicos. Se recomienda seguir las cuentas oficiales de @OCHAVenezuela y @CruzRojaVe para información actualizada. Hasta el momento, las cifras no oficiales que circulan en redes sociales no han sido verificadas.'
  }

  if (lower.includes('tsunami') || lower.includes('ola')) {
    return 'No se registró actividad sísmica submarina que generara un tsunami. Las imágenes de olas gigantes que están circulando en redes sociales y WhatsApp corresponden al tsunami de Japón de 2011. Funvisis y el USGS confirman que no hubo alerta de tsunami emitida para la costa venezolana. Si ves un video de una ola gigante, verificá la fuente antes de compartirlo.'
  }

  if (lower.includes('réplica') || lower.includes('predecir') || lower.includes('alerta')) {
    return 'NO existe método científico para predecir sismos con precisión. Las cadenas que anuncian "réplicas de 8.0 en las próximas horas" son completamente falsas. La sismología solo puede calcular probabilidades estadísticas a largo plazo, no predicciones exactas. Seguí únicamente las cuentas verificadas de Funvisis para información sísmica.'
  }

  if (lower.includes('ayuda') || lower.includes('donación') || lower.includes('donar') || lower.includes('refugio')) {
    return 'La ayuda humanitaria está siendo coordinada por la Cruz Roja Venezolana y la OCHA. Los centros de acopio oficiales están en: \n\n• Cruz Roja Venezolana — Sede principal San Bernardino\n• Gobernaciones de los estados afectados\n• Alcaldías municipales\n\nSe recomienda NO donar a cuentas personales o colectas no verificadas que circulan en redes sociales. Verificá siempre en las cuentas oficiales (@CruzRojaVe, @OCHAVenezuela) antes de aportar.'
  }

  if (lower.includes('bono') || lower.includes('salario') || lower.includes('$') || lower.includes('dólar')) {
    return 'Circulan múltiples cadenas falsas sobre bonos, aumentos salariales y ayudas económicas. No hay ningún bono extraordinario de $500 ni aumento salarial a $800 anunciado oficialmente. Las únicas fuentes confiables sobre ayudas económicas son: \n\n• Ministerio del Poder Popular para Economía y Finanzas\n• Banco Central de Venezuela (@BCV_VE)\n• Gaceta Oficial de la República Bolivariana de Venezuela'
  }

  return 'Soy un asistente especializado en información verificada sobre el sismo de Venezuela de junio 2026. Podés preguntarme sobre:\n\n• Víctimas y daños\n• Réplicas y actividad sísmica\n• Ayuda humanitaria y refugios\n• Desinformación detectada\n• Fuentes confiables\n\n¿Sobre qué tema querés información?'
}

/* ─── Mock Client ─────────────────────────────────────────── */

const delay = (ms = 800) => new Promise((r) => setTimeout(r, ms))

export const mockApi = {
  verifyClaim: async ({
    claim,
    context,
  }: {
    claim: string
    context?: string
  }): Promise<VerificationResult> => {
    await delay()
    const patterns = detectPatterns(claim)
    const facts = findKeyFacts(claim)

    // Determine verdict
    let verdict: Verdict = 'dudoso'
    let confidence = 0

    const matchCount = patterns.length + facts.length

    if (facts.some((f) => f.verdict === 'verdadero')) {
      verdict = 'verdadero'
      confidence = 0.7 + matchCount * 0.1
    } else if (facts.some((f) => f.verdict === 'falso')) {
      verdict = 'falso'
      confidence = 0.8 + matchCount * 0.05
    } else if (patterns.length >= 2) {
      verdict = 'falso'
      confidence = 0.6 + patterns.length * 0.1
    } else if (patterns.length >= 1) {
      verdict = 'dudoso'
      confidence = 0.3
    } else {
      confidence = 0.1
    }

    // Verdict based on key fact matches
    for (const fact of facts) {
      if (fact.verdict === 'falso') {
        verdict = 'falso'
        confidence = Math.max(confidence, 0.75)
        break
      }
      if (fact.verdict === 'verdadero') {
        verdict = 'verdadero'
        confidence = Math.max(confidence, 0.7)
        break
      }
    }

    confidence = Math.min(confidence, 0.99)

    if (context) {
      // context refina el análisis
    }

    return {
      verdict,
      confidence: Math.round(confidence * 100) / 100,
      explanation: generateExplanation(claim, verdict, patterns),
      patterns,
      sources: MOCK_SOURCES.filter((s) => s.verified).slice(0, 3).map((s) => s.url),
    }
  },

  getAllPatterns: async (): Promise<Pattern[]> => {
    await delay(300)
    return MOCK_PATTERNS
  },

  getRecentPatternPreviews: async (): Promise<RecentPatternPreview[]> => {
    await delay(300)
    return MOCK_RECENT_PATTERN_PREVIEWS
  },

  getKeyFacts: async (): Promise<KeyFact[]> => {
    await delay(300)
    return MOCK_KEY_FACTS
  },

  searchSources: async ({
    topic,
    limit = 5,
  }: {
    topic: string
    limit?: number
  }): Promise<Source[]> => {
    await delay(500)
    const lower = topic.toLowerCase()
    return MOCK_SOURCES.filter(
      (s) =>
        s.topic.includes(lower) ||
        s.title.toLowerCase().includes(lower) ||
        s.topic.includes(lower)
    ).slice(0, limit)
  },

  chat: async ({
    message,
    sessionId,
  }: {
    message: string
    sessionId?: string
  }): Promise<ChatResponse> => {
    await delay(1200)
    return {
      reply: generateReply(message),
      sessionId: sessionId ?? crypto.randomUUID(),
    }
  },
}
