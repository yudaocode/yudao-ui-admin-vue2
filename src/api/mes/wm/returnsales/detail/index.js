import request from '@/utils/request'
// MES 销售退货明细 API
export const WmReturnSalesDetailApi = {
  // 查询销售退货明细列表（按行编号）
  getReturnSalesDetailListByLineId: async(lineId) => {
    return await request({ method: 'get',
      url: '/mes/wm/return-sales-detail/list-by-line',
      params: { lineId }
    })
  },
  // 查询销售退货明细详情
  getReturnSalesDetail: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/return-sales-detail/get?id=' + id })
  },
  // 新增销售退货明细
  createReturnSalesDetail: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/return-sales-detail/create', data })
  },
  // 修改销售退货明细
  updateReturnSalesDetail: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/return-sales-detail/update', data })
  },
  // 删除销售退货明细
  deleteReturnSalesDetail: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/return-sales-detail/delete?id=' + id })
  }
}

