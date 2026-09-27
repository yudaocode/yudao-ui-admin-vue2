import request from '@/utils/request'

// 查询招聘职位分页
export function getRecruitPostPage(params) {
  return request({ url: '/hrm/recruit/post/page', method: 'get', params })
}

// 查询招聘职位详情
export function getRecruitPost(id) {
  return request({ url: '/hrm/recruit/post/get?id=' + id, method: 'get' })
}

// 获得招聘职位精简列表
export function getRecruitPostSimpleList() {
  return request({ url: '/hrm/recruit/post/simple-list', method: 'get' })
}

// 获得招聘职位状态统计
export function getRecruitPostStatusCount(params) {
  return request({ url: '/hrm/recruit/post/status-count', method: 'get', params })
}

// 新增招聘职位
export function createRecruitPost(data) {
  return request({ url: '/hrm/recruit/post/create', method: 'post', data })
}

// 修改招聘职位
export function updateRecruitPost(data) {
  return request({ url: '/hrm/recruit/post/update', method: 'put', data })
}

// 修改招聘职位状态
export function updateRecruitPostStatus(data) {
  return request({ url: '/hrm/recruit/post/update-status', method: 'put', data })
}
