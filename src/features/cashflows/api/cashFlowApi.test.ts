import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getCashFlows,
  getCashFlowById,
  addCashFlow,
  updateCashFlow,
  deleteCashFlow,
  getCashFlowLabels,
  getCashFlowStatsDaily,
  getCashFlowStatsMonthly,
  deleteAllCashFlows,
} from './cashFlowApi'
import { requestJson } from '../../../helpers/apiHelper'

vi.mock('../../../helpers/apiHelper', () => ({
  requestJson: vi.fn(),
}))

describe('cashFlowApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls getCashFlows with params', async () => {
    vi.mocked(requestJson).mockResolvedValueOnce({ success: true })
    const params = { type: 'inflow', source: 'cash' }

    await getCashFlows(params)
    expect(requestJson).toHaveBeenCalledWith('/cash-flows', { params })
  })

  it('calls getCashFlowById with id', async () => {
    vi.mocked(requestJson).mockResolvedValueOnce({ success: true })

    await getCashFlowById(42)
    expect(requestJson).toHaveBeenCalledWith('/cash-flows/42')
  })

  it('calls addCashFlow with payload', async () => {
    vi.mocked(requestJson).mockResolvedValueOnce({ success: true })
    const payload = {
      type: 'inflow' as const,
      source: 'cash' as const,
      label: 'Gaji',
      nominal: 5000000,
    }

    await addCashFlow(payload)
    expect(requestJson).toHaveBeenCalledWith('/cash-flows', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  })

  it('calls updateCashFlow with id and payload', async () => {
    vi.mocked(requestJson).mockResolvedValueOnce({ success: true })
    const payload = {
      type: 'outflow' as const,
      source: 'savings' as const,
      label: 'Belanja',
      nominal: 200000,
    }

    await updateCashFlow(10, payload)
    expect(requestJson).toHaveBeenCalledWith('/cash-flows/10', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  })

  it('calls deleteCashFlow with id', async () => {
    vi.mocked(requestJson).mockResolvedValueOnce({ success: true })

    await deleteCashFlow(10)
    expect(requestJson).toHaveBeenCalledWith('/cash-flows/10', {
      method: 'DELETE',
    })
  })

  it('calls getCashFlowLabels', async () => {
    vi.mocked(requestJson).mockResolvedValueOnce({ success: true })

    await getCashFlowLabels()
    expect(requestJson).toHaveBeenCalledWith('/cash-flows/labels')
  })

  it('calls getCashFlowStatsDaily with params', async () => {
    vi.mocked(requestJson).mockResolvedValueOnce({ success: true })
    const params = { total_data: 7 }

    await getCashFlowStatsDaily(params)
    expect(requestJson).toHaveBeenCalledWith('/cash-flows/stats/daily', { params })
  })

  it('calls getCashFlowStatsMonthly with params', async () => {
    vi.mocked(requestJson).mockResolvedValueOnce({ success: true })
    const params = { total_data: 12 }

    await getCashFlowStatsMonthly(params)
    expect(requestJson).toHaveBeenCalledWith('/cash-flows/stats/monthly', { params })
  })

  it('calls deleteAllCashFlows', async () => {
    vi.mocked(requestJson).mockResolvedValueOnce({ success: true })

    await deleteAllCashFlows()
    expect(requestJson).toHaveBeenCalledWith('/cash-flows', {
      method: 'DELETE',
    })
  })
})
