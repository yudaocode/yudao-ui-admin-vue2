import request from '@/utils/request'

// CRM 联系人 API（与 Vue3 端保持同一资源路径）
export function getContactPage(params) {
  return request({ url: '/crm/contact/page', method: 'get', params })
}

export function getContactPageByCustomer(params) {
  return request({ url: '/crm/contact/page-by-customer', method: 'get', params })
}

export function getContactPageByBusiness(params) {
  return request({ url: '/crm/contact/page-by-business', method: 'get', params })
}

export function getContact(id) {
  return request({ url: '/crm/contact/get?id=' + id, method: 'get' })
}

export function createContact(data) {
  return request({ url: '/crm/contact/create', method: 'post', data })
}

export function updateContact(data) {
  return request({ url: '/crm/contact/update', method: 'put', data })
}

export function deleteContact(id) {
  return request({ url: '/crm/contact/delete?id=' + id, method: 'delete' })
}

export function exportContact(params) {
  return request({ url: '/crm/contact/export-excel', method: 'get', params, responseType: 'blob' })
}

export function getSimpleContactList() {
  return request({ url: '/crm/contact/simple-all-list', method: 'get' })
}

export function getContactListByCustomer(customerId) {
  return request({ url: '/crm/contact/list-by-customer', method: 'get', params: { customerId } })
}

export function createContactBusinessList(data) {
  return request({ url: '/crm/contact/create-business-list', method: 'post', data })
}

export function createContactBusinessList2(data) {
  return request({ url: '/crm/contact/create-business-list2', method: 'post', data })
}

export function deleteContactBusinessList(data) {
  return request({ url: '/crm/contact/delete-business-list', method: 'delete', data })
}

export function deleteContactBusinessList2(data) {
  return request({ url: '/crm/contact/delete-business-list2', method: 'delete', data })
}

export function transferContact(data) {
  return request({ url: '/crm/contact/transfer', method: 'put', data })
}
