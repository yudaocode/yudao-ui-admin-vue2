import request from '@/utils/request'

// 商品分类 API
export const ItemCategoryApi = {
  getItemCategoryList: (params) => request({ url: '/wms/item-category/list', method: 'get', params }),
  getItemCategorySimpleList: () => request({ url: '/wms/item-category/simple-list', method: 'get' }),
  getItemCategory: (id) => request({ url: '/wms/item-category/get?id=' + id, method: 'get' }),
  createItemCategory: (data) => request({ url: '/wms/item-category/create', method: 'post', data }),
  updateItemCategory: (data) => request({ url: '/wms/item-category/update', method: 'put', data }),
  deleteItemCategory: (id) => request({ url: '/wms/item-category/delete?id=' + id, method: 'delete' })
}
