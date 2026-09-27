import request from '@/utils/request'
// 生成 SN 码
export const generateSnCodes = async(data) => {
  return await request({ method: 'post', url: `/mes/wm/sn/generate`, data })
}
// 获得 SN 码分组分页
export const getSnGroupPage = async(params) => {
  return await request({ method: 'get', url: `/mes/wm/sn/group-page`, params })
}
// 获得批次 SN 码明细列表
export const getSnListByUuid = async(uuid) => {
  return await request({ method: 'get', url: `/mes/wm/sn/list-by-uuid`, params: { uuid }})
}
// 批量删除 SN 码（按批次 UUID）
export const deleteSnBatch = async(uuid) => {
  return await request({ method: 'delete', url: `/mes/wm/sn/delete-batch`, params: { uuid }})
}
// 导出 SN 码分组 Excel
export const exportSnGroupExcel = async(params) => {
  return await request({ method: 'get', responseType: 'blob', url: `/mes/wm/sn/group-export-excel`, params })
}
// 导出批次 SN 码明细 Excel
export const exportSnDetailExcel = async(uuid) => {
  return await request({ method: 'get', responseType: 'blob', url: `/mes/wm/sn/export-excel`, params: { uuid }})
}

