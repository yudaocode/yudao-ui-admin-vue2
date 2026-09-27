import request from '@/utils/request'
// 装箱单 API
export const WmPackageApi = {
  // 创建装箱单
  createPackage: async(data) => {
    return await request({ method: 'post', url: '/mes/wm/package/create', data })
  },
  // 修改装箱单
  updatePackage: async(data) => {
    return await request({ method: 'put', url: '/mes/wm/package/update', data })
  },
  // 删除装箱单
  deletePackage: async(id) => {
    return await request({ method: 'delete', url: '/mes/wm/package/delete?id=' + id })
  },
  // 获取装箱单详情
  getPackage: async(id) => {
    return await request({ method: 'get', url: '/mes/wm/package/get?id=' + id })
  },
  // 分页查询装箱单
  getPackagePage: async(params) => {
    return await request({ method: 'get', url: '/mes/wm/package/page', params })
  },
  // 完成装箱单
  finishPackage: async(id) => {
    return await request({ method: 'put', url: '/mes/wm/package/finish?id=' + id })
  },
  // 添加子箱
  addChildPackage: async(parentId, childId) => {
    return await request({ method: 'put',
      url: '/mes/wm/package/add-child-package',
      params: { parentId, childId }
    })
  },
  // 移除子箱
  removeChildPackage: async(childId) => {
    return await request({ method: 'put', url: '/mes/wm/package/remove-child-package?childId=' + childId })
  }
}

