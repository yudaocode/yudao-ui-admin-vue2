<template>
  <div v-loading="loading" class="app-container hrm-home">
    <div class="home-title">团队工作台</div>
    <el-row :gutter="16" type="flex" align="top" class="home-row">
      <el-col :lg="16" :md="24">
        <hrm-team-overview
          :leader-employee-id="summary && summary.leaderEmployeeId"
          :overview="summary && summary.teamOverview"
        />
        <hrm-team-survey :survey="summary && summary.teamSurvey" />
      </el-col>
      <el-col :lg="8" :md="24">
        <hrm-home-calendar
          ref="calendar"
          :get-calendar-items="getTeamHomeCalendar"
          :is-item-clickable="isCalendarItemClickable"
          @item-click="openCalendarItem"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getTeamHomeCalendar, getTeamHomeStatisticsSummary } from '@/api/hrm/home'
import { HrmHomeCalendarItemType } from '@/views/hrm/utils/constants'
import HrmHomeCalendar from '../components/HrmHomeCalendar.vue'
import HrmTeamOverview from './components/HrmTeamOverview.vue'
import HrmTeamSurvey from './components/HrmTeamSurvey.vue'

export default {
  name: 'HrmTeamHome',
  components: { HrmHomeCalendar, HrmTeamOverview, HrmTeamSurvey },
  data() {
    return {
      getTeamHomeCalendar,
      loading: false,
      summary: undefined
    }
  },
  mounted() {
    this.getSummary()
    if (this.$refs.calendar) this.$refs.calendar.refresh()
  },
  methods: {
    /** 获得团队工作台统计 */
    async getSummary() {
      this.loading = true
      try {
        const response = await getTeamHomeStatisticsSummary()
        this.summary = response.data
      } finally {
        this.loading = false
      }
    },
    isCalendarItemClickable(item) {
      return item.type !== HrmHomeCalendarItemType.NOTE && !!item.typeId
    },
    /** 打开下属员工档案 */
    openCalendarItem(item) {
      if (item.typeId) {
        this.$router.push({ name: 'HrmEmployeeDetail', params: { id: item.typeId }})
      }
    }
  }
}
</script>

<style scoped>
.home-title { margin-bottom: 16px; color: #303133; font-size: 24px; line-height: 28px; }
@media (max-width: 1199px) {
  .home-row { display: block; }
}
</style>
