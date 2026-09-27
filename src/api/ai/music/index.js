import request from '@/utils/request'

export const MusicApi = {
  getMusicPage(params) {
    return request({ url: '/ai/music/page', method: 'get', params })
  },
  updateMusic(data) {
    return request({ url: '/ai/music/update', method: 'put', data })
  },
  deleteMusic(id) {
    return request({ url: '/ai/music/delete?id=' + id, method: 'delete' })
  }
}
