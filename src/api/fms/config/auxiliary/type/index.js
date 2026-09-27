import request from '@/utils/request'

// FMS 辅助核算类别 API
export const FmsAuxiliaryTypeApi = {
  // 查询辅助核算类别列表
  getAuxiliaryTypeList: async(accountSetId) => {
    return await request({
      url: '/fms/config/auxiliary-type/list',
      method: 'get',
      params: { accountSetId }
    })
  },

  // 查询辅助核算类别精简列表
  getAuxiliaryTypeSimpleList: async(accountSetId) => {
    return await request({
      url: '/fms/config/auxiliary-type/simple-list',
      method: 'get',
      params: { accountSetId }
    })
  },

  // 新增辅助核算类别
  createAuxiliaryType: async(data) => {
    return await request({ url: '/fms/config/auxiliary-type/create', method: 'post', data })
  },

  // 修改辅助核算类别
  updateAuxiliaryType: async(data) => {
    return await request({ url: '/fms/config/auxiliary-type/update', method: 'put', data })
  },

  // 删除辅助核算类别
  deleteAuxiliaryType: async(accountSetId, id) => {
    return await request({
      url: '/fms/config/auxiliary-type/delete',
      method: 'delete',
      params: { accountSetId, id }
    })
  }
}
