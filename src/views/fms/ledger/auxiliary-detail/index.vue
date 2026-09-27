<template>
  <div class="app-container fms-ledger-page">
    <doc-alert title="【账簿】账簿管理" url="https://doc.iocoder.cn/fms/ledger/" />
    <el-card class="ledger-toolbar" shadow="never">
      <el-form :inline="true" label-width="78px" class="ledger-form">
        <el-form-item label="会计期间"><FmsLedgerMonthRangePicker v-model="monthRange" /></el-form-item>
        <el-form-item label="辅助类">
          <FmsAuxiliaryTypeSelect v-model="queryParams.auxiliaryTypeId" :account-set-id="accountSetId" :clearable="false" style="width: 220px" @change="handleTypeChange" @loaded="handleTypeLoaded" />
        </el-form-item>
        <el-form-item label="科目"><FmsSubjectSelect v-model="queryParams.subjectId" :options="subjects" clearable placeholder="全部科目" style="width: 220px" /></el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          <FmsLedgerPrintButton
            :center-text="selectedItemPrintText"
            :end-month="monthRange[1] || ''"
            :start-month="monthRange[0] || ''"
            permission-prefix="fms:ledger:detail"
            target="fms-auxiliary-detail-ledger-table"
            title="核算项目明细账"
          />
          <el-button v-hasPermi="['fms:ledger:detail:export']" :loading="exportLoading" type="success" plain icon="el-icon-download" @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never">
      <div v-if="selectedItem" class="selected-item">{{ selectedType && selectedType.name }}：{{ selectedItem.code }}_{{ selectedItem.name }}</div>
      <div class="auxiliary-layout">
        <el-table id="fms-auxiliary-detail-ledger-table" v-loading="loading || accountSetLoading" :data="list" :row-class-name="getRowClassName" border stripe height="calc(100vh - 345px)">
          <el-table-column align="center" label="日期" prop="accountDate" width="110" />
          <el-table-column align="center" label="凭证字号" width="110"><template slot-scope="scope"><el-button v-if="scope.row.voucherId" v-hasPermi="['fms:voucher:query']" type="text" @click="openVoucher(scope.row)">{{ scope.row.voucherNumber }}</el-button></template></el-table-column>
          <el-table-column label="摘要" min-width="180" prop="digest" />
          <el-table-column align="right" label="借方" width="140"><template slot-scope="scope">{{ formatMoney(scope.row.debitAmount) }}</template></el-table-column>
          <el-table-column align="right" label="贷方" width="140"><template slot-scope="scope">{{ formatMoney(scope.row.creditAmount) }}</template></el-table-column>
          <el-table-column align="center" label="方向" prop="balanceDirection" width="80" />
          <el-table-column align="right" label="余额" width="150"><template slot-scope="scope">{{ formatMoney(scope.row.balance) }}</template></el-table-column>
        </el-table>
        <aside v-if="!quickPanelCollapsed" class="quick-panel">
          <div class="quick-title"><strong>快捷项目</strong><el-tooltip content="收起快捷项目" placement="top"><el-button circle plain icon="el-icon-arrow-right" @click="quickPanelCollapsed = true" /></el-tooltip></div>
          <el-input v-model="itemKeyword" clearable placeholder="搜索辅助项目" prefix-icon="el-icon-search" />
          <div class="quick-list">
            <button v-for="item in filteredItems" :key="item.id" type="button" :class="{ active: Number(item.id) === Number(queryParams.auxiliaryItemId) }" @click="handleItemClick(item.id)"><span>{{ item.code }}</span><span>{{ item.name }}</span></button>
            <el-empty v-if="!filteredItems.length" description="暂无辅助项目" :image-size="64" />
          </div>
        </aside>
        <aside v-else class="quick-panel-collapsed"><el-tooltip content="展开快捷项目" placement="top"><el-button circle plain icon="el-icon-arrow-left" @click="quickPanelCollapsed = false" /></el-tooltip></aside>
      </div>
    </el-card>
  </div>
