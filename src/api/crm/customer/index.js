import request from '@/utils/request'

// 客户分页与详情
export function getCustomerPage(params) {
  return request({
    url: '/crm/customer/page',
    method: 'get',
    params
  })
}

export function getCustomer(id) {
  return request({
    url: '/crm/customer/get?id=' + id,
    method: 'get'
  })
}

// 客户维护
export function createCustomer(data) {
  return request({
    url: '/crm/customer/create',
    method: 'post',
    data
  })
}

export function updateCustomer(data) {
  return request({
    url: '/crm/customer/update',
    method: 'put',
    data
  })
}

export function deleteCustomer(id) {
  return request({
    url: '/crm/customer/delete?id=' + id,
    method: 'delete'
  })
}

export function updateCustomerDealStatus(id, dealStatus) {
  return request({
    url: '/crm/customer/update-deal-status',
    method: 'put',
    params: { id, dealStatus }
  })
}

// 客户业务操作
export function getCustomerSimpleList() {
  return request({
    url: '/crm/customer/simple-list',
    method: 'get'
  })
}

export function getPutPoolRemindCustomerPage(params) {
  return request({
    url: '/crm/customer/put-pool-remind-page',
    method: 'get',
    params
  })
}

export function getPutPoolRemindCustomerCount() {
  return request({
    url: '/crm/customer/put-pool-remind-count',
    method: 'get'
  })
}

export function getTodayContactCustomerCount() {
  return request({
    url: '/crm/customer/today-contact-count',
    method: 'get'
  })
}

export function getFollowCustomerCount() {
  return request({
    url: '/crm/customer/follow-count',
    method: 'get'
  })
}

export function lockCustomer(id, lockStatus) {
  return request({
    url: '/crm/customer/lock',
    method: 'put',
    data: { id, lockStatus }
  })
}

export function receiveCustomer(ids) {
  return request({
    url: '/crm/customer/receive',
    method: 'put',
    params: { ids: Array.isArray(ids) ? ids.join(',') : ids }
  })
}

export function distributeCustomer(ids, ownerUserId) {
  return request({
    url: '/crm/customer/distribute',
    method: 'put',
    data: { ids, ownerUserId }
  })
}

export function putCustomerPool(id) {
  return request({
    url: '/crm/customer/put-pool?id=' + id,
    method: 'put'
  })
}

export function transferCustomer(data) {
  return request({
    url: '/crm/customer/transfer',
    method: 'put',
    data
  })
}

export function exportCustomer(params) {
  return request({
    url: '/crm/customer/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

export function importCustomerTemplate() {
  return request({
    url: '/crm/customer/get-import-template',
    method: 'get',
    responseType: 'blob'
  })
}

export function handleImport(data) {
  return request({
    url: '/crm/customer/import',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
