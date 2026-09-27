import request from '@/utils/request'
// 装箱明细 API
export const WmPackageLineApi = {
  // 创建装箱明细
  createPackageLine: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/package-line/create', data })
  },
  // 修改装箱明细
  updatePackageLine: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/package-line/update', data })
  },
  // 删除装箱明细
  deletePackageLine: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/package-line/delete?id=' + id })
  },
  // 获取装箱明细详情
  getPackageLine: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/package-line/get?id=' + id })
  },
  // 分页查询装箱明细
  getPackageLinePage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/package-line/page', params })
  }
  // DONE @AI：这个接口不需要；是不是前后端都删除掉
}

