import request from '@/utils/request'

// 商品主数据 API
export const ItemApi = {
  getItemPage: (params) => request({ url: '/wms/item/page', method: 'get', params }),
  getItemSimpleList: (params) => request({ url: '/wms/item/simple-list', method: 'get', params }),
  getItem: (id) => request({ url: '/wms/item/get?id=' + id, method: 'get' }),
  createItem: (data) => request({ url: '/wms/item/create', method: 'post', data }),
  updateItem: (data) => request({ url: '/wms/item/update', method: 'put', data }),
  deleteItem: (id) => request({ url: '/wms/item/delete?id=' + id, method: 'delete' }),
  exportItem: (params) => request({
    url: '/wms/item/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
