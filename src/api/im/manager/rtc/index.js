import request from '@/utils/request'

export function getManagerRtcCallPage(params) {
  return request({ url: '/im/manager/rtc/page', method: 'get', params })
}

export function getManagerRtcCallParticipantList(id) {
  return request({ url: '/im/manager/rtc/participant-list', method: 'get', params: { id }})
}
