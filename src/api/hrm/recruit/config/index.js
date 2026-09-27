import request from '@/utils/request'

// 保存招聘淘汰原因
export function saveRecruitEliminateReason(reasons) {
  return request({
    url: '/hrm/recruit/config/eliminate-reason/save',
    method: 'post',
    data: { reasons }
  })
}

// 查询招聘淘汰原因列表
export function getRecruitEliminateReasonList() {
  return request({ url: '/hrm/recruit/config/eliminate-reason/list', method: 'get' })
}
