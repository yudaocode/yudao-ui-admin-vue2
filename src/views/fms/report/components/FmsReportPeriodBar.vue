<template>
  <el-form class="fms-report-period-bar" :inline="true" label-width="68px">
    <el-form-item label="报表周期">
      <el-radio-group v-model="periodType" @change="emitQuery">
        <el-radio-button label="month">月报</el-radio-button>
        <el-radio-button label="quarter">季报</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="会计期间">
      <el-date-picker
        v-model="reportMonth"
        :clearable="false"
        :picker-options="pickerOptions"
        :placeholder="periodType === 'month' ? '选择月份' : '选择季度内月份'"
        type="month"
        value-format="yyyy-MM"
        @change="emitQuery"
      />
    </el-form-item>
    <el-form-item>
      <el-button icon="el-icon-refresh" @click="emitQuery">刷新</el-button>
      <slot />
    </el-form-item>
  </el-form>
</template>

<script>
import { getAccountSet } from '@/api/fms/config/account-set'
import { useFmsStore } from '@/views/fms/store/fms'

export default {
  name: 'FmsReportPeriodBar',
  data() {
    return {
      fmsStore: useFmsStore(),
      periodType: 'month',
      reportMonth: this.formatMonth(new Date()),
      startMonth: this.formatMonth(new Date()),
      currentMonth: this.formatMonth(new Date()),
      requestSequence: 0,
      pickerOptions: { disabledDate: date => this.disabledDate(date) }
    }
  },
  computed: {
    accountSetId() {
      return this.fmsStore.getAccountSetId
    }
  },
  watch: {
    accountSetId: { immediate: true, handler: 'initializePeriod' }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    initializePeriod() {
      const accountSetId = Number(this.accountSetId) || 0
      const sequence = ++this.requestSequence
      if (!accountSetId) return Promise.resolve()
      return Promise.all([
        this.fmsStore.loadCurrentMonth(),
        getAccountSet(accountSetId)
      ]).then(responses => {
        if (sequence !== this.requestSequence || accountSetId !== Number(this.accountSetId)) return
        const currentMonth = responses[0]
        const accountSet = responses[1].data
        this.startMonth = this.formatMonth(accountSet && accountSet.startTime) || this.formatMonth(new Date())
        this.currentMonth = /^\d{4}-\d{2}$/.test(String(currentMonth || ''))
          ? String(currentMonth)
          : this.formatMonth(new Date())
        this.reportMonth = this.currentMonth
        this.emitQuery()
      })
    },
    disabledDate(date) {
      const month = this.formatMonth(date)
      return month < this.startMonth || month > this.currentMonth
    },
    emitQuery() {
      if (!this.accountSetId || !/^\d{4}-\d{2}$/.test(String(this.reportMonth || ''))) return
      const parts = this.reportMonth.split('-').map(Number)
      const year = parts[0]
      const month = parts[1]
      if (this.periodType === 'month') {
        this.$emit('query', {
          startMonth: this.reportMonth,
          endMonth: this.reportMonth,
          label: year + '年' + String(month).padStart(2, '0') + '月'
        })
        return
      }
      const quarter = Math.floor((month - 1) / 3) + 1
      const start = (quarter - 1) * 3 + 1
      this.$emit('query', {
        startMonth: year + '-' + String(start).padStart(2, '0'),
        endMonth: year + '-' + String(start + 2).padStart(2, '0'),
        label: year + '年第' + quarter + '季度'
      })
    },
    formatMonth(value) {
      if (!value) return ''
      const text = String(value)
      const matched = text.match(/^(\d{4})-(\d{2})/)
      if (matched) return matched[1] + '-' + matched[2]
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return ''
      return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0')
    }
  }
}
</script>

<style scoped>
.fms-report-period-bar { margin-bottom: -15px; }
@media (max-width: 900px) {
  .fms-report-period-bar ::v-deep .el-form-item { display: flex; margin-right: 0; }
  .fms-report-period-bar ::v-deep .el-form-item__content { flex: 1; min-width: 0; }
}
</style>
