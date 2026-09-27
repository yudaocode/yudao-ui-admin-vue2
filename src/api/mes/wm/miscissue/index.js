import request from '@/utils/request'
// MES 杂项出库单 API
export const WmMiscIssueApi = {
  // 查询杂项出库单分页
  getMiscIssuePage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/misc-issue/page', params })
  },
  // 查询杂项出库单详情
  getMiscIssue: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/misc-issue/get?id=' + id })
  },
  // 新增杂项出库单
  createMiscIssue: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/misc-issue/create', data })
  },
  // 修改杂项出库单
  updateMiscIssue: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/misc-issue/update', data })
  },
  // 删除杂项出库单
  deleteMiscIssue: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/misc-issue/delete?id=' + id })
  },
  // 提交杂项出库单
  submitMiscIssue: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/misc-issue/submit?id=' + id })
  },
  // 执行出库
  finishMiscIssue: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/misc-issue/finish?id=' + id })
  },
  // 取消杂项出库单
  cancelMiscIssue: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/misc-issue/cancel?id=' + id })
  },
  // 导出杂项出库单 Excel
  exportMiscIssue: async(params) => {
    return await request({ method: 'get', responseType: 'blob', url: '/mes/wm/misc-issue/export-excel', params })
  },
  // 校验杂项出库单数量
  checkMiscIssueQuantity: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/misc-issue/check-quantity?id=' + id })
  }
}

