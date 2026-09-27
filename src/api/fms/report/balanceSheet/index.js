import request from '@/utils/request'

/**
 * @typedef {Object} FmsBalanceSheetRowVO
 * @property {number} rowId
 * @property {number=} assetId
 * @property {string=} assetName
 * @property {number=} assetRowNo
 * @property {number=} assetClosingAmount
 * @property {number=} assetOpeningAmount
 * @property {number=} assetLevel
 * @property {boolean=} assetEditable
 * @property {string=} assetFormula
 * @property {number=} liabilityId
 * @property {string=} liabilityName
 * @property {number=} liabilityRowNo
 * @property {number=} liabilityClosingAmount
 * @property {number=} liabilityOpeningAmount
 * @property {number=} liabilityLevel
 * @property {boolean=} liabilityEditable
 * @property {string=} liabilityFormula
 */

/**
 * @typedef {Object} FmsBalanceSheetCheckVO
 * @property {boolean=} balanced
 * @property {boolean=} initialBalanceBalanced
 * @property {boolean=} profitLossTransferred
 * @property {number=} openingDifferenceAmount
 * @property {number=} closingDifferenceAmount
 * @property {Array<Object>} unmappedSubjects
 */

// FMS 资产负债表 API
export const FmsBalanceSheetApi = {
  // 查询资产负债表
  getBalanceSheet(params) {
    return request({ url: '/fms/report/balance-sheet/get', method: 'get', params })
  },

  // 导出资产负债表 Excel
  exportBalanceSheet(params) {
    return request({
      url: '/fms/report/balance-sheet/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    })
  },

  // 修改资产负债表公式
  updateBalanceSheetFormula(data) {
    return request({ url: '/fms/report/balance-sheet/update', method: 'put', data })
  },

  // 检查资产负债表
  checkBalanceSheet(params) {
    return request({ url: '/fms/report/balance-sheet/check', method: 'get', params })
  }
}
