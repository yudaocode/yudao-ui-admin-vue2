<template>
  <div class="app-container">
    <el-card shadow="never">
      <el-page-header
        :content="formatHrmYearMonth(record.year, record.month) + ' 工资条发放详情'"
        @back="close"
      />
    </el-card>
    <salary-slip-list
      v-if="record.id"
      v-loading="loading"
      :send-record-id="record.id"
      class="detail-list"
    />
  </div>
</template>

<script>
import { getSalarySlipSendRecord } from '@/api/hrm/salary/slip/send-record'
import { formatHrmYearMonth } from '@/views/hrm/utils/format'
import SalarySlipList from './SalarySlipList.vue'

export default {
  name: 'HrmSalarySlipSendRecordDetail',
  components: { SalarySlipList },
  data() {
    return {
      recordId: Number(this.$route.params.id),
      loading: false,
      record: {}
    }
  },
  created() { this.getRecord() },
  methods: {
    formatHrmYearMonth,
    close() {
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({ name: 'HrmSalarySlipSendRecord' })
    },
    async getRecord() {
      this.loading = true
      try {
        const response = await getSalarySlipSendRecord(this.recordId)
        this.record = response.data
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>.detail-list { margin-top: 16px; }</style>
