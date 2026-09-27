<template>
  <div v-loading="loading" class="app-container hrm-home">
    <div class="home-title">HR 工作台</div>
    <el-row :gutter="16" type="flex" align="top">
      <el-col :span="16">
        <hrm-home-employee-survey :survey="summary && summary.employeeSurvey" />
        <hrm-home-recruit-survey :survey="summary && summary.recruitSurvey" />
        <hrm-home-salary-survey :survey="summary && summary.salarySurvey" />
      </el-col>
      <el-col :span="8">
        <hrm-home-todo-survey :survey="summary && summary.todoSurvey" />
        <hrm-home-calendar
          ref="calendar"
          :get-calendar-items="getHrHomeCalendar"
          :is-item-clickable="isCalendarItemClickable"
          @item-click="openCalendarItem"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getHrHomeCalendar, getHrHomeStatisticsSummary } from '@/api/hrm/home'
import { HrmHomeCalendarItemType } from '@/views/hrm/utils/constants'
import HrmHomeCalendar from '../components/HrmHomeCalendar.vue'
import HrmHomeEmployeeSurvey from '../components/HrmHomeEmployeeSurvey.vue'
import HrmHomeRecruitSurvey from '../components/HrmHomeRecruitSurvey.vue'
import HrmHomeSalarySurvey from '../components/HrmHomeSalarySurvey.vue'
import HrmHomeTodoSurvey from '../components/HrmHomeTodoSurvey.vue'

export default {
  name: 'HrmHrHome',
  components: {
    HrmHomeCalendar,
    HrmHomeEmployeeSurvey,
    HrmHomeRecruitSurvey,
    HrmHomeSalarySurvey,
    HrmHomeTodoSurvey
  },
  data() {
    return {
      getHrHomeCalendar,
      loading: false,
      summary: undefined
    }
  },
  mounted() {
    this.getSummary()
    if (this.$refs.calendar) this.$refs.calendar.refresh()
  },
  methods: {
    /** 获得首页统计汇总 */
    async getSummary() {
      this.loading = true
      try {
        const response = await getHrHomeStatisticsSummary()
        this.summary = response.data
      } finally {
        this.loading = false
      }
    },
    isCalendarItemClickable(item) {
      return item.type !== HrmHomeCalendarItemType.NOTE && !!item.typeId
    },
    /** 打开日历事项详情 */
    openCalendarItem(item) {
      if (!item.typeId) return
      if (item.type === HrmHomeCalendarItemType.RECRUIT) {
        this.$router.push({ name: 'HrmRecruitCandidateDetail', params: { id: item.typeId }})
        return
      }
      this.$router.push({ name: 'HrmEmployeeDetail', params: { id: item.typeId }})
    }
  }
}
</script>

<style scoped>
.home-title { margin-bottom: 16px; color: #303133; font-size: 24px; line-height: 28px; }
</style>
