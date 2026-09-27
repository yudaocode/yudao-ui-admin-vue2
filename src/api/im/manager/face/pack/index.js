import request from '@/utils/request'

export function getManagerFacePackPage(params) {
  return request({ url: '/im/manager/face-pack/page', method: 'get', params })
}

export function getManagerFacePack(id) {
  return request({ url: '/im/manager/face-pack/get', method: 'get', params: { id }})
}

export function createManagerFacePack(data) {
  return request({ url: '/im/manager/face-pack/create', method: 'post', data })
}

export function updateManagerFacePack(data) {
  return request({ url: '/im/manager/face-pack/update', method: 'put', data })
}

export function deleteManagerFacePack(id) {
  return request({ url: '/im/manager/face-pack/delete', method: 'delete', params: { id }})
}

export function deleteManagerFacePackList(ids) {
  return request({
    url: '/im/manager/face-pack/delete-list',
    method: 'delete',
    params: { ids: ids.join(',') }
  })
}
