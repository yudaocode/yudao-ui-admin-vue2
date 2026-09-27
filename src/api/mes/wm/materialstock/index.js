import request from '@/utils/request'

export const WmMaterialStockApi = {
  getMaterialStockPage: async(params) => request({ url: '/mes/wm/material-stock/page', method: 'get', params }),
  getMaterialStock: async(id) => request({ url: '/mes/wm/material-stock/get?id=' + id, method: 'get' }),
  updateMaterialStockFrozen: async(data) => request({ url: '/mes/wm/material-stock/update-frozen', method: 'put', data }),
  exportMaterialStock: async(params) => request({ url: '/mes/wm/material-stock/export-excel', method: 'get', params, responseType: 'blob' })
}
