import request from '@/utils/request'

export function getManagerFaceUserItemPage(params) {
  return request({ url: '/im/manager/face-user-item/page', method: 'get', params })
}

export function deleteManagerFaceUserItem(id) {
  return request({ url: '/im/manager/face-user-item/delete', method: 'delete', params: { id }})
}
