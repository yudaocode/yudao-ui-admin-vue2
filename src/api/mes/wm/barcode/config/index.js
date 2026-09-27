import request from '@/utils/request'
// MES 条码配置 API
export const WmBarcodeConfigApi = {
  // 查询条码配置分页
  getBarcodeConfigPage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/barcode-config/page', params })
  },
  // 查询条码配置详情
  getBarcodeConfig: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/barcode-config/get?id=' + id })
  },
  // 新增条码配置
  createBarcodeConfig: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/barcode-config/create', data })
  },
  // 修改条码配置
  updateBarcodeConfig: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/barcode-config/update', data })
  },
  // 删除条码配置
  deleteBarcodeConfig: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/barcode-config/delete?id=' + id })
  }
}

