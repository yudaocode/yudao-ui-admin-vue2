<!-- 排班日历 - 按分类视图 -->
<template>
  <div class="calendar-layout">
    <div class="selector-panel">
      <div
        v-for="dict in calendarTypeOptions"
        :key="dict.value"
        class="selector-item"
        :class="{ selected: selectedType === dict.value }"
        @click="onSelectType(dict.value)"
      >
        {{ dict.label }}
      </div>
    </div>
    <div class="calendar-panel">
      <calendar-legend />
      <el-calendar v-model="currentDate" v-loading="loading">
        <template slot="dateCell" slot-scope="{ data }">
          <calendar-date-cell
            :day="data.day"
            :holiday-set="holidaySet"
            :calendar-day-map="calendarDayMap"
          />
        </template>
      </el-calendar>
    </div>
  </div>
</template>

<script>
import { getIntDictOptions } from '@/utils/dict'
import CalendarDateCell from './CalendarDateCell.vue'
import CalendarLegend from './CalendarLegend.vue'
import { useCalendar } from './useCalendar'

const MES_CAL_CALENDAR_TYPE = 'mes_cal_calendar_type'

export default {
  name: 'TypeView',
  components: { CalendarDateCell, CalendarLegend },
  mixins: [useCalendar()],
  data() {
    return {
      selectedType: undefined,
      calendarTypeOptions: getIntDictOptions(MES_CAL_CALENDAR_TYPE)
    }
  },
  watch: {
    currentDate() {
      this.watchMonth(this.doFetch)
    }
  },
  mounted() {
    this.loadHolidays()
    if (this.calendarTypeOptions.length > 0) this.onSelectType(this.calendarTypeOptions[0].value)
  },
  methods: {
    doFetch() {
      if (this.selectedType == null) return
      return this.fetchCalendar({ queryType: 'TYPE', calendarType: this.selectedType })
    },
    onSelectType(value) {
      this.selectedType = value
      return this.doFetch()
    }
  }
}
</script>

<style scoped>
.calendar-layout { display: flex; }
.selector-panel { flex: 0 0 150px; margin-right: 12px; overflow: hidden; border: 1px solid #dcdfe6; border-radius: 4px; }
.selector-item { padding: 10px 16px; color: #606266; font-size: 14px; cursor: pointer; border-bottom: 1px solid #ebeef5; transition: background-color .2s; }
.selector-item:last-child { border-bottom: 0; }
.selector-item:hover { background: #f5f7fa; }
.selector-item.selected { color: #409eff; font-weight: 500; background: #ecf5ff; }
.calendar-panel { flex: 1; min-width: 0; }
</style>
