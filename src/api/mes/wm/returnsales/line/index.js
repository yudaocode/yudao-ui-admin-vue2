import request from '@/utils/request'
// MES 销售退货单行 API
export const WmReturnSalesLineApi = {
  // 查询销售退货单行分页
  getReturnSalesLinePage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/return-sales-line/page', params })
  },
  // 查询销售退货单行详情
  getReturnSalesLine: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/return-sales-line/get?id=' + id })
  },
  // 新增销售退货单行
  createReturnSalesLine: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/return-sales-line/create', data })
  },
  // 修改销售退货单行
  updateReturnSalesLine: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/return-sales-line/update', data })
  },
  // 删除销售退货单行
  deleteReturnSalesLine: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/return-sales-line/delete?id=' + id })
  }
}

