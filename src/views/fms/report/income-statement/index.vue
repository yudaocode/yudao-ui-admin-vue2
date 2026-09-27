<template>
  <div class="app-container fms-income-statement-page">
    <doc-alert title="【报表】财务报表" url="https://doc.iocoder.cn/fms/report/" />

    <el-card class="toolbar-card" shadow="never">
      <fms-report-period-bar @query="handleQuery">
        <fms-report-print-button
          v-hasPermi="['fms:report:income-statement:print']"
          :disabled="!queryParams.endMonth"
          :period-label="periodLabel"
          target="fms-income-statement-table"
          title="利润表"
        />
        <el-button
          v-hasPermi="['fms:report:income-statement:export']"
          :disabled="!queryParams.endMonth"
          :loading="exportLoading"
          icon="el-icon-download"
          plain
          type="success"
          @click="handleExport"
        >导出</el-button>
      </fms-report-period-bar>
    </el-card>

    <el-card class="report-card" shadow="never">
      <fms-report-check-alert :report-type="FMS_REPORT_TYPE.INCOME_STATEMENT" :result="checkResult" />
      <el-table
        id="fms-income-statement-table"
        v-loading="loading"
        :data="list"
        border
        height="calc(100vh - 290px)"
      >
        <el-table-column label="项目" min-width="420">
          <template slot-scope="scope">
            <div class="item-cell">
              <span :class="itemClass(scope.row)">{{ scope.row.name }}</span>
              <el-button
                v-if="scope.row.editable && isWritable"
                v-hasPermi="['fms:report:income-statement:update']"
                icon="el-icon-edit-outline"
                title="编辑公式"
                type="text"
                @click="openFormula(scope.row)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="行次" prop="rowNo" width="90" />
        <el-table-column align="right" label="本年累计金额" min-width="180">
          <template slot-scope="scope">{{ formatMoney(scope.row.yearAmount) }}</template>
        </el-table-column>
        <el-table-column align="right" label="本期金额" min-width="180">
          <template slot-scope="scope">{{ formatMoney(scope.row.currentAmount) }}</template>
        </el-table-column>
      </el-table>
    </el-card>

    <fms-report-formula-form ref="formulaForm" @success="getList" />
  </div>
</template>

<script>
import { FmsIncomeStatementApi } from '@/api/fms/report/incomeStatement'
import FmsReportCheckAlert from '@/views/fms/report/components/FmsReportCheckAlert.vue'
import FmsReportFormulaForm from '@/views/fms/report/components/FmsReportFormulaForm.vue'
import FmsReportPeriodBar from '@/views/fms/report/components/FmsReportPeriodBar.vue'
import FmsReportPrintButton from '@/views/fms/report/components/FmsReportPrintButton.vue'
import { useFmsStore } from '@/views/fms/store/fms'
import { FMS_REPORT_TYPE } from '@/views/fms/utils/constants'

import { formatMoney } from '@/views/fms/utils/format'

export default {
  name: 'FmsIncomeStatement',
  components: {
    FmsReportCheckAlert,
    FmsReportFormulaForm,
    FmsReportPeriodBar,
    FmsReportPrintButton
  },
  data() {
    return {
      FMS_REPORT_TYPE,
      fmsStore: useFmsStore(),
      loading: false,
      exportLoading: false,
      list: [],
      checkResult: null,
      periodLabel: '',
      queryParams: { accountSetId: 0, startMonth: '', endMonth: '' },
      requestSequence: 0
    }
  },
  computed: {
    accountSetId() {
      return this.fmsStore.getAccountSetId
    },
    isWritable() {
      return this.fmsStore.isAccountSetWritable
    }
  },
  watch: {
    accountSetId() { this.getList() }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    handleQuery(value) {
      this.periodLabel = value.label
      Object.assign(this.queryParams, value, { accountSetId: Number(this.accountSetId) || 0 })
      return this.getList()
    },
    getList() {
      const accountSetId = Number(this.accountSetId) || 0
      const sequence = ++this.requestSequence
      if (!accountSetId || !this.queryParams.endMonth) {
        this.list = []
        this.checkResult = null
        return Promise.resolve()
      }
      const params = Object.assign({}, this.queryParams, { accountSetId })
      this.loading = true
      return Promise.all([
        FmsIncomeStatementApi.getIncomeStatement(params),
        FmsIncomeStatementApi.checkIncomeStatement(params)
      ]).then(responses => {
        if (sequence !== this.requestSequence || accountSetId !== Number(this.accountSetId)) return
        this.list = responses[0].data
        this.checkResult = responses[1].data
      }).finally(() => {
        if (sequence === this.requestSequence) this.loading = false
      })
    },
    handleExport() {
      if (!this.queryParams.endMonth) return
      this.exportLoading = true
      FmsIncomeStatementApi.exportIncomeStatement(this.queryParams).then(response => {
        this.$download.excel(response.data, '利润表-' + this.periodLabel + '.xls')
      }).finally(() => {
        this.exportLoading = false
      })
    },
    itemClass(item) {
      return {
        'level-two': Number(item.level) === 2,
        'level-three': Number(item.level) === 3,
        'summary-item': !item.editable
      }
    },
    openFormula(item) {
      this.$refs.formulaForm.open(item, 'income')
    },
    formatMoney
  }
}
</script>

<style scoped>
.toolbar-card { margin-bottom: 16px; }
.report-card { min-width: 0; }
.item-cell { display: flex; align-items: center; gap: 4px; }
.level-two { padding-left: 20px; }
.level-three { padding-left: 40px; }
.summary-item { font-weight: 600; }
</style>
