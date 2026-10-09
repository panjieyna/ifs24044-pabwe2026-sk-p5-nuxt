<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCashFlowsStore } from '../states/cashFlowsStore'
import AddModal from '../modals/AddModal.vue'
import { formatRupiah, formatDate, showConfirmDialog, showSuccessDialog, showErrorDialog } from '../../../helpers/toolsHelper'

const router = useRouter()
const store = useCashFlowsStore()

const isAddModalOpen = ref(false)

const filters = reactive({
  type: '',
  source: '',
  label: '',
  start_date: '',
  end_date: '',
})

async function loadData() {
  const queryParams: any = {}
  if (filters.type) queryParams.type = filters.type
  if (filters.source) queryParams.source = filters.source
  if (filters.label) queryParams.label = filters.label
  if (filters.start_date) queryParams.start_date = `${filters.start_date} 00:00:00`
  if (filters.end_date) queryParams.end_date = `${filters.end_date} 23:59:59`

  await store.asyncGetCashFlows(queryParams)
  await store.asyncGetLabels()
}

onMounted(async () => {
  await loadData()
})

function applyFilter() {
  loadData()
}

function resetFilter() {
  filters.type = ''
  filters.source = ''
  filters.label = ''
  filters.start_date = ''
  filters.end_date = ''
  loadData()
}

async function handleResetAll() {
  const confirmed = await showConfirmDialog(
    'Hapus Semua Data',
    'Apakah Anda yakin ingin menghapus seluruh riwayat arus kas? Tindakan ini tidak dapat dibatalkan.'
  )

  if (confirmed) {
    const res = await store.asyncDeleteAllCashFlows()
    if (res?.success || res?.status === 'success') {
      showSuccessDialog('Berhasil', res?.message || 'Semua transaksi berhasil dihapus')
      await loadData()
    } else {
      showErrorDialog('Gagal', res?.message || 'Gagal mereset transaksi')
    }
  }
}

// Derived Metrics
const netBalance = computed(() => {
  if (store.stats?.cashflow !== undefined) return store.stats.cashflow
  return (store.stats?.total_inflow || 0) - (store.stats?.total_outflow || 0)
})

const totalInflow = computed(() => store.stats?.total_inflow || 0)
const totalOutflow = computed(() => store.stats?.total_outflow || 0)

const cashBalance = computed(() => {
  if (store.stats?.cash !== undefined) return store.stats.cash
  const inCash = store.stats?.total_inflow_cash || 0
  const outCash = store.stats?.total_outflow_cash || 0
  return inCash - outCash
})

const savingsBalance = computed(() => {
  if (store.stats?.savings !== undefined) return store.stats.savings
  const inSav = store.stats?.total_inflow_savings || 0
  const outSav = store.stats?.total_outflow_savings || 0
  return inSav - outSav
})

