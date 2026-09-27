import request from '@/utils/request'

// 产品分析 API
export const StatisticsProductApi = {
  // 获得产品销售情况统计
  getProductSalesList(params) {
    return request({
      url: '/crm/statistics-product/get-product-sales-list',
      method: 'get',
      params
    })
  },

  // 获得产品分类销售分析
  getProductCategorySummary(params) {
    return request({
      url: '/crm/statistics-product/get-product-category-summary',
      method: 'get',
      params
    })
  }
}
