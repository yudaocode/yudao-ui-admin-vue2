import request from '@/utils/request'

// 创建分销用户
export function createBrokerageUser(data) {
  return request({
    url: '/trade/brokerage-user/create',
    method: 'post',
    data
  })
}

// 查询分销用户列表
export function getBrokerageUserPage(params) {
  return request({
    url: '/trade/brokerage-user/page',
    method: 'get',
    params
  })
}

// 查询分销用户详情
export function getBrokerageUser(id) {
  return request({
    url: '/trade/brokerage-user/get?id=' + id,
    method: 'get'
  })
}

// 修改上级推广人
export function updateBindUser(data) {
  return request({
    url: '/trade/brokerage-user/update-bind-user',
    method: 'put',
    data
  })
}

// 清除上级推广人
export function clearBindUser(data) {
  return request({
    url: '/trade/brokerage-user/clear-bind-user',
    method: 'put',
    data
  })
}

// 修改推广资格
export function updateBrokerageEnabled(data) {
  return request({
    url: '/trade/brokerage-user/update-brokerage-enable',
    method: 'put',
    data
  })
}
