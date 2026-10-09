import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  future: {
    compatibilityVersion: 4,
  },
  srcDir: 'src/',
  ssr: false,
  modules: ['@pinia/nuxt'],
  css: ['~/index.css'],
  vite: {
    plugins: [tailwindcss()],
    define: {
      DELCOM_BASEURL: JSON.stringify(process.env.VITE_DELCOM_BASEURL || 'https://open-api.delcom.org/api/v1'),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-vue': ['vue', 'vue-router', 'pinia'],
            'vendor-ui': ['lucide-vue-next', 'sweetalert2'],
            'vendor-utils': ['ofetch', 'ufo', 'defu', 'klona', 'ohash', 'scule'],
          },
        },
      },
      cssCodeSplit: true,
      minify: 'esbuild',
    },
  },
  runtimeConfig: {
    public: {
      delcomBaseUrl: process.env.VITE_DELCOM_BASEURL || 'https://open-api.delcom.org/api/v1',
    },
  },
  devServer: {
    port: Number(process.env.APP_PORT || 3000),
  },
  app: {
    head: {
      title: 'Delcom Cash Flow',
      htmlAttrs: { lang: 'id' },
      bodyAttrs: { class: 'antialiased' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Delcom Cash Flow — aplikasi pencatatan arus kas untuk memantau pemasukan, pengeluaran, serta saldo kas tunai, tabungan, dan pinjaman secara real-time.' },
        { name: 'theme-color', content: '#2563eb' },
        { name: 'color-scheme', content: 'light' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Delcom Cash Flow' },
        { property: 'og:title', content: 'Delcom Cash Flow — Pencatatan Arus Kas' },
        { property: 'og:description', content: 'Kelola pemasukan, pengeluaran, dan saldo kas tunai, tabungan, serta pinjaman dengan mudah.' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'Delcom Cash Flow — Pencatatan Arus Kas' },
        { name: 'twitter:description', content: 'Kelola pemasukan, pengeluaran, dan saldo kas tunai, tabungan, serta pinjaman dengan mudah.' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'preload',
          as: 'style',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap',
          fetchpriority: 'high',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap',
          media: 'print',
          onload: "this.media='all'",
        },
        { rel: 'dns-prefetch', href: 'https://open-api.delcom.org' },
      ],
      script: [
        {
          children: `
            if ('onpageshow' in window) {
              window.addEventListener('pageshow', (event) => {
                if (event.persisted) {
                  window.location.reload();
                }
              });
            }
          `,
          type: 'text/javascript',
          pos: 'bodyClose',
        },
      ],
    },
  },
})
