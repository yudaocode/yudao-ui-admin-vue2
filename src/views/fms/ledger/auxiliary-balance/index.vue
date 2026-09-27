<template>
  <div class="app-container fms-ledger-page">
    <doc-alert title="【账簿】账簿管理" url="https://doc.iocoder.cn/fms/ledger/" />
    <el-card class="ledger-toolbar" shadow="never">
      <el-form :inline="true" label-width="78px" class="ledger-form">
        <el-form-item label="会计期间"><FmsLedgerMonthRangePicker v-model="monthRange" /></el-form-item>
        <el-form-item label="辅助类">
          <FmsAuxiliaryTypeSelect v-model="queryParams.auxiliaryTypeId" :account-set-id="accountSetId" :clearable="false" style="width: 220px" @change="handleTypeChange" @loaded="handleTypeLoaded" />
        </el-form-item>
        <el-form-item label="辅助项目">
          <FmsAuxiliaryItemSelect v-model="queryParams.auxiliaryItemId" :account-set-id="accountSetId" :auxiliary-type-id="queryParams.auxiliaryTypeId" clearable placeholder="全部辅助项目" style="width: 220px" />
        </el-form-item>
        <el-form-item label="科目"><FmsSubjectSelect v-model="queryParams.subjectId" :options="subjects" clearable placeholder="全部科目" style="width: 220px" /></el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          <FmsLedgerPrintButton
            :end-month="monthRange[1] || ''"
            :start-month="monthRange[0] || ''"
            permission-prefix="fms:ledger:subject-balance"
            target="fms-auxiliary-balance-table"
            title="核算项目余额表"
          />
          <el-button v-hasPermi="['fms:ledger:subject-balance:export']" :loading="exportLoading" type="success" plain icon="el-icon-download" @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never">
      <el-table id="fms-auxiliary-balance-table" v-loading="loading || accountSetLoading" :data="list" border stripe height="calc(100vh - 325px)">
        <el-table-column align="center" label="编码" min-width="120" prop="code" fixed="left" />
        <el-table-column label="项目名称" min-width="180" prop="name" fixed="left" />
        <el-table-column align="center" label="期初余额">
          <el-table-column align="right" label="借方" min-width="130"><template slot-scope="scope">{{ formatMoney(scope.row.openingDebitAmount) }}</template></el-table-column>
          <el-table-column align="right" label="贷方" min-width="130"><template slot-scope="scope">{{ formatMoney(scope.row.openingCreditAmount) }}</template></el-table-column>
        </el-table-column>
        <el-table-column align="center" label="本期发生额">
          <el-table-column align="right" label="借方" min-width="130"><template slot-scope="scope">{{ formatMoney(scope.row.periodDebitAmount) }}</template></el-table-column>
          <el-table-column align="right" label="贷方" min-width="130"><template slot-scope="scope">{{ formatMoney(scope.row.periodCreditAmount) }}</template></el-table-column>
        </el-table-column>
        <el-table-column align="center" label="本年累计发生额">
          <el-table-column align="right" label="借方" min-width="130"><template slot-scope="scope">{{ formatMoney(scope.row.yearDebitAmount) }}</template></el-table-column>
          <el-table-column align="right" label="贷方" min-width="130"><template slot-scope="scope">{{ formatMoney(scope.row.yearCreditAmount) }}</template></el-table-column>
        </el-table-column>
        <el-table-column align="center" label="期末余额">
          <el-table-column align="right" label="借方" min-width="130"><template slot-scope="scope">{{ formatMoney(scope.row.endingDebitAmount) }}</template></el-table-column>
          <el-table-column align="right" label="贷方" min-width="130"><template slot-scope="scope">{{ formatMoney(scope.row.endingCreditAmount) }}</template></el-table-column>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { FmsLedgerApi } from '@/api/fms/ledger'
import * as FmsSubjectApi from '@/api/fms/config/subject'
import FmsAuxiliaryItemSelect from '@/views/fms/config/auxiliary/components/FmsAuxiliaryItemSelect.vue'
import FmsAuxiliaryTypeSelect from '@/views/fms/config/auxiliary/components/FmsAuxiliaryTypeSelect.vue'
import FmsSubjectSelect from '@/views/fms/config/subject/components/FmsSubjectSelect.vue'

