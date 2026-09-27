import request from '@/utils/request'

// 查询共享权限
export function getFilePermissionList(nodeId) {
  return request({ url: '/oa/file-permission/list', method: 'get', params: { nodeId } })
}

// 保存共享权限
export function saveFilePermission(data) {
  return request({ url: '/oa/file-permission/save', method: 'post', data })
}

// 取消共享权限
export function deleteFilePermission(id) {
  return request({ url: '/oa/file-permission/delete', method: 'delete', params: { id } })
}
