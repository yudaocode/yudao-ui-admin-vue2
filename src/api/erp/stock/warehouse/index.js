import request from '@/utils/request'

// ERP 仓库分页
export function getWarehousePage(query) {
  return request({
    url: '/erp/warehouse/page',
    method: 'get',
    params: query
  })
}

// ERP 仓库精简列表（仅启用仓库）
export function getWarehouseSimpleList() {
  return request({
    url: '/erp/warehouse/simple-list',
    method: 'get'
  })
}

// ERP 仓库详情
export function getWarehouse(id) {
  return request({
    url: '/erp/warehouse/get?id=' + id,
    method: 'get'
  })
}

// 新增 ERP 仓库
export function createWarehouse(data) {
  return request({
    url: '/erp/warehouse/create',
    method: 'post',
    data
  })
}

// 修改 ERP 仓库
export function updateWarehouse(data) {
  return request({
    url: '/erp/warehouse/update',
    method: 'put',
    data
  })
}

// 修改 ERP 仓库默认状态
export function updateWarehouseDefaultStatus(id, defaultStatus) {
  return request({
    url: '/erp/warehouse/update-default-status',
    method: 'put',
    params: { id, defaultStatus }
  })
}

// 删除 ERP 仓库
export function deleteWarehouse(id) {
  return request({
    url: '/erp/warehouse/delete?id=' + id,
    method: 'delete'
  })
}

// 导出 ERP 仓库 Excel
export function exportWarehouse(query) {
  return request({
    url: '/erp/warehouse/export-excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
