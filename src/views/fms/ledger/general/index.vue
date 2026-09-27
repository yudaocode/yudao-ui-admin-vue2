<template>
  <div class="app-container fms-ledger-page">
    <doc-alert title="【账簿】账簿管理" url="https://doc.iocoder.cn/fms/ledger/" />
    <el-card class="ledger-toolbar" shadow="never">
      <FmsLedgerSearchBar
        :end-month="queryParams.endMonth"
        :export-loading="exportLoading"
        :start-month="queryParams.startMonth"
        permission-prefix="fms:ledger:general"
        print-target="fms-general-ledger-table"
        print-title="总账"
        @export="handleExport"
        @search="handleQuery"
      />
    </el-card>
    <el-card shadow="never">
      <el-alert v-if="!accountSetLoading && !accountSetId" :closable="false" show-icon type="info" title="请先选择已初始化的账套" />
      <el-table
        id="fms-general-ledger-table"
        v-loading="loading || accountSetLoading"
        :data="list"
        :row-class-name="getRowClassName"
        :span-method="spanSubjectColumns"
        border
        stripe
        height="calc(100vh - 285px)"
      >
        <el-table-column align="center" label="科目编码" prop="subjectCode" width="125">
          <template slot-scope="scope"><el-button type="text" @click="openDetail(scope.row)">{{ scope.row.subjectCode }}</el-button></template>
        </el-table-column>
        <el-table-column label="科目名称" prop="subjectName" min-width="160" />
        <el-table-column align="center" label="期间" prop="period" width="100" />
        <el-table-column label="摘要" prop="digest" min-width="130" />
        <el-table-column align="right" label="借方" width="140"><template slot-scope="scope">{{ formatMoney(scope.row.debitAmount) }}</template></el-table-column>
        <el-table-column align="right" label="贷方" width="140"><template slot-scope="scope">{{ formatMoney(scope.row.creditAmount) }}</template></el-table-column>
        <el-table-column align="center" label="方向" prop="balanceDirection" width="80" />
        <el-table-column align="right" label="余额" width="150"><template slot-scope="scope">{{ formatMoney(scope.row.balance) }}</template></el-table-column>
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
  name: 'FmsGeneralLedger',
  components: { FmsLedgerSearchBar },
  mixins: [ledgerContextMixin],
  data() {
    const month = currentMonthValue()
    return {
      loading: false,
      exportLoading: false,
      list: [],
      listSequence: 0,
      queryParams: { accountSetId: 0, startMonth: month, endMonth: month, minLevel: 1, maxLevel: 1 }
    }
  },
  beforeDestroy() { this.listSequence += 1 },
  methods: {
    formatMoney,
    clearLedgerData() { this.list = [] },
    onLedgerContextReady() {
      this.queryParams = Object.assign({}, this.queryParams, {
        accountSetId: Number(this.accountSetId),
        startMonth: this.accountingMonth,
        endMonth: this.accountingMonth
      })
      return this.getList()
    },
    getList() {
      if (!this.accountSetId) { this.list = []; return Promise.resolve() }
      const sequence = ++this.listSequence
      const params = Object.assign({}, this.queryParams, { accountSetId: Number(this.accountSetId) })
      this.loading = true
      return FmsLedgerApi.getGeneralList(params).then(response => {
        if (sequence !== this.listSequence) return
        const rows = response.data
        this.list = rows
      }).finally(() => {
        if (sequence === this.listSequence) this.loading = false
      })
    },
    handleQuery(value) {
      this.queryParams = Object.assign({}, this.queryParams, value, { accountSetId: Number(this.accountSetId) })
      this.getList()
    },
    openDetail(row) {
      this.$router.push({ path: '/fms/ledger/detail', query: {
        accountSetId: this.accountSetId,
        subjectId: row.subjectId,
        startMonth: this.queryParams.startMonth,
        endMonth: this.queryParams.endMonth
      }})
    },
    spanSubjectColumns({ rowIndex, columnIndex }) {
      if (columnIndex > 1) return [1, 1]
      const subjectId = this.list[rowIndex] && this.list[rowIndex].subjectId
      if (rowIndex > 0 && this.list[rowIndex - 1] && this.list[rowIndex - 1].subjectId === subjectId) return [0, 0]
      let rowspan = 1
      while (this.list[rowIndex + rowspan] && this.list[rowIndex + rowspan].subjectId === subjectId) rowspan += 1
      return [rowspan, 1]
    },
    getRowClassName() { return 'ledger-strong-row' },
    handleExport() {
      if (!this.accountSetId) return
      this.exportLoading = true
      FmsLedgerApi.exportGeneral(this.queryParams).then(response => {
        this.$download.excel(response.data, buildPeriodFilename('总账', this.queryParams.startMonth, this.queryParams.endMonth))
      }).finally(() => { this.exportLoading = false })
    }
  }
}
</script>

<style scoped>
.ledger-toolbar { margin-bottom: 16px; }
::v-deep .ledger-strong-row td { font-weight: 500; }
</style>
