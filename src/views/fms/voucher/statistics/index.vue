<template>
  <div class="app-container fms-voucher-statistics" data-testid="fms-voucher-statistics-page">
    <el-card shadow="never" class="filter-card">
      <el-form ref="queryForm" :inline="true" :model="queryParams" label-width="68px">
        <el-form-item label="会计期间">
          <el-date-picker
            v-model="monthRange"
            :clearable="false"
            type="monthrange"
            value-format="yyyy-MM"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="凭证字" prop="voucherWordId">
          <fms-voucher-word-select v-model="queryParams.voucherWordId" :options="voucherWords" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="凭证号">
          <div class="range-inputs">
            <el-input-number v-model="queryParams.minVoucherNumber" :controls="false" :min="1" placeholder="起始号" />
            <span>至</span>
            <el-input-number v-model="queryParams.maxVoucherNumber" :controls="false" :min="1" placeholder="结束号" />
          </div>
        </el-form-item>
        <el-form-item label="科目级次">
          <div class="range-inputs">
            <el-input-number v-model="queryParams.minLevel" :controls="false" :min="1" :max="10" />
            <span>至</span>
            <el-input-number v-model="queryParams.maxLevel" :controls="false" :min="1" :max="10" />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          <el-button v-if="accountSetWritable" v-hasPermi="['fms:voucher:create']" type="primary" plain icon="el-icon-plus" @click="openCreate">新增</el-button>
          <el-button v-hasPermi="['fms:voucher:print']" type="primary" plain icon="el-icon-printer" @click="handlePrint">打印</el-button>
          <el-button v-hasPermi="['fms:voucher:statistics:export']" :loading="exportLoading" type="success" plain icon="el-icon-download" @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table
        id="voucher-statistics-table"
        v-loading="loading"
        :data="list"
        :summary-method="getSummaries"
        border
        stripe
        show-summary
        data-testid="fms-voucher-statistics-table"
      >
        <el-table-column label="科目编码" min-width="160" prop="subjectCode">
          <template slot-scope="scope">
            <el-button v-if="checkPermi(['fms:ledger:detail:query'])" type="text" @click="openDetail(scope.row)">{{ scope.row.subjectCode }}</el-button>
            <span v-else>{{ scope.row.subjectCode }}</span>
          </template>
        </el-table-column>
        <el-table-column label="科目名称" min-width="220" prop="subjectName" />
        <el-table-column align="right" label="借方金额" min-width="180" prop="debitAmount">
          <template slot-scope="scope">{{ formatMoney(scope.row.debitAmount) }}</template>
        </el-table-column>
        <el-table-column align="right" label="贷方金额" min-width="180" prop="creditAmount">
          <template slot-scope="scope">{{ formatMoney(scope.row.creditAmount) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
    <fms-print-preview ref="printPreview" />
  </div>
</template>

<script>
import { FmsVoucherWordApi } from '@/api/fms/config/voucher-word'
import { FmsVoucherStatisticsApi } from '@/api/fms/voucher'
import { checkPermi } from '@/utils/permission'

import { formatMoney } from '@/views/fms/utils/format'
import { buildFmsTablePrintHtml } from '@/views/fms/utils/print'
import FmsVoucherWordSelect from '@/views/fms/config/voucher-word/components/FmsVoucherWordSelect.vue'
import FmsPrintPreview from '@/views/fms/components/print/FmsPrintPreview.vue'
import voucherContextMixin from '../mixin'
import { buildPeriodFilename, formatPeriodLabel } from '../helpers'

export default {
  name: 'FmsVoucherStatistics',
  components: { FmsVoucherWordSelect, FmsPrintPreview },
  mixins: [voucherContextMixin],
  data() {
    return {
      loading: false,
      exportLoading: false,
      monthRange: [],
      voucherWords: [],
      list: [],
      queryParams: this.createDefaultQuery(),
      statisticsRequestSequence: 0
    }
  },
  beforeDestroy() {
    this.statisticsRequestSequence += 1
  },
  methods: {
    checkPermi,
    formatMoney,
    clearVoucherData() {
      this.voucherWords = []
      this.list = []
    },
    createDefaultQuery(accountSetId, month) {
      return {
        accountSetId: Number(accountSetId) || 0,
        startMonth: month || '',
        endMonth: month || '',
        voucherWordId: undefined,
        minVoucherNumber: undefined,
        maxVoucherNumber: undefined,
        minLevel: 1,
        maxLevel: 1
      }
    },
    onVoucherContextReady() {
      const accountSetId = Number(this.accountSetId) || 0
      const month = this.currentMonth
      if (!accountSetId) return Promise.resolve()
      this.monthRange = [month, month]
      this.queryParams = this.createDefaultQuery(accountSetId, month)
      return FmsVoucherWordApi.getVoucherWordSimpleList(accountSetId).then(response => {
        if (accountSetId !== Number(this.accountSetId)) return
        const rows = response.data
        this.voucherWords = rows
        return this.getList()
      })
    },
    getList() {
      const accountSetId = Number(this.accountSetId) || 0
      if (!accountSetId) return Promise.resolve()
      const sequence = ++this.statisticsRequestSequence
      this.loading = true
      return FmsVoucherStatisticsApi.getVoucherStatisticsList(this.queryParams).then(response => {
        if (sequence !== this.statisticsRequestSequence || accountSetId !== Number(this.accountSetId)) return
        const rows = response.data
        this.list = rows
      }).finally(() => {
        if (sequence === this.statisticsRequestSequence) this.loading = false
      })
    },
    handleQuery() {
      if (!this.monthRange || this.monthRange.length !== 2) return
      this.queryParams.startMonth = this.monthRange[0]
      this.queryParams.endMonth = this.monthRange[1]
      this.getList()
    },
    resetQuery() {
      this.monthRange = [this.currentMonth, this.currentMonth]
      this.queryParams = this.createDefaultQuery(this.accountSetId, this.currentMonth)
      this.$nextTick(() => this.$refs.queryForm && this.$refs.queryForm.clearValidate())
      this.getList()
    },
    openCreate() {
      this.$router.push({
        path: '/fms/voucher/create',
        query: { accountSetId: this.accountSetId }
      })
    },
    openDetail(row) {
      if (!checkPermi(['fms:ledger:detail:query'])) return
      this.$router.push({
        path: '/fms/ledger/detail',
        query: {
          accountSetId: this.accountSetId,
          subjectId: row.subjectId,
          startMonth: this.queryParams.startMonth,
          endMonth: this.queryParams.endMonth
        }
      })
    },
    handleExport() {
      this.$modal.confirm('是否确认导出当前凭证汇总表？').then(() => {
        this.exportLoading = true
        return FmsVoucherStatisticsApi.exportVoucherStatistics(this.queryParams)
      }).then(response => {
        this.$download.excel(response.data, buildPeriodFilename(
          '凭证汇总表', this.queryParams.startMonth, this.queryParams.endMonth
        ))
      }).catch(() => {}).finally(() => {
        this.exportLoading = false
      })
    },
    handlePrint() {
      const tableElement = document.getElementById('voucher-statistics-table')
      if (!tableElement) {
        this.$message.error('未找到可打印的表格')
        return
      }
      this.$refs.printPreview.printHtml(buildFmsTablePrintHtml({
        title: '凭证汇总表',
        companyName: this.accountSetCompanyName,
        periodLabel: formatPeriodLabel(this.queryParams.startMonth, this.queryParams.endMonth),
        tableElement
      }))
    },
    getSummaries(param) {
      const totalRows = param.data.filter(item => Number(item.level) === Number(this.queryParams.minLevel))
      return param.columns.map((column, index) => {
        if (index === 0) return '总计'
        if (index === 1) return ''
        return formatMoney(totalRows.reduce((sum, item) => sum + Number(item[column.property] || 0), 0))
      })
    }
  }
}
</script>

<style scoped>
.filter-card { margin-bottom: 16px; }
.fms-voucher-statistics .el-form-item { margin-bottom: 14px; }
.range-inputs { display: flex; width: 240px; align-items: center; gap: 8px; }
.range-inputs .el-input-number { width: 105px; }
</style>
