import request from '@/utils/request'
// MES 生产退料单 API
export const WmReturnIssueApi = {
  // 查询生产退料单分页
  getReturnIssuePage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/return-issue/page', params })
  },
  // 查询生产退料单详情
  getReturnIssue: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/return-issue/get?id=' + id })
  },
  // 新增生产退料单
  createReturnIssue: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/return-issue/create', data })
  },
  // 修改生产退料单
  updateReturnIssue: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/return-issue/update', data })
  },
  // 删除生产退料单
  deleteReturnIssue: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/return-issue/delete?id=' + id })
  },
  // 提交生产退料单（草稿 → 待检验/待上架）
  submitReturnIssue: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/return-issue/submit?id=' + id })
  },
  // 入库上架
  stockReturnIssue: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/return-issue/stock?id=' + id })
  },
  // 取消生产退料单
  cancelReturnIssue: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/return-issue/cancel?id=' + id })
  },
  // 完成生产退料单
  finishReturnIssue: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/return-issue/finish?id=' + id })
  },
  // 导出生产退料单 Excel
  exportReturnIssue: async(params) => {
    return await request({ method: 'get', responseType: 'blob', url: '/mes/wm/return-issue/export-excel', params })
  }
}

