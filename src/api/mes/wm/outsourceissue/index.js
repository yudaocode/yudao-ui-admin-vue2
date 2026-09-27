import request from '@/utils/request'
// MES 外协发料单 API
export const WmOutsourceIssueApi = {
  // 查询外协发料单分页
  getOutsourceIssuePage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/outsource-issue/page', params })
  },
  // 查询外协发料单详情
  getOutsourceIssue: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/outsource-issue/get?id=' + id })
  },
  // 新增外协发料单
  createOutsourceIssue: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/outsource-issue/create', data })
  },
  // 修改外协发料单
  updateOutsourceIssue: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/outsource-issue/update', data })
  },
  // 删除外协发料单
  deleteOutsourceIssue: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/outsource-issue/delete?id=' + id })
  },
  // 提交到待拣货
  submitOutsourceIssue: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/outsource-issue/submit?id=' + id })
  },
  // 执行拣货
  stockOutsourceIssue: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/outsource-issue/stock?id=' + id })
  },
  // 完成外协发料出库
  finishOutsourceIssue: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/outsource-issue/finish?id=' + id })
  },
  // 取消外协发料单
  cancelOutsourceIssue: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/outsource-issue/cancel?id=' + id })
  },
  // 校验外协发料单数量
  checkOutsourceIssueQuantity: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/outsource-issue/check-quantity?id=' + id })
  },
  // 导出外协发料单 Excel
  exportOutsourceIssue: async(params) => {
    return await request({ method: 'get', responseType: 'blob', url: '/mes/wm/outsource-issue/export-excel', params })
  }
}

