import request from '@/utils/request'

// 收藏文件
export function createFileFavorite(nodeId) {
  return request({ url: '/oa/file-favorite/create', method: 'post', params: { nodeId } })
}

// 取消收藏
export function deleteFileFavorite(nodeId) {
  return request({ url: '/oa/file-favorite/delete', method: 'delete', params: { nodeId } })
}
