<template>
  <div class="app-container fms-ledger-page">
    <doc-alert title="【账簿】账簿管理" url="https://doc.iocoder.cn/fms/ledger/" />
    <el-card class="ledger-toolbar" shadow="never">
      <FmsLedgerSearchBar
        :end-month="queryParams.endMonth"
        :export-loading="exportLoading"
        :start-month="queryParams.startMonth"
        :subject-id="queryParams.subjectId"
        :subjects="multiColumnSubjects"
        auto-query
        show-subject
        permission-prefix="fms:ledger:multi-column"
        print-target="fms-multi-column-ledger-table"
        print-title="多栏账"
        @export="handleExport"
        @search="handleQuery"
      />
    </el-card>
    <el-card shadow="never">
      <el-table id="fms-multi-column-ledger-table" v-loading="loading || accountSetLoading" :data="result.rows" :row-class-name="getRowClassName" border stripe height="calc(100vh - 285px)">
        <el-table-column align="center" label="日期" prop="accountDate" width="110" fixed="left" />
        <el-table-column align="center" label="凭证字号" width="110" fixed="left"><template slot-scope="scope"><el-button v-if="scope.row.voucherId" v-hasPermi="['fms:voucher:query']" type="text" @click="openVoucher(scope.row)">{{ scope.row.voucherNumber }}</el-button></template></el-table-column>
        <el-table-column label="摘要" min-width="160" prop="digest" fixed="left" />
        <el-table-column align="right" label="借方" width="125"><template slot-scope="scope">{{ formatMoney(scope.row.debitAmount) }}</template></el-table-column>
        <el-table-column align="right" label="贷方" width="125"><template slot-scope="scope">{{ formatMoney(scope.row.creditAmount) }}</template></el-table-column>
        <el-table-column align="center" label="方向" prop="balanceDirection" width="70" />
        <el-table-column align="right" label="余额" width="130"><template slot-scope="scope">{{ formatMoney(scope.row.balance) }}</template></el-table-column>
        <el-table-column v-if="debitColumns.length" align="center" label="借方">
          <el-table-column v-for="column in debitColumns" :key="column.subjectId" align="right" :label="column.subjectCode + '/' + column.subjectName" min-width="145"><template slot-scope="scope">{{ formatMoney(getColumnAmount(scope.row, column.subjectId)) }}</template></el-table-column>
        </el-table-column>
        <el-table-column v-if="creditColumns.length" align="center" label="贷方">
          <el-table-column v-for="column in creditColumns" :key="column.subjectId" align="right" :label="column.subjectCode + '/' + column.subjectName" min-width="145"><template slot-scope="scope">{{ formatMoney(getColumnAmount(scope.row, column.subjectId)) }}</template></el-table-column>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { FmsLedgerApi } from '@/api/fms/ledger'
import * as FmsSubjectApi from '@/api/fms/config/subject'

import { formatMoney } from '@/views/fms/utils/format'
import FmsLedgerSearchBar from '../components/FmsLedgerSearchBar.vue'
import ledgerContextMixin from '../mixin'
import { buildPeriodFilename, buildTree, currentMonthValue, filterParentSubjects, flattenTree } from '../utils'

export default {
  name: 'FmsMultiColumnLedger',
  components: { FmsLedgerSearchBar },
  mixins: [ledgerContextMixin],
  data() {
    const month = currentMonthValue()
    return { loading: false, exportLoading: false, subjects: [], result: { columns: [], rows: [] }, listSequence: 0, subjectSequence: 0, queryParams: { accountSetId: 0, startMonth: month, endMonth: month, subjectId: undefined }}
  },
  computed: {
    multiColumnSubjects() { return filterParentSubjects(this.subjects) },
    debitColumns() { return this.result.columns.filter(column => Number(column.balanceDirection) === 1) },
    creditColumns() { return this.result.columns.filter(column => Number(column.balanceDirection) === 2) }
  },
  beforeDestroy() { this.listSequence += 1; this.subjectSequence += 1 },
  methods: {
    formatMoney,
    clearLedgerData() { this.subjects = []; this.result = { columns: [], rows: [] } },
    onLedgerContextReady() {
      this.queryParams = Object.assign({}, this.queryParams, { accountSetId: Number(this.accountSetId), startMonth: this.accountingMonth, endMonth: this.accountingMonth })
      const sequence = ++this.subjectSequence
      return FmsSubjectApi.getSubjectSimpleList(Number(this.accountSetId)).then(response => {
        if (sequence !== this.subjectSequence) return
        const rows = response.data
        this.subjects = buildTree(rows)
        this.queryParams.subjectId = (flattenTree(this.multiColumnSubjects)[0] || {}).id
        return this.getList()
      })
    },
    getList() {
      if (!this.accountSetId || !this.queryParams.subjectId) { this.result = { columns: [], rows: [] }; return Promise.resolve() }
      const sequence = ++this.listSequence
      this.loading = true
      return FmsLedgerApi.getMultiColumn(this.queryParams).then(response => {
        if (sequence !== this.listSequence) return
        const value = response.data
        this.result = value
      }).finally(() => { if (sequence === this.listSequence) this.loading = false })
    },
    handleQuery(value) { this.queryParams = Object.assign({}, this.queryParams, value, { accountSetId: Number(this.accountSetId) }); this.getList() },
    getColumnAmount(row, subjectId) { return row.columnAmounts && (row.columnAmounts[subjectId] === undefined ? row.columnAmounts[String(subjectId)] : row.columnAmounts[subjectId]) },
    getRowClassName({ row }) { return Number(row.rowType) === 2 ? '' : 'ledger-summary-row' },
    openVoucher(row) { this.$router.push({ path: '/fms/voucher/create', query: { id: row.voucherId, accountSetId: this.accountSetId }}) },
    handleExport() {
      if (!this.queryParams.subjectId) return
      this.exportLoading = true
      FmsLedgerApi.exportMultiColumn(this.queryParams).then(response => {
        this.$download.excel(response.data, buildPeriodFilename('多栏账', this.queryParams.startMonth, this.queryParams.endMonth))
      }).finally(() => { this.exportLoading = false })
    }
  }
}
</script>

<style scoped>
.ledger-toolbar { margin-bottom: 16px; }
::v-deep .ledger-summary-row td { background: #f5f7fa !important; font-weight: 600; }
</style>
