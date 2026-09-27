<template>
  <el-card shadow="never" class="home-card">
    <div slot="header" class="home-card__title">我的团队（{{ currentMonthRange }}）</div>
    <div class="overview-grid">
      <button
        v-for="(item, index) in overviewItems"
        :key="item.label"
        :disabled="!canOpenEmployeeList"
        :class="['overview-button', { 'overview-button--clickable': canOpenEmployeeList, 'overview-button--divider': index < overviewItems.length - 1, 'overview-button--primary-divider': index === 0 }]"
        type="button"
        @click="openEmployeeList(item.surveyType)"
      >
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
      </button>
    </div>
  </el-card>
</template>

<script>
import { checkPermi } from '@/utils/permission'
import { HrmEmployeeStatusTab, HrmEmployeeSurveyType } from '@/views/hrm/utils/constants'

function pad(value) {
  return String(value).padStart(2, '0')
}

function formatDate(date) {
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`
}

function getCurrentMonthRange() {
  const now = new Date()
  return `${formatDate(new Date(now.getFullYear(), now.getMonth(), 1))}-${formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))}`
}

export default {
  name: 'HrmTeamHomeOverview',
  props: {
    leaderEmployeeId: { type: Number, default: undefined },
    overview: { type: Object, default: undefined }
  },
  data() {
    return { currentMonthRange: getCurrentMonthRange() }
  },
  computed: {
    canOpenEmployeeList() {
      return !!this.leaderEmployeeId && checkPermi(['hrm:employee:query'])
    },
    overviewItems() {
      const overview = this.overview || {}
      return [
        { label: '团队人数', value: overview.employeeCount || 0, surveyType: undefined },
        { label: '本月入职', value: overview.entryThisMonthCount || 0, surveyType: HrmEmployeeSurveyType.ENTRY },
        { label: '本月离职', value: overview.leaveThisMonthCount || 0, surveyType: HrmEmployeeSurveyType.LEAVE },
        { label: '本月转正', value: overview.regularThisMonthCount || 0, surveyType: HrmEmployeeSurveyType.REGULAR }
      ]
    }
  },
  methods: {
    /** 打开当前直属团队对应的员工列表 */
    openEmployeeList(surveyType) {
      if (!this.canOpenEmployeeList) return
      this.$router.push({
        name: 'HrmEmployee',
        query: {
          leaderEmployeeId: this.leaderEmployeeId,
          statusCategory: surveyType === undefined ? HrmEmployeeStatusTab.ACTIVE : undefined,
          surveyType
        }
      })
    }
  }
}
</script>

<style scoped>
.home-card { margin-bottom: 16px; }
.home-card__title { color: #303133; font-size: 16px; font-weight: 600; }
.overview-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.overview-button { min-height: 88px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0; border: 0; background: transparent; cursor: default; }
.overview-button--divider { border-right: 1px solid #ebeef5; }
.overview-button--primary-divider { margin-right: 24px; border-right-color: #dcdfe6; }
.overview-button strong { color: #303133; font-size: 24px; line-height: 32px; }
.overview-button span { margin-top: 8px; color: #909399; font-size: 13px; }
.overview-button--clickable { cursor: pointer; }
.overview-button--clickable:hover strong, .overview-button--clickable:hover span { color: #409eff; }
@media (max-width: 991px) {
  .overview-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .overview-button--primary-divider { margin-right: 0; }
}
</style>
