<template>
  <el-dialog
    :title="'编辑公式——' + (currentItem ? currentItem.name : '')"
    :visible.sync="dialogVisible"
    append-to-body
    width="900px"
  >
    <div v-loading="loading">
      <el-form class="formula-toolbar" :inline="true">
        <el-form-item label="科目">
          <fms-subject-select
            v-model="subjectId"
            :options="enabledSubjects"
            class="subject-select"
          />
        </el-form-item>
        <el-form-item label="取数规则">
          <el-select v-model="rules" class="rule-select">
            <el-option
              v-for="option in ruleOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="运算符号">
          <el-radio-group v-model="operator">
            <el-radio label="+">+</el-radio>
            <el-radio label="-">-</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addFormula">添加</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="formulaList"
        :summary-method="getSummaries"
        border
        class="formula-table"
        max-height="320"
        show-summary
      >
        <el-table-column label="科目" min-width="240">
          <template slot-scope="scope">
            {{ scope.row.subjectNumber }} {{ scope.row.subjectName }}
            <el-tag v-if="!scope.row.subjectId" class="invalid-tag" size="mini" type="danger">科目已失效</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="运算符号" prop="operator" width="90" />
        <el-table-column label="取数规则" width="150">
          <template slot-scope="scope">{{ getRuleName(scope.row.rules) }}</template>
        </el-table-column>
        <el-table-column v-if="formulaType === 'balance'" align="right" label="期末数">
          <template slot-scope="scope">{{ formatMoney(scope.row.closingAmount) }}</template>
        </el-table-column>
        <el-table-column v-if="formulaType === 'balance'" align="right" label="年初数">
          <template slot-scope="scope">{{ formatMoney(scope.row.openingAmount) }}</template>
        </el-table-column>
        <el-table-column v-if="formulaType !== 'balance'" align="right" label="本期金额">
          <template slot-scope="scope">{{ formatMoney(scope.row.currentAmount) }}</template>
        </el-table-column>
        <el-table-column v-if="formulaType !== 'balance'" align="right" label="本年累计金额">
          <template slot-scope="scope">{{ formatMoney(scope.row.yearAmount) }}</template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="80">
          <template slot-scope="scope">
            <el-button class="danger-text" type="text" @click="removeFormula(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-alert
        class="formula-warning"
        :closable="false"
        :title="formulaType === 'balance' ? '新公式将应用于当前报表和以后尚未生成的报表，不影响其他已生成的历史报表' : '新公式仅应用于当前报表，不影响其他期间报表'"
        show-icon
        type="warning"
      />
    </div>
    <div slot="footer">
      <el-button :disabled="loading" type="primary" @click="submitForm">保 存</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as FmsSubjectApi from '@/api/fms/config/subject'
import { FmsBalanceSheetApi } from '@/api/fms/report/balanceSheet'
import { FmsCashFlowStatementApi } from '@/api/fms/report/cashFlowStatement'
import { FmsIncomeStatementApi } from '@/api/fms/report/incomeStatement'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import FmsSubjectSelect from '@/views/fms/config/subject/components/FmsSubjectSelect.vue'
import { useFmsStore } from '@/views/fms/store/fms'
import {
  FMS_FORMULA_RULE,
  FMS_FORMULA_RULE_OPTIONS,
  FMS_SUBJECT_STATUS
} from '@/views/fms/utils/constants'

import { formatMoney } from '@/views/fms/utils/format'

function numberDictOptions(type, fallback) {
  const options = getDictDatas(type).map(item => ({ label: item.label, value: Number(item.value) }))
    .filter(item => Number.isFinite(item.value))
  return options.length ? options : fallback
}

