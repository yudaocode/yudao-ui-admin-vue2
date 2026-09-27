<template>
  <el-card
    shadow="never"
    class="employee-survey"
  >
    <template v-if="employee">
      <div class="survey-main">
        <el-avatar
          :size="64"
          :src="employee.avatar"
        >{{ employeeInitial }}</el-avatar>
        <div class="survey-info">
          <div class="survey-greeting">Hi，{{ employee.name }}</div>
          <div class="survey-entry-day">
            这是你在{{ employee.deptName || '部门' }}的第 <b>{{ employee.entryDay || 0 }}</b> 天
          </div>
          <div class="survey-details">
            <span>部门 <b>{{ employee.deptName || '未设置' }}</b>，</span>
            <span>岗位 <b>{{ employee.postName || '未设置' }}</b>，</span>
            <span>工号 <b>{{ employee.jobNumber || '未设置' }}</b>，</span>
            <span v-if="employee.entryTime"><b>{{ formatHrmDate(employee.entryTime) }}</b> 入职</span>
            <span v-if="showRegularDate">，将于 <b>{{ formatHrmDate(employee.regularTime) }}</b> 转正</span>
          </div>
          <el-button
            v-if="salarySlipSummary && salarySlipSummary.reminder"
            class="salary-reminder"
            type="text"
            @click="goSalarySlip"
          >{{ salarySlipSummary.reminder }} &gt;&gt;</el-button>
        </div>
      </div>
    </template>
    <el-empty
      v-else
      :image-size="100"
      description="当前账号未绑定员工档案"
    />
  </el-card>
</template>

<script>
import { formatHrmDate } from '@/views/hrm/utils/format'

export default {
  name: 'HrmPortalEmployeeSurvey',
  props: {
    employee: { type: Object, default: undefined },
    salarySlipSummary: { type: Object, default: undefined }
  },
  computed: {
    employeeInitial() {
      return this.employee && this.employee.name ? this.employee.name.slice(0, 1) : ''
    },
    showRegularDate() {
      return Boolean(this.employee && this.employee.regularTime && Date.now() < new Date(this.employee.regularTime).getTime())
    }
  },
  methods: {
    formatHrmDate,
    goSalarySlip() { this.$router.push({ name: 'HrmPortalSalarySlip' }) }
  }
}
</script>

<style scoped>
.employee-survey { min-height: 130px; }
.survey-main { display: flex; align-items: flex-start; gap: 34px; padding: 18px 20px; }
.survey-info { min-width: 0; padding-top: 4px; }
.survey-greeting { color: #303133; font-size: 20px; font-weight: 700; }
.survey-entry-day { margin-top: 12px; color: #606266; }
.survey-details { margin-top: 22px; color: #606266; line-height: 30px; }
.survey-entry-day b, .survey-details b { color: #303133; font-weight: 700; }
.salary-reminder { height: auto; margin-top: 10px; padding: 0; white-space: normal; }
</style>
