<template>
  <div class="app-container fms-ledger-page">
    <doc-alert title="【账簿】账簿管理" url="https://doc.iocoder.cn/fms/ledger/" />
    <el-card class="ledger-toolbar" shadow="never">
      <FmsLedgerSearchBar
        :end-month="queryParams.endMonth"
        :export-loading="exportLoading"
        :start-month="queryParams.startMonth"
        :subject-id="queryParams.subjectId"
        :subjects="quantitySubjects"
        show-subject
        permission-prefix="fms:ledger:detail"
        print-target="fms-quantity-detail-ledger-table"
        print-title="数量金额明细账"
        @export="handleExport"
        @search="handleQuery"
      />
    </el-card>
    <el-card shadow="never">
      <el-table id="fms-quantity-detail-ledger-table" v-loading="loading || accountSetLoading" :data="list" :row-class-name="getRowClassName" border stripe height="calc(100vh - 285px)">
        <el-table-column align="center" label="日期" prop="accountDate" width="110" />
        <el-table-column align="center" label="凭证字号" width="110"><template slot-scope="scope"><el-button v-if="scope.row.voucherId" v-hasPermi="['fms:voucher:query']" type="text" @click="openVoucher(scope.row)">{{ scope.row.voucherNumber }}</el-button></template></el-table-column>
        <el-table-column label="摘要" min-width="160" prop="digest" />
        <el-table-column align="center" label="借方发生额">
          <el-table-column align="right" label="数量" width="105"><template slot-scope="scope">{{ formatMoney(scope.row.debitQuantity) }}</template></el-table-column>
          <el-table-column align="right" label="单价" width="110"><template slot-scope="scope">{{ formatMoney(getDebitUnitPrice(scope.row)) }}</template></el-table-column>
          <el-table-column align="right" label="金额" width="125"><template slot-scope="scope">{{ formatMoney(scope.row.debitAmount) }}</template></el-table-column>
        </el-table-column>
        <el-table-column align="center" label="贷方发生额">
          <el-table-column align="right" label="数量" width="105"><template slot-scope="scope">{{ formatMoney(scope.row.creditQuantity) }}</template></el-table-column>
          <el-table-column align="right" label="单价" width="110"><template slot-scope="scope">{{ formatMoney(getCreditUnitPrice(scope.row)) }}</template></el-table-column>
          <el-table-column align="right" label="金额" width="125"><template slot-scope="scope">{{ formatMoney(scope.row.creditAmount) }}</template></el-table-column>
        </el-table-column>
        <el-table-column align="center" label="余额">
          <el-table-column align="center" label="方向" prop="balanceDirection" width="70" />
          <el-table-column align="right" label="数量" width="105"><template slot-scope="scope">{{ formatMoney(scope.row.balanceQuantity) }}</template></el-table-column>
          <el-table-column align="right" label="单价" width="110"><template slot-scope="scope">{{ formatMoney(getBalanceUnitPrice(scope.row)) }}</template></el-table-column>
          <el-table-column align="right" label="金额" width="125"><template slot-scope="scope">{{ formatMoney(scope.row.balance) }}</template></el-table-column>
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
import { buildPeriodFilename, buildTree, currentMonthValue, filterQuantitySubjects, flattenTree } from '../utils'

export default {
  name: 'FmsQuantityDetailLedger',
  components: { FmsLedgerSearchBar },
  mixins: [ledgerContextMixin],
  data() {
    const month = currentMonthValue()
    return { loading: false, exportLoading: false, list: [], quantitySubjects: [], listSequence: 0, subjectSequence: 0, queryParams: { accountSetId: 0, startMonth: month, endMonth: month, subjectId: undefined }}
  },
  beforeDestroy() { this.listSequence += 1; this.subjectSequence += 1 },
  methods: {
    formatMoney,
    clearLedgerData() { this.list = []; this.quantitySubjects = [] },
    onLedgerContextReady() {
      this.queryParams = Object.assign({}, this.queryParams, { accountSetId: Number(this.accountSetId), startMonth: this.accountingMonth, endMonth: this.accountingMonth })
      const sequence = ++this.subjectSequence
      return FmsSubjectApi.getSubjectSimpleList(Number(this.accountSetId)).then(response => {
        if (sequence !== this.subjectSequence) return
        const rows = response.data
        this.quantitySubjects = filterQuantitySubjects(buildTree(rows))
        this.queryParams.subjectId = (flattenTree(this.quantitySubjects)[0] || {}).id
        return this.getList()
      })
    },
    getList() {
      if (!this.accountSetId || !this.queryParams.subjectId) { this.list = []; return Promise.resolve() }
      const sequence = ++this.listSequence
      this.loading = true
      return FmsLedgerApi.getQuantityDetailList(this.queryParams).then(response => {
        if (sequence !== this.listSequence) return
        const rows = response.data
        this.list = rows
      }).finally(() => { if (sequence === this.listSequence) this.loading = false })
    },
    handleQuery(value) { this.queryParams = Object.assign({}, this.queryParams, value, { accountSetId: Number(this.accountSetId) }); this.getList() },
    getDebitUnitPrice(row) { return Number(row.debitQuantity) ? Number(row.debitAmount) / Number(row.debitQuantity) : undefined },
    getCreditUnitPrice(row) { return Number(row.creditQuantity) ? Number(row.creditAmount) / Number(row.creditQuantity) : undefined },
    getBalanceUnitPrice(row) { return Number(row.balanceQuantity) ? Number(row.balance) / Number(row.balanceQuantity) : undefined },
    getRowClassName({ row }) { return Number(row.rowType) === 2 ? '' : 'ledger-summary-row' },
    openVoucher(row) { this.$router.push({ path: '/fms/voucher/create', query: { id: row.voucherId, accountSetId: this.accountSetId }}) },
    handleExport() {
      if (!this.queryParams.subjectId) return
      this.exportLoading = true
      FmsLedgerApi.exportQuantityDetail(this.queryParams).then(response => {
        this.$download.excel(response.data, buildPeriodFilename('数量金额明细账', this.queryParams.startMonth, this.queryParams.endMonth))
      }).finally(() => { this.exportLoading = false })
    }
  }
}
</script>

<style scoped>
.ledger-toolbar { margin-bottom: 16px; }
::v-deep .ledger-summary-row td { background: #f5f7fa !important; font-weight: 600; }
</style>
