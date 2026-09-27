import request from '@/utils/request'

// FMS 结转凭证 API
export const FmsClosingVoucherApi = {
  // 生成结转损益凭证
  generateProfitLossVoucher(data) {
    return request({
      url: '/fms/closing/voucher/generate-profit-loss',
      method: 'post',
      data
    })
  },

  // 生成结账方案凭证
  generateClosingSchemeVoucher(data) {
    return request({
      url: '/fms/closing/voucher/generate-scheme',
      method: 'post',
      data
    })
  },

  // 批量生成结转凭证
  generateClosingVoucherList(data) {
    return request({
      url: '/fms/closing/voucher/generate-list',
      method: 'post',
      data
    })
  }
}
