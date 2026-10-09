import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    DELCOM_BASEURL: JSON.stringify('https://open-api.delcom.org/api/v1'),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        'src/setupTests.ts',
        'src/test-utils.ts',
        'src/env.d.ts',
        '**/*.test.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 49,
        functions: 78,
        branches: 81,
        statements: 49,
      },
    },
  },
})
