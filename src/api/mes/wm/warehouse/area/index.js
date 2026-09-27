import request from '@/utils/request'

export const WmWarehouseAreaApi = {
  getWarehouseAreaPage: async(params) => request({ url: '/mes/wm/warehouse-area/page', method: 'get', params }),
  getWarehouseAreaSimpleList: async(locationId) => request({ url: '/mes/wm/warehouse-area/simple-list', method: 'get', params: { locationId }}),
  getWarehouseArea: async(id) => request({ url: '/mes/wm/warehouse-area/get?id=' + id, method: 'get' }),
  createWarehouseArea: async(data) => request({ url: '/mes/wm/warehouse-area/create', method: 'post', data }),
  updateWarehouseArea: async(data) => request({ url: '/mes/wm/warehouse-area/update', method: 'put', data }),
  deleteWarehouseArea: async(id) => request({ url: '/mes/wm/warehouse-area/delete?id=' + id, method: 'delete' })
}
