import request from '@/utils/request'

// 查询用户分组分页
export function getGroupPage(params) {
  return request({
    url: '/member/group/page',
    method: 'get',
    params: params
  })
}

// 查询用户分组详情
export function getGroup(id) {
  return request({
    url: '/member/group/get?id=' + id,
    method: 'get'
  })
}

// 新增用户分组
export function createGroup(data) {
  return request({
    url: '/member/group/create',
    method: 'post',
    data: data
  })
}

// 查询用户分组精简列表
export function getSimpleGroupList() {
  return request({
    url: '/member/group/list-all-simple',
    method: 'get'
  })
}

// 修改用户分组
export function updateGroup(data) {
  return request({
    url: '/member/group/update',
    method: 'put',
    data: data
  })
}

// 删除用户分组
export function deleteGroup(id) {
  return request({
    url: '/member/group/delete?id=' + id,
    method: 'delete'
  })
}
