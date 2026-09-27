import request from '@/utils/request'
// MES 领料出库明细 API
export const WmProductIssueDetailApi = {
  // 查询领料出库明细列表（按行编号）
  getProductIssueDetailListByLineId: async(lineId) => {
    return await request({ method: 'get',
      url: '/mes/wm/product-issue-detail/list-by-line',
      params: { lineId }
    })
  },
  // 查询领料出库明细详情
  getProductIssueDetail: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/product-issue-detail/get?id=' + id })
  },
  // 新增领料出库明细
  createProductIssueDetail: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/product-issue-detail/create', data })
  },
  // 修改领料出库明细
  updateProductIssueDetail: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/product-issue-detail/update', data })
  },
  // 删除领料出库明细
  deleteProductIssueDetail: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/product-issue-detail/delete?id=' + id })
  }
}

