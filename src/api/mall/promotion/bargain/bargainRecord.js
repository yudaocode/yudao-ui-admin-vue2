import request from '@/utils/request'

// 查询砍价记录分页
export function getBargainRecordPage(params) {
  return request({
    url: '/promotion/bargain-record/page',
    method: 'get',
    params
  })
}
