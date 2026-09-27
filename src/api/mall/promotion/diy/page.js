import request from '@/utils/request'

// 查询装修页面分页
export function getDiyPagePage(params) {
  return request({
    url: '/promotion/diy-page/page',
    method: 'get',
    params
  })
}

// 查询装修页面详情
export function getDiyPage(id) {
  return request({
    url: '/promotion/diy-page/get?id=' + id,
    method: 'get'
  })
}

// 新增装修页面
export function createDiyPage(data) {
  return request({
    url: '/promotion/diy-page/create',
    method: 'post',
    data
  })
}

// 修改装修页面
export function updateDiyPage(data) {
  return request({
    url: '/promotion/diy-page/update',
    method: 'put',
    data
  })
}

// 删除装修页面
export function deleteDiyPage(id) {
  return request({
    url: '/promotion/diy-page/delete?id=' + id,
    method: 'delete'
  })
}

// 获得装修页面属性
export function getDiyPageProperty(id) {
  return request({
    url: '/promotion/diy-page/get-property?id=' + id,
    method: 'get'
  })
}

// 更新装修页面属性
export function updateDiyPageProperty(data) {
  return request({
    url: '/promotion/diy-page/update-property',
    method: 'put',
    data
  })
}
