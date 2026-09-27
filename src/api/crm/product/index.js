import request from '@/utils/request'

// CRM 产品接口与 Vue3 端保持一致
export function getProductPage(params) {
  return request({ url: '/crm/product/page', method: 'get', params })
}

export function getProductSimpleList() {
  return request({ url: '/crm/product/simple-list', method: 'get' })
}

export function getProduct(id) {
  return request({ url: '/crm/product/get?id=' + id, method: 'get' })
}

export function createProduct(data) {
  return request({ url: '/crm/product/create', method: 'post', data })
}

export function updateProduct(data) {
  return request({ url: '/crm/product/update', method: 'put', data })
}

export function deleteProduct(id) {
  return request({ url: '/crm/product/delete?id=' + id, method: 'delete' })
}

export function exportProduct(params) {
  return request({ url: '/crm/product/export-excel', method: 'get', params, responseType: 'blob' })
}
