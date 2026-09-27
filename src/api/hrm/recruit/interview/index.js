import request from '@/utils/request'

// 查询招聘面试详情
export function getRecruitInterview(id) {
  return request({ url: '/hrm/recruit/interview/get?id=' + id, method: 'get' })
}

// 查询候选人的招聘面试列表
export function getRecruitInterviewListByCandidate(candidateId) {
  return request({
    url: '/hrm/recruit/interview/list-by-candidate?candidateId=' + candidateId,
    method: 'get'
  })
}

// 新增招聘面试
export function createRecruitInterview(data) {
  return request({ url: '/hrm/recruit/interview/create', method: 'post', data })
}

// 修改招聘面试
export function updateRecruitInterview(data) {
  return request({ url: '/hrm/recruit/interview/update', method: 'put', data })
}

// 修改招聘面试结果
export function updateRecruitInterviewResult(data) {
  return request({ url: '/hrm/recruit/interview/update-result', method: 'put', data })
}

// 删除招聘面试
export function deleteRecruitInterview(id) {
  return request({ url: '/hrm/recruit/interview/delete?id=' + id, method: 'delete' })
}
