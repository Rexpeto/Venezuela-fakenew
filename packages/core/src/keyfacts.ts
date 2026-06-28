import type { KeyFact } from "./types.js";

// Contexto temático (clave→resumen) — usado por el MCP y para fundamentar
// las respuestas del LLM. NO confundir con KEY_FACT_CHECKS (datos para la UI).
export const KEY_FACTS = {
  political:
    "3 ene 2026: Captura de Maduro. Delcy Rodríguez presidenta encargada. 81-100 muertos en operación.",
  economy:
    "Salario mínimo ~$7/mes. Canasta básica $300-645. Devaluación ~640% en 12 meses.",
  earthquakes:
    "24 jun 2026: Terremotos 7.2 y 7.5. 1430 fallecidos oficiales, 3238 heridos. $200M fondo reconstrucción.",
  migration:
    "6.9M venezolanos fuera. 7.9M necesitan ayuda humanitaria dentro del país.",
  disinformation:
    "13 fake contents sobre Delcy en 18 días. Videos falsos de tsunami y apagones.",
};

// Datos verificados / desmentidos sobre el sismo, listos para mostrar en la UI.
// Cifras alineadas con KEY_FACTS.earthquakes y la investigación (USGS).
export const KEY_FACT_CHECKS: KeyFact[] = [
  {
    id: "kf-1",
    claim: "El sismo del 24 de junio de 2026 alcanzó magnitud 7.5",
    verdict: "verdadero",
    source: "USGS — United States Geological Survey",
    explanation:
      "El 24 de junio de 2026 se registró un doblete sísmico: un sismo previo de magnitud 7.2 Mw seguido 39 segundos después por el principal de 7.5 Mw, con epicentros cerca de San Felipe y Yumare (estado Yaracuy). El USGS emitió alerta PAGER roja.",
  },
  {
    id: "kf-2",
    claim: "Un tsunami arrasó la costa de La Guaira tras el terremoto",
    verdict: "falso",
    source: "USGS / Protección Civil",
    explanation:
      "No se registró actividad que generara un tsunami. La alerta que circuló fue desmentida y las imágenes de olas gigantes corresponden al tsunami de Japón 2011.",
  },
  {
    id: "kf-3",
    claim: "Hubo más de 5.000 víctimas fatales por el sismo",
    verdict: "dudoso",
    source: "Cifras oficiales (en recopilación)",
    explanation:
      "El balance oficial reporta alrededor de 1.430 fallecidos y 3.238 heridos. La cifra de 5.000 no ha sido confirmada por ninguna autoridad.",
  },
  {
    id: "kf-4",
    claim: "Corpoelec decretó un apagón nacional de 24 horas",
    verdict: "falso",
    source: "Corpoelec (cuentas oficiales)",
    explanation:
      "Es un falso anuncio oficial difundido en TikTok. Corpoelec no emitió tal comunicado; corresponde al patrón de falsos anuncios oficiales.",
  },
  {
    id: "kf-5",
    claim: "Delcy Rodríguez anunció un aumento salarial a $800/mes",
    verdict: "falso",
    source: "Ecoanalítica / BCV",
    explanation:
      "El salario mínimo real ronda los $7/mes. Las cifras de $800-1000 forman parte del patrón de desinformación salarial sobre Delcy Rodríguez (13 contenidos falsos en 18 días).",
  },
];
