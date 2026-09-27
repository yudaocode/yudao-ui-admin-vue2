import request from '@/utils/request'

// FMS 凭证模板 API
export const FmsVoucherTemplateApi = {
  // 查询凭证模板列表
  getVoucherTemplateList(accountSetId) {
    return request({
      url: '/fms/config/voucher-template/list',
      method: 'get',
      params: { accountSetId }
    })
  },

  // 查询凭证模板精简列表
  getVoucherTemplateSimpleList(accountSetId) {
    return request({
      url: '/fms/config/voucher-template/simple-list',
      method: 'get',
      params: { accountSetId }
    })
  },

  // 新增凭证模板
  createVoucherTemplate(data) {
    return request({
      url: '/fms/config/voucher-template/create',
      method: 'post',
      data
    })
  },

  // 修改凭证模板
  updateVoucherTemplate(data) {
    return request({
      url: '/fms/config/voucher-template/update',
      method: 'put',
      data
    })
  },

  // 删除凭证模板
  deleteVoucherTemplate(accountSetId, id) {
    return request({
      url: '/fms/config/voucher-template/delete',
      method: 'delete',
      params: { accountSetId, id }
    })
  }
}
