import request from '@/utils/request'

// 查询交易订单列表
export function getOrderPage(params) {
  return request({
    url: '/trade/order/page',
    method: 'get',
    params
  })
}

// 查询交易订单统计
export function getOrderSummary(params) {
  return request({
    url: '/trade/order/summary',
    method: 'get',
    params
  })
}

// 查询交易订单详情
export function getOrder(id) {
  return request({
    url: '/trade/order/get-detail?id=' + id,
    method: 'get'
  })
}

// 查询交易订单物流详情
export function getExpressTrackList(id) {
  return request({
    url: '/trade/order/get-express-track-list?id=' + id,
    method: 'get'
  })
}

// 订单发货
export function deliveryOrder(data) {
  return request({
    url: '/trade/order/delivery',
    method: 'put',
    data
  })
}

// 订单备注
export function updateOrderRemark(data) {
  return request({
    url: '/trade/order/update-remark',
    method: 'put',
    data
  })
}

// 订单调价
export function updateOrderPrice(data) {
  return request({
    url: '/trade/order/update-price',
    method: 'put',
    data
  })
}

// 修改订单地址
export function updateOrderAddress(data) {
  return request({
    url: '/trade/order/update-address',
    method: 'put',
    data
  })
}

// 订单核销
export function pickUpOrder(id) {
  return request({
    url: '/trade/order/pick-up-by-id?id=' + id,
    method: 'put'
  })
}

// 根据核销码核销订单
export function pickUpOrderByVerifyCode(pickUpVerifyCode) {
  return request({
    url: '/trade/order/pick-up-by-verify-code',
    method: 'put',
    params: { pickUpVerifyCode }
  })
}

// 查询核销码对应的订单
export function getOrderByPickUpVerifyCode(pickUpVerifyCode) {
  return request({
    url: '/trade/order/get-by-pick-up-verify-code',
    method: 'get',
    params: { pickUpVerifyCode }
  })
}
