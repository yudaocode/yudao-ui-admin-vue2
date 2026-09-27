import request from '@/utils/request'

// WMS 库存统计 API
export const InventoryApi = {
  getInventoryPage: (params) => request({ url: '/wms/inventory/page', method: 'get', params }),
  getInventoryList: (params) => request({ url: '/wms/inventory/list', method: 'get', params })
}
