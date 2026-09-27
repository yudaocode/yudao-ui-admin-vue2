import request from '@/utils/request'
// MES 来料检验单 API
export const QcIqcApi = {
  // 查询来料检验单分页
  getIqcPage: async(params) => {
    return await request({ method: 'get', url: `/mes/qc/iqc/page`, params })
  },
  // 查询来料检验单详情
  getIqc: async(id) => {
    return await request({ method: 'get', url: `/mes/qc/iqc/get?id=` + id })
  },
  // 新增来料检验单
  createIqc: async(data) => {
    return await request({ method: 'post', url: `/mes/qc/iqc/create`, data })
  },
  // 修改来料检验单
  updateIqc: async(data) => {
    return await request({ method: 'put', url: `/mes/qc/iqc/update`, data })
  },
  // 完成来料检验单
  finishIqc: async(id) => {
    return await request({ method: 'put', url: `/mes/qc/iqc/finish?id=` + id })
  },
  // 删除来料检验单
  deleteIqc: async(id) => {
    return await request({ method: 'delete', url: `/mes/qc/iqc/delete?id=` + id })
  },
  // 导出来料检验单 Excel
  exportIqc: async(params) => {
    return await request({ method: 'get', responseType: 'blob', url: `/mes/qc/iqc/export-excel`, params })
  }
}

