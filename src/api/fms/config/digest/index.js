import request from '@/utils/request'

// FMS 常用摘要 API
export const FmsDigestApi = {
  // 查询常用摘要列表
  getDigestList(accountSetId) {
    return request({
      url: '/fms/config/digest/list',
      method: 'get',
      params: { accountSetId }
    })
  },

  // 查询常用摘要精简列表
  getDigestSimpleList(accountSetId) {
    return request({
      url: '/fms/config/digest/simple-list',
      method: 'get',
      params: { accountSetId }
    })
  },

  // 新增常用摘要
  createDigest(data) {
    return request({ url: '/fms/config/digest/create', method: 'post', data })
  },

  // 修改常用摘要
  updateDigest(data) {
    return request({ url: '/fms/config/digest/update', method: 'put', data })
  },

  // 删除常用摘要
  deleteDigest(accountSetId, id) {
    return request({
      url: '/fms/config/digest/delete',
      method: 'delete',
      params: { accountSetId, id }
    })
  }
}
