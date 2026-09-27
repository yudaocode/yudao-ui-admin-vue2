import request from '@/utils/request'

// 查询佣金提现列表
export function getBrokerageWithdrawPage(params) {
  return request({
    url: '/trade/brokerage-withdraw/page',
    method: 'get',
    params
  })
}

// 查询佣金提现详情
export function getBrokerageWithdraw(id) {
  return request({
    url: '/trade/brokerage-withdraw/get?id=' + id,
    method: 'get'
  })
}

// 佣金提现 - 通过申请或失败后重新转账
export function approveBrokerageWithdraw(id) {
  return request({
    url: '/trade/brokerage-withdraw/approve?id=' + id,
    method: 'put'
  })
}

// 审核佣金提现 - 驳回申请
export function rejectBrokerageWithdraw(data) {
  return request({
    url: '/trade/brokerage-withdraw/reject',
    method: 'put',
    data
  })
}
