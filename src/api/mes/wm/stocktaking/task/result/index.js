import request from '@/utils/request'
export const StockTakingResultApi = {
  getStockTakingResultPage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/stocktaking-task-result/page', params })
  },
  getStockTakingResult: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/stocktaking-task-result/get', params: { id }})
  },
  createStockTakingResult: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/stocktaking-task-result/create', data })
  },
  updateStockTakingResult: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/stocktaking-task-result/update', data })
  },
  deleteStockTakingResult: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/stocktaking-task-result/delete?id=' + id })
  }
}

