import { CalCalendarApi } from '@/api/mes/cal/calendar'
import { CalHolidayApi } from '@/api/mes/cal/holiday'
import { formatDate } from '@/utils/formatTime'
import { HolidayType } from '@/views/mes/utils/constants'

/**
 * Vue 2 版排班日历通用逻辑。
 *
 * 使用 mixin 承接 Vue 3 composable 的状态和方法。Map、Set 每次整体替换，
 * 既保证 Vue 2 能追踪更新，也让请求失败时保留当前已渲染数据。
 */
export function useCalendar() {
  return {
    data() {
      return {
        loading: false,
        currentDate: new Date(),
        calendarDayMap: new Map(),
        holidaySet: new Set()
      }
    },
    methods: {
      /** 计算当前月份的起止时间。 */
      getMonthRange() {
        const date = this.currentDate
        const year = date.getFullYear()
        const month = date.getMonth()
        return {
          startDay: new Date(year, month, 1),
          endDay: new Date(year, month + 1, 0, 23, 59, 59)
        }
      },

      /** 获取当前月份节假日。 */
      async loadHolidays() {
        const { startDay, endDay } = this.getMonthRange()
        const response = await CalHolidayApi.getHolidayList({
          startDay: formatDate(startDay, 'YYYY-MM-DD HH:mm:ss'),
          endDay: formatDate(endDay, 'YYYY-MM-DD HH:mm:ss')
        })
        if (!response.data) return
        const nextHolidaySet = new Set()
        response.data.forEach(item => {
          const day = item.day ? formatDate(item.day, 'YYYY-MM-DD') : ''
          if (day && item.type === HolidayType.HOLIDAY) nextHolidaySet.add(day)
        })
        this.holidaySet = nextHolidaySet
      },

      /** 查询排班日历，params 由调用方提供 queryType 相关参数。 */
      async fetchCalendar(params) {
        this.loading = true
        try {
          const { startDay, endDay } = this.getMonthRange()
          const response = await CalCalendarApi.getCalendarList({
            ...params,
            startDay: formatDate(startDay, 'YYYY-MM-DD HH:mm:ss'),
            endDay: formatDate(endDay, 'YYYY-MM-DD HH:mm:ss')
          })
          if (!response.data) return
          const nextCalendarDayMap = new Map()
          response.data.forEach(item => {
            const day = item.day ? formatDate(item.day, 'YYYY-MM-DD') : ''
            if (day) nextCalendarDayMap.set(day, { ...item, day })
          })
          this.calendarDayMap = nextCalendarDayMap
        } finally {
          this.loading = false
        }
      },

      /** 月份切换后刷新节假日和调用方视图数据。 */
      watchMonth(callback) {
        this.loadHolidays()
        callback()
      }
    }
  }
}
