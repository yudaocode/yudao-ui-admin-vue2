import request from '@/utils/request'

export function getOperateLogPage(params) {
  return request({
    url: '/crm/operate-log/page',
    method: 'get',
    params
  })
}
