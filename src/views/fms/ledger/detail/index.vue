<template>
  <div class="app-container fms-ledger-page">
    <doc-alert title="【账簿】账簿管理" url="https://doc.iocoder.cn/fms/ledger/" />
    <el-card class="ledger-toolbar" shadow="never">
      <FmsLedgerSearchBar
        :end-month="queryParams.endMonth"
        :export-loading="exportLoading"
        :start-month="queryParams.startMonth"
        :subject-id="queryParams.subjectId"
        :subjects="subjects"
        auto-query
        show-subject
        permission-prefix="fms:ledger:detail"
        print-target="fms-detail-ledger-table"
        print-title="明细账"
        @export="handleExport"
        @search="handleQuery"
      />
    </el-card>
    <el-card shadow="never">
      <div class="detail-layout">
        <aside class="subject-panel">
          <el-input v-model="subjectKeyword" clearable placeholder="搜索科目" prefix-icon="el-icon-search" />
          <el-tree
            ref="subjectTree"
            :data="subjects"
            :filter-node-method="filterSubject"
            :props="{ label: getSubjectLabel, children: 'children' }"
            :current-node-key="queryParams.subjectId"
            node-key="id"
            highlight-current
            @node-click="handleSubjectClick"
          />
        </aside>
        <el-table
          id="fms-detail-ledger-table"
          v-loading="loading || accountSetLoading"
          :data="list"
          :row-class-name="getRowClassName"
          border
          stripe
          height="calc(100vh - 305px)"
        >
          <el-table-column align="center" label="日期" prop="accountDate" width="110" />
          <el-table-column align="center" label="凭证字号" width="110">
            <template slot-scope="scope"><el-button v-if="scope.row.voucherId" v-hasPermi="['fms:voucher:query']" type="text" @click="openVoucher(scope.row)">{{ scope.row.voucherNumber }}</el-button></template>
          </el-table-column>
          <el-table-column label="摘要" min-width="180" prop="digest" />
          <el-table-column align="right" label="借方" width="140"><template slot-scope="scope">{{ formatMoney(scope.row.debitAmount) }}</template></el-table-column>
          <el-table-column align="right" label="贷方" width="140"><template slot-scope="scope">{{ formatMoney(scope.row.creditAmount) }}</template></el-table-column>
          <el-table-column align="center" label="方向" prop="balanceDirection" width="80" />
          <el-table-column align="right" label="余额" width="150"><template slot-scope="scope">{{ formatMoney(scope.row.balance) }}</template></el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
import { FmsLedgerApi } from '@/api/fms/ledger'
import * as FmsSubjectApi from '@/api/fms/config/subject'

import { formatMoney } from '@/views/fms/utils/format'
import FmsLedgerSearchBar from '../components/FmsLedgerSearchBar.vue'
import ledgerContextMixin from '../mixin'
import { buildPeriodFilename, buildTree, currentMonthValue, flattenTree } from '../utils'

export default {
  name: 'FmsDetailLedger',
  components: { FmsLedgerSearchBar },
  mixins: [ledgerContextMixin],
  data() {
    const month = currentMonthValue()
    return {
      loading: false,
      exportLoading: false,
      list: [],
      subjects: [],
      subjectKeyword: '',
      listSequence: 0,
      subjectSequence: 0,
      queryParams: { accountSetId: 0, startMonth: month, endMonth: month, subjectId: undefined }
    }
  },
  watch: {
    subjectKeyword(value) { if (this.$refs.subjectTree) this.$refs.subjectTree.filter(value) }
  },
  beforeDestroy() { this.listSequence += 1; this.subjectSequence += 1 },
  methods: {
    formatMoney,
    clearLedgerData() { this.subjects = []; this.list = [] },
    async onLedgerContextReady() {
      this.queryParams.accountSetId = Number(this.accountSetId)
      this.queryParams.startMonth = String(this.$route.query.startMonth || this.accountingMonth)
      this.queryParams.endMonth = String(this.$route.query.endMonth || this.accountingMonth)
      this.queryParams.subjectId = Number(this.$route.query.subjectId) || undefined
      await this.loadSubjectTree()
      return this.getList()
    },
    loadSubjectTree() {
      if (!this.accountSetId) { this.subjects = []; return Promise.resolve() }
      const sequence = ++this.subjectSequence
      return FmsSubjectApi.getDetailSubjectList({
        accountSetId: Number(this.accountSetId),
        startMonth: this.queryParams.startMonth,
        endMonth: this.queryParams.endMonth
      }).then(response => {
        if (sequence !== this.subjectSequence) return
        const rows = response.data
        this.subjects = buildTree(rows)
        const subjectIds = flattenTree(this.subjects).map(subject => Number(subject.id))
        if (!subjectIds.includes(Number(this.queryParams.subjectId))) this.queryParams.subjectId = subjectIds[0]
        this.$nextTick(() => { if (this.$refs.subjectTree) this.$refs.subjectTree.setCurrentKey(this.queryParams.subjectId) })
      })
    },
    getList() {
      if (!this.accountSetId || !this.queryParams.subjectId) { this.list = []; return Promise.resolve() }
      const sequence = ++this.listSequence
      const params = Object.assign({}, this.queryParams, { accountSetId: Number(this.accountSetId) })
      this.loading = true
      return FmsLedgerApi.getDetailList(params).then(response => {
        if (sequence !== this.listSequence) return
        const rows = response.data
        this.list = rows
      }).finally(() => {
        if (sequence === this.listSequence) this.loading = false
      })
    },
    async handleQuery(value) {
      const changed = value.startMonth !== this.queryParams.startMonth || value.endMonth !== this.queryParams.endMonth
      this.queryParams = Object.assign({}, this.queryParams, value, { accountSetId: Number(this.accountSetId) })
      if (changed) await this.loadSubjectTree()
      if (this.$refs.subjectTree) this.$refs.subjectTree.setCurrentKey(this.queryParams.subjectId)
      return this.getList()
    },
    handleSubjectClick(subject) { this.queryParams.subjectId = subject.id; this.getList() },
    filterSubject(value, data) { return !value || (data.code + ' ' + data.name).toLowerCase().includes(value.toLowerCase()) },
    getSubjectLabel(subject) { return subject.code + ' ' + subject.name },
    getRowClassName({ row }) { return Number(row.rowType) === 2 ? '' : 'ledger-summary-row' },
    openVoucher(row) { this.$router.push({ path: '/fms/voucher/create', query: { id: row.voucherId, accountSetId: this.accountSetId }}) },
    handleExport() {
      if (!this.queryParams.subjectId) return
      this.exportLoading = true
      FmsLedgerApi.exportDetail(this.queryParams).then(response => {
        this.$download.excel(response.data, buildPeriodFilename('明细账', this.queryParams.startMonth, this.queryParams.endMonth))
      }).finally(() => { this.exportLoading = false })
    }
  }
}
</script>

<style scoped>
.ledger-toolbar { margin-bottom: 16px; }
.detail-layout { display: flex; gap: 16px; }
.subject-panel { flex: 0 0 260px; height: calc(100vh - 305px); overflow: auto; border-right: 1px solid #ebeef5; padding-right: 14px; }
.subject-panel .el-tree { margin-top: 12px; }
.detail-layout > .el-table { flex: 1; }
::v-deep .ledger-summary-row td { background: #f5f7fa !important; font-weight: 600; }
</style>
