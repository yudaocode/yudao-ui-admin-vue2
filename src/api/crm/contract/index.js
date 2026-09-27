import request from '@/utils/request'

// CRM 合同 API，保持和 Vue3 端同名同路径的资源契约
export function getContractPage(params) {
  return request({ url: '/crm/contract/page', method: 'get', params })
}

export function getContractPageByCustomer(params) {
  return request({ url: '/crm/contract/page-by-customer', method: 'get', params })
}

export function getContractPageByBusiness(params) {
  return request({ url: '/crm/contract/page-by-business', method: 'get', params })
}

export function getContract(id) {
  return request({ url: '/crm/contract/get?id=' + id, method: 'get' })
}

export function getContractSimpleList(customerId) {
  return request({
    url: '/crm/contract/simple-list',
    method: 'get',
    params: { customerId }
  })
}

export function createContract(data) {
  return request({ url: '/crm/contract/create', method: 'post', data })
}

export function updateContract(data) {
  return request({ url: '/crm/contract/update', method: 'put', data })
}

export function deleteContract(id) {
  return request({ url: '/crm/contract/delete?id=' + id, method: 'delete' })
}

export function exportContract(params) {
  return request({ url: '/crm/contract/export-excel', method: 'get', params, responseType: 'blob' })
}

export function submitContract(id) {
  return request({ url: '/crm/contract/submit?id=' + id, method: 'put' })
}

export function transferContract(data) {
  return request({ url: '/crm/contract/transfer', method: 'put', data })
}

export function getAuditContractCount() {
  return request({ url: '/crm/contract/audit-count', method: 'get' })
}

export function getRemindContractCount() {
  return request({ url: '/crm/contract/remind-count', method: 'get' })
}
