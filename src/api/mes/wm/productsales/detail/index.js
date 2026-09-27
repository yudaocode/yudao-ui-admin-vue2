import request from '@/utils/request'

export const WmProductSalesDetailApi = {
  getProductSalesDetailListByLineId: async(lineId) => request({ url: '/mes/wm/product-sales-detail/list-by-line', method: 'get', params: { lineId }}),
  getProductSalesDetail: async(id) => request({ url: '/mes/wm/product-sales-detail/get?id=' + id, method: 'get' }),
  createProductSalesDetail: async(data) => request({ url: '/mes/wm/product-sales-detail/create', method: 'post', data }),
  updateProductSalesDetail: async(data) => request({ url: '/mes/wm/product-sales-detail/update', method: 'put', data }),
  deleteProductSalesDetail: async(id) => request({ url: '/mes/wm/product-sales-detail/delete?id=' + id, method: 'delete' })
}
