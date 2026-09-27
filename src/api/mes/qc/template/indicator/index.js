import request from '@/utils/request'
// MES 质检方案-检测指标项 API
export const QcTemplateIndicatorApi = {
  // 查询检测指标项分页
  getTemplateIndicatorPage: async(params) => {
    return await request({ method: 'get', url: `/mes/qc/template/indicator/page`, params })
  },
  // 查询检测指标项详情
  getTemplateIndicator: async(id) => {
    return await request({ method: 'get', url: `/mes/qc/template/indicator/get?id=` + id })
  },
  // 新增检测指标项
  createTemplateIndicator: async(data) => {
    return await request({ method: 'post', url: `/mes/qc/template/indicator/create`, data })
  },
  // 修改检测指标项
  updateTemplateIndicator: async(data) => {
    return await request({ method: 'put', url: `/mes/qc/template/indicator/update`, data })
  },
  // 删除检测指标项
  deleteTemplateIndicator: async(id) => {
    return await request({ method: 'delete', url: `/mes/qc/template/indicator/delete?id=` + id })
  }
}

