import request from '@/utils/request'

// 查询用户钱包详情
export function getWallet(params) {
  return request({
    url: '/pay/wallet/get',
    method: 'get',
    params
  })
}

// 查询会员钱包列表
export function getWalletPage(params) {
  return request({
    url: '/pay/wallet/page',
    method: 'get',
    params
  })
}

// 修改会员钱包余额
export function updateWalletBalance(data) {
  return request({
    url: '/pay/wallet/update-balance',
    method: 'put',
    data
  })
}
