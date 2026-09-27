<!-- 排班日历 - 按班组视图 -->
<template>
  <div class="calendar-layout">
    <div class="selector-panel">
      <div
        v-for="team in teamList"
        :key="team.id"
        class="selector-item"
        :class="{ selected: selectedTeamId === team.id }"
        @click="onSelectTeam(team.id)"
      >
        {{ team.name }}
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
import { CalTeamApi } from '@/api/mes/cal/team'
import CalendarDateCell from './CalendarDateCell.vue'
import CalendarLegend from './CalendarLegend.vue'
import { useCalendar } from './useCalendar'

export default {
  name: 'TeamView',
  components: { CalendarDateCell, CalendarLegend },
  mixins: [useCalendar()],
  data() {
    return { selectedTeamId: undefined, teamList: [] }
  },
  watch: {
    currentDate() {
      this.watchMonth(this.doFetch)
    }
  },
  mounted() {
    this.getTeamList()
    this.loadHolidays()
  },
  methods: {
    async getTeamList() {
      const response = await CalTeamApi.getTeamList()
      this.teamList = response.data
      if (this.teamList.length > 0) return this.onSelectTeam(this.teamList[0].id)
    },
    doFetch() {
      if (this.selectedTeamId == null) return
      return this.fetchCalendar({ queryType: 'TEAM', teamId: this.selectedTeamId })
    },
    onSelectTeam(id) {
      this.selectedTeamId = id
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
