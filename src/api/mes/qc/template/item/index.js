import request from '@/utils/request'
// MES 质检方案-产品关联 API
export const QcTemplateItemApi = {
  // 查询产品关联分页
  getTemplateItemPage: async(params) => {
    return await request({ method: 'get', url: `/mes/qc/template/item/page`, params })
  },
  // 查询产品关联详情
  getTemplateItem: async(id) => {
    return await request({ method: 'get', url: `/mes/qc/template/item/get?id=` + id })
  },
  // 新增产品关联
  createTemplateItem: async(data) => {
    return await request({ method: 'post', url: `/mes/qc/template/item/create`, data })
  },
  // 修改产品关联
  updateTemplateItem: async(data) => {
    return await request({ method: 'put', url: `/mes/qc/template/item/update`, data })
  },
  // 删除产品关联
  deleteTemplateItem: async(id) => {
    return await request({ method: 'delete', url: `/mes/qc/template/item/delete?id=` + id })
  }
}

