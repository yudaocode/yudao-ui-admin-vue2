import request from '@/utils/request'

// MES 销售出库单 API
export const WmProductSalesApi = {
  getProductSalesPage: async(params) => request({ url: '/mes/wm/product-sales/page', method: 'get', params }),
  getProductSales: async(id) => request({ url: '/mes/wm/product-sales/get?id=' + id, method: 'get' }),
  createProductSales: async(data) => request({ url: '/mes/wm/product-sales/create', method: 'post', data }),
  updateProductSales: async(data) => request({ url: '/mes/wm/product-sales/update', method: 'put', data }),
  deleteProductSales: async(id) => request({ url: '/mes/wm/product-sales/delete?id=' + id, method: 'delete' }),
  submitProductSales: async(id) => request({ url: '/mes/wm/product-sales/submit?id=' + id, method: 'put' }),
  checkProductSalesQuantity: async(id) => request({ url: '/mes/wm/product-sales/check-quantity?id=' + id, method: 'get' }),
  stockProductSales: async(id) => request({ url: '/mes/wm/product-sales/stock?id=' + id, method: 'put' }),
  shippingProductSales: async(data) => request({ url: '/mes/wm/product-sales/shipping', method: 'put', data }),
  finishProductSales: async(id) => request({ url: '/mes/wm/product-sales/finish?id=' + id, method: 'put' }),
  cancelProductSales: async(id) => request({ url: '/mes/wm/product-sales/cancel?id=' + id, method: 'put' }),
  exportProductSales: async(params) => request({ url: '/mes/wm/product-sales/export-excel', method: 'get', params, responseType: 'blob' })
}
