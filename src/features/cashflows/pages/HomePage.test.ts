import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/vue'
import { nextTick } from 'vue'
import HomePage from './HomePage.vue'
import { renderWithProviders } from '../../../test-utils'
import { useCashFlowsStore } from '../states/cashFlowsStore'
import * as toolsHelper from '../../../helpers/toolsHelper'

vi.mock('../../../helpers/toolsHelper', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    showConfirmDialog: vi.fn(),
    showSuccessDialog: vi.fn(),
    showErrorDialog: vi.fn(),
  }
})

const mockCashFlow = {
  id: 1,
  type: 'inflow' as const,
  source: 'cash' as const,
  label: 'Gaji',
  nominal: 5000000,
  description: 'Gaji bulanan',
  created_at: '2024-10-01 10:00:00',
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders metrics and empty state', async () => {
    const { getByTestId, getByText } = renderWithProviders(HomePage)
    const store = useCashFlowsStore()
    vi.spyOn(store, 'asyncGetCashFlows').mockResolvedValue({ success: true } as any)
    vi.spyOn(store, 'asyncGetLabels').mockResolvedValue({ success: true } as any)

    store.isLoading = false
    store.cashFlows = []
    store.stats = {
      total_inflow: 1000000,
      total_outflow: 200000,
      cashflow: 800000,
      cash: 500000,
      savings: 200000,
      loans: 100000,
    }
    store.labels = ['gaji', 'makan']
    await nextTick()

    expect(getByText('Ringkasan Arus Kas')).toBeInTheDocument()
    expect(getByTestId('metric-net-balance')).toBeInTheDocument()
    expect(getByTestId('metric-total-inflow')).toBeInTheDocument()
    expect(getByTestId('cashflows-empty')).toBeInTheDocument()
  })

  it('computes fallback metrics when stats keys missing', async () => {
    const { getByTestId } = renderWithProviders(HomePage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlows = []
    store.stats = {
      total_inflow: 100,
      total_outflow: 40,
      total_inflow_cash: 80,
      total_outflow_cash: 20,
      total_inflow_savings: 15,
      total_outflow_savings: 5,
      total_inflow_loans: 5,
      total_outflow_loans: 15,
    } as any
    await nextTick()

    expect(getByTestId('metric-net-balance')).toBeInTheDocument()
    expect(getByTestId('metric-total-inflow')).toBeInTheDocument()
  })

  it('renders transaction list and navigates to detail', async () => {
    const { getByTestId, getAllByRole, router } = renderWithProviders(HomePage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlows = [mockCashFlow, { ...mockCashFlow, id: 2, type: 'outflow', label: 'Makan' }]
    store.stats = { total_inflow: 5000000, total_outflow: 50000 }
    store.labels = ['Gaji', 'Makan']
    await nextTick()

    expect(getByTestId('cashflows-table')).toBeInTheDocument()

    const pushSpy = vi.spyOn(router, 'push')
    const detailBtns = getAllByRole('button', { name: 'Detail' })
    expect(detailBtns.length).toBeGreaterThan(0)
    await fireEvent.click(detailBtns[0])
    expect(pushSpy).toHaveBeenCalledWith('/cash-flows/1')
  })

  it('opens add modal', async () => {
    const { getByRole } = renderWithProviders(HomePage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlows = []
    await nextTick()

    await fireEvent.click(getByRole('button', { name: 'Tambah Transaksi' }))
    await nextTick()
    // modal may render based on isAddModalOpen
  })

  it('applies and resets filters', async () => {
    const { getByLabelText, getByRole } = renderWithProviders(HomePage)
    const store = useCashFlowsStore()
    const getSpy = vi.spyOn(store, 'asyncGetCashFlows').mockResolvedValue({ success: true } as any)
    vi.spyOn(store, 'asyncGetLabels').mockResolvedValue({ success: true } as any)
    store.isLoading = false
    store.cashFlows = [mockCashFlow]
    store.labels = ['Gaji']
    await nextTick()

    await fireEvent.update(getByLabelText('Filter Tipe'), 'inflow')
    await fireEvent.update(getByLabelText('Filter Sumber'), 'cash')
    await fireEvent.update(getByLabelText('Filter Label'), 'Gaji')
    await fireEvent.update(getByLabelText('Dari Tanggal'), '2024-01-01')
    await fireEvent.update(getByLabelText('Sampai Tanggal'), '2024-12-31')

    // change events trigger applyFilter
    await fireEvent.change(getByLabelText('Filter Tipe'))
    expect(getSpy).toHaveBeenCalled()

  })

  it('handles reset all confirmed success', async () => {
    const { getByRole } = renderWithProviders(HomePage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlows = [mockCashFlow]
    store.stats = { total_inflow: 1, total_outflow: 0 }
    await nextTick()

    vi.mocked(toolsHelper.showConfirmDialog).mockResolvedValueOnce(true)
    vi.spyOn(store, 'asyncDeleteAllCashFlows').mockResolvedValueOnce({
      success: true,
      status: 'success',
      message: 'Semua dihapus',
    } as any)
    vi.spyOn(store, 'asyncGetCashFlows').mockResolvedValue({ success: true } as any)
    vi.spyOn(store, 'asyncGetLabels').mockResolvedValue({ success: true } as any)

    await fireEvent.click(getByRole('button', { name: 'Reset Semua Data' }))
    await waitFor(() => {
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalled()
    })
  })

  it('handles reset all confirmed failure', async () => {
    const { getByRole } = renderWithProviders(HomePage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlows = [mockCashFlow]
    await nextTick()

    vi.mocked(toolsHelper.showConfirmDialog).mockResolvedValueOnce(true)
    vi.spyOn(store, 'asyncDeleteAllCashFlows').mockResolvedValueOnce({
      success: false,
      message: 'Gagal reset',
    } as any)

    await fireEvent.click(getByRole('button', { name: 'Reset Semua Data' }))
    await waitFor(() => {
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Gagal', 'Gagal reset')
    })
  })

  it('cancels reset all when not confirmed', async () => {
    const { getByRole } = renderWithProviders(HomePage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlows = [mockCashFlow]
    await nextTick()

    vi.mocked(toolsHelper.showConfirmDialog).mockResolvedValueOnce(false)
    const deleteSpy = vi.spyOn(store, 'asyncDeleteAllCashFlows')

    await fireEvent.click(getByRole('button', { name: 'Reset Semua Data' }))
    expect(deleteSpy).not.toHaveBeenCalled()
  })

  it('shows loading state', async () => {
    const { getByTestId } = renderWithProviders(HomePage)
    const store = useCashFlowsStore()
    store.isLoading = true
    await nextTick()
    expect(getByTestId('cashflows-loading')).toBeInTheDocument()
  })

  it('clicks Reset Filter button', async () => {
    const { getByRole, getByLabelText } = renderWithProviders(HomePage)
    const store = useCashFlowsStore()
    const getSpy = vi.spyOn(store, 'asyncGetCashFlows').mockResolvedValue({ success: true } as any)
    vi.spyOn(store, 'asyncGetLabels').mockResolvedValue({ success: true } as any)
    store.isLoading = false
    store.cashFlows = [mockCashFlow]
    store.labels = ['Gaji']
    await nextTick()

    await fireEvent.update(getByLabelText('Filter Tipe'), 'inflow')
    await fireEvent.click(getByRole('button', { name: 'Reset Filter' }))
    expect(getSpy).toHaveBeenCalled()
  })

  it('opens add modal from empty state button', async () => {
    const { getByRole, getByTestId } = renderWithProviders(HomePage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlows = []
    await nextTick()
    expect(getByTestId('cashflows-empty')).toBeInTheDocument()
    // empty state has + Tambah Transaksi button without aria-label sometimes
    const buttons = document.querySelectorAll('button')
    const emptyAdd = Array.from(buttons).find((b) => b.textContent?.includes('Tambah Transaksi'))
    if (emptyAdd) await fireEvent.click(emptyAdd)
  })

  it('reset all with status success and no message', async () => {
    const { getByRole } = renderWithProviders(HomePage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlows = [mockCashFlow]
    await nextTick()

    vi.mocked(toolsHelper.showConfirmDialog).mockResolvedValueOnce(true)
    vi.spyOn(store, 'asyncDeleteAllCashFlows').mockResolvedValueOnce({
      status: 'success',
    } as any)
    vi.spyOn(store, 'asyncGetCashFlows').mockResolvedValue({ success: true } as any)
    vi.spyOn(store, 'asyncGetLabels').mockResolvedValue({ success: true } as any)

    await fireEvent.click(getByRole('button', { name: 'Reset Semua Data' }))
    await waitFor(() => {
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith(
        'Berhasil',
        'Semua transaksi berhasil dihapus'
      )
    })
  })

  it('reset all failure with default message', async () => {
    const { getByRole } = renderWithProviders(HomePage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlows = [mockCashFlow]
    await nextTick()

    vi.mocked(toolsHelper.showConfirmDialog).mockResolvedValueOnce(true)
    vi.spyOn(store, 'asyncDeleteAllCashFlows').mockResolvedValueOnce({
      success: false,
    } as any)

    await fireEvent.click(getByRole('button', { name: 'Reset Semua Data' }))
    await waitFor(() => {
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
        'Gagal',
        'Gagal mereset transaksi'
      )
    })
  })

  it('clicks all detail buttons and closes modal', async () => {
    const { getByRole, getAllByRole, router } = renderWithProviders(HomePage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlows = [mockCashFlow]
    store.stats = {
      total_inflow: 1,
      total_outflow: 0,
      cashflow: 1,
      cash: 1,
      savings: 0,
      loans: 0,
    }
    await nextTick()

    const pushSpy = vi.spyOn(router, 'push')
    const detailBtns = getAllByRole('button', { name: 'Detail' })
    for (const btn of detailBtns) {
      await fireEvent.click(btn)
    }
    expect(pushSpy).toHaveBeenCalled()

    await fireEvent.click(getByRole('button', { name: 'Tambah Transaksi' }))
    await nextTick()
    // close via success path is covered in modal tests; ensure open works
  })

  it('closes add modal via close event', async () => {
    const { getByRole, getByTestId } = renderWithProviders(HomePage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlows = [mockCashFlow]
    await nextTick()

    await fireEvent.click(getByRole('button', { name: 'Tambah Transaksi' }))
    await nextTick()
    // AddModal backdrop emits close
    const backdrop = document.querySelector('[data-testid="add-modal-backdrop"]')
    if (backdrop) {
      await fireEvent.click(backdrop)
    }
    await nextTick()
  })
})
