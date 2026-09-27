import request from '@/utils/request'

// 获得交易售后分页
export function getAfterSalePage(params) {
  return request({
    url: '/trade/after-sale/page',
    method: 'get',
    params
  })
}

// 获得交易售后详情
export function getAfterSale(id) {
  return request({
    url: '/trade/after-sale/get-detail?id=' + id,
    method: 'get'
  })
}

// 同意售后
export function agree(id) {
  return request({
    url: '/trade/after-sale/agree?id=' + id,
    method: 'put'
  })
}

// 拒绝售后
export function disagree(data) {
  return request({
    url: '/trade/after-sale/disagree',
    method: 'put',
    data
  })
}

// 确认收货
export function receive(id) {
  return request({
    url: '/trade/after-sale/receive?id=' + id,
    method: 'put'
  })
}

// 拒绝收货
export function refuse(id) {
  return request({
    url: '/trade/after-sale/refuse?id=' + id,
    method: 'put'
  })
}

// 确认退款
export function refund(id) {
  return request({
    url: '/trade/after-sale/refund?id=' + id,
    method: 'put'
  })
}
