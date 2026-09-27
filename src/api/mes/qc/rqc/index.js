import request from '@/utils/request'
// MES 退货检验单 API
export const QcRqcApi = {
  // 查询退货检验单分页
  getRqcPage: async(params) => {
    return await request({ method: 'get', url: `/mes/qc/rqc/page`, params })
  },
  // 查询退货检验单详情
  getRqc: async(id) => {
    return await request({ method: 'get', url: `/mes/qc/rqc/get?id=` + id })
  },
  // 新增退货检验单
  createRqc: async(data) => {
    return await request({ method: 'post', url: `/mes/qc/rqc/create`, data })
  },
  // 修改退货检验单
  updateRqc: async(data) => {
    return await request({ method: 'put', url: `/mes/qc/rqc/update`, data })
  },
  // 完成退货检验单
  finishRqc: async(id) => {
    return await request({ method: 'put', url: `/mes/qc/rqc/finish?id=` + id })
  },
  // 删除退货检验单
  deleteRqc: async(id) => {
    return await request({ method: 'delete', url: `/mes/qc/rqc/delete?id=` + id })
  },
  // 导出退货检验单 Excel
  exportRqc: async(params) => {
    return await request({ method: 'get', responseType: 'blob', url: `/mes/qc/rqc/export-excel`, params })
  }
}

