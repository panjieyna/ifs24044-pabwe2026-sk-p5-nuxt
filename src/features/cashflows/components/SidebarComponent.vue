<script setup lang="ts">
import { useRoute } from 'vue-router'

defineProps<{
  isOpen?: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

const route = useRoute()

const navLinks = [
  { name: 'Ringkasan Arus Kas', path: '/' },
  { name: 'Direktori Pengguna', path: '/users' },
  { name: 'Profil Saya', path: '/profile' },
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <div>
    <!-- Mobile Backdrop -->
    <div
      v-if="isOpen"
      data-testid="sidebar-backdrop"
      class="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs transition-opacity lg:hidden"
      @click="$emit('close')"
    ></div>

    <!-- Sidebar Container -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
      aria-label="Sidebar Navigasi"
    >
      <div class="flex h-16 items-center justify-between border-b border-slate-200 px-6 lg:hidden">
        <div class="flex items-center gap-2">
          <div class="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
            D
          </div>
          <span class="font-bold text-slate-900 text-sm">Delcom Cash Flow</span>
        </div>
        <button
          type="button"
          aria-label="Tutup sidebar"
          class="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          @click="$emit('close')"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav class="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
        <p class="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Menu Utama
        </p>
        <RouterLink
          v-for="item in navLinks"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors',
            isActive(item.path)
              ? 'bg-blue-50 text-blue-700 shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
          ]"
          @click="$emit('close')"
        >
          <span>{{ item.name }}</span>
        </RouterLink>
      </nav>

      <div class="border-t border-slate-200 p-4">
        <div class="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          <p class="font-semibold text-slate-700">Delcom Cash Flow</p>
          <p class="mt-0.5">Versi 1.0 SPA</p>
        </div>
      </div>
    </aside>
  </div>
</template>
