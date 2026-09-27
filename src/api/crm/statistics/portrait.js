import request from '@/utils/request'

// 客户画像 API
export const StatisticsPortraitApi = {
  // 获取客户行业统计数据
  getCustomerIndustry(params) {
    return request({
      url: '/crm/statistics-portrait/get-customer-industry-summary',
      method: 'get',
      params
    })
  },

  // 获取客户来源统计数据
  getCustomerSource(params) {
    return request({
      url: '/crm/statistics-portrait/get-customer-source-summary',
      method: 'get',
      params
    })
  },

  // 获取客户级别统计数据
  getCustomerLevel(params) {
    return request({
      url: '/crm/statistics-portrait/get-customer-level-summary',
      method: 'get',
      params
    })
  },

  // 获取客户地区统计数据
  getCustomerArea(params) {
    return request({
      url: '/crm/statistics-portrait/get-customer-area-summary',
      method: 'get',
      params
    })
  }
}
