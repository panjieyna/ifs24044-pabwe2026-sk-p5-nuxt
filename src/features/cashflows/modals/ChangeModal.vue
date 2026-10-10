<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useCashFlowsStore, type CashFlow } from '../states/cashFlowsStore'
import { showSuccessDialog, showErrorDialog } from '../../../helpers/toolsHelper'

const props = defineProps<{
  isOpen: boolean
  cashFlow: CashFlow | null
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const store = useCashFlowsStore()

const form = reactive({
  type: 'inflow' as 'inflow' | 'outflow',
  source: 'cash' as 'cash' | 'savings' | 'loans',
  label: '',
  nominal: 0,
  description: '',
})

function getWatchSource() {
  return [props.isOpen, props.cashFlow] as const
}

function onCashFlowOpen([open, cf]: readonly [boolean, CashFlow | null | undefined]) {
  if (open && cf) {
    const data = cf as CashFlow
    form.type = data.type || 'inflow'
    form.source = data.source || 'cash'
    form.label = data.label || ''
    form.nominal = data.nominal || 0
    form.description = data.description || ''
  }
}

watch(getWatchSource, onCashFlowOpen, { immediate: true })

function handleClose() {
  emit('close')
}

function handleSuccess() {
  emit('success')
  emit('close')
}

async function submit() {
  if (!props.cashFlow) return

  if (!form.label.trim()) {
    showErrorDialog('Validasi Gagal', 'Label transaksi wajib diisi')
    return
  }
  if (!form.nominal || form.nominal <= 0) {
    showErrorDialog('Validasi Gagal', 'Nominal harus lebih dari 0')
    return
  }

  const res = await store.asyncUpdateCashFlow(props.cashFlow.id, {
    type: form.type,
    source: form.source,
    label: form.label.trim(),
    nominal: Number(form.nominal),
    description: form.description.trim(),
  })

  if (res?.success || res?.status === 'success') {
    showSuccessDialog('Berhasil', res?.message || 'Transaksi berhasil diubah')
    handleSuccess()
  } else {
    showErrorDialog('Gagal', res?.message || 'Gagal mengubah transaksi')
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div
      data-testid="change-modal-backdrop"
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      @click="handleClose"
    ></div>

    <!-- Modal Box -->
    <div
      class="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-modal-title"
    >
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 id="change-modal-title" class="text-lg font-bold text-slate-900">
          Ubah Transaksi
        </h3>
        <button
          type="button"
          aria-label="Tutup"
          class="rounded-lg p-1 text-slate-600 hover:bg-slate-100 hover:text-slate-600"
          @click="handleClose"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form class="space-y-4 mt-4" novalidate @submit.prevent="submit">
        <!-- Tipe Transaksi -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Tipe Transaksi</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              :class="[
                'rounded-lg py-2.5 text-sm font-semibold border transition-all text-center',
                form.type === 'inflow'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
              ]"
              @click="form.type = 'inflow'"
            >
              + Pemasukan (Inflow)
            </button>
            <button
              type="button"
              :class="[
                'rounded-lg py-2.5 text-sm font-semibold border transition-all text-center',
                form.type === 'outflow'
                  ? 'border-rose-600 bg-rose-50 text-rose-700 ring-2 ring-rose-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
              ]"
              @click="form.type = 'outflow'"
            >
              - Pengeluaran (Outflow)
            </button>
          </div>
        </div>

        <!-- Sumber Dana -->
        <div>
          <label for="change-source" class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Sumber Dana
          </label>
          <select
            id="change-source"
            v-model="form.source"
            aria-label="Sumber Dana"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="cash">Tunai (Cash)</option>
            <option value="savings">Tabungan (Savings)</option>
            <option value="loans">Pinjaman (Loans)</option>
          </select>
        </div>

        <!-- Label / Kategori -->
        <div>
          <label for="change-label" class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Label / Kategori
          </label>
          <input
            id="change-label"
            v-model="form.label"
            type="text"
            placeholder="cth: Gaji, Belanja, Transportasi"
            aria-label="Label"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <!-- Nominal -->
        <div>
          <label for="change-nominal" class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Nominal (Rp)
          </label>
          <input
            id="change-nominal"
            v-model.number="form.nominal"
            type="number"
            min="1"
            placeholder="0"
            aria-label="Nominal"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <!-- Deskripsi -->
        <div>
          <label for="change-description" class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Deskripsi (Opsional)
          </label>
          <textarea
            id="change-description"
            v-model="form.description"
            rows="3"
            placeholder="Catatan tambahan transaksi..."
            aria-label="Deskripsi"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
          ></textarea>
        </div>

        <!-- Tombol Aksi -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            @click="handleClose"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="store.isCashFlowChange"
            class="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {{ store.isCashFlowChange ? 'Menyimpan...' : 'Perbarui Transaksi' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
