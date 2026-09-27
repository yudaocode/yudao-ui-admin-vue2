import request from '@/utils/request'

// ERP 采购统计 API
export const PurchaseStatisticsApi = {
  getPurchaseSummary: () => request({ url: '/erp/purchase-statistics/summary', method: 'get' }),
  getPurchaseTimeSummary: () => request({ url: '/erp/purchase-statistics/time-summary', method: 'get' })
}
