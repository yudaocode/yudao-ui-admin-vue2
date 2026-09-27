import request from '@/utils/request'
// MES 委外收货单行 API
export const WmOutsourceReceiptLineApi = {
  // 查询委外收货单行分页
  getOutsourceReceiptLinePage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/outsource-receipt-line/page', params })
  },
  // 查询委外收货单行详情
  getOutsourceReceiptLine: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/outsource-receipt-line/get?id=' + id })
  },
  // 新增委外收货单行
  createOutsourceReceiptLine: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/outsource-receipt-line/create', data })
  },
  // 修改委外收货单行
  updateOutsourceReceiptLine: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/outsource-receipt-line/update', data })
  },
  // 删除委外收货单行
  deleteOutsourceReceiptLine: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/outsource-receipt-line/delete?id=' + id })
  }
}

