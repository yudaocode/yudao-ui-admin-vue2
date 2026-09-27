<template>
  <el-card shadow="never" class="home-card">
    <div slot="header" class="home-card__title">人事概况（{{ currentMonthRange }}）</div>
    <div class="survey-grid survey-grid--seven">
      <button
        v-for="(item, index) in surveyItems"
        :key="item.label"
        :disabled="!canQueryEmployee"
        :class="['survey-button', { 'survey-button--clickable': canQueryEmployee, 'survey-button--divider': index < surveyItems.length - 1, 'survey-button--primary-divider': index === 0 }]"
        type="button"
        @click="goEmployeeSurvey(item.surveyType)"
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
  name: 'HrmHomeEmployeeSurvey',
  props: {
    survey: { type: Object, default: undefined }
  },
  data() {
    return { currentMonthRange: getCurrentMonthRange() }
  },
  computed: {
    canQueryEmployee() {
      return checkPermi(['hrm:employee:query'])
    },
    surveyItems() {
      const survey = this.survey || {}
      return [
        { label: '在职', value: survey.activeCount || 0, surveyType: undefined },
        { label: '入职', value: survey.entryThisMonthCount || 0, surveyType: HrmEmployeeSurveyType.ENTRY },
        { label: '待入职', value: survey.pendingEntryThisMonthCount || 0, surveyType: HrmEmployeeSurveyType.PENDING_ENTRY },
        { label: '离职', value: survey.leaveThisMonthCount || 0, surveyType: HrmEmployeeSurveyType.LEAVE },
        { label: '待离职', value: survey.pendingLeaveThisMonthCount || 0, surveyType: HrmEmployeeSurveyType.PENDING_LEAVE },
        { label: '转正', value: survey.regularThisMonthCount || 0, surveyType: HrmEmployeeSurveyType.REGULAR },
        { label: '调岗', value: survey.transferThisMonthCount || 0, surveyType: HrmEmployeeSurveyType.TRANSFER }
      ]
    }
  },
  methods: {
    /** 打开人事概况对应的员工列表 */
    goEmployeeSurvey(surveyType) {
      if (!this.canQueryEmployee) return
      if (surveyType === undefined) {
        this.$router.push({ name: 'HrmEmployee', query: { statusCategory: HrmEmployeeStatusTab.ACTIVE }})
        return
      }
      this.$router.push({ name: 'HrmEmployee', query: { surveyType }})
    }
  }
}
</script>

<style scoped>
.home-card { margin-bottom: 16px; }
.home-card__title { color: #303133; font-size: 16px; font-weight: 600; }
.survey-grid { display: grid; }
.survey-grid--seven { grid-template-columns: repeat(7, minmax(0, 1fr)); }
.survey-button { min-height: 88px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0; border: 0; background: transparent; cursor: default; }
.survey-button--divider { border-right: 1px solid #ebeef5; }
.survey-button--primary-divider { margin-right: 24px; border-right-color: #dcdfe6; }
.survey-button strong { color: #303133; font-size: 24px; line-height: 32px; }
.survey-button span { margin-top: 8px; color: #909399; font-size: 13px; }
.survey-button--clickable { cursor: pointer; }
.survey-button--clickable:hover strong, .survey-button--clickable:hover span { color: #409eff; }
@media (max-width: 1199px) {
  .survey-grid--seven { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .survey-button--primary-divider { margin-right: 0; }
}
</style>
