import request from '@/utils/request'

// CRM 回款计划 API。方法名与 Vue3 ReceivablePlanApi 保持一致。
export function getReceivablePlanPage(params) {
  return request({ url: '/crm/receivable-plan/page', method: 'get', params })
}

export function getReceivablePlanPageByCustomer(params) {
  return request({ url: '/crm/receivable-plan/page-by-customer', method: 'get', params })
}

export function getReceivablePlan(id) {
  return request({ url: '/crm/receivable-plan/get?id=' + id, method: 'get' })
}

export function getReceivablePlanSimpleList(customerId, contractId) {
  return request({
    url: '/crm/receivable-plan/simple-list',
    method: 'get',
    params: { customerId, contractId }
  })
}

export function createReceivablePlan(data) {
  return request({ url: '/crm/receivable-plan/create', method: 'post', data })
}

export function updateReceivablePlan(data) {
  return request({ url: '/crm/receivable-plan/update', method: 'put', data })
}

export function deleteReceivablePlan(id) {
  return request({ url: '/crm/receivable-plan/delete?id=' + id, method: 'delete' })
}

export function exportReceivablePlan(params) {
  return request({
    url: '/crm/receivable-plan/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

export function getReceivablePlanRemindCount() {
  return request({ url: '/crm/receivable-plan/remind-count', method: 'get' })
}
