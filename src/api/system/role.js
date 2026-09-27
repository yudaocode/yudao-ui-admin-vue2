import request from '@/utils/request'

// 查询角色列表
export function getRolePage(query) {
  return request({
    url: '/system/role/page',
    method: 'get',
    params: query
  })
}

// 查询角色（精简)列表
export function getSimpleRoleList() {
  return request({
    url: '/system/role/simple-list',
    method: 'get'
  })
}

// 查询角色详细
export function getRole(roleId) {
  return request({
    url: '/system/role/get?id=' + roleId,
    method: 'get'
  })
}

// 新增角色
export function createRole(data) {
  return request({
    url: '/system/role/create',
    method: 'post',
    data: data
  })
}

// 修改角色
export function updateRole(data) {
  return request({
    url: '/system/role/update',
    method: 'put',
    data: data
  })
}

// 删除角色
export function deleteRole(roleId) {
  return request({
    url: '/system/role/delete?id=' + roleId,
    method: 'delete'
  })
}

// 批量删除角色
export function deleteRoleList(ids) {
  return request({
    url: '/system/role/delete-list',
    method: 'delete',
    params: { ids: ids.join(',') }
  })
}

// 导出角色
export function exportRole(query) {
  return request({
    url: '/system/role/export-excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
