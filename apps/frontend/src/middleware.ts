import { defineMiddleware } from 'astro:middleware'
import { parseLocale, localizeUrl, chooseLocaleRedirect } from './i18n'

// Cookie con la elección explícita de idioma (la setea LangSwitcher al hacer
// clic). Tiene prioridad sobre el navegador para que un usuario pueda quedarse
// en `es` aunque su navegador prefiera otro idioma.
const LOCALE_COOKIE = 'locale'

// Detección automática de idioma: en rutas sin prefijo (las `es`), redirige al
// locale preferido del cliente. Se decide con `context.currentLocale` (el locale
// que Astro resuelve de la URL original) — NO parseando context.url.pathname,
// que el routing i18n reescribe internamente y causaría un loop de redirects.
export const onRequest = defineMiddleware((context, next) => {
  // Solo navegaciones de documento: nunca assets, fetch ni llamadas API.
  if (!(context.request.headers.get('accept') ?? '').includes('text/html')) {
    return next()
  }

  const target = chooseLocaleRedirect({
    current: context.currentLocale,
    cookie: context.cookies.get(LOCALE_COOKIE)?.value,
    preferred: context.preferredLocale,
  })

  if (target) {
    const { path } = parseLocale(context.url.pathname)
    return context.redirect(localizeUrl(target, path) + context.url.search, 302)
  }
  return next()
})
