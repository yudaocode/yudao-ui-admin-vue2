import request from '@/utils/request'

// 查询会员钱包
export function getWallet(params) {
  return request({
    url: '/pay/wallet/get',
    method: 'get',
    params: params
  })
}

// 修改会员钱包余额
export function updateWalletBalance(data) {
  return request({
    url: '/pay/wallet/update-balance',
    method: 'put',
    data: data
  })
}

// 查询钱包交易分页
export function getWalletTransactionPage(params) {
  return request({
    url: '/pay/wallet-transaction/page',
    method: 'get',
    params: params
  })
}

// 查询会员收货地址
export function getAddressList(params) {
  return request({
    url: '/member/address/list',
    method: 'get',
    params: params
  })
}

// 查询会员成长值记录分页
export function getExperienceRecordPage(params) {
  return request({
    url: '/member/experience-record/page',
    method: 'get',
    params: params
  })
}

// 查询会员积分记录分页
export function getPointRecordPage(params) {
  return request({
    url: '/member/point/record/page',
    method: 'get',
    params: params
  })
}

// 查询会员签到记录分页
export function getSignInRecordPage(params) {
  return request({
    url: '/member/sign-in/record/page',
    method: 'get',
    params: params
  })
}

// 查询会员订单分页
export function getOrderPage(params) {
  return request({
    url: '/trade/order/page',
    method: 'get',
    params: params
  })
}

// 查询订单筛选所需的快递公司精简列表
export function getSimpleDeliveryExpressList() {
  return request({
    url: '/trade/delivery/express/list-all-simple',
    method: 'get'
  })
}

// 查询订单筛选所需的自提门店精简列表
export function getSimpleDeliveryPickUpStoreList() {
  return request({
    url: '/trade/delivery/pick-up-store/simple-list',
    method: 'get'
  })
}

// 查询会员售后分页
export function getAfterSalePage(params) {
  return request({
    url: '/trade/after-sale/page',
    method: 'get',
    params: params
  })
}

// 查询会员优惠券分页
export function getCouponPage(params) {
  return request({
    url: '/promotion/coupon/page',
    method: 'get',
    params: params
  })
}

// 回收会员优惠券
export function deleteCoupon(id) {
  return request({
    url: '/promotion/coupon/delete?id=' + id,
    method: 'delete'
  })
}

// 查询会员收藏商品分页
export function getFavoritePage(params) {
  return request({
    url: '/product/favorite/page',
    method: 'get',
    params: params
  })
}

// 查询推广用户分页
export function getBrokerageUserPage(params) {
  return request({
    url: '/trade/brokerage-user/page',
    method: 'get',
    params: params
  })
}
