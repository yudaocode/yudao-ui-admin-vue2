<template>
  <div class="app-container fms-balance-sheet-page">
    <doc-alert title="【报表】财务报表" url="https://doc.iocoder.cn/fms/report/" />

    <el-card class="toolbar-card" shadow="never">
      <fms-report-period-bar @query="handleQuery">
        <fms-report-print-button
          v-hasPermi="['fms:report:balance-sheet:print']"
          :disabled="!queryParams.endMonth"
          :period-label="periodLabel"
          target="fms-balance-sheet-table"
          title="资产负债表"
        />
        <el-button
          v-hasPermi="['fms:report:balance-sheet:export']"
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
      <fms-report-check-alert :report-type="FMS_REPORT_TYPE.BALANCE_SHEET" :result="checkResult" />
      <el-table
        id="fms-balance-sheet-table"
        v-loading="loading"
        :data="list"
        border
        height="calc(100vh - 290px)"
      >
        <el-table-column label="资产" min-width="210">
          <template slot-scope="scope">
            <div class="item-cell">
              <span :class="itemClass(scope.row.assetLevel, scope.row.assetEditable, scope.row.assetRowNo)">
                {{ scope.row.assetName }}
              </span>
              <el-button
                v-if="scope.row.assetEditable && isWritable"
                v-hasPermi="['fms:report:balance-sheet:update']"
                icon="el-icon-edit-outline"
                title="编辑公式"
                type="text"
                @click="openFormula(scope.row, true)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="行次" width="64">
          <template slot-scope="scope">{{ scope.row.assetRowNo || '' }}</template>
        </el-table-column>
        <el-table-column align="right" label="期末余额" width="140">
          <template slot-scope="scope">{{ formatMoney(scope.row.assetClosingAmount) }}</template>
        </el-table-column>
        <el-table-column align="right" label="年初余额" width="140">
          <template slot-scope="scope">{{ formatMoney(scope.row.assetOpeningAmount) }}</template>
        </el-table-column>
        <el-table-column label="负债和所有者权益" min-width="250">
          <template slot-scope="scope">
            <div class="item-cell">
              <span :class="itemClass(scope.row.liabilityLevel, scope.row.liabilityEditable, scope.row.liabilityRowNo)">
                {{ scope.row.liabilityName }}
              </span>
              <el-button
                v-if="scope.row.liabilityEditable && isWritable"
                v-hasPermi="['fms:report:balance-sheet:update']"
                icon="el-icon-edit-outline"
                title="编辑公式"
                type="text"
                @click="openFormula(scope.row, false)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="行次" width="64">
          <template slot-scope="scope">{{ scope.row.liabilityRowNo || '' }}</template>
        </el-table-column>
        <el-table-column align="right" label="期末余额" width="140">
          <template slot-scope="scope">{{ formatMoney(scope.row.liabilityClosingAmount) }}</template>
        </el-table-column>
        <el-table-column align="right" label="年初余额" width="140">
          <template slot-scope="scope">{{ formatMoney(scope.row.liabilityOpeningAmount) }}</template>
        </el-table-column>
      </el-table>
    </el-card>

    <fms-report-formula-form ref="formulaForm" @success="getList" />
  </div>
</template>

<script>
import { FmsBalanceSheetApi } from '@/api/fms/report/balanceSheet'
import FmsReportCheckAlert from '@/views/fms/report/components/FmsReportCheckAlert.vue'
import FmsReportFormulaForm from '@/views/fms/report/components/FmsReportFormulaForm.vue'
import FmsReportPeriodBar from '@/views/fms/report/components/FmsReportPeriodBar.vue'
import FmsReportPrintButton from '@/views/fms/report/components/FmsReportPrintButton.vue'
import { useFmsStore } from '@/views/fms/store/fms'
import { FMS_REPORT_TYPE } from '@/views/fms/utils/constants'

import { formatMoney } from '@/views/fms/utils/format'

export default {
  name: 'FmsBalanceSheet',
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
        FmsBalanceSheetApi.getBalanceSheet(params),
        FmsBalanceSheetApi.checkBalanceSheet(params)
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
      FmsBalanceSheetApi.exportBalanceSheet(this.queryParams).then(response => {
        this.$download.excel(response.data, '资产负债表-' + this.periodLabel + '.xls')
      }).finally(() => {
        this.exportLoading = false
      })
    },
    itemClass(level, editable, rowNo) {
      return {
        'level-two': Number(level) === 2,
        'level-three': Number(level) === 3,
        'summary-item': !editable && rowNo
      }
    },
    openFormula(row, asset) {
      const item = {
        id: asset ? row.assetId : row.liabilityId,
        name: asset ? row.assetName : row.liabilityName,
        formula: asset ? row.assetFormula : row.liabilityFormula
      }
      this.$refs.formulaForm.open(item, 'balance')
    },
    formatMoney
  }
}
</script>

<style scoped>
.toolbar-card { margin-bottom: 16px; }
.report-card { min-width: 0; }
.item-cell { display: flex; align-items: center; gap: 4px; }
.level-two { padding-left: 16px; }
.level-three { padding-left: 32px; }
.summary-item { font-weight: 600; }
</style>
