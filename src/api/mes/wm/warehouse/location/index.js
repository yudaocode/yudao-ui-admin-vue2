import request from '@/utils/request'

export const WmWarehouseLocationApi = {
  getWarehouseLocationPage: async(params) => request({ url: '/mes/wm/warehouse-location/page', method: 'get', params }),
  getWarehouseLocationSimpleList: async(warehouseId) => request({ url: '/mes/wm/warehouse-location/simple-list', method: 'get', params: { warehouseId }}),
  getWarehouseLocation: async(id) => request({ url: '/mes/wm/warehouse-location/get?id=' + id, method: 'get' }),
  createWarehouseLocation: async(data) => request({ url: '/mes/wm/warehouse-location/create', method: 'post', data }),
  updateWarehouseLocation: async(data) => request({ url: '/mes/wm/warehouse-location/update', method: 'put', data }),
  deleteWarehouseLocation: async(id) => request({ url: '/mes/wm/warehouse-location/delete?id=' + id, method: 'delete' }),
  updateAreaByLocationId: async(locationId, allowItemMixing, allowBatchMixing) => request({ url: '/mes/wm/warehouse-location/update-by-location-id', method: 'put', params: { locationId, allowItemMixing, allowBatchMixing }})
}
