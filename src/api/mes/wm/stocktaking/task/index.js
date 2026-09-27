import request from '@/utils/request'
export const StockTakingApi = {
  getStockTakingPage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/stocktaking-task/page', params })
  },
  getStockTaking: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/stocktaking-task/get?id=' + id })
  },
  createStockTaking: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/stocktaking-task/create', data })
  },
  updateStockTaking: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/stocktaking-task/update', data })
  },
  deleteStockTaking: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/stocktaking-task/delete?id=' + id })
  },
  submitStockTaking: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/stocktaking-task/submit', params: { id }})
  },
  cancelStockTaking: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/stocktaking-task/cancel', params: { id }})
  },
  finishStockTaking: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/stocktaking-task/finish', data: { id }})
  },
  exportStockTaking: async(params) => {
    return await request({ method: 'get', responseType: 'blob', url: '/mes/wm/stocktaking-task/export-excel', params })
  }
}

