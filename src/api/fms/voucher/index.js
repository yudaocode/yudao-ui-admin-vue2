import request from '@/utils/request'

// FMS 凭证 API
export const FmsVoucherApi = {
  // 查询凭证分页
  getVoucherPage(params) {
    return request({ url: '/fms/voucher/page', method: 'get', params })
  },

  // 查询待打印凭证列表
  getVoucherPrintList(params) {
    return request({ url: '/fms/voucher/print-list', method: 'get', params })
  },

  // 导出凭证 Excel
  exportVoucher(params) {
    return request({ url: '/fms/voucher/export-excel', method: 'get', params, responseType: 'blob' })
  },

  // 下载凭证导入模板
  getVoucherImportTemplate(accountSetId) {
    return request({
      url: '/fms/voucher/get-import-template',
      method: 'get',
      params: { accountSetId },
      responseType: 'blob'
    })
  },

  // 导入凭证
  importVoucher(accountSetId, file) {
    const data = new FormData()
    data.append('accountSetId', String(accountSetId))
    data.append('file', file)
    return request({
      url: '/fms/voucher/import',
      method: 'post',
      data,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // 查询凭证详情
  getVoucher(accountSetId, id) {
    return request({
      url: '/fms/voucher/get',
      method: 'get',
      params: { accountSetId, id }
    })
  },

  // 查询凭证科目余额列表
  getVoucherSubjectBalanceList(accountSetId, month) {
    return request({
      url: '/fms/voucher/subject-balance-list',
      method: 'get',
      params: { accountSetId, month }
    })
  },

  // 查询凭证辅助核算组合余额
  getVoucherAuxiliaryBalance(accountSetId, month, subjectId, auxiliaryItemIds) {
    return request({
      url: '/fms/voucher/auxiliary-balance',
      method: 'get',
      params: { accountSetId, month, subjectId, auxiliaryItemIds: auxiliaryItemIds.join(',') }
    })
  },

  // 查询下一凭证号
  getNextVoucherNumber(accountSetId, voucherWordId, voucherTime) {
    return request({
      url: '/fms/voucher/next-number',
      method: 'get',
      params: { accountSetId, voucherWordId, voucherTime }
    })
  },

  // 新增凭证
  createVoucher(data) {
    return request({ url: '/fms/voucher/create', method: 'post', data })
  },

  // 修改凭证
  updateVoucher(data) {
    return request({ url: '/fms/voucher/update', method: 'put', data })
  },

  // 修改凭证附件
  updateVoucherAttachments(data) {
    return request({ url: '/fms/voucher/update-attachments', method: 'put', data })
  },

  // 批量删除凭证
  deleteVoucherList(accountSetId, ids) {
    return request({
      url: '/fms/voucher/delete-list',
      method: 'delete',
      params: { accountSetId, ids: ids.join(',') }
    })
  },

  // 审核或反审核凭证
  updateVoucherReviewStatus(accountSetId, ids, status) {
    return request({
      url: '/fms/voucher/update-review-status',
      method: 'put',
      data: { accountSetId, ids, status }
    })
  },

  // 整理凭证
  tidyVoucher(data) {
    return request({ url: '/fms/voucher/tidy', method: 'put', data })
  },

  // 移动凭证
  moveVoucher(data) {
    return request({ url: '/fms/voucher/move', method: 'put', data })
  }
}

export { FmsVoucherStatisticsApi } from './statistics'
