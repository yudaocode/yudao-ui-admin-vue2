import request from '@/utils/request'

// CRM 商机 API. The names/endpoints mirror the Vue3 BusinessApi contract.
export function getBusinessPage(params) {
  return request({ url: '/crm/business/page', method: 'get', params })
}

export function getBusinessPageByCustomer(params) {
  return request({ url: '/crm/business/page-by-customer', method: 'get', params })
}

export function getBusiness(id) {
  return request({ url: '/crm/business/get?id=' + id, method: 'get' })
}

export function getSimpleBusinessList() {
  return request({ url: '/crm/business/simple-all-list', method: 'get' })
}

export function createBusiness(data) {
  return request({ url: '/crm/business/create', method: 'post', data })
}

export function updateBusiness(data) {
  return request({ url: '/crm/business/update', method: 'put', data })
}

export function updateBusinessStatus(data) {
  return request({ url: '/crm/business/update-status', method: 'put', data })
}

export function deleteBusiness(id) {
  return request({ url: '/crm/business/delete?id=' + id, method: 'delete' })
}

export function exportBusiness(params) {
  return request({ url: '/crm/business/export-excel', method: 'get', params, responseType: 'blob' })
}

export function getBusinessPageByContact(params) {
  return request({ url: '/crm/business/page-by-contact', method: 'get', params })
}

export function transferBusiness(data) {
  return request({ url: '/crm/business/transfer', method: 'put', data })
}
