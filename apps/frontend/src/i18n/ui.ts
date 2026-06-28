// Diccionarios de UI. `es` es la fuente de verdad; las claves faltantes en
// `en`/`pt` caen a `es` vía useTranslations (ver index.ts).
// Solo se traduce la interfaz: el contenido (PATTERNS, datos del backend,
// mensajes demo del chat) permanece en español por diseño.

export const LOCALES = ['es', 'en', 'pt'] as const
export type Lang = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Lang = 'es'

// Nombres nativos para el selector de idioma (constantes, no se traducen).
export const LOCALE_NAMES: Record<Lang, string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português',
}

const es = {
  // Navegación (Header, Footer, BottomNav)
  'nav.inicio': 'Inicio',
  'nav.verificar': 'Verificar',
  'nav.asistente': 'Asistente',
  'nav.patrones': 'Patrones',
  'nav.openMenu': 'Abrir menú',
  'nav.closeMenu': 'Cerrar menú',
  'nav.openQueries': 'Abrir consultas frecuentes',
  'nav.menuDialog': 'Menú de navegación',
  'nav.bottomNav': 'Navegación inferior',
  'lang.switch': 'Cambiar idioma',

  // Home
  'home.meta.title': 'VerificaVzla - Combatiendo la desinformación',
  'home.meta.description':
    'Portal de verificación de noticias sobre Venezuela. Analiza afirmaciones virales y consulta datos verificados sobre el sismo de junio 2026.',
  'home.hero.badge': 'Actualización: 15 de junio, 2026',
  'home.hero.title': 'Combatiendo la desinformación en momentos de crisis',
  'home.hero.subtitle':
    'Analiza afirmaciones virales y consulta datos verificados sobre la situación actual en Venezuela.',
  'home.hero.ctaVerify': 'Verificar una noticia',
  'home.hero.ctaAsk': 'Preguntar al Asistente',
  'home.trust.title': 'Fuentes de Confianza & Aliados',
  'home.patterns.title': 'Patrones de Desinformación Recientes',
  'home.patterns.viewAll': 'Ver todos',
  'home.patterns.viewAllMobile': 'Ver todos los patrones',
  'home.newsletter.title': 'Recibe alertas críticas en tiempo real',
  'home.newsletter.subtitle':
    'Suscríbete a nuestro canal de verificación para recibir solo información confirmada durante emergencias.',
  'home.newsletter.placeholder': 'correo@ejemplo.com',
  'home.newsletter.submit': 'Unirme',

  // Verificar
  'verificar.meta.title': 'Verificar una noticia - VerificaVzla',
  'verificar.meta.description':
    'Herramienta de verificación: analiza afirmaciones virales, tweets o cadenas de WhatsApp y obtén un veredicto basado en fuentes confiables.',
  'verificar.badge': 'LABORATORIO DE VERIFICACIÓN',
  'verificar.title': 'Verifica una afirmación',
  'verificar.subtitle':
    'Pega el texto, tweet o cadena de WhatsApp que quieras revisar. Nuestro equipo lo contrasta con fuentes oficiales y devuelve un veredicto.',
  'verificar.form.label': 'Afirmación / Claim a verificar',
  'verificar.form.placeholder': 'Pega el texto, tweet o cadena de WhatsApp aquí...',
  'verificar.form.addContext': 'Añadir contexto o fuente de origen (opcional)',
  'verificar.form.sourceLabel': 'URL o nombre de la fuente',
  'verificar.form.sourcePlaceholder': 'URL o nombre de la fuente...',
  'verificar.form.submit': 'VERIFICAR CLAIM',
  'verificar.result.confidence': 'CONFIANZA:',
  'verificar.result.patternsTitle': 'Patrones detectados',
  'verificar.result.sourcesTitle': 'Fuentes y evidencias',
  'verificar.result.sourcesEmpty': 'No se encontraron fuentes para esta consulta.',
  // Cadenas usadas por el script cliente (ver bloque JSON en la página)
  'verificar.js.verifying': 'VERIFICANDO',
  'verificar.js.verdict.verdadero': 'VERDADERO',
  'verificar.js.verdict.falso': 'FALSO',
  'verificar.js.verdict.dudoso': 'DUDOSO',
  'verificar.js.conf.alta': 'ALTA',
  'verificar.js.conf.media': 'MEDIA',
  'verificar.js.conf.baja': 'BAJA',
  'verificar.js.error':
    'No se pudo completar la verificación. Intenta de nuevo en unos segundos.',

  // Patrones
  'patrones.meta.title': 'Catálogo de Patrones - VerificaVzla',
  'patrones.meta.description':
    'Análisis técnico de las estrategias estructurales utilizadas para propagar fake news en Venezuela.',
  'patrones.badge': 'RECURSOS TÉCNICOS',
  'patrones.title': 'Catálogo de Patrones de Desinformación',
  'patrones.subtitle':
    'Análisis técnico de las estrategias estructurales utilizadas para propagar fake news en Venezuela. Este catálogo identifica firmas digitales y heurísticas de manipulación.',

  // Asistente
  'asistente.meta.title': 'VerificaVzla - Chat de Verificación',
  'asistente.meta.description':
    'Asistente virtual para verificar noticias, alertas sismológicas y reportes de crisis sobre el sismo de junio 2026.',
  'asistente.sidebar.title': 'CONSULTAS FRECUENTES',
  'asistente.sidebar.settings': 'Configuración',
  'asistente.banner':
    'Monitoreo del sismo de junio 2026. Respuestas basadas estrictamente en datos e investigación verificada.',
  'asistente.dateLabel': 'HOY - 14 DE JUNIO, 2026',
  'asistente.typing': 'La IA está procesando...',
  'asistente.attachAria': 'Adjuntar archivo',
  'asistente.inputLabel': 'Escribe tu consulta',
  'asistente.inputPlaceholder': 'Escribe tu consulta aquí...',
  'asistente.sendAria': 'Enviar',
  'asistente.disclaimer':
    'Utiliza el chat para verificar noticias, alertas sismológicas o reportes de crisis.',
  'asistente.js.error':
    'No se pudo conectar con el asistente. Intenta de nuevo en unos segundos.',

  // Componentes
  'footer.tagline': 'Al servicio de la verdad.',
  'sources.view': 'Ver fuentes consultadas',
  'patternCard.patternPrefix': 'Patrón',
  'patternCard.indicators': 'INDICADORES TÉCNICOS',
  'patternCard.caseStudy': 'ESTUDIO DE CASO',
  'riskBadge.prefix': 'Riesgo:',
  'riskBadge.alta': 'Alta',
  'riskBadge.media': 'Media',
  'riskBadge.baja': 'Baja',
  'patternBadge.alerta-falsa': 'ALERTA FALSA',
  'patternBadge.contexto-necesario': 'CONTEXTO NECESARIO',
  'patternBadge.cadena-falsa': 'CADENA FALSA',
  'recentCard.readMore': 'LEER MÁS',
} as const

