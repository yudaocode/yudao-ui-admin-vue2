import request from '@/utils/request'
// MES 退货检验单行 API
export const QcRqcLineApi = {
  // 查询退货检验单行分页
  getRqcLinePage: async(params) => {
    return await request({ method: 'get', url: `/mes/qc/rqc/line/page`, params })
  },
  // 查询退货检验单行详情
  getRqcLine: async(id) => {
    return await request({ method: 'get', url: `/mes/qc/rqc/line/get?id=` + id })
  }
}

