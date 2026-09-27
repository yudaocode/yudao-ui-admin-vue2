import request from '@/utils/request'

// 查询转账单分页
export function getTransferPage(query) {
  return request({
    url: '/pay/transfer/page',
    method: 'get',
    params: query
  })
}

// 查询转账单详情
export function getTransfer(id) {
  return request({
    url: '/pay/transfer/get?id=' + id,
    method: 'get'
  })
}

// 导出转账单 Excel
export function exportTransfer(query) {
  return request({
    url: '/pay/transfer/export-excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
