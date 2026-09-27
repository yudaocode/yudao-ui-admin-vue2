import request from '@/utils/request'

// 查询产品分类列表
export function getProductCategoryList(query) {
  return request({
    url: '/erp/product-category/list',
    method: 'get',
    params: query
  })
}

// 查询产品分类精简列表
export function getProductCategorySimpleList() {
  return request({
    url: '/erp/product-category/simple-list',
    method: 'get'
  })
}

// 查询产品分类详情
export function getProductCategory(id) {
  return request({
    url: '/erp/product-category/get?id=' + id,
    method: 'get'
  })
}

// 新增产品分类
export function createProductCategory(data) {
  return request({
    url: '/erp/product-category/create',
    method: 'post',
    data: data
  })
}

// 修改产品分类
export function updateProductCategory(data) {
  return request({
    url: '/erp/product-category/update',
    method: 'put',
    data: data
  })
}

// 删除产品分类
export function deleteProductCategory(id) {
  return request({
    url: '/erp/product-category/delete?id=' + id,
    method: 'delete'
  })
}

// 导出产品分类 Excel
export function exportProductCategory(query) {
  return request({
    url: '/erp/product-category/export-excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
