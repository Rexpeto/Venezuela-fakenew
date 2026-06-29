import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  integrations: [],
  i18n: {
    locales: ['es', 'en', 'pt'],
    defaultLocale: 'es',
    // en/pt no tienen páginas propias: Astro reescribe (sin redirect) el
    // contenido de la página `es` en la URL localizada. El idioma se lee de
    // la URL (Astro.url.pathname) en cada componente.
    fallback: { en: 'es', pt: 'es' },
    routing: {
      prefixDefaultLocale: false,
      fallbackType: 'rewrite',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
