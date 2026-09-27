import request from '@/utils/request'
// MES 销售退货单 API
export const WmReturnSalesApi = {
  // 查询销售退货单分页
  getReturnSalesPage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/return-sales/page', params })
  },
  // 查询销售退货单详情
  getReturnSales: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/return-sales/get?id=' + id })
  },
  // 新增销售退货单
  createReturnSales: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/return-sales/create', data })
  },
  // 修改销售退货单
  updateReturnSales: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/return-sales/update', data })
  },
  // 删除销售退货单
  deleteReturnSales: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/return-sales/delete?id=' + id })
  },
  // 提交销售退货单
  submitReturnSales: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/return-sales/submit?id=' + id })
  },
  // 执行退货
  finishReturnSales: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/return-sales/finish?id=' + id })
  },
  // 执行上架
  stockReturnSales: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/return-sales/stock?id=' + id })
  },
  // 取消销售退货单
  cancelReturnSales: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/return-sales/cancel?id=' + id })
  },
  // 导出销售退货单 Excel
  exportReturnSales: async(params) => {
    return await request({ method: 'get', responseType: 'blob', url: '/mes/wm/return-sales/export-excel', params })
  }
}

