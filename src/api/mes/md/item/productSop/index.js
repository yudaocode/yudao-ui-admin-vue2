import request from '@/utils/request'

export const MdProductSopApi = {
  createProductSop: async(data) => request({ url: '/mes/md/product-sop/create', method: 'post', data }),
  updateProductSop: async(data) => request({ url: '/mes/md/product-sop/update', method: 'put', data }),
  deleteProductSop: async(id) => request({ url: '/mes/md/product-sop/delete?id=' + id, method: 'delete' }),
  getProductSop: async(id) => request({ url: '/mes/md/product-sop/get?id=' + id, method: 'get' }),
  getProductSopPage: async(params) => request({ url: '/mes/md/product-sop/page', method: 'get', params }),
  getProductSopListByItemId: async(itemId) => request({ url: '/mes/md/product-sop/list-by-item-id?itemId=' + itemId, method: 'get' })
}
