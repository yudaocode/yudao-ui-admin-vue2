import request from '@/utils/request'

// MES 计量单位 API
export const MdUnitMeasureApi = {
  // 查询计量单位分页
  getUnitMeasurePage: async(params) => {
    return await request({ url: '/mes/md/unit-measure/page', method: 'get', params })
  },

  // 查询计量单位精简列表
  getUnitMeasureSimpleList: async() => {
    return await request({ url: '/mes/md/unit-measure/simple-list', method: 'get' })
  },

  // 查询计量单位详情
  getUnitMeasure: async(id) => {
    return await request({ url: '/mes/md/unit-measure/get?id=' + id, method: 'get' })
  },

  // 新增计量单位
  createUnitMeasure: async(data) => {
    return await request({ url: '/mes/md/unit-measure/create', method: 'post', data })
  },

  // 修改计量单位
  updateUnitMeasure: async(data) => {
    return await request({ url: '/mes/md/unit-measure/update', method: 'put', data })
  },

  // 删除计量单位
  deleteUnitMeasure: async(id) => {
    return await request({ url: '/mes/md/unit-measure/delete?id=' + id, method: 'delete' })
  },

  // 导出计量单位 Excel
  exportUnitMeasure: async(params) => {
    return await request({
      url: '/mes/md/unit-measure/export-excel',
      method: 'get',
      params,
      responseType: 'blob'
    })
  }
}
