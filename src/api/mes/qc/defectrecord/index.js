import request from '@/utils/request'
// MES 质检缺陷记录 API
export const QcDefectRecordApi = {
  // 查询质检缺陷记录分页
  getDefectRecordPage: async(params) => {
    return await request({ method: 'get', url: `/mes/qc/defect-record/page`, params })
  },
  // 新增质检缺陷记录
  createDefectRecord: async(data) => {
    return await request({ method: 'post', url: `/mes/qc/defect-record/create`, data })
  },
  // 修改质检缺陷记录
  updateDefectRecord: async(data) => {
    return await request({ method: 'put', url: `/mes/qc/defect-record/update`, data })
  },
  // 删除质检缺陷记录
  deleteDefectRecord: async(id) => {
    return await request({ method: 'delete', url: `/mes/qc/defect-record/delete?id=` + id })
  }
}