export type UIKey = keyof typeof es

const en: Partial<Record<UIKey, string>> = {
  'nav.inicio': 'Home',
  'nav.verificar': 'Verify',
  'nav.asistente': 'Assistant',
  'nav.patrones': 'Patterns',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',
  'nav.openQueries': 'Open frequent queries',
  'nav.menuDialog': 'Navigation menu',
  'nav.bottomNav': 'Bottom navigation',
  'lang.switch': 'Change language',

  'home.meta.title': 'VerificaVzla - Fighting disinformation',
  'home.meta.description':
    'News verification portal about Venezuela. Analyze viral claims and consult verified data about the June 2026 earthquake.',
  'home.hero.badge': 'Update: June 15, 2026',
  'home.hero.title': 'Fighting disinformation in times of crisis',
  'home.hero.subtitle':
    'Analyze viral claims and consult verified data about the current situation in Venezuela.',
  'home.hero.ctaVerify': 'Verify a news item',
  'home.hero.ctaAsk': 'Ask the Assistant',
  'home.trust.title': 'Trusted Sources & Allies',
  'home.patterns.title': 'Recent Disinformation Patterns',
  'home.patterns.viewAll': 'View all',
  'home.patterns.viewAllMobile': 'View all patterns',
  'home.newsletter.title': 'Get critical alerts in real time',
  'home.newsletter.subtitle':
    'Subscribe to our verification channel to receive only confirmed information during emergencies.',
  'home.newsletter.placeholder': 'email@example.com',
  'home.newsletter.submit': 'Join',

  'verificar.meta.title': 'Verify a news item - VerificaVzla',
  'verificar.meta.description':
    'Verification tool: analyze viral claims, tweets or WhatsApp chain messages and get a verdict based on trusted sources.',
  'verificar.badge': 'VERIFICATION LAB',
  'verificar.title': 'Verify a claim',
  'verificar.subtitle':
    'Paste the text, tweet or WhatsApp chain message you want to check. Our team contrasts it against official sources and returns a verdict.',
  'verificar.form.label': 'Claim to verify',
  'verificar.form.placeholder': 'Paste the text, tweet or WhatsApp message here...',
  'verificar.form.addContext': 'Add context or original source (optional)',
  'verificar.form.sourceLabel': 'Source URL or name',
  'verificar.form.sourcePlaceholder': 'Source URL or name...',
  'verificar.form.submit': 'VERIFY CLAIM',
  'verificar.result.confidence': 'CONFIDENCE:',
  'verificar.result.patternsTitle': 'Detected patterns',
  'verificar.result.sourcesTitle': 'Sources and evidence',
  'verificar.result.sourcesEmpty': 'No sources were found for this query.',
  'verificar.js.verifying': 'VERIFYING',
  'verificar.js.verdict.verdadero': 'TRUE',
  'verificar.js.verdict.falso': 'FALSE',
  'verificar.js.verdict.dudoso': 'DUBIOUS',
  'verificar.js.conf.alta': 'HIGH',
  'verificar.js.conf.media': 'MEDIUM',
  'verificar.js.conf.baja': 'LOW',
  'verificar.js.error': 'The verification could not be completed. Please try again in a few seconds.',

  'patrones.meta.title': 'Pattern Catalog - VerificaVzla',
  'patrones.meta.description':
    'Technical analysis of the structural strategies used to spread fake news in Venezuela.',
  'patrones.badge': 'TECHNICAL RESOURCES',
  'patrones.title': 'Disinformation Pattern Catalog',
  'patrones.subtitle':
    'Technical analysis of the structural strategies used to spread fake news in Venezuela. This catalog identifies digital signatures and manipulation heuristics.',

  'asistente.meta.title': 'VerificaVzla - Verification Chat',
  'asistente.meta.description':
    'Virtual assistant to verify news, seismic alerts and crisis reports about the June 2026 earthquake.',
  'asistente.sidebar.title': 'FREQUENT QUERIES',
  'asistente.sidebar.settings': 'Settings',
  'asistente.banner':
    'June 2026 earthquake monitoring. Answers strictly based on verified data and research.',
  'asistente.dateLabel': 'TODAY - JUNE 14, 2026',
  'asistente.typing': 'The AI is processing...',
  'asistente.attachAria': 'Attach file',
  'asistente.inputLabel': 'Type your query',
  'asistente.inputPlaceholder': 'Type your query here...',
  'asistente.sendAria': 'Send',
  'asistente.disclaimer':
    'Use the chat to verify news, seismic alerts or crisis reports.',
  'asistente.js.error': 'Could not connect to the assistant. Please try again in a few seconds.',

  'footer.tagline': 'In service of the truth.',
  'sources.view': 'View consulted sources',
  'patternCard.patternPrefix': 'Pattern',
  'patternCard.indicators': 'TECHNICAL INDICATORS',
  'patternCard.caseStudy': 'CASE STUDY',
  'riskBadge.prefix': 'Risk:',
  'riskBadge.alta': 'High',
  'riskBadge.media': 'Medium',
  'riskBadge.baja': 'Low',
  'patternBadge.alerta-falsa': 'FALSE ALERT',
  'patternBadge.contexto-necesario': 'CONTEXT NEEDED',
  'patternBadge.cadena-falsa': 'FALSE CHAIN',
  'recentCard.readMore': 'READ MORE',
}

