import request from '@/utils/request'

/**
 * @typedef {Object} FmsCashFlowCheckVO
 * @property {boolean=} balanced
 * @property {boolean=} initialBalanceBalanced
 * @property {boolean=} profitLossTransferred
 * @property {boolean=} balanceSheetReady
 * @property {number=} openingDifferenceAmount
 * @property {number=} closingDifferenceAmount
 * @property {Array<Object>} unmappedSubjects
 */

/**
 * @typedef {Object} FmsCashFlowAdjustmentVO
 * @property {number} id
 * @property {string} name
 * @property {number} rowNo
 * @property {string} formula
 * @property {string=} remark
 * @property {boolean} editable
 * @property {number} currentAmount
 * @property {number} yearAmount
 * @property {number} level
 */

/**
 * @typedef {Object} FmsCashFlowStatementUpdateItemReqVO
 * @property {number} id
 * @property {number} currentAmount
 * @property {number} yearAmount
 */

/**
 * @typedef {Object} FmsCashFlowStatementUpdateReqVO
 * @property {number} accountSetId
 * @property {string} startMonth
 * @property {string} endMonth
 * @property {FmsCashFlowStatementUpdateItemReqVO[]} items
 */

/**
 * @typedef {Object} FmsCashFlowAdjustmentUpdateItemReqVO
 * @property {number} id
 * @property {number} currentAmount
 * @property {number} yearAmount
 */

/**
 * @typedef {Object} FmsCashFlowAdjustmentUpdateReqVO
 * @property {number} accountSetId
 * @property {FmsCashFlowAdjustmentUpdateItemReqVO[]} items
 */

// FMS 现金流量表 API
export const FmsCashFlowStatementApi = {
  // 查询现金流量表
  getCashFlowStatement(params) {
    return request({ url: '/fms/report/cash-flow-statement/get', method: 'get', params })
  },

  // 修改现金流量表
  updateCashFlowStatement(data) {
    return request({ url: '/fms/report/cash-flow-statement/update', method: 'put', data })
  },

  // 导出现金流量表 Excel
  exportCashFlowStatement(params) {
    return request({
      url: '/fms/report/cash-flow-statement/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    })
  },

  // 检查现金流量表
  checkCashFlowStatement(params) {
    return request({ url: '/fms/report/cash-flow-statement/check', method: 'get', params })
  },

  // 查询现金流量辅助数据列表
  getCashFlowAdjustmentList(params) {
    return request({
      url: '/fms/report/cash-flow-statement/adjustment/list',
      method: 'get',
      params
    })
  },

  // 修改现金流量辅助数据
  updateCashFlowAdjustment(data) {
    return request({
      url: '/fms/report/cash-flow-statement/adjustment/update',
      method: 'put',
      data
    })
  },

  // 修改现金流量辅助数据公式
  updateCashFlowAdjustmentFormula(data) {
    return request({
      url: '/fms/report/cash-flow-statement/adjustment/update-formula',
      method: 'put',
      data
    })
  }
}
