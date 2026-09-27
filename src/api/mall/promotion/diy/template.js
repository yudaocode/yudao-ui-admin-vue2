import request from '@/utils/request'

// 查询装修模板分页
export function getDiyTemplatePage(params) {
  return request({
    url: '/promotion/diy-template/page',
    method: 'get',
    params
  })
}

// 查询装修模板详情
export function getDiyTemplate(id) {
  return request({
    url: '/promotion/diy-template/get?id=' + id,
    method: 'get'
  })
}

// 新增装修模板
export function createDiyTemplate(data) {
  return request({
    url: '/promotion/diy-template/create',
    method: 'post',
    data
  })
}

// 修改装修模板
export function updateDiyTemplate(data) {
  return request({
    url: '/promotion/diy-template/update',
    method: 'put',
    data
  })
}

// 删除装修模板
export function deleteDiyTemplate(id) {
  return request({
    url: '/promotion/diy-template/delete?id=' + id,
    method: 'delete'
  })
}

// 使用装修模板
export function useDiyTemplate(id) {
  return request({
    url: '/promotion/diy-template/use?id=' + id,
    method: 'put'
  })
}

// 获得装修模板属性
export function getDiyTemplateProperty(id) {
  return request({
    url: '/promotion/diy-template/get-property?id=' + id,
    method: 'get'
  })
}

// 更新装修模板属性
export function updateDiyTemplateProperty(data) {
  return request({
    url: '/promotion/diy-template/update-property',
    method: 'put',
    data
  })
}