</template>

<script>
import { FmsAuxiliaryItemApi } from '@/api/fms/config/auxiliary/item'
import { FmsLedgerApi } from '@/api/fms/ledger'
import * as FmsSubjectApi from '@/api/fms/config/subject'
import FmsAuxiliaryTypeSelect from '@/views/fms/config/auxiliary/components/FmsAuxiliaryTypeSelect.vue'
import FmsSubjectSelect from '@/views/fms/config/subject/components/FmsSubjectSelect.vue'

import { formatMoney } from '@/views/fms/utils/format'
import FmsLedgerMonthRangePicker from '../components/FmsLedgerMonthRangePicker.vue'
import FmsLedgerPrintButton from '../components/FmsLedgerPrintButton.vue'
import ledgerContextMixin from '../mixin'
import { buildPeriodFilename, buildTree, currentMonthValue } from '../utils'

export default {
  name: 'FmsAuxiliaryDetailLedger',
  components: { FmsAuxiliaryTypeSelect, FmsSubjectSelect, FmsLedgerMonthRangePicker, FmsLedgerPrintButton },
  mixins: [ledgerContextMixin],
  data() {
    const month = currentMonthValue()
    return {
      loading: false,
      exportLoading: false,
      list: [],
      types: [],
      items: [],
      subjects: [],
      dataItemIds: [],
      itemKeyword: '',
      quickPanelCollapsed: false,
      loadSequence: 0,
      listSequence: 0,
      subjectSequence: 0,
      monthRange: [month, month],
      queryParams: { accountSetId: 0, startMonth: month, endMonth: month, auxiliaryTypeId: 0, auxiliaryItemId: 0, subjectId: undefined }
    }
  },
  computed: {
    selectedType() { return this.types.find(item => Number(item.id) === Number(this.queryParams.auxiliaryTypeId)) },
    selectedItem() { return this.items.find(item => Number(item.id) === Number(this.queryParams.auxiliaryItemId)) },
    selectedItemPrintText() { return this.selectedItem ? '辅助项目：' + ((this.selectedType && this.selectedType.name) || '') + ' ' + this.selectedItem.code + '_' + this.selectedItem.name : '' },
    filteredItems() {
      const keyword = this.itemKeyword.toLowerCase()
      return this.items.filter(item => this.dataItemIds.includes(Number(item.id))).filter(item => !keyword || (item.code + ' ' + item.name).toLowerCase().includes(keyword))
    }
  },
  beforeDestroy() { this.loadSequence += 1; this.listSequence += 1; this.subjectSequence += 1 },
  methods: {
    formatMoney,
    clearLedgerData() { this.list = []; this.items = []; this.dataItemIds = []; this.subjects = [] },
    onLedgerContextReady() {
      this.monthRange = [this.accountingMonth, this.accountingMonth]
      this.queryParams.accountSetId = Number(this.accountSetId)
      this.queryParams.startMonth = this.accountingMonth
      this.queryParams.endMonth = this.accountingMonth
      this.loadSubjectOptions()
      if (this.queryParams.auxiliaryTypeId) return this.loadItems()
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
      if (!this.types.some(item => Number(item.id) === Number(this.queryParams.auxiliaryTypeId))) this.queryParams.auxiliaryTypeId = (this.types[0] && this.types[0].id) || 0
      this.loadItems()
    },
    handleTypeChange() { this.itemKeyword = ''; return this.loadItems() },
    handleQuery() { return this.loadItems() },
    resetQuery() {
      const month = this.accountingMonth || currentMonthValue()
      this.monthRange = [month, month]
      this.queryParams.auxiliaryTypeId = (this.types[0] && this.types[0].id) || 0
      this.queryParams.subjectId = undefined
      this.itemKeyword = ''
      return this.loadItems()
    },
    loadItems() {
      const sequence = ++this.loadSequence
      this.list = []
      this.items = []
      this.dataItemIds = []
      this.queryParams.auxiliaryItemId = 0
      if (!this.accountSetId || !this.queryParams.auxiliaryTypeId || this.monthRange.length !== 2) return Promise.resolve()
      const balanceParams = {
        accountSetId: Number(this.accountSetId),
        startMonth: this.monthRange[0],
        endMonth: this.monthRange[1],
        auxiliaryTypeId: this.queryParams.auxiliaryTypeId,
        subjectId: this.queryParams.subjectId
      }
      return Promise.all([
        FmsAuxiliaryItemApi.getAuxiliaryItemSimpleList(Number(this.accountSetId), this.queryParams.auxiliaryTypeId),
        FmsLedgerApi.getAuxiliaryBalanceList(balanceParams)
      ]).then(responses => {
        if (sequence !== this.loadSequence) return
        const items = responses[0].data
        const balances = responses[1].data
        this.items = items
        this.dataItemIds = (balances).filter(item => Number(item.periodDebitAmount || 0) !== 0 || Number(item.periodCreditAmount || 0) !== 0).map(item => Number(item.auxiliaryItemId))
        this.queryParams.auxiliaryItemId = this.dataItemIds[0] || 0
        return this.getList()
      })
    },
    getList() {
      if (!this.accountSetId || !this.queryParams.auxiliaryItemId || this.monthRange.length !== 2) { this.list = []; return Promise.resolve() }
      const sequence = ++this.listSequence
      this.queryParams = Object.assign({}, this.queryParams, { accountSetId: Number(this.accountSetId), startMonth: this.monthRange[0], endMonth: this.monthRange[1] })
      this.loading = true
      return FmsLedgerApi.getAuxiliaryDetailList(this.queryParams).then(response => {
        if (sequence !== this.listSequence) return
        const rows = response.data
        this.list = rows
      }).finally(() => {
        if (sequence === this.listSequence) this.loading = false
      })
    },
    handleItemClick(id) { this.queryParams.auxiliaryItemId = id; this.getList() },
    getRowClassName({ row }) { return Number(row.rowType) === 2 ? '' : 'ledger-summary-row' },
    openVoucher(row) { this.$router.push({ path: '/fms/voucher/create', query: { id: row.voucherId, accountSetId: this.accountSetId }}) },
    handleExport() {
      if (!this.queryParams.auxiliaryItemId) return
      this.exportLoading = true
      FmsLedgerApi.exportAuxiliaryDetail(this.queryParams).then(response => {
        this.$download.excel(response.data, buildPeriodFilename('核算项目明细账', this.queryParams.startMonth, this.queryParams.endMonth))
      }).finally(() => { this.exportLoading = false })
    }
  }
}
</script>

<style scoped>
.ledger-toolbar { margin-bottom: 16px; }
.ledger-form { margin-bottom: -18px; }
.selected-item { padding-bottom: 12px; font-weight: 600; }
.auxiliary-layout { display: flex; align-items: stretch; gap: 12px; }
.auxiliary-layout > .el-table { flex: 1; }
.quick-panel { flex: 0 0 240px; height: calc(100vh - 345px); border-left: 1px solid #ebeef5; padding-left: 14px; }
.quick-panel-collapsed { flex: 0 0 36px; height: calc(100vh - 345px); border-left: 1px solid #ebeef5; padding-left: 8px; }
.quick-title { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.quick-list { height: calc(100% - 48px); margin-top: 12px; overflow: auto; }
.quick-list button { display: flex; width: 100%; flex-direction: column; gap: 3px; border: 0; border-radius: 4px; background: transparent; padding: 9px 10px; text-align: left; color: #606266; cursor: pointer; }
.quick-list button:hover, .quick-list button.active { background: #ecf5ff; color: #409eff; }
::v-deep .ledger-summary-row td { background: #f5f7fa !important; font-weight: 600; }
</style>
