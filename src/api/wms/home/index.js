import request from '@/utils/request'

// WMS 首页统计 API
export const WmsHomeStatisticsApi = {
  getOrderSummary: (params) => request({ url: '/wms/home-statistics/order-summary', method: 'get', params }),
  getOrderTrend: (days, params) => request({
    url: '/wms/home-statistics/order-trend',
    method: 'get',
    params: { ...params, days }
  }),
  getInventorySummary: (params) => request({
    url: '/wms/home-statistics/inventory-summary',
    method: 'get',
    params
  })
}
