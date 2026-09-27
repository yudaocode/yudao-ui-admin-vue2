<template>
  <div class="app-container fms-ledger-page">
    <doc-alert title="【账簿】账簿管理" url="https://doc.iocoder.cn/fms/ledger/" />
    <el-card class="ledger-toolbar" shadow="never">
      <FmsLedgerSearchBar
        :before-print="expandBalanceForPrint"
        :end-month="queryParams.endMonth"
        :export-loading="exportLoading"
        :max-level="8"
        :start-month="queryParams.startMonth"
        permission-prefix="fms:ledger:subject-balance"
        print-target="fms-subject-balance-table"
        print-title="科目余额表"
        @export="handleExport"
        @search="handleQuery"
      >
        <template slot="actions"><el-button type="danger" plain icon="el-icon-sort" @click="toggleExpandAll">展开/折叠</el-button></template>
      </FmsLedgerSearchBar>
    </el-card>
    <el-card shadow="never">
      <el-table
        v-if="refreshTable"
        id="fms-subject-balance-table"
        v-loading="loading || accountSetLoading"
        :data="list"
        :default-expand-all="isExpandAll"
        :tree-props="{ children: 'children' }"
        row-key="nodeKey"
        border
        stripe
        height="calc(100vh - 285px)"
      >
        <el-table-column label="科目编码" prop="subjectCode" min-width="125">
          <template slot-scope="scope"><el-button v-if="Number(scope.row.nodeType) === 1" type="text" @click="openDetail(scope.row)">{{ scope.row.subjectCode }}</el-button><span v-else>{{ scope.row.subjectCode }}</span></template>
        </el-table-column>
        <el-table-column label="科目名称" prop="subjectName" min-width="150" />
        <el-table-column align="center" label="期初余额">
          <el-table-column align="right" label="借方" width="125"><template slot-scope="scope">{{ formatMoney(scope.row.openingDebitAmount) }}</template></el-table-column>
          <el-table-column align="right" label="贷方" width="125"><template slot-scope="scope">{{ formatMoney(scope.row.openingCreditAmount) }}</template></el-table-column>
        </el-table-column>
        <el-table-column align="center" label="本期发生额">
          <el-table-column align="right" label="借方" width="125"><template slot-scope="scope">{{ formatMoney(scope.row.periodDebitAmount) }}</template></el-table-column>
          <el-table-column align="right" label="贷方" width="125"><template slot-scope="scope">{{ formatMoney(scope.row.periodCreditAmount) }}</template></el-table-column>
        </el-table-column>
        <el-table-column align="center" label="本年累计发生额">
          <el-table-column align="right" label="借方" width="125"><template slot-scope="scope">{{ formatMoney(scope.row.yearDebitAmount) }}</template></el-table-column>
          <el-table-column align="right" label="贷方" width="125"><template slot-scope="scope">{{ formatMoney(scope.row.yearCreditAmount) }}</template></el-table-column>
        </el-table-column>
        <el-table-column align="center" label="期末余额">
          <el-table-column align="right" label="借方" width="125"><template slot-scope="scope">{{ formatMoney(scope.row.endingDebitAmount) }}</template></el-table-column>
          <el-table-column align="right" label="贷方" width="125"><template slot-scope="scope">{{ formatMoney(scope.row.endingCreditAmount) }}</template></el-table-column>
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
import { buildPeriodFilename, currentMonthValue } from '../utils'

export default {
  name: 'FmsSubjectBalance',
  components: { FmsLedgerSearchBar },
  mixins: [ledgerContextMixin],
  data() {
    const month = currentMonthValue()
    return {
      loading: false,
      exportLoading: false,
      isExpandAll: false,
      refreshTable: true,
      list: [],
      listSequence: 0,
      queryParams: { accountSetId: 0, startMonth: month, endMonth: month, minLevel: 1, maxLevel: 8 }
    }
  },
  beforeDestroy() { this.listSequence += 1 },
  methods: {
    formatMoney,
    clearLedgerData() { this.list = [] },
    onLedgerContextReady() {
      this.queryParams = Object.assign({}, this.queryParams, { accountSetId: Number(this.accountSetId), startMonth: this.accountingMonth, endMonth: this.accountingMonth })
      return this.getList()
    },
    getList() {
      if (!this.accountSetId) { this.list = []; return Promise.resolve() }
      const sequence = ++this.listSequence
      this.loading = true
      return FmsLedgerApi.getSubjectBalanceList(this.queryParams).then(async response => {
        if (sequence !== this.listSequence) return
        const rows = response.data
        this.list = rows
        this.isExpandAll = false
        this.refreshTable = false
        await this.$nextTick()
        this.refreshTable = true
      }).finally(() => {
        if (sequence === this.listSequence) this.loading = false
      })
    },
    handleQuery(value) { this.queryParams = Object.assign({}, this.queryParams, value, { accountSetId: Number(this.accountSetId) }); this.getList() },
    toggleExpandAll() {
      this.refreshTable = false
      this.isExpandAll = !this.isExpandAll
      return this.$nextTick().then(() => { this.refreshTable = true }).then(() => this.$nextTick())
    },
    expandBalanceForPrint() { return this.isExpandAll ? Promise.resolve() : this.toggleExpandAll() },
    openDetail(row) {
      this.$router.push({ path: '/fms/ledger/detail', query: { accountSetId: this.accountSetId, subjectId: row.subjectId, startMonth: this.queryParams.startMonth, endMonth: this.queryParams.endMonth }})
    },
    handleExport() {
      if (!this.accountSetId) return
      this.exportLoading = true
      FmsLedgerApi.exportSubjectBalance(this.queryParams).then(response => {
        this.$download.excel(response.data, buildPeriodFilename('科目余额表', this.queryParams.startMonth, this.queryParams.endMonth))
      }).finally(() => { this.exportLoading = false })
    }
  }
}
</script>

<style scoped>
.ledger-toolbar { margin-bottom: 16px; }
</style>
