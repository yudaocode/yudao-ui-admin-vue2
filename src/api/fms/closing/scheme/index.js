import request from '@/utils/request'

// FMS 结账方案 API
export const FmsClosingSchemeApi = {
  // 查询结账方案列表
  getClosingSchemeList(params) {
    return request({
      url: '/fms/closing/scheme/list',
      method: 'get',
      params
    })
  },

  // 新增结账方案
  createClosingScheme(data) {
    return request({
      url: '/fms/closing/scheme/create',
      method: 'post',
      data
    })
  },

  // 修改结账方案
  updateClosingScheme(data) {
    return request({
      url: '/fms/closing/scheme/update',
      method: 'put',
      data
    })
  },

  // 保存结转损益设置
  saveProfitLossSettings(data) {
    return request({
      url: '/fms/closing/scheme/update-profit-loss-settings',
      method: 'put',
      data
    })
  },

  // 保存专用结转设置
  updateSpecialClosingSettings(data) {
    return request({
      url: '/fms/closing/scheme/update-special-settings',
      method: 'put',
      data
    })
  },

  // 删除结账方案
  deleteClosingScheme(accountSetId, id) {
    return request({
      url: '/fms/closing/scheme/delete',
      method: 'delete',
      params: { accountSetId, id }
    })
  }
}
