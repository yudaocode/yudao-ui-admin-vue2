import request from '@/utils/request'

export const MdProductSipApi = {
  createProductSip: async(data) => request({ url: '/mes/md/product-sip/create', method: 'post', data }),
  updateProductSip: async(data) => request({ url: '/mes/md/product-sip/update', method: 'put', data }),
  deleteProductSip: async(id) => request({ url: '/mes/md/product-sip/delete?id=' + id, method: 'delete' }),
  getProductSip: async(id) => request({ url: '/mes/md/product-sip/get?id=' + id, method: 'get' }),
  getProductSipPage: async(params) => request({ url: '/mes/md/product-sip/page', method: 'get', params }),
  getProductSipListByItemId: async(itemId) => request({ url: '/mes/md/product-sip/list-by-item-id?itemId=' + itemId, method: 'get' })
}
