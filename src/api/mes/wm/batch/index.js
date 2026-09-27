import request from '@/utils/request'
// 批次追溯 API
export const BatchApi = {
  // 获取批次详情
  getBatch: async(id) => {
    return await request({ method: 'get', url: `/mes/wm/batch/get?id=` + id })
  },
  // 获取批次分页
  getBatchPage: async(params) => {
    return await request({ method: 'get', url: `/mes/wm/batch/page`, params })
  },
  // 向前追溯
  getForwardList: async(code) => {
    return await request({ method: 'get', url: `/mes/wm/batch/forward-list`, params: { code }})
  },
  // 向后追溯
  getBackwardList: async(code) => {
    return await request({ method: 'get', url: `/mes/wm/batch/backward-list`, params: { code }})
  }
}

