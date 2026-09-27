import request from '@/utils/request'
// MES 生产退料明细 API
export const WmReturnIssueDetailApi = {
  // 查询生产退料明细列表（按行编号）
  getReturnIssueDetailListByLineId: async(lineId) => {
    return await request({ method: 'get',
      url: '/mes/wm/return-issue-detail/list-by-line',
      params: { lineId }
    })
  },
  // 查询生产退料明细详情
  getReturnIssueDetail: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/return-issue-detail/get?id=' + id })
  },
  // 新增生产退料明细
  createReturnIssueDetail: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/return-issue-detail/create', data })
  },
  // 修改生产退料明细
  updateReturnIssueDetail: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/return-issue-detail/update', data })
  },
  // 删除生产退料明细
  deleteReturnIssueDetail: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/return-issue-detail/delete?id=' + id })
  }
}

