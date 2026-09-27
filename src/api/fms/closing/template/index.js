import request from '@/utils/request'

// FMS 结账模板 API
export const FmsClosingTemplateApi = {
  // 查询结账模板列表
  getClosingTemplateList(accountSetId) {
    return request({
      url: '/fms/closing/template/list',
      method: 'get',
      params: { accountSetId }
    })
  },

  // 新增结账模板
  createClosingTemplate(data) {
    return request({
      url: '/fms/closing/template/create',
      method: 'post',
      data
    })
  },

  // 修改结账模板
  updateClosingTemplate(data) {
    return request({
      url: '/fms/closing/template/update',
      method: 'put',
      data
    })
  },

  // 删除结账模板
  deleteClosingTemplate(accountSetId, id) {
    return request({
      url: '/fms/closing/template/delete',
      method: 'delete',
      params: { accountSetId, id }
    })
  }
}
