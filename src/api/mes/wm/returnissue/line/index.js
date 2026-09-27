import request from '@/utils/request'
// MES 生产退料单行 API
export const WmReturnIssueLineApi = {
  // 查询生产退料单行分页
  getReturnIssueLinePage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/return-issue-line/page', params })
  },
  // 查询生产退料单行详情
  getReturnIssueLine: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/return-issue-line/get?id=' + id })
  },
  // 新增生产退料单行
  createReturnIssueLine: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/return-issue-line/create', data })
  },
  // 修改生产退料单行
  updateReturnIssueLine: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/return-issue-line/update', data })
  },
  // 删除生产退料单行
  deleteReturnIssueLine: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/return-issue-line/delete?id=' + id })
  }
}

