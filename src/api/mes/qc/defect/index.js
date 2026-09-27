import request from '@/utils/request'
// MES 缺陷类型 API
export const QcDefectApi = {
  // 查询缺陷类型分页
  getDefectPage: async(params) => {
    return await request({ method: 'get', url: `/mes/qc/defect/page`, params })
  },
  // 查询缺陷类型精简列表
  getDefectSimpleList: async() => {
    return await request({ method: 'get', url: `/mes/qc/defect/simple-list` })
  },
  // 查询缺陷类型详情
  getDefect: async(id) => {
    return await request({ method: 'get', url: `/mes/qc/defect/get?id=` + id })
  },
  // 新增缺陷类型
  createDefect: async(data) => {
    return await request({ method: 'post', url: `/mes/qc/defect/create`, data })
  },
  // 修改缺陷类型
  updateDefect: async(data) => {
    return await request({ method: 'put', url: `/mes/qc/defect/update`, data })
  },
  // 删除缺陷类型
  deleteDefect: async(id) => {
    return await request({ method: 'delete', url: `/mes/qc/defect/delete?id=` + id })
  },
  // 导出缺陷类型 Excel
  exportDefect: async(params) => {
    return await request({ method: 'get', responseType: 'blob', url: `/mes/qc/defect/export-excel`, params })
  }
}

