import request from '@/utils/request'

export const MesHomeStatisticsApi = {
  getHomeSummary() {
    return request({
      url: '/mes/home-statistics/summary',
      method: 'get'
    })
  },

  getWorkOrderStatusDistribution() {
    return request({
      url: '/mes/home-statistics/work-order-status',
      method: 'get'
    })
  },

  getProductionTrend(days) {
    return request({
      url: '/mes/home-statistics/production-trend',
      method: 'get',
      params: { days }
    })
  }
}
