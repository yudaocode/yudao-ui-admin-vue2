import request from '@/utils/request'

export const WmWarehouseApi = {
  getWarehousePage: async(params) => request({ url: '/mes/wm/warehouse/page', method: 'get', params }),
  getWarehouseSimpleList: async() => request({ url: '/mes/wm/warehouse/simple-list', method: 'get' }),
  getWarehouse: async(id) => request({ url: '/mes/wm/warehouse/get?id=' + id, method: 'get' }),
  createWarehouse: async(data) => request({ url: '/mes/wm/warehouse/create', method: 'post', data }),
  updateWarehouse: async(data) => request({ url: '/mes/wm/warehouse/update', method: 'put', data }),
  deleteWarehouse: async(id) => request({ url: '/mes/wm/warehouse/delete?id=' + id, method: 'delete' })
}
