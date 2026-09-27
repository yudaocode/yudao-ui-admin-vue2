import request from '@/utils/request'

// 查询用户积分记录列表
export function getRecordPage(params) {
  return request({
    url: '/member/point/record/page',
    method: 'get',
    params
  })
}
