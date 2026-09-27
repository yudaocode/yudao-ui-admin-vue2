import request from '@/utils/request'

// 获得支付订单
export function getOrder(id, sync) {
  return request({
    url: '/pay/order/get',
    method: 'get',
    params: { id, sync }
  })
}

// 获得支付订单的明细
export function getOrderDetail(id) {
  return request({
    url: '/pay/order/get-detail?id=' + id,
    method: 'get'
  })
}

// 提交支付订单
export function submitOrder(data) {
  return request({
    url: '/pay/order/submit',
    method: 'post',
    data: data
  })
}

// 获得支付订单分页
export function getOrderPage(query) {
  return request({
    url: '/pay/order/page',
    method: 'get',
    params: query
  })
}

// 导出支付订单
export function exportOrder(query) {
  return request({
    url: '/pay/order/export-excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
