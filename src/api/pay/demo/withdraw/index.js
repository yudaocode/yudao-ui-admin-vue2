import request from '@/utils/request'

// 查询示例提现单列表
export function getDemoWithdrawPage(params) {
  return request({
    url: '/pay/demo-withdraw/page',
    method: 'get',
    params
  })
}

// 创建示例提现单
export function createDemoWithdraw(data) {
  return request({
    url: '/pay/demo-withdraw/create',
    method: 'post',
    data
  })
}

// 发起提现单转账
export function transferDemoWithdraw(id) {
  return request({
    url: '/pay/demo-withdraw/transfer',
    method: 'post',
    params: { id }
  })
}
