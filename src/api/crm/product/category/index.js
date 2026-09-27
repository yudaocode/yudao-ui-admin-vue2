import request from '@/utils/request'

// CRM 产品分类接口与 Vue3 端保持一致
export function getProductCategory(id) {
  return request({ url: '/crm/product-category/get?id=' + id, method: 'get' })
}

export function createProductCategory(data) {
  return request({ url: '/crm/product-category/create', method: 'post', data })
}

export function updateProductCategory(data) {
  return request({ url: '/crm/product-category/update', method: 'put', data })
}

export function deleteProductCategory(id) {
  return request({ url: '/crm/product-category/delete?id=' + id, method: 'delete' })
}

export function getProductCategoryList(params) {
  return request({ url: '/crm/product-category/list', method: 'get', params })
}
