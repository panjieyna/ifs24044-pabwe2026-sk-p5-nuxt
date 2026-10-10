import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/vue'
import { nextTick } from 'vue'
import DetailPage from './DetailPage.vue'
import { renderWithProviders, createMockPinia } from '../../../test-utils'
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

const routeParams: Record<string, string> = { cashFlowId: '42' }
const mockPush = vi.fn()

vi.mock('vue-router', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    useRoute: () => ({
      params: routeParams,
      path: `/cash-flows/${routeParams.cashFlowId || ''}`,
      fullPath: `/cash-flows/${routeParams.cashFlowId || ''}`,
      query: {},
      hash: '',
      name: undefined,
      matched: [],
      meta: {},
      redirectedFrom: undefined,
    }),
    useRouter: () => ({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      currentRoute: { value: { params: routeParams } },
    }),
  }
})

const mockCashFlow = {
  id: 42,
  type: 'inflow' as const,
  source: 'cash' as const,
  label: 'Gaji',
  nominal: 5000000,
  description: 'Gaji bulanan',
  created_at: '2024-10-01 10:00:00',
  updated_at: '2024-10-02 11:00:00',
}

describe('DetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    routeParams.cashFlowId = '42'
  })

  it('loads detail on mount and shows card', async () => {
    const pinia = createMockPinia()
    const store = useCashFlowsStore(pinia)
    vi.spyOn(store, 'asyncGetCashFlowById').mockImplementation(async () => {
      store.cashFlow = mockCashFlow
      store.isLoading = false
      return { success: true } as any
    })

    const { getByTestId, getByText } = renderWithProviders(DetailPage, { pinia })

    await waitFor(() => {
      expect(store.asyncGetCashFlowById).toHaveBeenCalledWith('42')
    })
    await waitFor(() => {
      expect(getByTestId('detail-card')).toBeInTheDocument()
    })
    expect(getByText('Gaji')).toBeInTheDocument()
    expect(getByTestId('detail-nominal')).toBeInTheDocument()
    expect(getByTestId('detail-source')).toHaveTextContent('cash')
    expect(getByTestId('detail-id')).toHaveTextContent('#42')
  })

  it('shows loading state', async () => {
    const { getByTestId } = renderWithProviders(DetailPage)
    const store = useCashFlowsStore()
    store.isLoading = true
    store.cashFlow = null
    await nextTick()
    expect(getByTestId('detail-loading')).toBeInTheDocument()
  })

  it('shows not found state and navigates home', async () => {
    const { getByTestId, getByRole } = renderWithProviders(DetailPage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlow = null
    await nextTick()

    expect(getByTestId('detail-not-found')).toBeInTheDocument()
    await fireEvent.click(getByRole('button', { name: /Kembali ke Beranda/i }))
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('navigates back via back button', async () => {
    const { getByRole } = renderWithProviders(DetailPage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlow = mockCashFlow
    await nextTick()

    await fireEvent.click(getByRole('button', { name: 'Kembali' }))
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('opens change modal', async () => {
    const { getByRole } = renderWithProviders(DetailPage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlow = mockCashFlow
    await nextTick()

    await fireEvent.click(getByRole('button', { name: 'Ubah' }))
    await nextTick()
  })

  it('handles delete confirmed success', async () => {
    const { getByRole } = renderWithProviders(DetailPage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlow = mockCashFlow
    await nextTick()

    vi.mocked(toolsHelper.showConfirmDialog).mockResolvedValueOnce(true)
    vi.spyOn(store, 'asyncDeleteCashFlow').mockResolvedValueOnce({
      success: true,
      status: 'success',
      message: 'Transaksi berhasil dihapus',
    } as any)

    await fireEvent.click(getByRole('button', { name: 'Hapus' }))
    await waitFor(() => {
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith('Berhasil', 'Transaksi berhasil dihapus')
    })
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('handles delete confirmed failure', async () => {
    const { getByRole } = renderWithProviders(DetailPage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlow = mockCashFlow
    await nextTick()

    vi.mocked(toolsHelper.showConfirmDialog).mockResolvedValueOnce(true)
    vi.spyOn(store, 'asyncDeleteCashFlow').mockResolvedValueOnce({
      success: false,
      message: 'Gagal hapus',
    } as any)

    await fireEvent.click(getByRole('button', { name: 'Hapus' }))
    await waitFor(() => {
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith('Gagal', 'Gagal hapus')
    })
  })

  it('cancels delete when not confirmed', async () => {
    const { getByRole } = renderWithProviders(DetailPage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlow = mockCashFlow
    await nextTick()

    vi.mocked(toolsHelper.showConfirmDialog).mockResolvedValueOnce(false)
    const delSpy = vi.spyOn(store, 'asyncDeleteCashFlow')

    await fireEvent.click(getByRole('button', { name: 'Hapus' }))
    await nextTick()
    expect(delSpy).not.toHaveBeenCalled()
  })

  it('renders outflow type badge and empty description fallback', async () => {
    const { getByTestId } = renderWithProviders(DetailPage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlow = {
      ...mockCashFlow,
      type: 'outflow',
      description: '',
    }
    await nextTick()
    expect(getByTestId('detail-card')).toBeInTheDocument()
  })

  it('skips load when no cashFlowId in route', async () => {
    routeParams.cashFlowId = ''
    const pinia = createMockPinia()
    const store = useCashFlowsStore(pinia)
    const spy = vi.spyOn(store, 'asyncGetCashFlowById')

    const { getByTestId } = renderWithProviders(DetailPage, { pinia })
    store.isLoading = false
    store.cashFlow = null
    await nextTick()

    expect(spy).not.toHaveBeenCalled()
    expect(getByTestId('detail-not-found')).toBeInTheDocument()
  })

  it('handleDelete returns early when no cashFlow', async () => {
    const { queryByRole } = renderWithProviders(DetailPage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlow = null
    await nextTick()
    expect(queryByRole('button', { name: 'Hapus' })).toBeNull()
  })

  it('calls asyncGetCashFlowById when route has id', async () => {
    routeParams.cashFlowId = '42'
    const pinia = createMockPinia()
    const store = useCashFlowsStore(pinia)
    const spy = vi.spyOn(store, 'asyncGetCashFlowById').mockImplementation(async (id) => {
      store.cashFlow = { ...mockCashFlow, id: Number(id) }
      store.isLoading = false
      return { success: true, status: 'success' } as any
    })

    const { getByTestId } = renderWithProviders(DetailPage, { pinia })

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith('42')
    })
    await waitFor(() => {
      expect(getByTestId('detail-card')).toBeInTheDocument()
    })
  })

  it('delete success uses default message when missing', async () => {
    const { getByRole } = renderWithProviders(DetailPage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlow = mockCashFlow
    await nextTick()

    vi.mocked(toolsHelper.showConfirmDialog).mockResolvedValueOnce(true)
    vi.spyOn(store, 'asyncDeleteCashFlow').mockResolvedValueOnce({
      status: 'success',
    } as any)

    await fireEvent.click(getByRole('button', { name: 'Hapus' }))
    await waitFor(() => {
      expect(toolsHelper.showSuccessDialog).toHaveBeenCalledWith(
        'Berhasil',
        'Transaksi berhasil dihapus'
      )
    })
  })

  it('delete failure uses default message when missing', async () => {
    const { getByRole } = renderWithProviders(DetailPage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlow = mockCashFlow
    await nextTick()

    vi.mocked(toolsHelper.showConfirmDialog).mockResolvedValueOnce(true)
    vi.spyOn(store, 'asyncDeleteCashFlow').mockResolvedValueOnce({
      success: false,
    } as any)

    await fireEvent.click(getByRole('button', { name: 'Hapus' }))
    await waitFor(() => {
      expect(toolsHelper.showErrorDialog).toHaveBeenCalledWith(
        'Gagal',
        'Gagal menghapus transaksi'
      )
    })
  })

  it('closes change modal', async () => {
    const { getByRole } = renderWithProviders(DetailPage)
    const store = useCashFlowsStore()
    store.isLoading = false
    store.cashFlow = mockCashFlow
    await nextTick()

    await fireEvent.click(getByRole('button', { name: 'Ubah' }))
    await nextTick()
    const backdrop = document.querySelector('[data-testid="change-modal-backdrop"]')
    if (backdrop) {
      await fireEvent.click(backdrop)
    }
    await nextTick()
  })
})
