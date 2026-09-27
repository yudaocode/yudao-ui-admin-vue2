import request from '@/utils/request'

// 查询列表退款订单
export function getRefundPage(query) {
  return request({
    url: '/pay/refund/page',
    method: 'get',
    params: query
  })
}

// 查询详情退款订单
export function getRefund(id) {
  return request({
    url: '/pay/refund/get?id=' + id,
    method: 'get'
  })
}

// 新增退款订单
export function createRefund(data) {
  return request({
    url: '/pay/refund/create',
    method: 'post',
    data
  })
}

// 修改退款订单
export function updateRefund(data) {
  return request({
    url: '/pay/refund/update',
    method: 'put',
    data
  })
}

// 删除退款订单
export function deleteRefund(id) {
  return request({
    url: '/pay/refund/delete?id=' + id,
    method: 'delete'
  })
}

// 导出退款订单
export function exportRefund(query) {
  return request({
    url: '/pay/refund/export-excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
