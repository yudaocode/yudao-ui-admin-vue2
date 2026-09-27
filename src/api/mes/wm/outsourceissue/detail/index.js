import request from '@/utils/request'
// MES 外协发料单明细 API
export const WmOutsourceIssueDetailApi = {
  // 查询外协发料单明细列表（按行编号）
  getOutsourceIssueDetailListByLineId: async(lineId) => {
    return await request({ method: 'get',
      url: '/mes/wm/outsource-issue-detail/list-by-line',
      params: { lineId }
    })
  },
  // 查询外协发料单明细详情
  getOutsourceIssueDetail: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/outsource-issue-detail/get?id=' + id })
  },
  // 新增外协发料单明细
  createOutsourceIssueDetail: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/outsource-issue-detail/create', data })
  },
  // 修改外协发料单明细
  updateOutsourceIssueDetail: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/outsource-issue-detail/update', data })
  },
  // 删除外协发料单明细
  deleteOutsourceIssueDetail: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/outsource-issue-detail/delete?id=' + id })
  }
}

