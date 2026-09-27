import request from '@/utils/request'

// 业绩目标完成情况 API
export const StatisticsPerformanceTargetApi = {
  // 获得业绩目标完成情况
  getPerformanceTargetSummary(params) {
    return request({
      url: '/crm/statistics-performance-target/get-performance-target-summary',
      method: 'get',
      params
    })
  }
}
