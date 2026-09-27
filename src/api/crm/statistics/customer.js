import request from '@/utils/request'

// 客户分析 API
export const StatisticsCustomerApi = {
  // 客户总量分析（按日期）
  getCustomerSummaryByDate(params) {
    return request({
      url: '/crm/statistics-customer/get-customer-summary-by-date',
      method: 'get',
      params
    })
  },

  // 客户总量分析（按用户）
  getCustomerSummaryByUser(params) {
    return request({
      url: '/crm/statistics-customer/get-customer-summary-by-user',
      method: 'get',
      params
    })
  },

  // 客户跟进次数分析（按日期）
  getFollowUpSummaryByDate(params) {
    return request({
      url: '/crm/statistics-customer/get-follow-up-summary-by-date',
      method: 'get',
      params
    })
  },

  // 客户跟进次数分析（按用户）
  getFollowUpSummaryByUser(params) {
    return request({
      url: '/crm/statistics-customer/get-follow-up-summary-by-user',
      method: 'get',
      params
    })
  },

  // 获取客户跟进方式统计
  getFollowUpSummaryByType(params) {
    return request({
      url: '/crm/statistics-customer/get-follow-up-summary-by-type',
      method: 'get',
      params
    })
  },

  // 获取客户首次合同、回款摘要
  getContractSummary(params) {
    return request({
      url: '/crm/statistics-customer/get-contract-summary',
      method: 'get',
      params
    })
  },

  // 公海客户分析（按日期）
  getPoolSummaryByDate(params) {
    return request({
      url: '/crm/statistics-customer/get-pool-summary-by-date',
      method: 'get',
      params
    })
  },

  // 公海客户分析（按用户）
  getPoolSummaryByUser(params) {
    return request({
      url: '/crm/statistics-customer/get-pool-summary-by-user',
      method: 'get',
      params
    })
  },

  // 客户成交周期（按日期）
  getCustomerDealCycleByDate(params) {
    return request({
      url: '/crm/statistics-customer/get-customer-deal-cycle-by-date',
      method: 'get',
      params
    })
  },

  // 客户成交周期（按用户）
  getCustomerDealCycleByUser(params) {
    return request({
      url: '/crm/statistics-customer/get-customer-deal-cycle-by-user',
      method: 'get',
      params
    })
  },

  // 客户成交周期（按地区）
  getCustomerDealCycleByArea(params) {
    return request({
      url: '/crm/statistics-customer/get-customer-deal-cycle-by-area',
      method: 'get',
      params
    })
  },

  // 客户成交周期（按产品）
  getCustomerDealCycleByProduct(params) {
    return request({
      url: '/crm/statistics-customer/get-customer-deal-cycle-by-product',
      method: 'get',
      params
    })
  }
}
