import request from '@/utils/request'

// 查询佣金记录列表
export function getBrokerageRecordPage(params) {
  return request({
    url: '/trade/brokerage-record/page',
    method: 'get',
    params
  })
}

// 查询佣金记录详情
export function getBrokerageRecord(id) {
  return request({
    url: '/trade/brokerage-record/get?id=' + id,
    method: 'get'
  })
}
