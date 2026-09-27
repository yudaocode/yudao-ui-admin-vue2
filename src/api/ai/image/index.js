import request from '@/utils/request'

// AI 图片 API
export const ImageApi = {
  // 获取【我的】绘图分页
  getImagePageMy: async(params) => {
    return await request({ url: '/ai/image/my-page', method: 'get', params })
  },

  // 获取【我的】绘图记录
  getImageMy: async(id) => {
    return await request({ url: '/ai/image/get-my?id=' + id, method: 'get' })
  },

  // 获取【我的】绘图记录列表
  getImageListMyByIds: async(ids) => {
    return await request({
      url: '/ai/image/my-list-by-ids',
      method: 'get',
      params: { ids: ids.join(',') }
    })
  },

  // 生成图片
  drawImage: async(data) => {
    return await request({ url: '/ai/image/draw', method: 'post', data })
  },

  // 删除【我的】绘画记录
  deleteImageMy: async(id) => {
    return await request({ url: '/ai/image/delete-my?id=' + id, method: 'delete' })
  },

  // ================ midjourney 专属 ================

  // 【Midjourney】生成图片
  midjourneyImagine: async(data) => {
    return await request({ url: '/ai/image/midjourney/imagine', method: 'post', data })
  },

  // 【Midjourney】Action 操作（二次生成图片）
  midjourneyAction: async(data) => {
    return await request({ url: '/ai/image/midjourney/action', method: 'post', data })
  },

  // ================ 绘图管理 ================

  // 查询绘画分页
  getImagePage: async(params) => {
    return await request({ url: '/ai/image/page', method: 'get', params })
  },

  // 更新绘画发布状态
  updateImage: async(data) => {
    return await request({ url: '/ai/image/update', method: 'put', data })
  },

  // 删除绘画
  deleteImage: async(id) => {
    return await request({ url: '/ai/image/delete?id=' + id, method: 'delete' })
  }
}
