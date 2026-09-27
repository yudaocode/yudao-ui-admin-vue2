import request from '@/utils/request'

// MES 排班日历 API
export const CalCalendarApi = {
  // 查询排班日历列表
  getCalendarList: async(params) => {
    return await request({ url: '/mes/cal/calendar/list', method: 'get', params })
  }
}
