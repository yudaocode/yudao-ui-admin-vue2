import request from '@/utils/request'

// MES 假期设置 API
export const CalHolidayApi = {
  // 查询假期设置列表（支持可选日期范围过滤）
  getHolidayList: async(params) => {
    return await request({ url: '/mes/cal/holiday/list', method: 'get', params })
  },

  // 根据日期查询假期设置
  getHolidayByDay: async(day) => {
    return await request({
      url: '/mes/cal/holiday/get-by-day',
      method: 'get',
      params: { day }
    })
  },

  // 保存假期设置（含 upsert 逻辑）
  saveHoliday: async(data) => {
    return await request({ url: '/mes/cal/holiday/save', method: 'post', data })
  }
}
