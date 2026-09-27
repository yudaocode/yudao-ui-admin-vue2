import request from '@/utils/request'
// MES 来料检验单行 API
export const QcIqcLineApi = {
  // 查询来料检验单行分页
  getIqcLinePage: async(params) => {
    return await request({ method: 'get', url: `/mes/qc/iqc/line/page`, params })
  },
  // 查询来料检验单行详情
  getIqcLine: async(id) => {
    return await request({ method: 'get', url: `/mes/qc/iqc/line/get?id=` + id })
  }
}

