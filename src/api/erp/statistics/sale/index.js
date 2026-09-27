import request from '@/utils/request'

// ERP 销售统计 API
export const SaleStatisticsApi = {
  getSaleSummary: () => request({ url: '/erp/sale-statistics/summary', method: 'get' }),
  getSaleTimeSummary: () => request({ url: '/erp/sale-statistics/time-summary', method: 'get' })
}
