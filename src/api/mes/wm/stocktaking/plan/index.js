import request from '@/utils/request'
export const StockTakingPlanApi = {
  updateStockTakingPlanStatus: async(id, status) => {
    return await request({ method: 'put',
      url: '/mes/wm/stocktaking-plan/update-status?id=' + id + '&status=' + status
    })
  },
  getStockTakingPlanPage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/stocktaking-plan/page', params })
  },
  getStockTakingPlan: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/stocktaking-plan/get?id=' + id })
  },
  createStockTakingPlan: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/stocktaking-plan/create', data })
  },
  updateStockTakingPlan: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/stocktaking-plan/update', data })
  },
  deleteStockTakingPlan: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/stocktaking-plan/delete?id=' + id })
  },
  exportStockTakingPlan: async(params) => {
    return await request({ method: 'get', responseType: 'blob', url: '/mes/wm/stocktaking-plan/export-excel', params })
  }
}

