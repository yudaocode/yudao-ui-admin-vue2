import request from '@/utils/request'

// 查询联系人分类列表
export function getContactCategoryList() {
  return request({ url: '/oa/contact-category/list', method: 'get' })
}

// 查询联系人分类详情
export function getContactCategory(id) {
  return request({ url: '/oa/contact-category/get', method: 'get', params: { id } })
}

// 查询分类精简列表
export function getSimpleContactCategoryList() {
  return request({ url: '/oa/contact-category/simple-list', method: 'get' })
}

// 新增联系人分类
export function createContactCategory(data) {
  return request({ url: '/oa/contact-category/create', method: 'post', data })
}

// 修改联系人分类
export function updateContactCategory(data) {
  return request({ url: '/oa/contact-category/update', method: 'put', data })
}

// 删除联系人分类
export function deleteContactCategory(id) {
  return request({ url: '/oa/contact-category/delete', method: 'delete', params: { id } })
}
