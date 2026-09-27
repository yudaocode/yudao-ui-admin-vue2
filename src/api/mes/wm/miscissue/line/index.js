import request from '@/utils/request'
// MES 杂项出库单行 API
export const WmMiscIssueLineApi = {
  // 查询杂项出库单行分页
  getMiscIssueLinePage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/misc-issue-line/page', params })
  },
  // 根据出库单ID查询杂项出库单行列表
  getMiscIssueLineListByIssueId: async(issueId) => {
    return await request({ method: 'get', url: '/mes/wm/misc-issue-line/list-by-issue-id?issueId=' + issueId })
  },
  // 查询杂项出库单行详情
  getMiscIssueLine: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/misc-issue-line/get?id=' + id })
  },
  // 新增杂项出库单行
  createMiscIssueLine: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/misc-issue-line/create', data })
  },
  // 修改杂项出库单行
  updateMiscIssueLine: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/misc-issue-line/update', data })
  },
  // 删除杂项出库单行
  deleteMiscIssueLine: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/misc-issue-line/delete?id=' + id })
  }
}

