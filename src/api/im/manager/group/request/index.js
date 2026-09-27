import request from '@/utils/request'

export function getManagerGroupRequestPage(params) {
  return request({ url: '/im/manager/group-request/page', method: 'get', params })
}
