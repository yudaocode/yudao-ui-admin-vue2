import request from '@/utils/request'

// FMS 辅助核算项目 API
export const FmsAuxiliaryItemApi = {
  // 查询辅助核算项目分页
  getAuxiliaryItemPage(params) {
    return request({ url: '/fms/config/auxiliary-item/page', method: 'get', params })
  },

  // 查询辅助核算项目精简列表
  getAuxiliaryItemSimpleList(accountSetId, auxiliaryTypeId) {
    return request({
      url: '/fms/config/auxiliary-item/simple-list',
      method: 'get',
      params: { accountSetId, auxiliaryTypeId }
    })
  },

  // 新增辅助核算项目
  createAuxiliaryItem(data) {
    return request({ url: '/fms/config/auxiliary-item/create', method: 'post', data })
  },

  // 修改辅助核算项目
  updateAuxiliaryItem(data) {
    return request({ url: '/fms/config/auxiliary-item/update', method: 'put', data })
  },

  // 批量删除辅助核算项目
  deleteAuxiliaryItemList(accountSetId, ids) {
    return request({
      url: '/fms/config/auxiliary-item/delete-list',
      method: 'delete',
      params: { accountSetId, ids: ids.join(',') }
    })
  },

  // 修改辅助核算项目状态
  updateAuxiliaryItemStatus(accountSetId, id, status) {
    return request({
      url: '/fms/config/auxiliary-item/update-status',
      method: 'put',
      data: { accountSetId, id, status }
    })
  },

  // 导出辅助核算项目 Excel
  exportAuxiliaryItem(params) {
    return request({
      url: '/fms/config/auxiliary-item/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    })
  },

  // 下载辅助核算项目导入模板
  getAuxiliaryItemImportTemplate(type) {
    return request({
      url: '/fms/config/auxiliary-item/get-import-template',
      method: 'get',
      params: { type },
      responseType: 'blob'
    })
  },

  // 导入辅助核算项目
  importAuxiliaryItem(accountSetId, auxiliaryTypeId, file) {
    const data = new FormData()
    data.append('accountSetId', String(accountSetId))
    data.append('auxiliaryTypeId', String(auxiliaryTypeId))
    data.append('file', file)
    return request({
      url: '/fms/config/auxiliary-item/import',
      method: 'post',
      data,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
