import request from '@/utils/request'
// MES 检验结果 API
export const QcIndicatorResultApi = {
  // 查询检验结果分页
  getResultPage: async(params) => {
    return await request({ method: 'get', url: `/mes/qc/indicator-result/page`, params })
  },
  // 查询检验结果明细（含检测项模板）：编辑传 id，新增不传
  getDetail: async(qcId, qcType, id) => {
    return await request({ method: 'get',
      url: `/mes/qc/indicator-result/get-detail`,
      params: { id, qcId, qcType }
    })
  },
  // 新增检验结果
  createResult: async(data) => {
    return await request({ method: 'post', url: `/mes/qc/indicator-result/create`, data })
  },
  // 修改检验结果
  updateResult: async(data) => {
    return await request({ method: 'put', url: `/mes/qc/indicator-result/update`, data })
  },
  // 删除检验结果
  deleteResult: async(id) => {
    return await request({ method: 'delete', url: `/mes/qc/indicator-result/delete?id=` + id })
  }
}

