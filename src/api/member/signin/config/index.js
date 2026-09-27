import request from '@/utils/request'

// 查询积分签到规则列表
export function getSignInConfigList() {
  return request({
    url: '/member/sign-in/config/list',
    method: 'get'
  })
}

// 查询积分签到规则详情
export function getSignInConfig(id) {
  return request({
    url: '/member/sign-in/config/get?id=' + id,
    method: 'get'
  })
}

// 新增积分签到规则
export function createSignInConfig(data) {
  return request({
    url: '/member/sign-in/config/create',
    method: 'post',
    data: data
  })
}

// 修改积分签到规则
export function updateSignInConfig(data) {
  return request({
    url: '/member/sign-in/config/update',
    method: 'put',
    data: data
  })
}

// 删除积分签到规则
export function deleteSignInConfig(id) {
  return request({
    url: '/member/sign-in/config/delete?id=' + id,
    method: 'delete'
  })
}
