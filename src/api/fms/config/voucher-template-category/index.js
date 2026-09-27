import request from '@/utils/request'

// FMS 凭证模板分类 API
export const FmsVoucherTemplateCategoryApi = {
  // 查询凭证模板分类列表
  getVoucherTemplateCategoryList(accountSetId) {
    return request({
      url: '/fms/config/voucher-template-category/list',
      method: 'get',
      params: { accountSetId }
    })
  },

  // 查询凭证模板分类精简列表
  getVoucherTemplateCategorySimpleList(accountSetId) {
    return request({
      url: '/fms/config/voucher-template-category/simple-list',
      method: 'get',
      params: { accountSetId }
    })
  },

  // 新增凭证模板分类
  createVoucherTemplateCategory(data) {
    return request({
      url: '/fms/config/voucher-template-category/create',
      method: 'post',
      data
    })
  },

  // 修改凭证模板分类
  updateVoucherTemplateCategory(data) {
    return request({
      url: '/fms/config/voucher-template-category/update',
      method: 'put',
      data
    })
  },

  // 删除凭证模板分类
  deleteVoucherTemplateCategory(accountSetId, id) {
    return request({
      url: '/fms/config/voucher-template-category/delete',
      method: 'delete',
      params: { accountSetId, id }
    })
  }
}
