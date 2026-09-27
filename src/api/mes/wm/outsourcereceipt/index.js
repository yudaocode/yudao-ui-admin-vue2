import request from '@/utils/request'
// MES 委外收货单 API
export const WmOutsourceReceiptApi = {
  // 查询委外收货单分页
  getOutsourceReceiptPage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/outsource-receipt/page', params })
  },
  // 查询委外收货单详情
  getOutsourceReceipt: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/outsource-receipt/get?id=' + id })
  },
  // 新增委外收货单
  createOutsourceReceipt: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/outsource-receipt/create', data })
  },
  // 修改委外收货单
  updateOutsourceReceipt: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/outsource-receipt/update', data })
  },
  // 删除委外收货单
  deleteOutsourceReceipt: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/outsource-receipt/delete?id=' + id })
  },
  // 提交委外收货单
  submitOutsourceReceipt: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/outsource-receipt/submit?id=' + id })
  },
  // 入库上架
  stockOutsourceReceipt: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/outsource-receipt/stock?id=' + id })
  },
  // 完成委外收货单
  finishOutsourceReceipt: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/outsource-receipt/finish?id=' + id })
  },
  // 取消委外收货单
  cancelOutsourceReceipt: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/outsource-receipt/cancel?id=' + id })
  },
  // 导出委外收货单 Excel
  exportOutsourceReceipt: async(params) => {
    return await request({ method: 'get', responseType: 'blob', url: '/mes/wm/outsource-receipt/export-excel', params })
  }
}

