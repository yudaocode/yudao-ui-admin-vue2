import request from '@/utils/request'

// 员工业绩分析 API
export const StatisticsPerformanceApi = {
  /** 获取员工合同金额统计 */
  getContractPricePerformance(params) {
    return request({
      url: '/crm/statistics-performance/get-contract-price-performance',
      method: 'get',
      params
    })
  },
  /** 获取员工回款金额统计 */
  getReceivablePricePerformance(params) {
    return request({
      url: '/crm/statistics-performance/get-receivable-price-performance',
      method: 'get',
      params
    })
  },
  /** 获取员工签约合同数量统计 */
  getContractCountPerformance(params) {
    return request({
      url: '/crm/statistics-performance/get-contract-count-performance',
      method: 'get',
      params
    })
  },
  /** 获取合同汇总表 */
  getContractSummary(params) {
    return request({
      url: '/crm/statistics-performance/get-contract-summary',
      method: 'get',
      params
    })
  }
}
