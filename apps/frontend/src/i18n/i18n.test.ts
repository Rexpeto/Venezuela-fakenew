import { expect, test } from 'bun:test'
import {
  parseLocale,
  localizeUrl,
  useTranslations,
  chooseLocaleRedirect,
} from './index'
import { ui } from './ui'

test('parseLocale strips a known locale prefix', () => {
  expect(parseLocale('/en/verificar')).toEqual({ lang: 'en', path: '/verificar' })
  expect(parseLocale('/pt/patrones')).toEqual({ lang: 'pt', path: '/patrones' })
  expect(parseLocale('/en')).toEqual({ lang: 'en', path: '/' })
})

test('parseLocale leaves default + unprefixed + unknown paths as es', () => {
  expect(parseLocale('/')).toEqual({ lang: 'es', path: '/' })
  expect(parseLocale('/verificar')).toEqual({ lang: 'es', path: '/verificar' })
  expect(parseLocale('/unknown')).toEqual({ lang: 'es', path: '/unknown' })
  // 'es' nunca lleva prefijo: /es/x no es una ruta válida y no se reescribe
  expect(parseLocale('/es/verificar')).toEqual({ lang: 'es', path: '/es/verificar' })
})

test('localizeUrl prefixes non-default locales only', () => {
  expect(localizeUrl('es', '/verificar')).toBe('/verificar')
  expect(localizeUrl('en', '/verificar')).toBe('/en/verificar')
  expect(localizeUrl('pt', '/patrones')).toBe('/pt/patrones')
  expect(localizeUrl('en', '/')).toBe('/en')
})

test('parseLocale and localizeUrl round-trip', () => {
  for (const url of ['/', '/verificar', '/en/patrones', '/pt/asistente']) {
    const { lang, path } = parseLocale(url)
    expect(localizeUrl(lang, path)).toBe(url)
  }
})

test('every UI key resolves to a non-empty string in all locales (fallback to es)', () => {
  for (const key of Object.keys(ui.es) as (keyof typeof ui.es)[]) {
    expect(useTranslations('es')(key)).toBeTruthy()
    expect(useTranslations('en')(key)).toBeTruthy()
    expect(useTranslations('pt')(key)).toBeTruthy()
  }
})

test('translations differ per locale where expected', () => {
  expect(useTranslations('es')('nav.verificar')).toBe('Verificar')
  expect(useTranslations('en')('nav.verificar')).toBe('Verify')
  expect(useTranslations('pt')('nav.patrones')).toBe('Padrões')
})

test('chooseLocaleRedirect: browser preference on default-locale routes', () => {
  expect(chooseLocaleRedirect({ current: 'es', preferred: 'en' })).toBe('en')
  expect(chooseLocaleRedirect({ current: 'es', preferred: 'pt' })).toBe('pt')
  // navegador prefiere es, o no hay match → no redirige
  expect(chooseLocaleRedirect({ current: 'es', preferred: 'es' })).toBeNull()
  expect(chooseLocaleRedirect({ current: 'es', preferred: undefined })).toBeNull()
  // current ausente se trata como default es
  expect(chooseLocaleRedirect({ current: undefined, preferred: 'en' })).toBe('en')
})

test('chooseLocaleRedirect: explicit cookie wins over browser', () => {
  // eligió es explícitamente aunque el navegador prefiera en → se queda en es
  expect(chooseLocaleRedirect({ current: 'es', cookie: 'es', preferred: 'en' })).toBeNull()
  // eligió en aunque el navegador prefiera es → redirige a en
  expect(chooseLocaleRedirect({ current: 'es', cookie: 'en', preferred: 'es' })).toBe('en')
  // cookie basura se ignora, cae al navegador
  expect(chooseLocaleRedirect({ current: 'es', cookie: 'xx', preferred: 'pt' })).toBe('pt')
})

test('chooseLocaleRedirect: never touches already-prefixed routes (no loop)', () => {
  // current = en/pt (ya con prefijo) → nunca redirige, evita el loop /en -> /en
  expect(chooseLocaleRedirect({ current: 'en', preferred: 'pt' })).toBeNull()
  expect(chooseLocaleRedirect({ current: 'en', preferred: 'en' })).toBeNull()
  expect(chooseLocaleRedirect({ current: 'pt', cookie: 'en', preferred: 'en' })).toBeNull()
})
