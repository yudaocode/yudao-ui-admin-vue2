import request from '@/utils/request'

// 查询产品单位分页
export function getProductUnitPage(query) {
  return request({
    url: '/erp/product-unit/page',
    method: 'get',
    params: query
  })
}

// 查询产品单位精简列表
export function getProductUnitSimpleList() {
  return request({
    url: '/erp/product-unit/simple-list',
    method: 'get'
  })
}

// 查询产品单位详情
export function getProductUnit(id) {
  return request({
    url: '/erp/product-unit/get?id=' + id,
    method: 'get'
  })
}

// 新增产品单位
export function createProductUnit(data) {
  return request({
    url: '/erp/product-unit/create',
    method: 'post',
    data: data
  })
}

// 修改产品单位
export function updateProductUnit(data) {
  return request({
    url: '/erp/product-unit/update',
    method: 'put',
    data: data
  })
}

// 删除产品单位
export function deleteProductUnit(id) {
  return request({
    url: '/erp/product-unit/delete?id=' + id,
    method: 'delete'
  })
}

// 导出产品单位 Excel
export function exportProductUnit(query) {
  return request({
    url: '/erp/product-unit/export-excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
