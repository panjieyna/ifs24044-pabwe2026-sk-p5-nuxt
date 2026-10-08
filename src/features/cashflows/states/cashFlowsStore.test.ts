import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCashFlowsStore } from './cashFlowsStore'
import * as cashFlowApi from '../api/cashFlowApi'

vi.mock('../api/cashFlowApi')

describe('cashFlowsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('handles asyncGetCashFlows success and error', async () => {
    const store = useCashFlowsStore()
    const mockCashFlows = [
      { id: 1, type: 'inflow' as const, source: 'cash' as const, label: 'Gaji', nominal: 1000000 },
    ]
    const mockStats = { total_inflow: 1000000, total_outflow: 0 }

    vi.mocked(cashFlowApi.getCashFlows).mockResolvedValueOnce({
      success: true,
      status: 'success',
      data: {
        cash_flows: mockCashFlows,
        stats: mockStats,
      },
    } as any)

    const res = await store.asyncGetCashFlows()
    expect(res.success).toBe(true)
    expect(store.cashFlows).toEqual(mockCashFlows)
    expect(store.stats).toEqual(mockStats)
    expect(store.isLoading).toBe(false)

    // Unsuccessful response
    vi.mocked(cashFlowApi.getCashFlows).mockResolvedValueOnce({
      success: false,
      status: 'fail',
      data: null,
    } as any)
    await store.asyncGetCashFlows()
    expect(store.isLoading).toBe(false)
  })

  it('handles asyncGetCashFlowById success and error', async () => {
    const store = useCashFlowsStore()
    const mockCashFlow = {
      id: 1,
      type: 'inflow' as const,
      source: 'cash' as const,
      label: 'Gaji',
      nominal: 1000000,
    }

    vi.mocked(cashFlowApi.getCashFlowById).mockResolvedValueOnce({
      success: true,
      status: 'success',
      data: {
        cash_flow: mockCashFlow,
      },
    } as any)

    const res = await store.asyncGetCashFlowById(1)
    expect(res.success).toBe(true)
    expect(store.cashFlow).toEqual(mockCashFlow)
    expect(store.isLoading).toBe(false)

    // Unsuccessful response
    vi.mocked(cashFlowApi.getCashFlowById).mockResolvedValueOnce({
      success: false,
      status: 'fail',
    } as any)
    await store.asyncGetCashFlowById(99)
    expect(store.isLoading).toBe(false)
  })

  it('handles asyncAddCashFlow and mutations flags', async () => {
    const store = useCashFlowsStore()
    vi.mocked(cashFlowApi.addCashFlow).mockResolvedValueOnce({
      success: true,
      status: 'success',
    } as any)

    const res = await store.asyncAddCashFlow({
      type: 'inflow',
      source: 'cash',
      label: 'Bonus',
      nominal: 500000,
    })
    expect(res.success).toBe(true)
    expect(store.isCashFlowAdded).toBe(true)
    expect(store.isCashFlowAdd).toBe(false)

    // Failure branch
    vi.mocked(cashFlowApi.addCashFlow).mockResolvedValueOnce({
      success: false,
      status: 'fail',
    } as any)
    await store.asyncAddCashFlow({
      type: 'inflow',
      source: 'cash',
      label: 'Bonus',
      nominal: 500000,
    })
    expect(store.isCashFlowAdded).toBe(false)
  })

  it('handles asyncUpdateCashFlow and mutation flags', async () => {
    const store = useCashFlowsStore()
    vi.mocked(cashFlowApi.updateCashFlow).mockResolvedValueOnce({
      success: true,
      status: 'success',
    } as any)

    const res = await store.asyncUpdateCashFlow(1, {
      type: 'outflow',
      source: 'savings',
      label: 'Belanja',
      nominal: 300000,
    })
    expect(res.success).toBe(true)
    expect(store.isCashFlowChanged).toBe(true)
    expect(store.isCashFlowChange).toBe(false)

    // Failure branch
    vi.mocked(cashFlowApi.updateCashFlow).mockResolvedValueOnce({
      success: false,
      status: 'fail',
    } as any)
    await store.asyncUpdateCashFlow(1, {
      type: 'outflow',
      source: 'savings',
      label: 'Belanja',
      nominal: 300000,
    })
    expect(store.isCashFlowChanged).toBe(false)
  })

  it('handles asyncDeleteCashFlow and mutation flags', async () => {
    const store = useCashFlowsStore()
    vi.mocked(cashFlowApi.deleteCashFlow).mockResolvedValueOnce({
      success: true,
      status: 'success',
    } as any)

    const res = await store.asyncDeleteCashFlow(1)
    expect(res.success).toBe(true)
    expect(store.isCashFlowDeleted).toBe(true)
    expect(store.isCashFlowDelete).toBe(false)

    // Failure branch
    vi.mocked(cashFlowApi.deleteCashFlow).mockResolvedValueOnce({
      success: false,
      status: 'fail',
    } as any)
    await store.asyncDeleteCashFlow(1)
    expect(store.isCashFlowDeleted).toBe(false)
  })

  it('handles asyncDeleteAllCashFlows and mutation flags', async () => {
    const store = useCashFlowsStore()
    vi.mocked(cashFlowApi.deleteAllCashFlows).mockResolvedValueOnce({
      success: true,
      status: 'success',
    } as any)

    const res = await store.asyncDeleteAllCashFlows()
    expect(res.success).toBe(true)
    expect(store.isCashFlowDeletedAll).toBe(true)
    expect(store.isCashFlowDeleteAll).toBe(false)

    // Failure branch
    vi.mocked(cashFlowApi.deleteAllCashFlows).mockResolvedValueOnce({
      success: false,
      status: 'fail',
    } as any)
    await store.asyncDeleteAllCashFlows()
    expect(store.isCashFlowDeletedAll).toBe(false)
  })

  it('handles asyncGetLabels success and catch error', async () => {
    const store = useCashFlowsStore()
    vi.mocked(cashFlowApi.getCashFlowLabels).mockResolvedValueOnce({
      success: true,
      status: 'success',
      data: { labels: ['gaji', 'makan'] },
    } as any)

    await store.asyncGetLabels()
    expect(store.labels).toEqual(['gaji', 'makan'])

    vi.mocked(cashFlowApi.getCashFlowLabels).mockRejectedValueOnce(new Error('Network error'))
    const resCatch = await store.asyncGetLabels()
    expect(resCatch.success).toBe(false)
  })

  it('handles asyncGetDailyStats success and catch error', async () => {
    const store = useCashFlowsStore()
    const statsData = { stats_inflow: {}, stats_outflow: {} }
    vi.mocked(cashFlowApi.getCashFlowStatsDaily).mockResolvedValueOnce({
      success: true,
      status: 'success',
      data: statsData,
    } as any)

    await store.asyncGetDailyStats({ total_data: 7 })
    expect(store.dailyStats).toEqual(statsData)

    vi.mocked(cashFlowApi.getCashFlowStatsDaily).mockRejectedValueOnce(new Error('Network error'))
    const resCatch = await store.asyncGetDailyStats()
    expect(resCatch.success).toBe(false)
  })

  it('handles asyncGetMonthlyStats success and catch error', async () => {
    const store = useCashFlowsStore()
    const statsData = { stats_inflow: {}, stats_outflow: {} }
    vi.mocked(cashFlowApi.getCashFlowStatsMonthly).mockResolvedValueOnce({
      success: true,
      status: 'success',
      data: statsData,
    } as any)

    await store.asyncGetMonthlyStats({ total_data: 12 })
    expect(store.monthlyStats).toEqual(statsData)

    vi.mocked(cashFlowApi.getCashFlowStatsMonthly).mockRejectedValueOnce(new Error('Network error'))
    const resCatch = await store.asyncGetMonthlyStats()
    expect(resCatch.success).toBe(false)
  })
})
