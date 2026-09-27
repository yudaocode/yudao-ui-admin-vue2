import request from '@/utils/request'

export const MdProductBomApi = {
  createProductBom: async(data) => request({ url: '/mes/md/product-bom/create', method: 'post', data }),
  updateProductBom: async(data) => request({ url: '/mes/md/product-bom/update', method: 'put', data }),
  deleteProductBom: async(id) => request({ url: '/mes/md/product-bom/delete?id=' + id, method: 'delete' }),
  getProductBom: async(id) => request({ url: '/mes/md/product-bom/get?id=' + id, method: 'get' }),
  getProductBomPage: async(params) => request({ url: '/mes/md/product-bom/page', method: 'get', params }),
  getProductBomListByItemId: async(itemId) => request({ url: '/mes/md/product-bom/list-by-item-id?itemId=' + itemId, method: 'get' })
}
