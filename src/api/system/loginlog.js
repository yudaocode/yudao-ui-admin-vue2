import request from '@/utils/request'

// 查询登录日志列表
export function getLoginLogPage(query) {
  return request({
    url: '/system/login-log/page',
    method: 'get',
    params: query
  })
}

// 导出登录日志
export function exportLoginLog(query) {
  return request({
    url: '/system/login-log/export-excel',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
