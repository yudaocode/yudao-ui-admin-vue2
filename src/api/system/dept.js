import request from '@/utils/request'

// 查询部门列表
export function getDeptList(query) {
  return request({
    url: '/system/dept/list',
    method: 'get',
    params: query
  })
}

// 查询部门分页列表（部门列表接口通过 pageNo/pageSize 支持分页）
export function getDeptPage(query) {
  return request({
    url: '/system/dept/list',
    method: 'get',
    params: query
  })
}

// 查询部门详细
export function getDept(deptId) {
  return request({
    url: '/system/dept/get?id=' + deptId,
    method: 'get'
  })
}

// 获取部门精简信息列表
export function getSimpleDeptList() {
  return request({
    url: '/system/dept/simple-list',
    method: 'get'
  })
}

// 新增部门
export function createDept(data) {
  return request({
    url: '/system/dept/create',
    method: 'post',
    data: data
  })
}

// 修改部门
export function updateDept(data) {
  return request({
    url: '/system/dept/update',
    method: 'put',
    data: data
  })
}

// 删除部门
export function deleteDept(id) {
  return request({
    url: '/system/dept/delete?id=' + id,
    method: 'delete'
  })
}

// 批量删除部门
export function deleteDeptList(ids) {
  return request({
    url: '/system/dept/delete-list',
    method: 'delete',
    params: { ids: ids.join(',') }
  })
}
