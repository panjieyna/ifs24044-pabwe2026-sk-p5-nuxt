import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '../api/cashFlowApi'

export interface CashFlow {
  id: number
  user_id?: number
  type: 'inflow' | 'outflow'
  source: 'cash' | 'savings' | 'loans'
  label: string
  nominal: number
  description?: string
  created_at?: string
  updated_at?: string
  [key: string]: any
}

export interface CashFlowStats {
  total_inflow: number
  total_outflow: number
  cashflow?: number
  cash?: number
  savings?: number
  loans?: number
  [key: string]: any
}

export interface CashFlowQueryParams {
  type?: string
  source?: string
  label?: string
  start_date?: string
  end_date?: string
}

export const useCashFlowsStore = defineStore('cashflows', () => {
  const cashFlows = ref<CashFlow[]>([])
  const cashFlow = ref<CashFlow | null>(null)
  const stats = ref<CashFlowStats | null>(null)
  const labels = ref<string[]>([])
  const dailyStats = ref<any | null>(null)
  const monthlyStats = ref<any | null>(null)

  const isLoading = ref<boolean>(false)
  const isCashFlowAdd = ref<boolean>(false)
  const isCashFlowAdded = ref<boolean>(false)
  const isCashFlowChange = ref<boolean>(false)
  const isCashFlowChanged = ref<boolean>(false)
  const isCashFlowDelete = ref<boolean>(false)
  const isCashFlowDeleted = ref<boolean>(false)
  const isCashFlowDeleteAll = ref<boolean>(false)
  const isCashFlowDeletedAll = ref<boolean>(false)

  async function asyncGetCashFlows(params?: CashFlowQueryParams) {
    isLoading.value = true
    try {
      const res: any = await api.getCashFlows(params)
      if (res?.success || res?.status === 'success') {
        cashFlows.value = res?.data?.cash_flows || []
        stats.value = res?.data?.stats || null
      }
      return res
    } finally {
      isLoading.value = false
    }
  }

  async function asyncGetCashFlowById(id: number | string) {
    isLoading.value = true
    try {
      const res: any = await api.getCashFlowById(id)
      if (res?.success || res?.status === 'success') {
        cashFlow.value = res?.data?.cash_flow || null
      }
      return res
    } finally {
      isLoading.value = false
    }
  }

  async function asyncAddCashFlow(body: api.CashFlowPayload) {
    isCashFlowAdd.value = true
    isCashFlowAdded.value = false
    try {
      const res: any = await api.addCashFlow(body)
      if (res?.success || res?.status === 'success') {
        isCashFlowAdded.value = true
      }
      return res
    } finally {
      isCashFlowAdd.value = false
    }
  }

  async function asyncUpdateCashFlow(id: number | string, body: api.CashFlowPayload) {
    isCashFlowChange.value = true
    isCashFlowChanged.value = false
    try {
      const res: any = await api.updateCashFlow(id, body)
      if (res?.success || res?.status === 'success') {
        isCashFlowChanged.value = true
      }
      return res
    } finally {
      isCashFlowChange.value = false
    }
  }

  async function asyncDeleteCashFlow(id: number | string) {
    isCashFlowDelete.value = true
    isCashFlowDeleted.value = false
    try {
      const res: any = await api.deleteCashFlow(id)
      if (res?.success || res?.status === 'success') {
        isCashFlowDeleted.value = true
      }
      return res
    } finally {
      isCashFlowDelete.value = false
    }
  }

  async function asyncDeleteAllCashFlows() {
    isCashFlowDeleteAll.value = true
    isCashFlowDeletedAll.value = false
    try {
      const res: any = await api.deleteAllCashFlows()
      if (res?.success || res?.status === 'success') {
        isCashFlowDeletedAll.value = true
      }
      return res
    } finally {
      isCashFlowDeleteAll.value = false
    }
  }

  async function asyncGetLabels() {
    try {
      const res: any = await api.getCashFlowLabels()
      if (res?.success || res?.status === 'success') {
        labels.value = res?.data?.labels || []
      }
      return res
    } catch {
      return { success: false, data: { labels: [] } }
    }
  }

  async function asyncGetDailyStats(params?: api.StatsQueryParams) {
    try {
      const res: any = await api.getCashFlowStatsDaily(params)
      if (res?.success || res?.status === 'success') {
        dailyStats.value = res?.data || null
      }
      return res
    } catch {
      return { success: false, data: null }
    }
  }

  async function asyncGetMonthlyStats(params?: api.StatsQueryParams) {
    try {
      const res: any = await api.getCashFlowStatsMonthly(params)
      if (res?.success || res?.status === 'success') {
        monthlyStats.value = res?.data || null
      }
      return res
    } catch {
      return { success: false, data: null }
    }
  }

  return {
    cashFlows,
    cashFlow,
    stats,
    labels,
    dailyStats,
    monthlyStats,
    isLoading,
    isCashFlowAdd,
    isCashFlowAdded,
    isCashFlowChange,
    isCashFlowChanged,
    isCashFlowDelete,
    isCashFlowDeleted,
    isCashFlowDeleteAll,
    isCashFlowDeletedAll,
    asyncGetCashFlows,
    asyncGetCashFlowById,
    asyncAddCashFlow,
    asyncUpdateCashFlow,
    asyncDeleteCashFlow,
    asyncDeleteAllCashFlows,
    asyncGetLabels,
    asyncGetDailyStats,
    asyncGetMonthlyStats,
  }
})
