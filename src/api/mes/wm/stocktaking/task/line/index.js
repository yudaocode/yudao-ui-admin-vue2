import request from '@/utils/request'
export const StockTakingTaskLineApi = {
  getStockTakingTaskLinePage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/stocktaking-task-line/page', params })
  },
  getStockTakingTaskLineSimpleList: async(taskId) => {
    return await request({ method: 'get',
      url: '/mes/wm/stocktaking-task-line/simple-list',
      params: { taskId }
    })
  },
  getStockTakingTaskLine: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/stocktaking-task-line/get', params: { id }})
  },
  createStockTakingTaskLine: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/stocktaking-task-line/create', data })
  },
  updateStockTakingTaskLine: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/stocktaking-task-line/update', data })
  },
  deleteStockTakingTaskLine: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/stocktaking-task-line/delete?id=' + id })
  }
}

