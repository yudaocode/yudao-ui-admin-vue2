import request from '@/utils/request'

export function getRecruitCandidatePage(params) {
  return request({ url: '/hrm/recruit/candidate/page', method: 'get', params })
}

export function getRecruitCandidate(id) {
  return request({ url: '/hrm/recruit/candidate/get?id=' + id, method: 'get' })
}

export function getRecruitCandidateStatusCount(params) {
  return request({ url: '/hrm/recruit/candidate/status-count', method: 'get', params })
}

export function getCleanRecruitCandidateIdList(statuses, days) {
  return request({ url: '/hrm/recruit/candidate/clean-ids', method: 'get', params: { statuses, days }})
}

export function createRecruitCandidate(data) {
  return request({ url: '/hrm/recruit/candidate/create', method: 'post', data })
}

export function updateRecruitCandidate(data) {
  return request({ url: '/hrm/recruit/candidate/update', method: 'put', data })
}

export function updateRecruitCandidateStatus(data) {
  return request({ url: '/hrm/recruit/candidate/update-status', method: 'put', data })
}

export function updateRecruitCandidatePost(data) {
  return request({ url: '/hrm/recruit/candidate/update-post', method: 'put', data })
}

export function updateRecruitCandidateChannel(data) {
  return request({ url: '/hrm/recruit/candidate/update-channel', method: 'put', data })
}

export function eliminateRecruitCandidate(data) {
  return request({ url: '/hrm/recruit/candidate/eliminate', method: 'put', data })
}

export function convertRecruitCandidateToEmployee(data) {
  return request({ url: '/hrm/recruit/candidate/convert-employee', method: 'post', data })
}

export function deleteRecruitCandidate(id) {
  return request({ url: '/hrm/recruit/candidate/delete?id=' + id, method: 'delete' })
}