export default {
  name: 'FmsReportFormulaForm',
  components: { FmsSubjectSelect },
  data() {
    const allRules = numberDictOptions(DICT_TYPE.FMS_FORMULA_RULE, FMS_FORMULA_RULE_OPTIONS)
    return {
      dialogVisible: false,
      fmsStore: useFmsStore(),
      loading: false,
      formulaType: 'balance',
      currentItem: null,
      subjects: [],
      formulaList: [],
      subjectId: undefined,
      rules: FMS_FORMULA_RULE.BALANCE,
      operator: '+',
      balanceFormulaRuleOptions: allRules.filter(item => [
        FMS_FORMULA_RULE.BALANCE,
        FMS_FORMULA_RULE.DEBIT_BALANCE,
        FMS_FORMULA_RULE.CREDIT_BALANCE
      ].includes(item.value)),
      incomeFormulaRuleOptions: allRules.filter(item => [
        FMS_FORMULA_RULE.DEBIT_AMOUNT,
        FMS_FORMULA_RULE.CREDIT_AMOUNT,
        FMS_FORMULA_RULE.PROFIT_LOSS_AMOUNT
      ].includes(item.value)),
      requestSequence: 0
    }
  },
  computed: {
    enabledSubjects() {
      return this.subjects.filter(subject => Number(subject.status) === FMS_SUBJECT_STATUS.ENABLED)
    },
    ruleOptions() {
      return this.formulaType === 'balance'
        ? this.balanceFormulaRuleOptions
        : this.incomeFormulaRuleOptions
    }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    open(item, type) {
      const accountSetId = Number(this.fmsStore.getAccountSetId) || 0
      if (!accountSetId) return Promise.resolve()
      const sequence = ++this.requestSequence
      this.dialogVisible = true
      this.loading = true
      this.formulaType = type
      this.currentItem = item
      this.subjectId = undefined
      this.operator = '+'
      this.rules = type === 'balance' ? FMS_FORMULA_RULE.BALANCE : FMS_FORMULA_RULE.DEBIT_AMOUNT
      this.formulaList = this.parseFormula(item && item.formula)
      return FmsSubjectApi.getSubjectSimpleList(accountSetId).then(response => {
        if (sequence !== this.requestSequence || accountSetId !== Number(this.fmsStore.getAccountSetId)) return
        const rows = response.data
        this.subjects = this.treeToList(rows)
      }).finally(() => {
        if (sequence === this.requestSequence) this.loading = false
      })
    },
    treeToList(tree) {
      return (tree || []).reduce((result, item) => {
        result.push(item)
        if (Array.isArray(item.children) && item.children.length) {
          result.push.apply(result, this.treeToList(item.children))
        }
        return result
      }, [])
    },
    addFormula() {
      const subject = this.subjects.find(item => Number(item.id) === Number(this.subjectId))
      if (!subject) {
        this.$modal.msgWarning('请选择科目')
        return
      }
      if (this.formulaList.some(item => Number(item.subjectId) === Number(subject.id))) {
        this.$modal.msgWarning('科目不能重复添加')
        return
      }
      this.formulaList.unshift({
        subjectId: subject.id,
        subjectName: subject.name,
        subjectNumber: subject.code,
        operator: this.operator,
        rules: this.rules,
        openingAmount: 0,
        closingAmount: 0,
        currentAmount: 0,
        yearAmount: 0
      })
      this.subjectId = undefined
    },
    removeFormula(index) {
      this.formulaList.splice(index, 1)
    },
    submitForm() {
      const accountSetId = Number(this.fmsStore.getAccountSetId) || 0
      if (!accountSetId || !this.currentItem) return
      if (this.formulaList.some(item => !item.subjectId)) {
        this.$modal.msgWarning('公式中存在已失效科目，请删除后保存')
        return
      }
      const data = {
        accountSetId,
        id: this.currentItem.id,
        formulas: this.formulaList.map(item => ({
          subjectId: item.subjectId,
          operator: item.operator,
          rules: item.rules
        }))
      }
      this.loading = true
      let operation
      if (this.formulaType === 'balance') {
        operation = FmsBalanceSheetApi.updateBalanceSheetFormula(data)
      } else if (this.formulaType === 'income') {
        operation = FmsIncomeStatementApi.updateIncomeStatementFormula(data)
      } else {
        operation = FmsCashFlowStatementApi.updateCashFlowAdjustmentFormula(data)
      }
      operation.then(() => {
        this.$modal.msgSuccess('保存成功')
        this.dialogVisible = false
        this.$emit('success')
      }).finally(() => {
        this.loading = false
      })
    },
    parseFormula(formula) {
      try {
        const values = JSON.parse(formula)
        if (!Array.isArray(values)) return []
        return values.filter(item => item && typeof item === 'object' &&
          Object.prototype.hasOwnProperty.call(item, 'subjectNumber'))
      } catch (error) {
        return []
      }
    },
    getRuleName(value) {
      const option = this.ruleOptions.find(item => Number(item.value) === Number(value))
      return option ? option.label : '-'
    },
    getSummaries({ columns, data }) {
      const amountFields = this.formulaType === 'balance'
        ? ['closingAmount', 'openingAmount']
        : ['currentAmount', 'yearAmount']
      return columns.map((column, index) => {
        if (index === 0) return '合计'
        const field = amountFields[index - 3]
        if (!field) return ''
        const total = data.reduce((result, item) => {
          const amount = Number(item[field] || 0)
          return result + (item.operator === '-' ? -amount : amount)
        }, 0)
        return formatMoney(total)
      })
    },
    formatMoney
  }
}
</script>

<style scoped>
.formula-toolbar { margin-bottom: -15px; }
.subject-select { width: 240px; }
.rule-select { width: 120px; }
.formula-table { margin-top: 8px; }
.invalid-tag { margin-left: 6px; }
.formula-warning { margin-top: 16px; }
.danger-text { color: #f56c6c; }
</style>
