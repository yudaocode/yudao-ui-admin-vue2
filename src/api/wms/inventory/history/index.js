import request from '@/utils/request'

// WMS 库存流水 API
export const InventoryHistoryApi = {
  getInventoryHistoryPage: (params) => request({
    url: '/wms/inventory-history/page',
    method: 'get',
    params
  })
}
