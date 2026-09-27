<template>
  <el-card shadow="never" class="home-card">
    <div slot="header" class="home-card__title">招聘动态（{{ recruitRange }}）</div>
    <div class="survey-grid">
      <button
        v-for="(item, index) in surveyItems"
        :key="item.label"
        :disabled="item.disabled"
        :class="['survey-button', { 'survey-button--clickable': !item.disabled, 'survey-button--divider': index < surveyItems.length - 1 }]"
        type="button"
        @click="goRecruitSurvey(item.action)"
      >
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
      </button>
    </div>
  </el-card>
</template>

<script>
import { checkPermi } from '@/utils/permission'
import { HrmRecruitCandidateStatus } from '@/views/hrm/utils/constants'

function pad(value) {
  return String(value).padStart(2, '0')
}

function formatDate(date) {
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`
}

function subtractMonths(date, amount) {
  const result = new Date(date.getFullYear(), date.getMonth() - amount, 1)
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()
  result.setDate(Math.min(date.getDate(), lastDay))
  return result
}

export default {
  name: 'HrmHomeRecruitSurvey',
  props: {
    survey: { type: Object, default: undefined }
  },
  data() {
    const now = new Date()
    return { recruitRange: `${formatDate(subtractMonths(now, 6))}-${formatDate(now)}` }
  },
  computed: {
    canQueryRecruitPost() {
      return checkPermi(['hrm:recruit:post:query'])
    },
    canQueryRecruitCandidate() {
      return checkPermi(['hrm:recruit:candidate:query'])
    },
    surveyItems() {
      const survey = this.survey || {}
      return [
        { label: '正在招聘职位', value: survey.recruitingPostCount || 0, action: 'post', disabled: !this.canQueryRecruitPost },
        { label: '评选中', value: survey.candidateInProcessCount || 0, action: undefined, disabled: true },
        { label: '待入职', value: survey.pendingEntryCount || 0, action: 'pending-entry', disabled: !this.canQueryRecruitCandidate },
        { label: '已入职', value: survey.joinedCount || 0, action: 'joined', disabled: !this.canQueryRecruitCandidate }
      ]
    }
  },
  methods: {
    /** 打开招聘动态对应的列表 */
    goRecruitSurvey(action) {
      if (action === 'post' && this.canQueryRecruitPost) {
        this.$router.push({ name: 'HrmRecruitPost' })
      } else if (action === 'pending-entry' && this.canQueryRecruitCandidate) {
        this.$router.push({ name: 'HrmRecruitCandidate', query: { status: HrmRecruitCandidateStatus.PENDING_ENTRY }})
      } else if (action === 'joined' && this.canQueryRecruitCandidate) {
        this.$router.push({ name: 'HrmRecruitCandidate', query: { status: HrmRecruitCandidateStatus.JOINED }})
      }
    }
  }
}
</script>

<style scoped>
.home-card { margin-bottom: 16px; }
.home-card__title { color: #303133; font-size: 16px; font-weight: 600; }
.survey-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.survey-button { min-height: 88px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0; border: 0; background: transparent; cursor: default; }
.survey-button--divider { border-right: 1px solid #ebeef5; }
.survey-button strong { color: #303133; font-size: 24px; line-height: 32px; }
.survey-button span { margin-top: 8px; color: #909399; font-size: 13px; }
.survey-button--clickable { cursor: pointer; }
.survey-button--clickable:hover strong, .survey-button--clickable:hover span { color: #409eff; }
</style>
