import request from '@/utils/request'

// 查询套餐充值列表
export function getWalletRechargePackagePage(params) {
  return request({
    url: '/pay/wallet-recharge-package/page',
    method: 'get',
    params
  })
}

// 查询套餐充值详情
export function getWalletRechargePackage(id) {
  return request({
    url: '/pay/wallet-recharge-package/get?id=' + id,
    method: 'get'
  })
}

// 新增套餐充值
export function createWalletRechargePackage(data) {
  return request({
    url: '/pay/wallet-recharge-package/create',
    method: 'post',
    data
  })
}

// 修改套餐充值
export function updateWalletRechargePackage(data) {
  return request({
    url: '/pay/wallet-recharge-package/update',
    method: 'put',
    data
  })
}

// 删除套餐充值
export function deleteWalletRechargePackage(id) {
  return request({
    url: '/pay/wallet-recharge-package/delete?id=' + id,
    method: 'delete'
  })
}
