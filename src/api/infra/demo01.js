import request from '@/utils/request'

// 创建示例联系人
export function createDemo01Contact(data) {
  return request({
    url: '/infra/demo01-contact/create',
    method: 'post',
    data: data
  })
}

// 更新示例联系人
export function updateDemo01Contact(data) {
  return request({
    url: '/infra/demo01-contact/update',
    method: 'put',
    data: data
  })
}

// 删除示例联系人
export function deleteDemo01Contact(id) {
  return request({
    url: '/infra/demo01-contact/delete?id=' + id,
    method: 'delete'
  })
}

// 获得示例联系人
export function getDemo01Contact(id) {
  return request({
    url: '/infra/demo01-contact/get?id=' + id,
    method: 'get'
  })
}

// 获得示例联系人分页
export function getDemo01ContactPage(params) {
  return request({
    url: '/infra/demo01-contact/page',
    method: 'get',
    params
  })
}
// 导出示例联系人 Excel
export function exportDemo01ContactExcel(params) {
  return request({
    url: '/infra/demo01-contact/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
