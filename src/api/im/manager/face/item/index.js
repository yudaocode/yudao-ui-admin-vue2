import request from '@/utils/request'

export function getManagerFacePackItemPage(params) {
  return request({ url: '/im/manager/face-pack-item/page', method: 'get', params })
}

export function getManagerFacePackItem(id) {
  return request({ url: '/im/manager/face-pack-item/get', method: 'get', params: { id }})
}

export function createManagerFacePackItem(data) {
  return request({ url: '/im/manager/face-pack-item/create', method: 'post', data })
}

export function updateManagerFacePackItem(data) {
  return request({ url: '/im/manager/face-pack-item/update', method: 'put', data })
}

export function deleteManagerFacePackItem(id) {
  return request({ url: '/im/manager/face-pack-item/delete', method: 'delete', params: { id }})
}

export function deleteManagerFacePackItemList(ids) {
  return request({
    url: '/im/manager/face-pack-item/delete-list',
    method: 'delete',
    params: { ids: ids.join(',') }
  })
}