const pt: Partial<Record<UIKey, string>> = {
  'nav.inicio': 'Início',
  'nav.verificar': 'Verificar',
  'nav.asistente': 'Assistente',
  'nav.patrones': 'Padrões',
  'nav.openMenu': 'Abrir menu',
  'nav.closeMenu': 'Fechar menu',
  'nav.openQueries': 'Abrir consultas frequentes',
  'nav.menuDialog': 'Menu de navegação',
  'nav.bottomNav': 'Navegação inferior',
  'lang.switch': 'Mudar idioma',

  'home.meta.title': 'VerificaVzla - Combatendo a desinformação',
  'home.meta.description':
    'Portal de verificação de notícias sobre a Venezuela. Analise alegações virais e consulte dados verificados sobre o terremoto de junho de 2026.',
  'home.hero.badge': 'Atualização: 15 de junho de 2026',
  'home.hero.title': 'Combatendo a desinformação em momentos de crise',
  'home.hero.subtitle':
    'Analise alegações virais e consulte dados verificados sobre a situação atual na Venezuela.',
  'home.hero.ctaVerify': 'Verificar uma notícia',
  'home.hero.ctaAsk': 'Perguntar ao Assistente',
  'home.trust.title': 'Fontes Confiáveis & Aliados',
  'home.patterns.title': 'Padrões de Desinformação Recentes',
  'home.patterns.viewAll': 'Ver todos',
  'home.patterns.viewAllMobile': 'Ver todos os padrões',
  'home.newsletter.title': 'Receba alertas críticos em tempo real',
  'home.newsletter.subtitle':
    'Inscreva-se no nosso canal de verificação para receber apenas informações confirmadas durante emergências.',
  'home.newsletter.placeholder': 'email@exemplo.com',
  'home.newsletter.submit': 'Participar',

  'verificar.meta.title': 'Verificar uma notícia - VerificaVzla',
  'verificar.meta.description':
    'Ferramenta de verificação: analise alegações virais, tweets ou correntes de WhatsApp e obtenha um veredicto baseado em fontes confiáveis.',
  'verificar.badge': 'LABORATÓRIO DE VERIFICAÇÃO',
  'verificar.title': 'Verifique uma alegação',
  'verificar.subtitle':
    'Cole o texto, tweet ou corrente de WhatsApp que deseja revisar. Nossa equipe o contrasta com fontes oficiais e devolve um veredicto.',
  'verificar.form.label': 'Alegação a verificar',
  'verificar.form.placeholder': 'Cole o texto, tweet ou mensagem de WhatsApp aqui...',
  'verificar.form.addContext': 'Adicionar contexto ou fonte de origem (opcional)',
  'verificar.form.sourceLabel': 'URL ou nome da fonte',
  'verificar.form.sourcePlaceholder': 'URL ou nome da fonte...',
  'verificar.form.submit': 'VERIFICAR ALEGAÇÃO',
  'verificar.result.confidence': 'CONFIANÇA:',
  'verificar.result.patternsTitle': 'Padrões detectados',
  'verificar.result.sourcesTitle': 'Fontes e evidências',
  'verificar.result.sourcesEmpty': 'Nenhuma fonte foi encontrada para esta consulta.',
  'verificar.js.verifying': 'VERIFICANDO',
  'verificar.js.verdict.verdadero': 'VERDADEIRO',
  'verificar.js.verdict.falso': 'FALSO',
  'verificar.js.verdict.dudoso': 'DUVIDOSO',
  'verificar.js.conf.alta': 'ALTA',
  'verificar.js.conf.media': 'MÉDIA',
  'verificar.js.conf.baja': 'BAIXA',
  'verificar.js.error': 'Não foi possível concluir a verificação. Tente novamente em alguns segundos.',

  'patrones.meta.title': 'Catálogo de Padrões - VerificaVzla',
  'patrones.meta.description':
    'Análise técnica das estratégias estruturais utilizadas para propagar fake news na Venezuela.',
  'patrones.badge': 'RECURSOS TÉCNICOS',
  'patrones.title': 'Catálogo de Padrões de Desinformação',
  'patrones.subtitle':
    'Análise técnica das estratégias estruturais utilizadas para propagar fake news na Venezuela. Este catálogo identifica assinaturas digitais e heurísticas de manipulação.',

  'asistente.meta.title': 'VerificaVzla - Chat de Verificação',
  'asistente.meta.description':
    'Assistente virtual para verificar notícias, alertas sísmicos e relatos de crise sobre o terremoto de junho de 2026.',
  'asistente.sidebar.title': 'CONSULTAS FREQUENTES',
  'asistente.sidebar.settings': 'Configurações',
  'asistente.banner':
    'Monitoramento do terremoto de junho de 2026. Respostas baseadas estritamente em dados e pesquisa verificada.',
  'asistente.dateLabel': 'HOJE - 14 DE JUNHO DE 2026',
  'asistente.typing': 'A IA está processando...',
  'asistente.attachAria': 'Anexar arquivo',
  'asistente.inputLabel': 'Digite sua consulta',
  'asistente.inputPlaceholder': 'Digite sua consulta aqui...',
  'asistente.sendAria': 'Enviar',
  'asistente.disclaimer':
    'Use o chat para verificar notícias, alertas sísmicos ou relatos de crise.',
  'asistente.js.error': 'Não foi possível conectar com o assistente. Tente novamente em alguns segundos.',

  'footer.tagline': 'A serviço da verdade.',
  'sources.view': 'Ver fontes consultadas',
  'patternCard.patternPrefix': 'Padrão',
  'patternCard.indicators': 'INDICADORES TÉCNICOS',
  'patternCard.caseStudy': 'ESTUDO DE CASO',
  'riskBadge.prefix': 'Risco:',
  'riskBadge.alta': 'Alta',
  'riskBadge.media': 'Média',
  'riskBadge.baja': 'Baixa',
  'patternBadge.alerta-falsa': 'ALERTA FALSO',
  'patternBadge.contexto-necesario': 'CONTEXTO NECESSÁRIO',
  'patternBadge.cadena-falsa': 'CORRENTE FALSA',
  'recentCard.readMore': 'LER MAIS',
}

export const ui: Record<Lang, Partial<Record<UIKey, string>>> = { es, en, pt }
