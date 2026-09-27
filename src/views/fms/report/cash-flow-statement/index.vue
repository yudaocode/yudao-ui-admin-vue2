<template>
  <div class="app-container fms-cash-flow-statement-page">
    <doc-alert title="【报表】财务报表" url="https://doc.iocoder.cn/fms/report/" />

    <el-card class="toolbar-card" shadow="never">
      <el-form v-if="statementAdjustmentMode || adjustmentMode" class="adjustment-toolbar" :inline="true">
        <el-form-item>
          <el-button
            v-if="adjustmentMode && isWritable"
            v-hasPermi="['fms:report:cash-flow-statement:update']"
            :loading="submitting"
            type="primary"
            @click="saveAdjustment(true)"
          >下一步</el-button>
          <el-button
            v-if="adjustmentMode && isWritable"
            v-hasPermi="['fms:report:cash-flow-statement:update']"
            :disabled="submitting"
            @click="clearAdjustment"
          >清空并重算</el-button>
          <el-button v-if="adjustmentMode" :disabled="submitting" @click="closeAdjustment">返回</el-button>
          <el-button
            v-if="statementAdjustmentMode && isWritable"
            v-hasPermi="['fms:report:cash-flow-statement:update']"
            :loading="submitting"
            type="primary"
            @click="saveStatementAdjustment"
          >保存</el-button>
          <el-button
            v-if="statementAdjustmentMode && isWritable"
            :disabled="submitting"
            @click="returnToAdjustment"
          >上一步</el-button>
          <el-button
            v-if="statementAdjustmentMode && isWritable"
            v-hasPermi="['fms:report:cash-flow-statement:update']"
            :disabled="submitting"
            @click="clearStatementAdjustment"
          >清空并重算</el-button>
          <fms-report-print-button
            v-hasPermi="['fms:report:cash-flow-statement:print']"
            :disabled="!queryParams.endMonth || loading"
            :period-label="periodLabel"
            target="fms-cash-flow-statement-table"
            title="现金流量表"
          />
          <el-button
            v-hasPermi="['fms:report:cash-flow-statement:export']"
            :disabled="!queryParams.endMonth"
            :loading="exportLoading"
            icon="el-icon-download"
            plain
            type="success"
            @click="handleExport"
          >导出</el-button>
        </el-form-item>
      </el-form>
      <fms-report-period-bar v-else @query="handleQuery">
        <fms-report-print-button
          v-hasPermi="['fms:report:cash-flow-statement:print']"
          :disabled="!queryParams.endMonth"
          :period-label="periodLabel"
          target="fms-cash-flow-statement-table"
          title="现金流量表"
        />
        <el-button
          v-hasPermi="['fms:report:cash-flow-statement:export']"
          :disabled="!queryParams.endMonth"
          :loading="exportLoading"
          icon="el-icon-download"
          plain
          type="success"
          @click="handleExport"
        >导出</el-button>
        <el-button
          v-if="isWritable"
          v-hasPermi="['fms:report:cash-flow-statement:update']"
          type="primary"
          @click="openAdjustment"
        >调整</el-button>
      </fms-report-period-bar>
    </el-card>

    <el-card class="report-card" shadow="never">
      <fms-report-check-alert
        v-if="!adjustmentMode && !statementAdjustmentMode"
        :report-type="FMS_REPORT_TYPE.CASH_FLOW_STATEMENT"
        :result="checkResult"
      />
      <el-alert
        v-if="adjustmentMode"
        class="mode-alert"
        :closable="false"
        show-icon
        title="辅助数据用于现金流量表 EX 项取数；可编辑公式或直接调整本期、本年金额"
        type="info"
      />
      <el-alert
        v-if="statementAdjustmentMode"
        class="mode-alert"
        :closable="false"
        show-icon
        title="可直接调整非行次公式项目；金额为 0 时重新按公式计算"
        type="warning"
      />
      <el-table
        id="fms-cash-flow-statement-table"
        v-loading="loading"
        :data="adjustmentMode ? adjustmentList : list"
        border
        height="calc(100vh - 300px)"
      >
        <el-table-column label="项目" min-width="480">
          <template slot-scope="scope">
            <div :class="itemClass(scope.row)">
              <span>{{ scope.row.name }}</span>
              <el-tooltip
                v-if="adjustmentMode && scope.row.remark"
                :content="scope.row.remark"
                placement="top"
              >
                <i class="el-icon-question remark-icon" />
              </el-tooltip>
              <el-button
                v-if="adjustmentMode && scope.row.editable && isWritable"
                v-hasPermi="['fms:report:cash-flow-statement:update']"
                class="formula-button"
                icon="el-icon-edit"
                title="编辑公式"
                type="text"
                @click="openFormula(scope.row)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="行次" width="90">
          <template slot-scope="scope">{{ scope.row.rowNo || '' }}</template>
        </el-table-column>
        <el-table-column :label="adjustmentMode ? '本年数' : '本年累计金额'" align="right" min-width="180">
          <template slot-scope="scope">
            <el-input-number
              v-if="adjustmentMode && scope.row.editable"
              v-model="scope.row.yearAmount"
              :controls="false"
              :precision="2"
              class="amount-input"
              @change="recalculateAdjustmentLineItems"
            />
            <el-input-number
              v-else-if="statementAdjustmentMode && isAmountAdjustable(scope.row)"
              v-model="scope.row.yearAmount"
              :controls="false"
              :precision="2"
              class="amount-input"
            />
            <span v-else>{{ formatMoney(scope.row.yearAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="adjustmentMode ? '本期数' : '本期金额'" align="right" min-width="180">
          <template slot-scope="scope">
            <el-input-number
              v-if="adjustmentMode && scope.row.editable"
              v-model="scope.row.currentAmount"
              :controls="false"
              :precision="2"
              class="amount-input"
              @change="recalculateAdjustmentLineItems"
            />
            <el-input-number
              v-else-if="statementAdjustmentMode && isAmountAdjustable(scope.row)"
              v-model="scope.row.currentAmount"
              :controls="false"
              :precision="2"
              class="amount-input"
            />
            <span v-else>{{ formatMoney(scope.row.currentAmount) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="adjustmentMode" class="adjustment-total">共 {{ adjustmentList.length }} 条</div>
    </el-card>

    <fms-report-formula-form
      ref="formulaForm"
      @success="getAdjustmentList"
    />
  </div>
</template>

<script>
import { FmsCashFlowStatementApi } from '@/api/fms/report/cashFlowStatement'
import FmsReportCheckAlert from '@/views/fms/report/components/FmsReportCheckAlert.vue'
import FmsReportFormulaForm from '@/views/fms/report/components/FmsReportFormulaForm.vue'
import FmsReportPeriodBar from '@/views/fms/report/components/FmsReportPeriodBar.vue'
import FmsReportPrintButton from '@/views/fms/report/components/FmsReportPrintButton.vue'
import { useFmsStore } from '@/views/fms/store/fms'
import { FMS_REPORT_TYPE } from '@/views/fms/utils/constants'

import { formatMoney } from '@/views/fms/utils/format'

export default {
  name: 'FmsCashFlowStatement',
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
      submitting: false,
      adjustmentMode: false,
      statementAdjustmentMode: false,
      list: [],
      checkResult: null,
      adjustmentList: [],
      periodLabel: '',
      queryParams: { accountSetId: 0, startMonth: '', endMonth: '' },
      listRequestSequence: 0,
      adjustmentRequestSequence: 0
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
    accountSetId() {
      this.adjustmentMode = false
      this.statementAdjustmentMode = false
      this.getList()
    }
  },
  beforeDestroy() {
    this.listRequestSequence += 1
    this.adjustmentRequestSequence += 1
  },
  methods: {
    handleQuery(value) {
      this.periodLabel = value.label
      Object.assign(this.queryParams, value, { accountSetId: Number(this.accountSetId) || 0 })
      return this.getList()
    },
    getList() {
      const accountSetId = Number(this.accountSetId) || 0
      const sequence = ++this.listRequestSequence
      if (!accountSetId || !this.queryParams.endMonth) {
        this.list = []
        this.checkResult = null
        return Promise.resolve()
      }
      const params = Object.assign({}, this.queryParams, { accountSetId })
      this.loading = true
      return Promise.all([
        FmsCashFlowStatementApi.getCashFlowStatement(params),
        FmsCashFlowStatementApi.checkCashFlowStatement(params)
      ]).then(responses => {
        if (sequence !== this.listRequestSequence || accountSetId !== Number(this.accountSetId)) return
        this.list = responses[0].data
        this.checkResult = responses[1].data
      }).finally(() => {
        if (sequence === this.listRequestSequence) this.loading = false
      })
    },
    handleExport() {
      if (!this.queryParams.endMonth) return
      this.exportLoading = true
      FmsCashFlowStatementApi.exportCashFlowStatement(this.queryParams).then(response => {
        this.$download.excel(response.data, '现金流量表-' + this.periodLabel + '.xls')
      }).finally(() => {
        this.exportLoading = false
      })
    },
    openAdjustment() {
      this.statementAdjustmentMode = false
      this.adjustmentMode = true
      return this.getAdjustmentList()
    },
    saveStatementAdjustment() {
      const items = this.list.filter(this.isAmountAdjustable).map(item => ({
        id: item.id,
        currentAmount: Number(item.currentAmount || 0),
        yearAmount: Number(item.yearAmount || 0)
      }))
      if (!this.accountSetId || !items.length || !this.isWritable) return
      this.submitting = true
      FmsCashFlowStatementApi.updateCashFlowStatement(Object.assign({}, this.queryParams, { items })).then(() => {
        this.$modal.msgSuccess('保存成功')
        this.statementAdjustmentMode = false
        return this.getList()
      }).finally(() => {
        this.submitting = false
      })
    },
    clearStatementAdjustment() {
      this.list.filter(this.isAmountAdjustable).forEach(item => {
        item.currentAmount = 0
        item.yearAmount = 0
      })
    },
    getAdjustmentList() {
      const accountSetId = Number(this.accountSetId) || 0
      const sequence = ++this.adjustmentRequestSequence
      if (!accountSetId || !this.queryParams.endMonth) {
        this.adjustmentList = []
        return Promise.resolve()
      }
      const params = Object.assign({}, this.queryParams, { accountSetId })
      this.loading = true
      return FmsCashFlowStatementApi.getCashFlowAdjustmentList(params).then(response => {
        if (sequence !== this.adjustmentRequestSequence || accountSetId !== Number(this.accountSetId)) return
        const list = response.data
        this.adjustmentList = list
      }).finally(() => {
        if (sequence === this.adjustmentRequestSequence) this.loading = false
      })
    },
    saveAdjustment(next = false) {
      const items = this.adjustmentList.filter(item => item.editable).map(item => ({
        id: item.id,
        currentAmount: Number(item.currentAmount || 0),
        yearAmount: Number(item.yearAmount || 0)
      }))
      if (!this.accountSetId || !items.length || !this.isWritable) return
      this.submitting = true
      FmsCashFlowStatementApi.updateCashFlowAdjustment({
        accountSetId: Number(this.accountSetId),
        items
      }).then(() => {
        this.$modal.msgSuccess('保存成功')
        this.adjustmentMode = false
        this.statementAdjustmentMode = Boolean(next)
        return this.getList()
      }).finally(() => {
        this.submitting = false
      })
    },
    clearAdjustment() {
      this.adjustmentList.filter(item => item.editable).forEach(item => {
        item.currentAmount = 0
        item.yearAmount = 0
      })
      this.recalculateAdjustmentLineItems()
    },
    recalculateAdjustmentLineItems() {
      const lineMap = new Map(this.adjustmentList.map(item => [item.rowNo, item]))
      this.adjustmentList.forEach(item => {
        if (!item.formula || !item.formula.includes('L')) return
        item.currentAmount = this.calculateAdjustmentLineAmount(item.formula, lineMap, 'currentAmount')
        item.yearAmount = this.calculateAdjustmentLineAmount(item.formula, lineMap, 'yearAmount')
        lineMap.set(item.rowNo, item)
      })
    },
    calculateAdjustmentLineAmount(formula, lineMap, amountField) {
      let expressions
      try {
        expressions = JSON.parse(formula)
      } catch (error) {
        return 0
      }
      if (!Array.isArray(expressions) || typeof expressions[0] !== 'string') return 0
      let amount = 0
      const pattern = /([+-]?)(L\d+)/g
      let match = pattern.exec(expressions[0])
      while (match) {
        const row = lineMap.get(Number(match[2].slice(1)))
        const rowAmount = Number(row && row[amountField] || 0)
        amount += match[1] === '-' ? -rowAmount : rowAmount
        match = pattern.exec(expressions[0])
      }
      return Number(amount.toFixed(2))
    },
    closeAdjustment() {
      this.adjustmentMode = false
      this.adjustmentList = []
      return this.getList()
    },
    returnToAdjustment() {
      this.statementAdjustmentMode = false
      this.adjustmentMode = true
      return this.getAdjustmentList()
    },
    isAmountAdjustable(item) {
      return Boolean(item.rowNo && (!item.formula || !item.formula.includes('L')))
    },
    openFormula(item) {
      this.$refs.formulaForm.open(item, 'cash-flow')
    },
    itemClass(item) {
      return {
        'item-cell': true,
        'level-two': Number(item.level) === 2,
        'level-three': Number(item.level) === 3,
        'summary-item': !item.editable
      }
    },
    formatMoney
  }
}
</script>

<style scoped>
.toolbar-card { margin-bottom: 16px; }
.adjustment-toolbar { margin-bottom: -15px; }
.report-card { min-width: 0; }
.mode-alert { margin-bottom: 16px; }
.item-cell { display: flex; align-items: center; min-height: 32px; }
.level-two { padding-left: 20px; }
.level-three { padding-left: 40px; }
.summary-item { font-weight: 600; }
.remark-icon { margin-left: 6px; color: #c0c4cc; }
.formula-button { margin-left: 8px; }
.amount-input { width: 100%; }
.amount-input ::v-deep .el-input__inner { text-align: right; }
.adjustment-total { padding: 12px 16px 0; color: #909399; text-align: right; }
</style>
