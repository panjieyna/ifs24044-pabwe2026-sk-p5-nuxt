<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <main class="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-slate-800">
    <div class="max-w-md w-full text-center space-y-5 rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
      <div class="mx-auto h-16 w-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-black">
        404
      </div>
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">Halaman Tidak Ditemukan</h1>
        <p class="text-sm text-slate-500 mt-2">
          Maaf, tautan atau halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
      </div>
      <button
        type="button"
        aria-label="Kembali ke Beranda"
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        @click="router.push('/')"
      >
        <span>← Kembali ke Beranda</span>
      </button>
    </div>
  </main>
</template>
