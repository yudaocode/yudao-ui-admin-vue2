import request from '@/utils/request'

export function getRecruitChannelPage(params) {
  return request({ url: '/hrm/recruit/channel/page', method: 'get', params })
}

export function getRecruitChannel(id) {
  return request({ url: '/hrm/recruit/channel/get?id=' + id, method: 'get' })
}

export function getRecruitChannelSimpleList() {
  return request({ url: '/hrm/recruit/channel/simple-list', method: 'get' })
}

export function createRecruitChannel(data) {
  return request({ url: '/hrm/recruit/channel/create', method: 'post', data })
}

export function updateRecruitChannel(data) {
  return request({ url: '/hrm/recruit/channel/update', method: 'put', data })
}

export function updateRecruitChannelStatus(data) {
  return request({ url: '/hrm/recruit/channel/update-status', method: 'put', data })
}

export function deleteRecruitChannel(data) {
  return request({ url: '/hrm/recruit/channel/delete', method: 'delete', data })
}
