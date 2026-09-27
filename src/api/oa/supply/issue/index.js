import request from '@/utils/request'

// 查询领用发放分页
export function getSupplyApplyItemPage(params) {
  return request({ url: '/oa/supply-issue/page', method: 'get', params })
}

// 发放用品
export function issueSupplyApplyItem(data) {
  return request({ url: '/oa/supply-issue/issue', method: 'put', data })
}

// 确认归还用品
export function returnSupplyApplyItem(id, quantity, returnRemark) {
  return request({ url: '/oa/supply-issue/return', method: 'put', data: { id, quantity, returnRemark } })
}
