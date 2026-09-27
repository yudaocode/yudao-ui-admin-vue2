<template>
  <div class="app-container fms-ledger-page">
    <doc-alert title="【账簿】账簿管理" url="https://doc.iocoder.cn/fms/ledger/" />
    <el-card class="ledger-toolbar" shadow="never">
      <FmsLedgerSearchBar
        :end-month="queryParams.endMonth"
        :export-loading="exportLoading"
        :max-level="8"
        :start-month="queryParams.startMonth"
        permission-prefix="fms:ledger:general"
        print-target="fms-quantity-general-ledger-table"
        print-title="数量金额总账"
        @export="handleExport"
        @search="handleQuery"
      />
    </el-card>
    <el-card shadow="never">
      <el-table id="fms-quantity-general-ledger-table" v-loading="loading || accountSetLoading" :data="list" border stripe height="calc(100vh - 285px)">
        <el-table-column align="center" label="科目编码" prop="subjectCode" width="125" />
        <el-table-column label="科目名称" min-width="150" prop="subjectName" />
        <el-table-column align="center" label="单位" prop="quantityUnit" width="80" />
        <el-table-column align="center" label="期初余额">
          <el-table-column align="center" label="方向" prop="openingBalanceDirection" width="70" />
          <el-table-column align="right" label="数量" width="105"><template slot-scope="scope">{{ formatMoney(scope.row.openingQuantity) }}</template></el-table-column>
          <el-table-column align="right" label="单价" width="110"><template slot-scope="scope">{{ formatMoney(scope.row.openingUnitPrice) }}</template></el-table-column>
          <el-table-column align="right" label="金额" width="125"><template slot-scope="scope">{{ formatMoney(getOpeningAmount(scope.row)) }}</template></el-table-column>
        </el-table-column>
        <el-table-column align="center" label="本期借方">
          <el-table-column align="right" label="数量" width="105"><template slot-scope="scope">{{ formatMoney(scope.row.periodDebitQuantity) }}</template></el-table-column>
          <el-table-column align="right" label="金额" width="125"><template slot-scope="scope">{{ formatMoney(scope.row.periodDebitAmount) }}</template></el-table-column>
        </el-table-column>
        <el-table-column align="center" label="本期贷方">
          <el-table-column align="right" label="数量" width="105"><template slot-scope="scope">{{ formatMoney(scope.row.periodCreditQuantity) }}</template></el-table-column>
          <el-table-column align="right" label="金额" width="125"><template slot-scope="scope">{{ formatMoney(scope.row.periodCreditAmount) }}</template></el-table-column>
        </el-table-column>
        <el-table-column align="center" label="本年累计借方">
          <el-table-column align="right" label="数量" width="105"><template slot-scope="scope">{{ formatMoney(scope.row.yearDebitQuantity) }}</template></el-table-column>
          <el-table-column align="right" label="金额" width="125"><template slot-scope="scope">{{ formatMoney(scope.row.yearDebitAmount) }}</template></el-table-column>
        </el-table-column>
        <el-table-column align="center" label="本年累计贷方">
          <el-table-column align="right" label="数量" width="105"><template slot-scope="scope">{{ formatMoney(scope.row.yearCreditQuantity) }}</template></el-table-column>
          <el-table-column align="right" label="金额" width="125"><template slot-scope="scope">{{ formatMoney(scope.row.yearCreditAmount) }}</template></el-table-column>
        </el-table-column>
        <el-table-column align="center" label="期末余额">
          <el-table-column align="center" label="方向" prop="endingBalanceDirection" width="70" />
          <el-table-column align="right" label="数量" width="105"><template slot-scope="scope">{{ formatMoney(scope.row.endingQuantity) }}</template></el-table-column>
          <el-table-column align="right" label="单价" width="110"><template slot-scope="scope">{{ formatMoney(scope.row.endingUnitPrice) }}</template></el-table-column>
          <el-table-column align="right" label="金额" width="125"><template slot-scope="scope">{{ formatMoney(getEndingAmount(scope.row)) }}</template></el-table-column>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { FmsLedgerApi } from '@/api/fms/ledger'

import { formatMoney } from '@/views/fms/utils/format'
import FmsLedgerSearchBar from '../components/FmsLedgerSearchBar.vue'
import ledgerContextMixin from '../mixin'
import { buildPeriodFilename, currentMonthValue, flattenTree } from '../utils'

export default {
  name: 'FmsQuantityGeneralLedger',
  components: { FmsLedgerSearchBar },
  mixins: [ledgerContextMixin],
  data() {
    const month = currentMonthValue()
    return { loading: false, exportLoading: false, list: [], listSequence: 0, queryParams: { accountSetId: 0, startMonth: month, endMonth: month, minLevel: 1, maxLevel: 8 }}
  },
  beforeDestroy() { this.listSequence += 1 },
  methods: {
    formatMoney,
    clearLedgerData() { this.list = [] },
    onLedgerContextReady() { this.queryParams = Object.assign({}, this.queryParams, { accountSetId: Number(this.accountSetId), startMonth: this.accountingMonth, endMonth: this.accountingMonth }); return this.getList() },
    getList() {
      if (!this.accountSetId) { this.list = []; return Promise.resolve() }
      const sequence = ++this.listSequence
      this.loading = true
      return FmsLedgerApi.getQuantityGeneralList(this.queryParams).then(response => {
        if (sequence !== this.listSequence) return
        const rows = response.data
        this.list = flattenTree(rows)
      }).finally(() => { if (sequence === this.listSequence) this.loading = false })
    },
    handleQuery(value) { this.queryParams = Object.assign({}, this.queryParams, value, { accountSetId: Number(this.accountSetId) }); this.getList() },
    getOpeningAmount(row) { return Number(row.openingDebitAmount) || Number(row.openingCreditAmount) || 0 },
    getEndingAmount(row) { return Number(row.endingDebitAmount) || Number(row.endingCreditAmount) || 0 },
    handleExport() {
      if (!this.accountSetId) return
      this.exportLoading = true
      FmsLedgerApi.exportQuantityGeneral(this.queryParams).then(response => {
        this.$download.excel(response.data, buildPeriodFilename('数量金额总账', this.queryParams.startMonth, this.queryParams.endMonth))
      }).finally(() => { this.exportLoading = false })
    }
  }
}
</script>

<style scoped>
.ledger-toolbar { margin-bottom: 16px; }
</style>
