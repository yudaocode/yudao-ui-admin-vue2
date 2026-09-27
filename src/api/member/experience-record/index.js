import request from '@/utils/request'

// 查询会员经验记录分页
export function getExperienceRecordPage(params) {
  return request({
    url: '/member/experience-record/page',
    method: 'get',
    params: params
  })
}

// 查询会员经验记录详情
export function getExperienceRecord(id) {
  return request({
    url: '/member/experience-record/get?id=' + id,
    method: 'get'
  })
}
