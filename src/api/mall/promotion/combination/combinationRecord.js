import request from '@/utils/request'

// 查询拼团记录分页
export function getCombinationRecordPage(params) {
  return request({
    url: '/promotion/combination-record/page',
    method: 'get',
    params
  })
}

// 获得拼团记录的概要信息
export function getCombinationRecordSummary() {
  return request({
    url: '/promotion/combination-record/get-summary',
    method: 'get'
  })
}
