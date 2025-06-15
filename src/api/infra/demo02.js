import request from '@/utils/request'

// 创建示例分类
export function createDemo02Category(data) {
  return request({
    url: '/infra/demo02-category/create',
    method: 'post',
    data: data
  })
}

// 更新示例分类
export function updateDemo02Category(data) {
  return request({
    url: '/infra/demo02-category/update',
    method: 'put',
    data: data
  })
}

// 删除示例分类
export function deleteDemo02Category(id) {
  return request({
    url: '/infra/demo02-category/delete?id=' + id,
    method: 'delete'
  })
}

// 批量删除示例分类
export function deleteDemo02CategoryList(ids) {
  return request({
    url: `/infra/demo02-category/delete-list?ids=${ids.join(',')}`,
    method: 'delete'
  })
}

// 获得示例分类
export function getDemo02Category(id) {
  return request({
    url: '/infra/demo02-category/get?id=' + id,
    method: 'get'
  })
}

// 获得示例分类列表
export function getDemo02CategoryList(params) {
  return request({
    url: '/infra/demo02-category/list',
    method: 'get',
    params
  })
}
// 导出示例分类 Excel
export function exportDemo02CategoryExcel(params) {
  return request({
    url: '/infra/demo02-category/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
