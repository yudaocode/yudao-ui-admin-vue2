import request from '@/utils/request'
// MES 委外收货明细 API
export const WmOutsourceReceiptDetailApi = {
  // 查询委外收货明细列表（按行编号）
  getOutsourceReceiptDetailListByLineId: async(lineId) => {
    return await request({ method: 'get',
      url: '/mes/wm/outsource-receipt-detail/list-by-line',
      params: { lineId }
    })
  },
  // 查询委外收货明细详情
  getOutsourceReceiptDetail: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/outsource-receipt-detail/get?id=' + id })
  },
  // 新增委外收货明细
  createOutsourceReceiptDetail: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/outsource-receipt-detail/create', data })
  },
  // 修改委外收货明细
  updateOutsourceReceiptDetail: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/outsource-receipt-detail/update', data })
  },
  // 删除委外收货明细
  deleteOutsourceReceiptDetail: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/outsource-receipt-detail/delete?id=' + id })
  }
}

