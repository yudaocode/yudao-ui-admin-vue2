import request from '@/utils/request'

function send(method, config) {
  return request({
    ...config,
    method
  })
}

export default {
  get(config) {
    return send('get', config)
  },
  post(config) {
    return send('post', config)
  },
  put(config) {
    return send('put', config)
  },
  delete(config) {
    return send('delete', config)
  },
  download(config) {
    return request({
      ...config,
      method: 'get',
      responseType: 'blob'
    })
  }
}
