<template>
  <el-alert
    v-if="result"
    class="fms-report-check-alert"
    :closable="false"
    :type="passed ? 'success' : 'warning'"
    show-icon
  >
    <template slot="title">{{ passed ? reportName + '检查通过' : reportName + '检查发现问题' }}</template>
    <div v-if="!passed" class="check-details">
      <div v-if="result.balanced === false && reportType !== FMS_REPORT_TYPE.INCOME_STATEMENT">
        资产负债表不平衡：年初差额
        {{ formatCheckAmount(result.openingDifferenceAmount) }}，期末差额
        {{ formatCheckAmount(result.closingDifferenceAmount) }}
        <el-button
          v-if="reportType === FMS_REPORT_TYPE.CASH_FLOW_STATEMENT"
          type="text"
          @click="$router.push('/fms/report/balance-sheet')"
        >查看资产负债表</el-button>
      </div>
      <div v-if="result.balanced === false && reportType === FMS_REPORT_TYPE.INCOME_STATEMENT">
        净利润与未分配利润变动不一致，勾稽差额
        {{ formatCheckAmount(result.differenceAmount) }}
        <el-button type="text" @click="$router.push('/fms/report/balance-sheet')">查看资产负债表</el-button>
      </div>
      <div v-if="result.initialBalanceBalanced === false">
        初始余额试算不平衡
        <el-button type="text" @click="$router.push('/fms/config/initial-balance')">处理初始余额</el-button>
      </div>
      <div v-if="result.profitLossTransferred === false">
        查询期间存在尚未结转的损益余额
        <el-button type="text" @click="$router.push('/fms/closing/period')">前往结转损益</el-button>
      </div>
      <div v-if="unmappedSubjects.length">
        {{ unmappedSubjects.length }} 个一级科目尚未纳入报表公式：{{ unmappedSubjectText }}
        <el-button
          v-if="reportType === FMS_REPORT_TYPE.CASH_FLOW_STATEMENT"
          type="text"
          @click="$router.push('/fms/report/balance-sheet')"
        >查看报表公式</el-button>
        <span v-else>，请编辑当前报表公式</span>
      </div>
    </div>
  </el-alert>
</template>

<script>
import { FMS_REPORT_TYPE } from '@/views/fms/utils/constants'
import { formatMoney } from '@/views/fms/utils/format'

export default {
  name: 'FmsReportCheckAlert',
  props: {
    result: { type: Object, default: null },
    reportType: { type: Number, required: true }
  },
  data() {
    return { FMS_REPORT_TYPE }
  },
  computed: {
    reportName() {
      if (this.reportType === FMS_REPORT_TYPE.INCOME_STATEMENT) return '利润表'
      if (this.reportType === FMS_REPORT_TYPE.CASH_FLOW_STATEMENT) return '现金流量表'
      return '资产负债表'
    },
    unmappedSubjects() {
      return this.result && Array.isArray(this.result.unmappedSubjects)
        ? this.result.unmappedSubjects
        : []
    },
    passed() {
      if (!this.result) return false
      if (this.reportType === FMS_REPORT_TYPE.CASH_FLOW_STATEMENT) {
        return this.result.balanceSheetReady === true
      }
      return this.result.balanced === true && this.unmappedSubjects.length === 0 &&
        (this.reportType === FMS_REPORT_TYPE.INCOME_STATEMENT ||
          (this.result.initialBalanceBalanced === true && this.result.profitLossTransferred === true))
    },
    unmappedSubjectText() {
      const text = this.unmappedSubjects.slice(0, 5)
        .map(subject => subject.code + ' ' + subject.name)
        .join('、')
      return this.unmappedSubjects.length > 5 ? text + ' 等' : text
    }
  },
  methods: {
    formatCheckAmount(amount) {
      return formatMoney(Math.abs(Number(amount || 0))) || '0.00'
    }
  }
}
</script>

<style scoped>
.fms-report-check-alert { margin-bottom: 12px; }
.fms-report-check-alert ::v-deep .el-alert__content { width: 100%; }
.check-details { display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }
</style>
