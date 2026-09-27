import request from '@/utils/request'
// MES 待检任务 API
export const QcPendingInspectApi = {
  // 查询待检任务分页
  getPendingInspectPage: async(params) => {
    return await request({ method: 'get', url: '/mes/qc/pending-inspect/page', params })
  }
}

