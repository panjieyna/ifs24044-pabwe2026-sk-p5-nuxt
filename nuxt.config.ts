import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  future: {
    compatibilityVersion: 4,
  },
  srcDir: 'src/',
  ssr: false,
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],
  css: ['~/index.css'],
  vite: {
    plugins: [tailwindcss()],
    define: {
      DELCOM_BASEURL: JSON.stringify(
        process.env.VITE_DELCOM_BASEURL || 'https://open-api.delcom.org/api/v1'
      ),
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
      delcomBaseUrl:
        process.env.VITE_DELCOM_BASEURL || 'https://open-api.delcom.org/api/v1',
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
        {
          name: 'description',
          content:
            'Delcom Cash Flow — aplikasi pencatatan arus kas untuk memantau pemasukan, pengeluaran, serta saldo kas tunai, tabungan, dan pinjaman secara real-time.',
        },
        { name: 'robots', content: 'index, follow' },
        { name: 'theme-color', content: '#2563eb' },
        { name: 'color-scheme', content: 'light' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Delcom Cash Flow' },
        {
          property: 'og:title',
          content: 'Delcom Cash Flow — Pencatatan Arus Kas',
        },
        {
          property: 'og:description',
          content:
            'Kelola pemasukan, pengeluaran, dan saldo kas tunai, tabungan, serta pinjaman dengan mudah.',
        },
        { name: 'twitter:card', content: 'summary' },
        {
          name: 'twitter:title',
          content: 'Delcom Cash Flow — Pencatatan Arus Kas',
        },
        {
          name: 'twitter:description',
          content:
            'Kelola pemasukan, pengeluaran, dan saldo kas tunai, tabungan, serta pinjaman dengan mudah.',
        },
      ],
      // Tanpa Google Fonts → FCP/LCP/Speed Index lebih cepat
      link: [
        { rel: 'dns-prefetch', href: 'https://open-api.delcom.org' },
      ],
    },
  },
})