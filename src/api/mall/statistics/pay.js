import request from '@/utils/request'

// 获取钱包充值金额
export function getWalletRechargePrice() {
  return request({
    url: '/statistics/pay/summary',
    method: 'get'
  })
}
