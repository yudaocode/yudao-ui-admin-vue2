import request from '@/utils/request'
// MES 领料出库单行 API
export const WmProductIssueLineApi = {
  // 查询领料出库单行分页
  getProductIssueLinePage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/product-issue-line/page', params })
  },
  // 查询领料出库单行详情
  getProductIssueLine: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/product-issue-line/get?id=' + id })
  },
  // 新增领料出库单行
  createProductIssueLine: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/product-issue-line/create', data })
  },
  // 修改领料出库单行
  updateProductIssueLine: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/product-issue-line/update', data })
  },
  // 删除领料出库单行
  deleteProductIssueLine: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/product-issue-line/delete?id=' + id })
  }
}

