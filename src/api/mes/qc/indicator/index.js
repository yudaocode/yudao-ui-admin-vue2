import request from '@/utils/request'
// MES 质检指标 API
export const QcIndicatorApi = {
  // 查询质检指标分页
  getIndicatorPage: async(params) => {
    return await request({ method: 'get', url: `/mes/qc/indicator/page`, params })
  },
  // 查询质检指标详情
  getIndicator: async(id) => {
    return await request({ method: 'get', url: `/mes/qc/indicator/get?id=` + id })
  },
  // 新增质检指标
  createIndicator: async(data) => {
    return await request({ method: 'post', url: `/mes/qc/indicator/create`, data })
  },
  // 修改质检指标
  updateIndicator: async(data) => {
    return await request({ method: 'put', url: `/mes/qc/indicator/update`, data })
  },
  // 删除质检指标
  deleteIndicator: async(id) => {
    return await request({ method: 'delete', url: `/mes/qc/indicator/delete?id=` + id })
  },
  // 导出质检指标 Excel
  exportIndicator: async(params) => {
    return await request({ method: 'get', responseType: 'blob', url: `/mes/qc/indicator/export-excel`, params })
  }
}

