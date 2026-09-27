import request from '@/utils/request'

// 排行 API
export const StatisticsRankApi = {
  // 获得合同排行榜
  getContractPriceRank(params) {
    return request({
      url: '/crm/statistics-rank/get-contract-price-rank',
      method: 'get',
      params
    })
  },

  // 获得回款排行榜
  getReceivablePriceRank(params) {
    return request({
      url: '/crm/statistics-rank/get-receivable-price-rank',
      method: 'get',
      params
    })
  },

  // 签约合同排行
  getContractCountRank(params) {
    return request({
      url: '/crm/statistics-rank/get-contract-count-rank',
      method: 'get',
      params
    })
  },

  // 产品销量排行
  getProductSalesRank(params) {
    return request({
      url: '/crm/statistics-rank/get-product-sales-rank',
      method: 'get',
      params
    })
  },

  // 新增客户数排行
  getCustomerCountRank(params) {
    return request({
      url: '/crm/statistics-rank/get-customer-count-rank',
      method: 'get',
      params
    })
  },

  // 新增联系人数排行
  getContactsCountRank(params) {
    return request({
      url: '/crm/statistics-rank/get-contacts-count-rank',
      method: 'get',
      params
    })
  },

  // 跟进次数排行
  getFollowCountRank(params) {
    return request({
      url: '/crm/statistics-rank/get-follow-count-rank',
      method: 'get',
      params
    })
  },

  // 跟进客户数排行
  getFollowCustomerCountRank(params) {
    return request({
      url: '/crm/statistics-rank/get-follow-customer-count-rank',
      method: 'get',
      params
    })
  }
}
