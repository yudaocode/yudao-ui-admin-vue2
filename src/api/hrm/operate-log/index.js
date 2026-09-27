import request from '@/utils/request'

export function getOperateLogPage(params) {
  return request({ url: '/hrm/operate-log/page', method: 'get', params })
}
