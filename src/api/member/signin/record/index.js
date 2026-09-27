import request from '@/utils/request'

// 查询用户签到积分列表
export function getSignInRecordPage(params) {
  return request({
    url: '/member/sign-in/record/page',
    method: 'get',
    params
  })
}