const loansBalance = computed(() => {
  if (store.stats?.loans !== undefined) return store.stats.loans
  const inLoan = store.stats?.total_inflow_loans || 0
  const outLoan = store.stats?.total_outflow_loans || 0
  return inLoan - outLoan
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header Page & Primary Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">Ringkasan Arus Kas</h1>
        <p class="text-sm text-slate-500 mt-0.5">Pantau pendapatan, pengeluaran, dan saldo aset Anda</p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          aria-label="Reset Semua Data"
          class="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
          @click="handleResetAll"
        >
          Reset Semua
        </button>

        <button
          type="button"
          aria-label="Tambah Transaksi"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          @click="isAddModalOpen = true"
        >
          <span class="text-base font-bold">+</span>
          <span>Tambah Transaksi</span>
        </button>
      </div>
    </div>

    <!-- 6 Kartu Metrik -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      <!-- Saldo Bersih -->
      <div class="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 shadow-xs">
        <p class="text-[11px] font-bold uppercase tracking-wider text-blue-700">Saldo Bersih</p>
        <p class="mt-2 text-lg font-extrabold text-blue-900 truncate" data-testid="metric-net-balance">
          {{ formatRupiah(netBalance) }}
        </p>
      </div>

      <!-- Total Inflow -->
      <div class="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-xs">
        <p class="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Total Inflow</p>
        <p class="mt-2 text-lg font-extrabold text-emerald-900 truncate" data-testid="metric-total-inflow">
          {{ formatRupiah(totalInflow) }}
        </p>
      </div>

      <!-- Total Outflow -->
      <div class="rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-4 shadow-xs">
        <p class="text-[11px] font-bold uppercase tracking-wider text-rose-700">Total Outflow</p>
        <p class="mt-2 text-lg font-extrabold text-rose-900 truncate" data-testid="metric-total-outflow">
          {{ formatRupiah(totalOutflow) }}
        </p>
      </div>

      <!-- Saldo Tunai (Cash) -->
      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <p class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Kas (Cash)</p>
        <p class="mt-2 text-lg font-bold text-slate-800 truncate" data-testid="metric-cash">
          {{ formatRupiah(cashBalance) }}
        </p>
      </div>

      <!-- Saldo Tabungan (Savings) -->
      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <p class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tabungan (Savings)</p>
        <p class="mt-2 text-lg font-bold text-slate-800 truncate" data-testid="metric-savings">
          {{ formatRupiah(savingsBalance) }}
        </p>
      </div>

      <!-- Saldo Pinjaman (Loans) -->
      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <p class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pinjaman (Loans)</p>
        <p class="mt-2 text-lg font-bold text-slate-800 truncate" data-testid="metric-loans">
          {{ formatRupiah(loansBalance) }}
        </p>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-600">Filter Transaksi</h2>
        <button
          type="button"
          aria-label="Reset Filter"
          class="text-xs font-semibold text-blue-600 hover:text-blue-800"
          @click="resetFilter"
        >
          Reset Filter
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <!-- Tipe Filter -->
        <div>
          <label for="filter-type" class="block text-[11px] font-semibold text-slate-500 mb-1">Tipe</label>
          <select
            id="filter-type"
            v-model="filters.type"
            aria-label="Filter Tipe"
            class="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
            @change="applyFilter"
          >
            <option value="">Semua Tipe</option>
            <option value="inflow">Inflow (Pemasukan)</option>
            <option value="outflow">Outflow (Pengeluaran)</option>
          </select>
        </div>

        <!-- Sumber Filter -->
        <div>
          <label for="filter-source" class="block text-[11px] font-semibold text-slate-500 mb-1">Sumber</label>
          <select
            id="filter-source"
            v-model="filters.source"
            aria-label="Filter Sumber"
            class="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
            @change="applyFilter"
          >
            <option value="">Semua Sumber</option>
            <option value="cash">Cash (Tunai)</option>
            <option value="savings">Savings (Tabungan)</option>
            <option value="loans">Loans (Pinjaman)</option>
          </select>
        </div>

        <!-- Label Filter -->
        <div>
          <label for="filter-label" class="block text-[11px] font-semibold text-slate-500 mb-1">Label</label>
          <select
            id="filter-label"
            v-model="filters.label"
            aria-label="Filter Label"
            class="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
            @change="applyFilter"
          >
            <option value="">Semua Label</option>
            <option v-for="lbl in store.labels" :key="lbl" :value="lbl">{{ lbl }}</option>
          </select>
        </div>

        <!-- Tanggal Mulai -->
        <div>
          <label for="filter-start-date" class="block text-[11px] font-semibold text-slate-500 mb-1">Dari Tanggal</label>
          <input
            id="filter-start-date"
            v-model="filters.start_date"
            type="date"
            aria-label="Dari Tanggal"
            class="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
            @change="applyFilter"
          />
        </div>

        <!-- Tanggal Akhir -->
        <div>
          <label for="filter-end-date" class="block text-[11px] font-semibold text-slate-500 mb-1">Sampai Tanggal</label>
          <input
            id="filter-end-date"
            v-model="filters.end_date"
            type="date"
            aria-label="Sampai Tanggal"
            class="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
            @change="applyFilter"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="store.isLoading" class="rounded-xl border border-slate-200 bg-white p-12 text-center" data-testid="cashflows-loading">
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      <p class="mt-3 text-sm text-slate-500">Memuat data transaksi...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="store.cashFlows.length === 0"
      class="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center"
      data-testid="cashflows-empty"
    >
      <div class="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg mb-3">
        Ø
      </div>
      <h3 class="text-base font-semibold text-slate-900">Belum ada catatan arus kas</h3>
      <p class="text-sm text-slate-500 mt-1">Mulai catat transaksi pertama Anda dengan mengklik tombol di bawah.</p>
      <button
        type="button"
        class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
        @click="isAddModalOpen = true"
      >
        + Tambah Transaksi
      </button>
    </div>

    <!-- Transactions List (Table Desktop / Cards Mobile) -->
    <div v-else class="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden" data-testid="cashflows-table">
      <!-- Desktop Table -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" class="px-6 py-3.5">Tipe</th>
              <th scope="col" class="px-6 py-3.5">Label</th>
              <th scope="col" class="px-6 py-3.5">Sumber</th>
              <th scope="col" class="px-6 py-3.5">Nominal</th>
              <th scope="col" class="px-6 py-3.5">Tanggal</th>
              <th scope="col" class="px-6 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="item in store.cashFlows"
              :key="item.id"
              class="hover:bg-slate-50/75 transition-colors"
            >
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                    item.type === 'inflow'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800',
                  ]"
                >
                  {{ item.type === 'inflow' ? '+ Inflow' : '- Outflow' }}
                </span>
              </td>
              <td class="px-6 py-4 font-semibold text-slate-900">
                {{ item.label }}
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 uppercase">
                  {{ item.source }}
                </span>
              </td>
              <td class="px-6 py-4 font-bold" :class="item.type === 'inflow' ? 'text-emerald-700' : 'text-rose-700'">
                {{ formatRupiah(item.nominal) }}
              </td>
              <td class="px-6 py-4 text-xs text-slate-500">
                {{ formatDate(item.created_at) }}
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  type="button"
                  class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                  @click="router.push(`/cash-flows/${item.id}`)"
                >
                  Detail
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="divide-y divide-slate-100 md:hidden">
        <div
          v-for="item in store.cashFlows"
          :key="item.id"
          class="p-4 space-y-2 hover:bg-slate-50 cursor-pointer"
          @click="router.push(`/cash-flows/${item.id}`)"
        >
          <div class="flex items-center justify-between">
            <span
              :class="[
                'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold',
                item.type === 'inflow'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800',
              ]"
            >
              {{ item.type === 'inflow' ? '+ Inflow' : '- Outflow' }}
            </span>
            <span class="text-xs text-slate-600">{{ formatDate(item.created_at) }}</span>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-bold text-slate-900">{{ item.label }}</p>
              <p class="text-xs text-slate-500 uppercase">{{ item.source }}</p>
            </div>
            <p
              class="font-bold text-base"
              :class="item.type === 'inflow' ? 'text-emerald-700' : 'text-rose-700'"
            >
              {{ formatRupiah(item.nominal) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Tambah Transaksi -->
    <AddModal
      :is-open="isAddModalOpen"
      @close="isAddModalOpen = false"
      @success="loadData"
    />
  </div>
</template>
