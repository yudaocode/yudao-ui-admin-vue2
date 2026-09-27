<template>
  <div class="app-container fms-voucher-list" data-testid="fms-voucher-list-page">
    <el-card shadow="never" class="filter-card">
      <el-form ref="queryForm" :inline="true" :model="queryParams" label-width="68px">
        <el-form-item label="会计期间">
          <el-date-picker
            v-model="monthRange"
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
        <el-form-item label="凭证号" prop="voucherNumber">
          <el-input-number v-model="queryParams.voucherNumber" :controls="false" :min="1" placeholder="请输入凭证号" style="width: 240px" />
        </el-form-item>
        <el-form-item label="摘要" prop="digest">
          <el-input v-model="queryParams.digest" clearable placeholder="请输入摘要" style="width: 240px" @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="科目" prop="subjectId">
          <fms-subject-select v-model="queryParams.subjectId" :options="subjects" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="金额">
          <div class="range-inputs">
            <el-input-number v-model="queryParams.minAmount" :controls="false" :min="0" :precision="2" placeholder="最小金额" />
            <span>至</span>
            <el-input-number v-model="queryParams.maxAmount" :controls="false" :min="0" :precision="2" placeholder="最大金额" />
          </div>
        </el-form-item>
        <el-form-item label="制单人" prop="creatorUserId">
          <user-select v-model="queryParams.creatorUserId" style="width: 240px" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" clearable placeholder="请选择状态" style="width: 240px">
            <el-option v-for="item in voucherStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          <el-button
            v-if="accountSetWritable"
            v-hasPermi="['fms:voucher:create']"
            type="primary"
            plain
            icon="el-icon-plus"
            @click="openCreate"
          >新增</el-button>
          <el-dropdown
            v-if="hasMorePermission"
            class="more-button"
            trigger="click"
            @command="handleMoreCommand"
          >
            <el-button>更多<i class="el-icon-arrow-down el-icon--right" /></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="checkPermi(['fms:voucher:print'])" command="print">打印凭证</el-dropdown-item>
              <el-dropdown-item v-if="checkPermi(['fms:voucher:print'])" command="printList">打印列表</el-dropdown-item>
              <el-dropdown-item v-if="checkPermi(['fms:voucher:export'])" command="export">导出</el-dropdown-item>
              <el-dropdown-item v-if="accountSetWritable && checkPermi(['fms:voucher:import'])" command="import">导入凭证</el-dropdown-item>
              <el-dropdown-item v-if="accountSetWritable && checkPermi(['fms:voucher:move'])" command="move" divided>移动凭证</el-dropdown-item>
              <el-dropdown-item v-if="accountSetWritable && checkPermi(['fms:voucher:tidy'])" command="tidy">整理凭证</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <div v-if="selectedRows.length && accountSetWritable" class="batch-bar">
        <span>已选择 {{ selectedRows.length }} 张凭证</span>
        <el-button v-hasPermi="['fms:voucher:review']" size="mini" @click="handleBatchReview(FMS_VOUCHER_STATUS.APPROVED)">批量审核</el-button>
        <el-button v-hasPermi="['fms:voucher:review']" size="mini" @click="handleBatchReview(FMS_VOUCHER_STATUS.PENDING_REVIEW)">批量反审核</el-button>
        <el-button v-hasPermi="['fms:voucher:delete']" size="mini" type="danger" @click="handleBatchDelete">批量删除</el-button>
      </div>
      <el-table
        ref="table"
        v-loading="loading"
        :data="list"
        stripe
        border
        data-testid="fms-voucher-table"
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="accountSetWritable" type="selection" width="46" :selectable="rowSelectable" />
        <el-table-column align="center" label="日期" prop="voucherTime" width="110">
          <template slot-scope="scope">{{ formatDateOnly(scope.row.voucherTime) }}</template>
        </el-table-column>
        <el-table-column align="center" label="凭证字号" width="110">
          <template slot-scope="scope">
            <el-button type="text" @click="openVoucher(scope.row)">{{ scope.row.voucherWordName }}-{{ scope.row.voucherNumber }}</el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" label="附件" width="72">
          <template slot-scope="scope">
            <el-button v-if="(scope.row.attachmentUrls || []).length || canEditVoucherAttachments(scope.row)" type="text" @click="openAttachmentDialog(scope.row)">
              <i class="el-icon-paperclip" /> {{ (scope.row.attachmentUrls || []).length }}
            </el-button>
            <span v-else><i class="el-icon-paperclip" /> 0</span>
          </template>
        </el-table-column>
        <el-table-column label="摘要" min-width="190">
          <template slot-scope="scope">
            <div class="entry-lines">
              <div v-for="(entry, index) in scope.row.entries || []" :key="entry.id || index" :title="entry.digest">{{ entry.digest }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="会计科目" min-width="230">
          <template slot-scope="scope">
            <div class="entry-lines">
              <div v-for="(entry, index) in scope.row.entries || []" :key="entry.id || index" :title="entry.subjectName">
                {{ entry.subjectCode }} {{ entry.subjectName }}
                <span v-if="entry.auxiliaries && entry.auxiliaries.length" class="muted">/ {{ entry.auxiliaries.map(item => item.name).join('、') }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="right" label="借方金额" width="135">
          <template slot-scope="scope">
            <div class="entry-lines amount-lines">
              <div v-for="(entry, index) in scope.row.entries || []" :key="entry.id || index">{{ Number(entry.debitAmount) ? formatMoney(entry.debitAmount) : '' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="right" label="贷方金额" width="135">
          <template slot-scope="scope">
            <div class="entry-lines amount-lines">
              <div v-for="(entry, index) in scope.row.entries || []" :key="entry.id || index">{{ Number(entry.creditAmount) ? formatMoney(entry.creditAmount) : '' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="制单人" prop="creatorUserName" width="100" />
        <el-table-column align="center" label="审核人" prop="reviewerUserName" width="100" />
        <el-table-column align="center" label="状态" width="90">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.closingGenerated" type="info">结账生成</el-tag>
            <el-tag v-else :type="Number(scope.row.status) === FMS_VOUCHER_STATUS.APPROVED ? 'success' : 'warning'">
              {{ Number(scope.row.status) === FMS_VOUCHER_STATUS.APPROVED ? '已审核' : '待审核' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作" width="250">
          <template slot-scope="scope">
            <el-button type="text" @click="openVoucher(scope.row)">{{ scope.row.closingGenerated || !accountSetWritable ? '查看' : '编辑' }}</el-button>
            <el-button
              v-if="accountSetWritable && !scope.row.closingGenerated && Number(scope.row.status) === FMS_VOUCHER_STATUS.PENDING_REVIEW"
              v-hasPermi="['fms:voucher:review']"
              type="text"
              @click="handleReview(scope.row, FMS_VOUCHER_STATUS.APPROVED)"
            >审核</el-button>
            <el-button
              v-else-if="accountSetWritable && !scope.row.closingGenerated"
              v-hasPermi="['fms:voucher:review']"
              type="text"
              @click="handleReview(scope.row, FMS_VOUCHER_STATUS.PENDING_REVIEW)"
            >反审核</el-button>
            <el-button v-hasPermi="['fms:voucher:print']" type="text" @click="handlePrintVoucher(scope.row)">打印</el-button>
            <el-button
              v-if="accountSetWritable && !scope.row.closingGenerated && Number(scope.row.status) !== FMS_VOUCHER_STATUS.APPROVED"
              v-hasPermi="['fms:voucher:delete']"
              type="text"
              class="danger-text"
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <fms-voucher-move-form ref="moveForm" @success="getList" />
    <fms-voucher-import-form ref="importForm" @success="getList" />
    <fms-voucher-print-form ref="printForm" />
    <fms-voucher-tidy-form ref="tidyForm" @success="getList" />
    <fms-voucher-attachment-form ref="attachmentForm" @success="getList" />
  </div>
</template>

<script>
import * as FmsSubjectApi from '@/api/fms/config/subject'
import { FmsVoucherWordApi } from '@/api/fms/config/voucher-word'
import { FmsVoucherApi } from '@/api/fms/voucher'
import { checkPermi } from '@/utils/permission'

import { formatMoney } from '@/views/fms/utils/format'
import FmsSubjectSelect from '@/views/fms/config/subject/components/FmsSubjectSelect.vue'
import FmsVoucherWordSelect from '@/views/fms/config/voucher-word/components/FmsVoucherWordSelect.vue'
import UserSelect from '@/views/system/user/components/UserSelect.vue'
import FmsVoucherPrintForm from '../components/FmsVoucherPrintForm.vue'
import { buildVoucherListPrintHtml } from '../components/print'
import FmsVoucherAttachmentForm from './FmsVoucherAttachmentForm.vue'
import FmsVoucherMoveForm from './FmsVoucherMoveForm.vue'
import FmsVoucherImportForm from './FmsVoucherImportForm.vue'
import FmsVoucherTidyForm from './FmsVoucherTidyForm.vue'
import voucherContextMixin from '../mixin'
import {
  FMS_VOUCHER_STATUS,
  FMS_VOUCHER_STATUS_OPTIONS,
  formatDateOnly,
  formatPeriodLabel,
  getMonthRange
} from '../helpers'

export default {
  name: 'FmsVoucherList',
  components: {
    FmsSubjectSelect,
    FmsVoucherWordSelect,
    UserSelect,
    FmsVoucherPrintForm,
    FmsVoucherAttachmentForm,
    FmsVoucherMoveForm,
    FmsVoucherImportForm,
    FmsVoucherTidyForm
  },
  mixins: [voucherContextMixin],
  data() {
    return {
      FMS_VOUCHER_STATUS,
      voucherStatusOptions: FMS_VOUCHER_STATUS_OPTIONS,
      loading: false,
      total: 0,
      list: [],
      selectedRows: [],
      voucherWords: [],
      subjects: [],
      monthRange: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        accountSetId: 0,
        voucherWordId: undefined,
        voucherNumber: undefined,
        digest: undefined,
        subjectId: undefined,
        minAmount: undefined,
        maxAmount: undefined,
        creatorUserId: undefined,
        status: undefined
      },
      listRequestSequence: 0
    }
  },
  computed: {
    hasMorePermission() {
      return checkPermi([
        'fms:voucher:print',
        'fms:voucher:export',
        'fms:voucher:import',
        'fms:voucher:move',
        'fms:voucher:tidy'
      ])
    }
  },
  beforeDestroy() {
    this.listRequestSequence += 1
  },
  methods: {
    checkPermi,
    formatMoney,
    formatDateOnly,
    clearVoucherData() {
      this.list = []
      this.total = 0
      this.voucherWords = []
      this.subjects = []
      this.selectedRows = []
    },
    onVoucherContextReady() {
      const accountSetId = Number(this.accountSetId) || 0
      if (!accountSetId) return Promise.resolve()
      this.queryParams.accountSetId = accountSetId
      this.monthRange = [this.currentMonth, this.currentMonth]
      return Promise.all([
        FmsVoucherWordApi.getVoucherWordSimpleList(accountSetId),
        FmsSubjectApi.getSubjectSimpleList(accountSetId)
      ]).then(responses => {
        if (accountSetId !== Number(this.accountSetId)) return
        const words = responses[0].data
        const subjects = responses[1].data
        this.voucherWords = words
        this.subjects = subjects
        return this.getList()
      })
    },
    getList() {
      const accountSetId = Number(this.accountSetId) || 0
      if (!accountSetId) return Promise.resolve()
      const sequence = ++this.listRequestSequence
      this.loading = true
      return FmsVoucherApi.getVoucherPage(this.buildQueryParams()).then(response => {
        if (sequence !== this.listRequestSequence || accountSetId !== Number(this.accountSetId)) return
        const data = response.data
        this.list = data.list
        this.total = Number(data.total)
        this.selectedRows = []
      }).finally(() => {
        if (sequence === this.listRequestSequence) this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      this.monthRange = [this.currentMonth, this.currentMonth]
      Object.assign(this.queryParams, {
        minAmount: undefined,
        maxAmount: undefined,
        pageNo: 1
      })
      this.getList()
    },
    buildQueryParams(ids) {
      const params = Object.assign({}, this.queryParams, { accountSetId: Number(this.accountSetId) })
      if (ids && ids.length) params.ids = ids
      if (this.monthRange && this.monthRange.length === 2) {
        const begin = getMonthRange(this.monthRange[0])
        const end = getMonthRange(this.monthRange[1])
        params.voucherTime = [begin[0], end[1]]
      }
      return params
    },
    openCreate() {
      this.$router.push({
        path: '/fms/voucher/create',
        query: { accountSetId: this.accountSetId }
      })
    },
    openVoucher(row) {
      this.$router.push({
        path: '/fms/voucher/create',
        query: {
          accountSetId: this.accountSetId,
          id: row.id,
          ids: this.list.map(item => item.id).join(',')
        }
      })
    },
    openAttachmentDialog(row) {
      if (!this.accountSetId) return
      this.$refs.attachmentForm.open(this.accountSetId, row)
    },
    canEditVoucherAttachments(row) {
      return Boolean(
        this.accountSetWritable && Number(row.status) === FMS_VOUCHER_STATUS.PENDING_REVIEW &&
        !row.closingGenerated && checkPermi(['fms:voucher:update'])
      )
    },
    rowSelectable(row) {
      return !row.closingGenerated
    },
    handleSelectionChange(rows) {
      this.selectedRows = rows
    },
    handleMoreCommand(command) {
      if (!this.accountSetId) return
      if (command === 'print') return this.handlePrintVoucher()
      if (command === 'printList') return this.handlePrintList()
      if (command === 'export') return this.handleExport()
      if (command === 'import') return this.$refs.importForm.open(this.accountSetId)
      if (!this.voucherWords.length) {
        this.$modal.msgWarning('请先设置凭证字')
        return
      }
      const defaultMonth = this.monthRange[1] || this.currentMonth
      if (command === 'move') this.$refs.moveForm.open(this.accountSetId, defaultMonth, this.voucherWords)
      if (command === 'tidy') this.$refs.tidyForm.open(this.accountSetId, defaultMonth, this.voucherWords)
    },
    handlePrintVoucher(row) {
      let request
      if (row) request = Promise.resolve([row])
      else if (this.selectedRows.length) request = Promise.resolve(this.selectedRows)
      else request = this.getAllVoucherList()
      return request.then(vouchers => {
        if (!vouchers.length) {
          this.$modal.msgWarning('暂无可打印的凭证')
          return
        }
        this.$refs.printForm.open(this.accountSetId, this.accountSetCompanyName, vouchers)
      })
    },
    handlePrintList() {
      return this.getAllVoucherList().then(vouchers => {
        if (!vouchers.length) {
          this.$modal.msgWarning('暂无可打印的凭证')
          return
        }
        this.$refs.printForm.previewHtml(buildVoucherListPrintHtml(
          this.accountSetCompanyName,
          formatPeriodLabel(this.monthRange[0], this.monthRange[1]),
          vouchers
        ))
      })
    },
    getAllVoucherList() {
      this.loading = true
      return FmsVoucherApi.getVoucherPrintList(this.buildQueryParams()).then(response => {
        const rows = response.data
        return rows
      }).finally(() => {
        this.loading = false
      })
    },
    handleExport() {
      this.$modal.confirm('是否确认导出当前筛选范围的凭证？').then(() => {
        this.loading = true
        const ids = this.selectedRows.length ? this.selectedRows.map(row => row.id) : undefined
        return FmsVoucherApi.exportVoucher(this.buildQueryParams(ids))
      }).then(response => {
        this.$download.excel(response.data, '凭证列表.xls')
      }).catch(() => {}).finally(() => {
        this.loading = false
      })
    },
    handleReview(row, status) {
      const text = status === FMS_VOUCHER_STATUS.APPROVED ? '确认审核该凭证吗？' : '确认反审核该凭证吗？'
      this.$modal.confirm(text).then(() => {
        return FmsVoucherApi.updateVoucherReviewStatus(this.accountSetId, [row.id], status)
      }).then(() => {
        this.$modal.msgSuccess('操作成功')
        this.getList()
      }).catch(() => {})
    },
    handleBatchReview(status) {
      const rows = this.selectedRows.filter(row => status === FMS_VOUCHER_STATUS.APPROVED
        ? Number(row.status) === FMS_VOUCHER_STATUS.PENDING_REVIEW
        : Number(row.status) === FMS_VOUCHER_STATUS.APPROVED)
      if (!rows.length) {
        this.$modal.msgWarning('所选凭证不符合当前审核操作')
        return
      }
      const text = status === FMS_VOUCHER_STATUS.APPROVED
        ? '确认审核选中的 ' + rows.length + ' 张凭证吗？'
        : '确认反审核选中的 ' + rows.length + ' 张凭证吗？'
      this.$modal.confirm(text).then(() => {
        return FmsVoucherApi.updateVoucherReviewStatus(this.accountSetId, rows.map(row => row.id), status)
      }).then(() => {
        this.$modal.msgSuccess('操作成功')
        this.getList()
      }).catch(() => {})
    },
    handleDelete(row) {
      this.$modal.confirm('确认删除凭证“' + row.voucherWordName + '-' + row.voucherNumber + '”吗？删除后会产生断号').then(() => {
        return FmsVoucherApi.deleteVoucherList(this.accountSetId, [row.id])
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    handleBatchDelete() {
      const rows = this.selectedRows
      if (rows.some(row => Number(row.status) === FMS_VOUCHER_STATUS.APPROVED)) {
        this.$modal.msgWarning('批量删除不能包含已审核凭证')
        return
      }
      this.$modal.confirm('确认删除选中的 ' + rows.length + ' 张凭证吗？删除后会产生断号').then(() => {
        return FmsVoucherApi.deleteVoucherList(this.accountSetId, rows.map(row => row.id))
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.fms-voucher-list .filter-card { margin-bottom: 16px; }
.fms-voucher-list .el-form-item { margin-bottom: 14px; }
.range-inputs { display: flex; width: 240px; align-items: center; gap: 7px; }
.range-inputs .el-input-number { width: 106px; }
.more-button { margin-left: 10px; }
.batch-bar { display: flex; min-height: 44px; align-items: center; gap: 10px; margin-bottom: 12px; padding: 0 14px; border: 1px solid #c6e2ff; background: #ecf5ff; color: #409eff; }
.entry-lines > div { min-height: 28px; overflow: hidden; border-bottom: 1px dashed #ebeef5; line-height: 28px; text-overflow: ellipsis; white-space: nowrap; }
.entry-lines > div:last-child { border-bottom: 0; }
.amount-lines { font-family: Arial, sans-serif; font-variant-numeric: tabular-nums; }
.muted { color: #909399; }
.danger-text { color: #f56c6c; }
</style>
