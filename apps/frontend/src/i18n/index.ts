import { ui, LOCALES, DEFAULT_LOCALE, type Lang, type UIKey } from './ui'

export { LOCALES, DEFAULT_LOCALE, LOCALE_NAMES, type Lang, type UIKey } from './ui'

const NON_DEFAULT = LOCALES.filter((l) => l !== DEFAULT_LOCALE)

export function isLang(value: string): value is Lang {
  return (LOCALES as readonly string[]).includes(value)
}

/**
 * Extrae el locale del prefijo de URL y devuelve la ruta sin prefijo.
 * `/en/verificar` → { lang: 'en', path: '/verificar' }
 * `/verificar`    → { lang: 'es', path: '/verificar' }  (default, sin prefijo)
 */
export function parseLocale(pathname: string): { lang: Lang; path: string } {
  const first = pathname.split('/')[1] ?? ''
  if (first !== DEFAULT_LOCALE && isLang(first)) {
    const rest = pathname.slice(first.length + 1) // quita '/en'
    return { lang: first, path: rest === '' ? '/' : rest }
  }
  return { lang: DEFAULT_LOCALE, path: pathname }
}

/** Antepone el prefijo de locale a una ruta sin prefijo. `es` no lleva prefijo. */
export function localizeUrl(lang: Lang, path: string): string {
  if (lang === DEFAULT_LOCALE) return path
  return path === '/' ? `/${lang}` : `/${lang}${path}`
}

/**
 * Decide a qué locale redirigir una ruta sin prefijo (auto-detección).
 * `current` es el locale ya resuelto de la request (Astro.currentLocale); si la
 * URL ya tiene prefijo (en/pt) no se redirige. La cookie (elección explícita)
 * manda sobre el navegador. Devuelve `null` cuando no hay que redirigir.
 */
export function chooseLocaleRedirect(opts: {
  current?: string
  cookie?: string
  preferred?: string
}): Lang | null {
  const current =
    opts.current && isLang(opts.current) ? opts.current : DEFAULT_LOCALE
  if (current !== DEFAULT_LOCALE) return null
  const target =
    opts.cookie && isLang(opts.cookie) ? opts.cookie : opts.preferred
  if (target && isLang(target) && target !== DEFAULT_LOCALE) return target
  return null
}

/** `t(key)` con fallback a `es` si la clave no existe en el locale pedido. */
export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang]?.[key] ?? ui[DEFAULT_LOCALE][key] ?? key
  }
}

/**
 * Atajo para componentes Astro: `const { t, href, lang } = i18n(Astro)`.
 * El idioma viene de `Astro.currentLocale` (lo computa el routing i18n de
 * Astro desde el prefijo de la URL); si por algo no está, cae a parsear la
 * URL. `path` es la ruta canónica sin prefijo, para el selector de idioma.
 * `href(path)` localiza enlaces internos para no perder el idioma al navegar.
 */
export function i18n(astro: { currentLocale?: string; url: URL }) {
  const fromCurrent =
    astro.currentLocale && isLang(astro.currentLocale) ? astro.currentLocale : null
  const parsed = parseLocale(astro.url.pathname)
  const lang = fromCurrent ?? parsed.lang
  return {
    lang,
    path: parsed.path,
    t: useTranslations(lang),
    href: (p: string) => localizeUrl(lang, p),
  }
}

export { NON_DEFAULT }
