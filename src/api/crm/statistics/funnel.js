import request from '@/utils/request'

// 销售漏斗 API
export const StatisticFunnelApi = {
  // 获取销售漏斗统计数据
  getFunnelSummary(params) {
    return request({
      url: '/crm/statistics-funnel/get-funnel-summary',
      method: 'get',
      params
    })
  },

  // 获取商机结束状态统计
  getBusinessSummaryByEndStatus(params) {
    return request({
      url: '/crm/statistics-funnel/get-business-summary-by-end-status',
      method: 'get',
      params
    })
  },

  // 获取商机阶段统计
  getBusinessSummaryByStatus(params) {
    return request({
      url: '/crm/statistics-funnel/get-business-summary-by-status',
      method: 'get',
      params
    })
  },

  // 新增商机分析（按日期）
  getBusinessSummaryByDate(params) {
    return request({
      url: '/crm/statistics-funnel/get-business-summary-by-date',
      method: 'get',
      params
    })
  },

  // 商机转化率分析（按日期）
  getBusinessInversionRateSummaryByDate(params) {
    return request({
      url: '/crm/statistics-funnel/get-business-inversion-rate-summary-by-date',
      method: 'get',
      params
    })
  },

  // 商机分页（按日期）
  getBusinessPageByDate(params) {
    return request({
      url: '/crm/statistics-funnel/get-business-page-by-date',
      method: 'get',
      params
    })
  }
}
