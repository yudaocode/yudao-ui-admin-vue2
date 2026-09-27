import request from '@/utils/request'

// FMS 初始余额 API
export const FmsInitialBalanceApi = {
  // 查询初始余额列表
  getInitialBalanceList(accountSetId, subjectType) {
    return request({
      url: '/fms/config/initial-balance/list',
      method: 'get',
      params: { accountSetId, subjectType }
    })
  },

  // 保存初始余额
  saveInitialBalance(accountSetId, balances) {
    return request({
      url: '/fms/config/initial-balance/save',
      method: 'put',
      data: { accountSetId, balances }
    })
  },

  // 查询试算平衡结果
  getTrialBalance(accountSetId) {
    return request({
      url: '/fms/config/initial-balance/trial-balance',
      method: 'get',
      params: { accountSetId }
    })
  },

  // 导出初始余额 Excel
  exportInitialBalance(accountSetId) {
    return request({
      url: '/fms/config/initial-balance/export-excel',
      method: 'get',
      params: { accountSetId },
      responseType: 'blob'
    })
  },

  // 下载初始余额导入模板
  getInitialBalanceImportTemplate(accountSetId) {
    return request({
      url: '/fms/config/initial-balance/get-import-template',
      method: 'get',
      params: { accountSetId },
      responseType: 'blob'
    })
  },

  // 导入初始余额
  importInitialBalance(accountSetId, file) {
    const data = new FormData()
    data.append('accountSetId', String(accountSetId))
    data.append('file', file)
    return request({
      url: '/fms/config/initial-balance/import',
      method: 'post',
      data,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
