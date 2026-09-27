import request from '@/utils/request'

// 查询会员钱包流水列表
export function getWalletTransactionPage(params) {
  return request({
    url: '/pay/wallet-transaction/page',
    method: 'get',
    params
  })
}
