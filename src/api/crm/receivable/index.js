import request from '@/utils/request'

// CRM 回款 API。方法名与 Vue3 ReceivableApi 保持一致，便于跨端复用业务调用。
export function getReceivablePage(params) {
  return request({ url: '/crm/receivable/page', method: 'get', params })
}

export function getReceivablePageByCustomer(params) {
  return request({ url: '/crm/receivable/page-by-customer', method: 'get', params })
}

export function getReceivable(id) {
  return request({ url: '/crm/receivable/get?id=' + id, method: 'get' })
}

export function createReceivable(data) {
  return request({ url: '/crm/receivable/create', method: 'post', data })
}

export function updateReceivable(data) {
  return request({ url: '/crm/receivable/update', method: 'put', data })
}

export function deleteReceivable(id) {
  return request({ url: '/crm/receivable/delete?id=' + id, method: 'delete' })
}

export function exportReceivable(params) {
  return request({
    url: '/crm/receivable/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

export function submitReceivable(id) {
  return request({ url: '/crm/receivable/submit?id=' + id, method: 'put' })
}

export function getAuditReceivableCount() {
  return request({ url: '/crm/receivable/audit-count', method: 'get' })
}
