<template>
  <div
    v-if="accessible"
    v-loading="loading"
  >
    <el-row :gutter="16">
      <el-col :span="16">
        <EmployeeSurvey
          :employee="employee"
          :salary-slip-summary="salarySlipSummary"
        />
      </el-col>
      <el-col :span="8">
        <HrmHomeCalendar
          ref="calendarRef"
          :get-calendar-items="getEmployeeHomeCalendar"
          :show-item-time="isCalendarItemTimeVisible"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getEmployee } from '@/api/hrm/portal/employee'
import { getEmployeeHomeCalendar } from '@/api/hrm/portal/home/calendar'
import { getUnreadSalarySlipSummary } from '@/api/hrm/portal/salary/slip'
import HrmHomeCalendar from '@/views/hrm/home/components/HrmHomeCalendar.vue'
import { HrmHomeCalendarItemType } from '@/views/hrm/utils/constants'
import { checkHrmPortalAccess } from '@/views/hrm/portal/utils/access'
import EmployeeSurvey from './EmployeeSurvey.vue'

export default {
  name: 'HrmPortalHome',
  components: { HrmHomeCalendar, EmployeeSurvey },
  data() {
    return { accessible: false, loading: false, employee: undefined, salarySlipSummary: undefined }
  },
  async activated() {
    this.accessible = await checkHrmPortalAccess(this.$router)
    if (!this.accessible) return
    await this.$nextTick()
    await this.refreshAll()
  },
  methods: {
    getEmployeeHomeCalendar,
    isCalendarItemTimeVisible(item) {
      return item.type === HrmHomeCalendarItemType.NOTE
    },
    async refreshAll() {
      this.loading = true
      try {
        const results = await Promise.all([
          getEmployee(),
          getUnreadSalarySlipSummary(),
          this.$refs.calendarRef && this.$refs.calendarRef.refresh()
        ])
        this.employee = results[0].data
        this.salarySlipSummary = results[1].data
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
