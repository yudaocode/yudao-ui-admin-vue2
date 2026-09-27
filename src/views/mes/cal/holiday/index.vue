<!-- MES 假期设置 - 日历视图 -->
<template>
  <div class="app-container">
    <doc-alert title="【排班】班组设置、节假日设置" url="https://doc.iocoder.cn/mes/cal/team/" />

    <el-calendar v-model="currentDate">
      <template slot="dateCell" slot-scope="{ data }">
        <div class="holiday-cell" @click.stop="onClickDay(data)">
          <div class="cell-header">
            <span class="day-number" :class="{ weekend: isWeekend(data.day) }">
              {{ data.day.split('-')[2] }}
            </span>
            <el-tag v-if="holidaySet.has(data.day)" size="mini" effect="dark" type="success">休</el-tag>
            <el-tag v-else size="mini" effect="dark">班</el-tag>
          </div>
          <div class="lunar-text" :class="{ festival: hasFestival(data.day) }">
            {{ getLunarDisplay(data.day) }}
          </div>
        </div>
      </template>
    </el-calendar>

    <holiday-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { CalHolidayApi } from '@/api/mes/cal/holiday'
import { formatDate } from '@/utils/formatTime'
import { SolarDay } from 'tyme4ts'
import { checkPermi } from '@/utils/permission'
import { HolidayType } from '@/views/mes/utils/constants'
import HolidayForm from './HolidayForm.vue'

export default {
  name: 'MesCalHoliday',
  components: { HolidayForm },
  data() {
    return {
      currentDate: new Date(),
      holidaySet: new Set(),
      lastFetchedMonth: ''
    }
  },
  watch: {
    currentDate(newDate) {
      const newMonth = this.formatMonth(newDate)
      if (newMonth !== this.lastFetchedMonth) this.getList()
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    formatMonth(date) {
      return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0')
    },
    async getList() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      const startDay = formatDate(new Date(year, month - 1, 1), 'YYYY-MM-DD 00:00:00')
      const endDay = formatDate(new Date(year, month + 2, 0, 23, 59, 59), 'YYYY-MM-DD 23:59:59')
      const response = await CalHolidayApi.getHolidayList({ startDay, endDay })
      if (!response.data) return
      const nextHolidaySet = new Set()
      response.data.forEach(item => {
        const day = item.day ? formatDate(item.day, 'YYYY-MM-DD') : ''
        if (day && item.type === HolidayType.HOLIDAY) nextHolidaySet.add(day)
      })
      this.holidaySet = nextHolidaySet
      this.lastFetchedMonth = this.formatMonth(this.currentDate)
    },
    onClickDay(data) {
      if (data.type !== 'current-month') return
      if (!checkPermi(['mes:cal-holiday:create'])) {
        this.$modal.msgWarning('没有假期设置权限')
        return
      }
      this.$refs.form.open(data.day)
    },
    isWeekend(day) {
      const weekDay = new Date(day).getDay()
      return weekDay === 0 || weekDay === 6
    },
    getLunarInfo(day) {
      const parts = day.split('-')
      try {
        const solarDay = SolarDay.fromYmd(Number(parts[0]), Number(parts[1]), Number(parts[2]))
        const lunarDay = solarDay.getLunarDay()
        const solarFestival = solarDay.getFestival()
        const lunarFestival = lunarDay.getFestival()
        const termDay = solarDay.getTermDay()
        const termName = termDay.getDayIndex() === 0 ? termDay.getSolarTerm().getName() : null
        return {
          solarFestival: solarFestival ? solarFestival.getName() : null,
          lunarFestival: lunarFestival ? lunarFestival.getName() : null,
          termName,
          lunarText: lunarDay.getLunarMonth().getName() + lunarDay.getName()
        }
      } catch (error) {
        return { solarFestival: null, lunarFestival: null, termName: null, lunarText: '' }
      }
    },
    getLunarDisplay(day) {
      const info = this.getLunarInfo(day)
      return info.solarFestival || info.lunarFestival || info.termName || info.lunarText
    },
    hasFestival(day) {
      const info = this.getLunarInfo(day)
      return Boolean(info.solarFestival || info.lunarFestival || info.termName)
    }
  }
}
</script>

<style scoped>
.holiday-cell { height: 100%; padding: 4px; }
.cell-header { display: flex; align-items: center; justify-content: space-between; }
.day-number { font-size: 16px; font-weight: 500; }
.weekend { color: #f56c6c; }
.lunar-text { margin-top: 4px; color: #909399; font-size: 12px; }
.festival { color: #67c23a; }
</style>
