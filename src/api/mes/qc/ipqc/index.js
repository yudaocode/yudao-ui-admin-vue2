import request from '@/utils/request'
// MES 过程检验单 API
export const QcIpqcApi = {
  // 查询过程检验单分页
  getIpqcPage: async(params) => {
    return await request({ method: 'get', url: `/mes/qc/ipqc/page`, params })
  },
  // 查询过程检验单详情
  getIpqc: async(id) => {
    return await request({ method: 'get', url: `/mes/qc/ipqc/get?id=` + id })
  },
  // 新增过程检验单
  createIpqc: async(data) => {
    return await request({ method: 'post', url: `/mes/qc/ipqc/create`, data })
  },
  // 修改过程检验单
  updateIpqc: async(data) => {
    return await request({ method: 'put', url: `/mes/qc/ipqc/update`, data })
  },
  // 完成过程检验单
  finishIpqc: async(id) => {
    return await request({ method: 'put', url: `/mes/qc/ipqc/finish?id=` + id })
  },
  // 删除过程检验单
  deleteIpqc: async(id) => {
    return await request({ method: 'delete', url: `/mes/qc/ipqc/delete?id=` + id })
  },
  // 导出过程检验单 Excel
  exportIpqc: async(params) => {
    return await request({ method: 'get', responseType: 'blob', url: `/mes/qc/ipqc/export-excel`, params })
  }
}

