<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCashFlowsStore } from '../states/cashFlowsStore'
import ChangeModal from '../modals/ChangeModal.vue'
import {
  formatRupiah,
  formatDate,
  showConfirmDialog,
  showSuccessDialog,
  showErrorDialog,
} from '../../../helpers/toolsHelper'

const route = useRoute()
const router = useRouter()
const store = useCashFlowsStore()

const isChangeModalOpen = ref(false)

const loadDetail = async () => {
  const id = route.params.cashFlowId as string
  if (id) {
    await store.asyncGetCashFlowById(id)
  }
}

onMounted(async () => {
  await loadDetail()
})

async function handleDelete() {
  if (!store.cashFlow) return
  const confirmed = await showConfirmDialog(
    'Konfirmasi Hapus',
    'Apakah Anda yakin ingin menghapus transaksi ini?'
  )

  if (confirmed) {
    const res = await store.asyncDeleteCashFlow(store.cashFlow.id)
    if (res?.success || res?.status === 'success') {
      showSuccessDialog('Berhasil', res?.message || 'Transaksi berhasil dihapus')
      router.push('/')
    } else {
      showErrorDialog('Gagal', res?.message || 'Gagal menghapus transaksi')
    }
  }
}
</script>

<template>
  <div class="max-w-3xl space-y-6">
    <!-- Navigation Back -->
    <div class="flex items-center justify-between">
      <button
        type="button"
        aria-label="Kembali"
        class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        @click="router.push('/')"
      >
        <span class="text-sm">←</span>
        <span>Kembali ke Beranda</span>
      </button>

      <div v-if="store.cashFlow" class="flex items-center gap-2">
        <button
          type="button"
          aria-label="Ubah"
          class="rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
          @click="isChangeModalOpen = true"
        >
          Ubah
        </button>

        <button
          type="button"
          aria-label="Hapus"
          class="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
          @click="handleDelete"
        >
          Hapus
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="store.isLoading" class="rounded-xl border border-slate-200 bg-white p-12 text-center" data-testid="detail-loading">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      <p class="mt-3 text-sm text-slate-500">Memuat rincian transaksi...</p>
    </div>

    <!-- Not Found State -->
    <div
      v-else-if="!store.cashFlow"
      class="rounded-xl border border-slate-200 bg-white p-12 text-center"
      data-testid="detail-not-found"
    >
      <p class="text-base font-semibold text-slate-700">Data transaksi tidak ditemukan</p>
      <button
        type="button"
        class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
        @click="router.push('/')"
      >
        Kembali ke Beranda
      </button>
    </div>

    <!-- Detail Card -->
    <div v-else class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6" data-testid="detail-card">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <span
            :class="[
              'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
              store.cashFlow.type === 'inflow'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800',
            ]"
          >
            {{ store.cashFlow.type === 'inflow' ? '+ Pemasukan (Inflow)' : '- Pengeluaran (Outflow)' }}
          </span>
          <h1 class="mt-3 text-2xl font-bold text-slate-900">{{ store.cashFlow.label }}</h1>
        </div>

        <div class="text-left sm:text-right">
          <p class="text-xs font-medium text-slate-500">Nominal Transaksi</p>
          <p
            class="text-2xl sm:text-3xl font-extrabold mt-1"
            :class="store.cashFlow.type === 'inflow' ? 'text-emerald-700' : 'text-rose-700'"
            data-testid="detail-nominal"
          >
            {{ formatRupiah(store.cashFlow.nominal) }}
          </p>
        </div>
      </div>

      <!-- Detail Properties Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div class="rounded-xl bg-slate-50 p-4 border border-slate-100">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Sumber Dana</p>
          <p class="mt-1 font-semibold text-slate-800 uppercase" data-testid="detail-source">
            {{ store.cashFlow.source }}
          </p>
        </div>

        <div class="rounded-xl bg-slate-50 p-4 border border-slate-100">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">ID Transaksi</p>
          <p class="mt-1 font-semibold text-slate-800" data-testid="detail-id">
            #{{ store.cashFlow.id }}
          </p>
        </div>

        <div class="rounded-xl bg-slate-50 p-4 border border-slate-100">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Tanggal Pencatatan</p>
          <p class="mt-1 font-semibold text-slate-800" data-testid="detail-created-at">
            {{ formatDate(store.cashFlow.created_at) }}
          </p>
        </div>

        <div class="rounded-xl bg-slate-50 p-4 border border-slate-100">
          <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Terakhir Diperbarui</p>
          <p class="mt-1 font-semibold text-slate-800" data-testid="detail-updated-at">
            {{ formatDate(store.cashFlow.updated_at) }}
          </p>
        </div>
      </div>

      <!-- Description Section -->
      <div class="rounded-xl bg-slate-50 p-5 border border-slate-100">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Deskripsi / Catatan</p>
        <p class="text-sm text-slate-700 whitespace-pre-line leading-relaxed" data-testid="detail-description">
          {{ store.cashFlow.description || 'Tidak ada catatan tambahan untuk transaksi ini.' }}
        </p>
      </div>
    </div>

    <!-- Modal Ubah Transaksi -->
    <ChangeModal
      :is-open="isChangeModalOpen"
      :cash-flow="store.cashFlow"
      @close="isChangeModalOpen = false"
      @success="loadDetail"
    />
  </div>
</template>
