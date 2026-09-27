import request from '@/utils/request'
// MES 外协发料单行 API
export const WmOutsourceIssueLineApi = {
  // 查询外协发料单行分页
  getOutsourceIssueLinePage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/outsource-issue-line/page', params })
  },
  // 查询外协发料单行详情
  getOutsourceIssueLine: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/outsource-issue-line/get?id=' + id })
  },
  // 新增外协发料单行
  createOutsourceIssueLine: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/outsource-issue-line/create', data })
  },
  // 修改外协发料单行
  updateOutsourceIssueLine: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/outsource-issue-line/update', data })
  },
  // 删除外协发料单行
  deleteOutsourceIssueLine: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/outsource-issue-line/delete?id=' + id })
  }
}

