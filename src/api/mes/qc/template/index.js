import request from '@/utils/request'
// MES 质检方案 API
export const QcTemplateApi = {
  // 查询质检方案分页
  getTemplatePage: async(params) => {
    return await request({ method: 'get', url: `/mes/qc/template/page`, params })
  },
  // 查询质检方案详情
  getTemplate: async(id) => {
    return await request({ method: 'get', url: `/mes/qc/template/get?id=` + id })
  },
  // 新增质检方案
  createTemplate: async(data) => {
    return await request({ method: 'post', url: `/mes/qc/template/create`, data })
  },
  // 修改质检方案
  updateTemplate: async(data) => {
    return await request({ method: 'put', url: `/mes/qc/template/update`, data })
  },
  // 删除质检方案
  deleteTemplate: async(id) => {
    return await request({ method: 'delete', url: `/mes/qc/template/delete?id=` + id })
  },
  // 导出质检方案 Excel
  exportTemplate: async(params) => {
    return await request({ method: 'get', responseType: 'blob', url: `/mes/qc/template/export-excel`, params })
  }
}

