import request from '@/utils/request'

// MES 物料产品 API
export const MdItemApi = {
  getItemPage: async(params) => request({ url: '/mes/md/item/page', method: 'get', params }),
  getItem: async(id) => request({ url: '/mes/md/item/get?id=' + id, method: 'get' }),
  createItem: async(data) => request({ url: '/mes/md/item/create', method: 'post', data }),
  updateItem: async(data) => request({ url: '/mes/md/item/update', method: 'put', data }),
  updateItemStatus: async(id, status) => request({ url: '/mes/md/item/update-status', method: 'put', params: { id, status }}),
  deleteItem: async(id) => request({ url: '/mes/md/item/delete?id=' + id, method: 'delete' }),
  exportItem: async(params) => request({ url: '/mes/md/item/export-excel', method: 'get', params, responseType: 'blob' }),
  importTemplate: async() => request({ url: '/mes/md/item/get-import-template', method: 'get', responseType: 'blob' })
}
