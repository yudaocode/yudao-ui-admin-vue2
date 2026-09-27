<template>
  <div class="app-container">
    <el-card
      class="block-card"
      shadow="never"
    >
      <el-page-header
        :content="record.title || '历史工资表详情'"
        @back="close"
      />
    </el-card>
    <salary-month-record-details-info
      :loading="loading"
      :record="record"
      class="block-card"
    />
    <salary-month-employee-record-list
      v-if="record.id"
      :record="record"
      class="block-card"
    />
  </div>
</template>

<script>
import { getSalaryMonthRecord } from '@/api/hrm/salary/month-record'
import { HrmSalaryMonthStatus } from '@/views/hrm/utils/constants'
import SalaryMonthEmployeeRecordList from './SalaryMonthEmployeeRecordList.vue'
import SalaryMonthRecordDetailsInfo from './SalaryMonthRecordDetailsInfo.vue'

export default {
  name: 'HrmSalaryHistoryDetail',
  components: { SalaryMonthEmployeeRecordList, SalaryMonthRecordDetailsInfo },
  data() {
    return {
      recordId: Number(this.$route.params.id),
      loading: true,
      record: {}
    }
  },
  created() { this.init() },
  methods: {
    close() {
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({ name: 'HrmSalaryHistory' })
    },
    async getRecord() {
      this.loading = true
      try {
        const response = await getSalaryMonthRecord(this.recordId)
        if (!response.data || response.data.status !== HrmSalaryMonthStatus.HISTORY) {
          this.$modal.msgWarning('历史工资表不存在')
          this.close()
          return
        }
        this.record = response.data
      } finally {
        this.loading = false
      }
    },
    async init() {
      if (!Number.isSafeInteger(this.recordId) || this.recordId <= 0) {
        this.$modal.msgWarning('参数错误，历史工资表不能为空！')
        this.close()
        return
      }
      await this.getRecord()
    }
  }
}
</script>

<style scoped>.block-card { margin-top: 16px; }</style>
