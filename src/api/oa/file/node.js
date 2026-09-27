import request from '@/utils/request'

// 查询本人云盘概览
export function getFileStorage() {
  return request({ url: '/oa/file-node/get-storage', method: 'get' })
}

// 查询文件分页
export function getFileNodePage(params) {
  return request({ url: '/oa/file-node/page', method: 'get', params })
}

// 查询本人可用目录
export function getFileDirectoryList() {
  return request({ url: '/oa/file-node/directory-list', method: 'get' })
}

// 新增文件或目录
export function createFileNode(data) {
  return request({ url: '/oa/file-node/create', method: 'post', data })
}

// 重命名节点
export function updateFileNodeName(id, name) {
  return request({ url: '/oa/file-node/update-name', method: 'put', data: { id, name } })
}

// 复制文件或整目录
export function copyFileNode(id, parentId) {
  return request({ url: '/oa/file-node/copy', method: 'post', data: { id, parentId } })
}

// 移动节点
export function updateFileNodeParent(id, parentId) {
  return request({ url: '/oa/file-node/update-parent', method: 'put', data: { id, parentId } })
}

// 移入回收站
export function recycleFileNode(id) {
  return request({ url: '/oa/file-node/recycle', method: 'put', params: { id } })
}

// 恢复节点
export function restoreFileNode(id) {
  return request({ url: '/oa/file-node/restore', method: 'put', params: { id } })
}

// 彻底删除业务节点
export function deleteFileNode(id) {
  return request({ url: '/oa/file-node/delete', method: 'delete', params: { id } })
}

// 查询文件详情
export function getFileNode(id) {
  return request({ url: '/oa/file-node/get', method: 'get', params: { id } })
}
