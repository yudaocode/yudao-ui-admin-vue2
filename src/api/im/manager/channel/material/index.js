import request from '@/utils/request'

export function getManagerChannelMaterialPage(params) {
  return request({ url: '/im/manager/channel-material/page', method: 'get', params })
}

export function getSimpleManagerChannelMaterialList(channelId) {
  return request({
    url: '/im/manager/channel-material/simple-list',
    method: 'get',
    params: { channelId }
  })
}

export function getManagerChannelMaterial(id) {
  return request({ url: '/im/manager/channel-material/get', method: 'get', params: { id }})
}

export function createManagerChannelMaterial(data) {
  return request({ url: '/im/manager/channel-material/create', method: 'post', data })
}

export function updateManagerChannelMaterial(data) {
  return request({ url: '/im/manager/channel-material/update', method: 'put', data })
}

export function deleteManagerChannelMaterial(id) {
  return request({ url: '/im/manager/channel-material/delete', method: 'delete', params: { id }})
}
