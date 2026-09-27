import request from '@/utils/request'

// 查询砍价助力分页
export function getBargainHelpPage(params) {
  return request({
    url: '/promotion/bargain-help/page',
    method: 'get',
    params
  })
}
