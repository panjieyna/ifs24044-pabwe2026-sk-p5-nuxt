import { requestJson } from '../../../helpers/apiHelper'

export interface CashFlowPayload {
  type: 'inflow' | 'outflow'
  source: 'cash' | 'savings' | 'loans'
  label: string
  description?: string
  nominal: number
}

export interface CashFlowQueryParams {
  type?: string
  source?: string
  label?: string
  start_date?: string
  end_date?: string
}

export interface StatsQueryParams {
  end_date?: string
  total_data?: number
}

export const getCashFlows = (params?: CashFlowQueryParams) =>
  requestJson('/cash-flows', { params })

export const getCashFlowById = (id: number | string) =>
  requestJson(`/cash-flows/${id}`)

export const addCashFlow = (body: CashFlowPayload) =>
  requestJson('/cash-flows', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const updateCashFlow = (id: number | string, body: CashFlowPayload) =>
  requestJson(`/cash-flows/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })

export const deleteCashFlow = (id: number | string) =>
  requestJson(`/cash-flows/${id}`, {
    method: 'DELETE',
  })

export const getCashFlowLabels = () =>
  requestJson('/cash-flows/labels')

export const getCashFlowStatsDaily = (params?: StatsQueryParams) =>
  requestJson('/cash-flows/stats/daily', { params })

export const getCashFlowStatsMonthly = (params?: StatsQueryParams) =>
  requestJson('/cash-flows/stats/monthly', { params })

export const deleteAllCashFlows = () =>
  requestJson('/cash-flows', {
    method: 'DELETE',
  })
