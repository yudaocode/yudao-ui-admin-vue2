import request from '@/utils/request'
export const StockTakingPlanParamApi = {
  getStockTakingPlanParam: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/stocktaking-plan-param/get?id=' + id })
  },
  getStockTakingPlanParamPage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/stocktaking-plan-param/page', params })
  },
  createStockTakingPlanParam: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/stocktaking-plan-param/create', data })
  },
  updateStockTakingPlanParam: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/stocktaking-plan-param/update', data })
  },
  deleteStockTakingPlanParam: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/stocktaking-plan-param/delete?id=' + id })
  }
}

