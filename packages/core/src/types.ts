// ============================================================
// Tipos compartidos — fuente única de verdad para frontend, backend y MCP
// ============================================================

export type Severity = "alta" | "media" | "baja";

export type Verdict = "verdadero" | "falso" | "dudoso";

/** Indicador técnico de un patrón (icono Material Symbols + descripción). */
export type PatternIndicator = {
  icon: string;
  text: string;
};

/** Patrón de desinformación del cuaderno de investigación. */
export type Pattern = {
  id: string;
  name: string;
  description: string;
  examples: string[];
  detection: string;
  severity: Severity;
  /** Familia del patrón: Multimedia, De Autoridad, Estructural, Político… */
  category?: string;
  /** Señales técnicas de detección, para la tarjeta del catálogo. */
  indicators?: PatternIndicator[];
  /** Ejemplo representativo mostrado como estudio de caso en la UI. */
  caseStudy?: string;
};

/** Dato verificado / desmentido sobre el sismo, mostrado en la UI. */
export type KeyFact = {
  id: string;
  claim: string;
  verdict: Verdict;
  source: string;
  explanation: string;
};

/** Estados de badge para las vistas previas de patrones recientes. */
export type PreviewStatus =
  | "alerta-falsa"
  | "contexto-necesario"
  | "cadena-falsa";

/** Vista previa de un patrón reciente para la home. */
export type RecentPatternPreview = {
  id: string;
  status: PreviewStatus;
  title: string;
  summary: string;
  createdAt: string; // ISO-8601
  href: string;
};
