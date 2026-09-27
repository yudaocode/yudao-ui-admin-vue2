import request from '@/utils/request'

/**
 * @typedef {Object} FmsIncomeStatementCheckVO
 * @property {boolean=} balanced
 * @property {number=} differenceAmount
 * @property {Array<Object>} unmappedSubjects
 */

// FMS 利润表 API
export const FmsIncomeStatementApi = {
  // 查询利润表
  getIncomeStatement(params) {
    return request({ url: '/fms/report/income-statement/get', method: 'get', params })
  },

  // 导出利润表 Excel
  exportIncomeStatement(params) {
    return request({
      url: '/fms/report/income-statement/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    })
  },

  // 修改利润表公式
  updateIncomeStatementFormula(data) {
    return request({ url: '/fms/report/income-statement/update', method: 'put', data })
  },

  // 检查利润表
  checkIncomeStatement(params) {
    return request({ url: '/fms/report/income-statement/check', method: 'get', params })
  }
}
