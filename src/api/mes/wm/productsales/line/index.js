import request from '@/utils/request'

// MES 销售出库单行 API
export const WmProductSalesLineApi = {
  getProductSalesLinePage: async(params) => request({ url: '/mes/wm/product-sales-line/page', method: 'get', params }),
  getProductSalesLine: async(id) => request({ url: '/mes/wm/product-sales-line/get?id=' + id, method: 'get' }),
  createProductSalesLine: async(data) => request({ url: '/mes/wm/product-sales-line/create', method: 'post', data }),
  updateProductSalesLine: async(data) => request({ url: '/mes/wm/product-sales-line/update', method: 'put', data }),
  deleteProductSalesLine: async(id) => request({ url: '/mes/wm/product-sales-line/delete?id=' + id, method: 'delete' })
}
