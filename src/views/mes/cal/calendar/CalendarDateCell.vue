<!-- 排班日历 - 日历格子（公共组件） -->
<template>
  <div class="calendar-date-cell">
    <div class="cell-header">
      <span class="day-number" :class="{ weekend: isWeekend }">{{ dayNumber }}</span>
      <el-tag v-if="isHoliday" size="mini" effect="dark" type="success">休</el-tag>
      <el-tag v-else size="mini" effect="dark">班</el-tag>
    </div>
    <div class="lunar-text" :class="{ festival: hasFestivalDay }">{{ lunarDisplay }}</div>
    <div v-if="!isHoliday" class="shift-list">
      <div v-for="item in teamShifts" :key="item.sort">
        <div v-if="item.sort === 1" class="shift-tag day-shift">
          {{ item.shiftName }} · {{ item.teamName }}
        </div>
        <div
          v-else-if="item.sort === 2"
          class="shift-tag"
          :class="shiftType === MesCalShiftTypeEnum.THREE ? 'middle-shift' : 'night-shift'"
        >
          {{ item.shiftName }} · {{ item.teamName }}
        </div>
        <div v-else-if="item.sort === 3" class="shift-tag night-shift">
          {{ item.shiftName }} · {{ item.teamName }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { SolarDay } from 'tyme4ts'
import { MesCalShiftTypeEnum } from '@/views/mes/utils/constants'

export default {
  name: 'CalendarDateCell',
  props: {
    day: { type: String, required: true },
    holidaySet: { type: Set, required: true },
    calendarDayMap: { type: Map, required: true }
  },
  data() {
    return { MesCalShiftTypeEnum }
  },
  computed: {
    dayNumber() {
      return this.day.split('-')[2]
    },
    isHoliday() {
      return this.holidaySet.has(this.day)
    },
    isWeekend() {
      const weekDay = new Date(this.day).getDay()
      return weekDay === 0 || weekDay === 6
    },
    calDay() {
      return this.calendarDayMap.get(this.day)
    },
    teamShifts() {
      return this.calDay ? this.calDay.teamShifts || [] : []
    },
    shiftType() {
      return this.calDay && this.calDay.shiftType
    },
    lunarInfo() {
      const parts = this.day.split('-')
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
    lunarDisplay() {
      const info = this.lunarInfo
      return info.solarFestival || info.lunarFestival || info.termName || info.lunarText
    },
    hasFestivalDay() {
      const info = this.lunarInfo
      return Boolean(info.solarFestival || info.lunarFestival || info.termName)
    }
  }
}
</script>

<style scoped>
.calendar-date-cell { height: 100%; padding: 4px; overflow: hidden; }
.cell-header { display: flex; align-items: center; justify-content: space-between; }
.day-number { font-size: 16px; font-weight: 500; }
.weekend { color: #f56c6c; }
.lunar-text { margin-top: 1px; overflow: hidden; color: #909399; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.festival { color: #67c23a; }
.shift-list { display: flex; flex-direction: column; margin-top: 2px; overflow: hidden; }
.shift-tag { width: 100%; padding: 1px 4px; overflow: hidden; color: #fff; font-size: 11px; line-height: 1.5; text-overflow: ellipsis; white-space: nowrap; border-radius: 3px; }
.day-shift { background: #95d475; }
.middle-shift { background: #f0a020; }
.night-shift { background: #909399; }
</style>
