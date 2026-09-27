import request from '@/utils/request'

// 查询产品分页
export function getProductPage(query) {
  return request({
    url: '/erp/product/page',
    method: 'get',
    params: query
  })
}

// 查询产品精简列表（仅启用产品）
export function getProductSimpleList() {
  return request({
    url: '/erp/product/simple-list',
    method: 'get'
  })
}

// 查询产品详情
export function getProduct(id) {
  return request({
    url: '/erp/product/get?id=' + id,
    method: 'get'
  })
}

// 新增产品
export function createProduct(data) {
  return request({
    url: '/erp/product/create',
    method: 'post',
    data: data
  })
}

// 修改产品
export function updateProduct(data) {
  return request({
    url: '/erp/product/update',
    method: 'put',
    data: data
  })
}

// 删除产品
export function deleteProduct(id) {
  return request({
    url: '/erp/product/delete?id=' + id,
    method: 'delete'
  })
}

// 导出产品 Excel
export function exportProduct(query) {
  return request({
    url: '/erp/product/export-excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