import { formatMoney } from '@/views/fms/utils/format'
import FmsLedgerMonthRangePicker from '../components/FmsLedgerMonthRangePicker.vue'
import FmsLedgerPrintButton from '../components/FmsLedgerPrintButton.vue'
import ledgerContextMixin from '../mixin'
import { buildPeriodFilename, buildTree, currentMonthValue } from '../utils'

export default {
  name: 'FmsAuxiliaryBalance',
  components: { FmsAuxiliaryItemSelect, FmsAuxiliaryTypeSelect, FmsSubjectSelect, FmsLedgerMonthRangePicker, FmsLedgerPrintButton },
  mixins: [ledgerContextMixin],
  data() {
    const month = currentMonthValue()
    return {
      loading: false,
      exportLoading: false,
      list: [],
      types: [],
      subjects: [],
      listSequence: 0,
      subjectSequence: 0,
      monthRange: [month, month],
      queryParams: { accountSetId: 0, startMonth: month, endMonth: month, auxiliaryTypeId: 0, auxiliaryItemId: undefined, subjectId: undefined }
    }
  },
  beforeDestroy() { this.listSequence += 1; this.subjectSequence += 1 },
  methods: {
    formatMoney,
    clearLedgerData() { this.list = []; this.subjects = [] },
    onLedgerContextReady() {
      this.monthRange = [this.accountingMonth, this.accountingMonth]
      this.queryParams.accountSetId = Number(this.accountSetId)
      this.queryParams.startMonth = this.accountingMonth
      this.queryParams.endMonth = this.accountingMonth
      this.loadSubjectOptions()
      if (this.queryParams.auxiliaryTypeId) return this.getList()
    },
    loadSubjectOptions() {
      const sequence = ++this.subjectSequence
      return FmsSubjectApi.getSubjectSimpleList(Number(this.accountSetId)).then(response => {
        if (sequence !== this.subjectSequence) return
        const rows = response.data
        this.subjects = buildTree(rows)
      })
    },
    handleTypeLoaded(rows) {
      this.types = rows
      if (!this.types.some(item => Number(item.id) === Number(this.queryParams.auxiliaryTypeId))) {
        this.queryParams.auxiliaryTypeId = (this.types[0] && this.types[0].id) || 0
        this.queryParams.auxiliaryItemId = undefined
      }
      this.getList()
    },
    handleTypeChange() { this.queryParams.auxiliaryItemId = undefined; this.getList() },
    handleQuery() { this.getList() },
    resetQuery() {
      this.monthRange = [this.accountingMonth || currentMonthValue(), this.accountingMonth || currentMonthValue()]
      this.queryParams.auxiliaryTypeId = (this.types[0] && this.types[0].id) || 0
      this.queryParams.auxiliaryItemId = undefined
      this.queryParams.subjectId = undefined
      return this.getList()
    },
    getList() {
      if (!this.accountSetId || !this.queryParams.auxiliaryTypeId || this.monthRange.length !== 2) { this.list = []; return Promise.resolve() }
      const sequence = ++this.listSequence
      this.queryParams = Object.assign({}, this.queryParams, { accountSetId: Number(this.accountSetId), startMonth: this.monthRange[0], endMonth: this.monthRange[1] })
      this.loading = true
      return FmsLedgerApi.getAuxiliaryBalanceList(this.queryParams).then(response => {
        if (sequence !== this.listSequence) return
        const rows = response.data
        this.list = rows
      }).finally(() => {
        if (sequence === this.listSequence) this.loading = false
      })
    },
    handleExport() {
      if (!this.queryParams.auxiliaryTypeId) return
      this.exportLoading = true
      FmsLedgerApi.exportAuxiliaryBalance(this.queryParams).then(response => {
        this.$download.excel(response.data, buildPeriodFilename('核算项目余额表', this.queryParams.startMonth, this.queryParams.endMonth))
      }).finally(() => { this.exportLoading = false })
    }
  }
}
</script>

<style scoped>
.ledger-toolbar { margin-bottom: 16px; }
.ledger-form { margin-bottom: -18px; }
</style>
