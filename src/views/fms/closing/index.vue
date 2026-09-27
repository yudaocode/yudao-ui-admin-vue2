<template>
  <div class="app-container fms-closing-page">
    <doc-alert title="【结账】期末结账" url="https://doc.iocoder.cn/fms/closing/" />

    <el-card shadow="never" class="section-card">
      <el-form class="period-form" :inline="true" label-width="68px">
        <el-form-item label="会计期间">
          <el-date-picker
            v-model="month"
            type="month"
            value-format="yyyy-MM"
            format="yyyy年MM月"
            :clearable="false"
            :picker-options="monthPickerOptions"
            :disabled="!ready"
            @change="getOverview"
          />
        </el-form-item>
        <el-form-item>
          <el-button :loading="loading" :disabled="!ready" icon="el-icon-refresh" @click="getOverview">刷新</el-button>
        </el-form-item>
      </el-form>
      <el-alert
        v-if="!accountSetLoading && !accountSetId"
        title="当前没有可用的已启用账套，请先在账套管理中完成初始化"
        type="warning"
        :closable="false"
        show-icon
      />
    </el-card>

    <ClosingSchemeList
      v-if="ready && accountSetId"
      ref="schemeList"
      :account-set-id="Number(accountSetId)"
      :month="month"
      :current-period="isCurrentPeriod"
      :closed="overview.closed"
      :voucher-count="Number(overview.voucherCount || 0)"
      :profit-loss-balance="Number(overview.profitLossBalance || 0)"
      :is-writable="isWritable"
      @success="getOverview"
    />

    <el-card v-if="ready" shadow="never" class="section-card">
      <el-alert
        :title="overview.closed ? monthLabel + ' 已结账' : monthLabel + ' 尚未结账'"
        :type="overview.closed ? 'success' : 'info'"
        :closable="false"
        show-icon
        class="overview-alert"
      />
      <el-row v-loading="loading" :gutter="16">
        <el-col :xs="24" :sm="12" :lg="6">
          <ClosingStatusCard
            title="凭证审核"
            :value="overview.pendingVoucherCount + ' 张待审核'"
            :tag-type="!overview.voucherReviewRequired || overview.pendingVoucherCount === 0 ? 'success' : 'danger'"
            :tag-label="overview.voucherReviewRequired ? '结账前必须审核' : '当前未强制审核'"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <ClosingStatusCard
            title="初始余额"
            :value="overview.initialBalanceBalanced ? '试算平衡' : '试算不平衡'"
            :tag-type="overview.initialBalanceBalanced ? 'success' : 'danger'"
            :tag-label="overview.initialBalanceBalanced ? '检查通过' : '需要处理'"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <ClosingStatusCard
            title="凭证编号"
            :value="overview.voucherNumberContinuous ? '编号连续' : '存在断号'"
            :tag-type="overview.voucherNumberContinuous ? 'success' : 'danger'"
            :tag-label="overview.voucherNumberContinuous ? '检查通过' : '需要整理'"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <ClosingStatusCard
            title="损益结转"
            :value="formatMoney(overview.profitLossBalance)"
            :tag-type="overview.profitLossVoucherGenerated && Number(overview.profitLossBalance) === 0 ? 'success' : 'warning'"
            :tag-label="profitLossCheckLabel"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <ClosingStatusCard
            title="利润表检查"
            :value="incomeStatementCheckValue"
            :tag-type="overview.incomeStatementBalanced && overview.incomeStatementUnmappedSubjectCount === 0 ? 'success' : 'danger'"
            :tag-label="overview.incomeStatementBalanced && overview.incomeStatementUnmappedSubjectCount === 0 ? '检查通过' : '需要处理'"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <ClosingStatusCard
            title="资产负债平衡"
            :value="'差额 ' + formatMoney(overview.balanceSheetDifference)"
            :tag-type="balanceSheetCheckPassed ? 'success' : 'danger'"
            :tag-label="balanceSheetCheckLabel"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <ClosingStatusCard
            title="期间状态"
            :value="overview.closed ? '已结账' : '未结账'"
            :tag-type="overview.closed ? 'success' : 'info'"
            :tag-label="overview.closed ? '账簿已锁定' : '允许继续记账'"
          />
        </el-col>
      </el-row>
    </el-card>

    <el-card v-if="ready" shadow="never" class="section-card">
      <div slot="header">执行结账</div>
      <div class="closing-actions">
        <el-button
          v-if="isWritable && !overview.closed && !isBeforeCurrentPeriod"
          v-hasPermi="['fms:closing:close']"
          type="primary"
          :loading="submitting"
          :disabled="!canClose"
          @click="closeToPeriod"
        >{{ isCurrentPeriod ? '结账' : '结账到 ' + monthLabel }}</el-button>
        <el-button
          v-if="isWritable && overview.closed"
          v-hasPermi="['fms:closing:cancel']"
          type="danger"
          plain
          :loading="submitting"
          @click="cancelToPeriod"
        >{{ isCurrentPeriod ? '反结账' : '反结账到 ' + monthLabel }}</el-button>
        <span v-if="!overview.closed && !isBeforeCurrentPeriod && !canClose" class="warning-text">完成上方检查后才可结账</span>
        <span v-if="!overview.closed && isBeforeCurrentPeriod" class="warning-text">结账目标不能早于当前会计期间 {{ currentMonthLabel }}</span>
      </div>
    </el-card>
  </div>
</template>

<script>
import { FmsClosingPeriodApi } from '@/api/fms/closing/period'
import { getAccountSetList } from '@/api/fms/config/account-set'
import { formatMoney } from '@/views/fms/utils/format'
import { readFmsAccountSetId, saveFmsAccountSet } from '@/views/fms/utils/context'
import ClosingSchemeList from './ClosingSchemeList.vue'
import ClosingStatusCard from './ClosingStatusCard.vue'

function pad(value) {
  return String(value).padStart(2, '0')
}

function currentMonthValue() {
  const now = new Date()
  return now.getFullYear() + '-' + pad(now.getMonth() + 1)
}

function toMonth(value, fallback) {
  if (!value) return fallback
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})/)
    if (match) return match[1] + '-' + match[2]
  }
  if (Array.isArray(value) && value.length >= 2) return value[0] + '-' + pad(value[1])
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? fallback : date.getFullYear() + '-' + pad(date.getMonth() + 1)
}

function defaultOverview(month) {
  return {
    month,
    closed: false,
    voucherReviewRequired: false,
    pendingVoucherCount: 0,
    voucherCount: 0,
    profitLossBalance: 0,
    balanceSheetDifference: 0,
    initialBalanceBalanced: false,
    voucherNumberContinuous: false,
    profitLossVoucherGenerated: false,
    incomeStatementBalanced: false,
    incomeStatementUnmappedSubjectCount: 0,
    balanceSheetProfitLossTransferred: false,
    balanceSheetBalanced: false,
    balanceSheetUnmappedSubjectCount: 0,
    canClose: false
  }
}

export default {
  name: 'FmsClosing',
  components: { ClosingSchemeList, ClosingStatusCard },
  data() {
    const currentMonth = currentMonthValue()
    return {
      accountSetLoading: false,
      accountSets: [],
      accountSetId: Number(readFmsAccountSetId(this.$route)) || 0,
      accountSet: null,
      month: currentMonth,
      currentMonth,
      startMonth: currentMonth,
      loading: false,
      submitting: false,
      ready: false,
      overview: defaultOverview(currentMonth),
      initSequence: 0,
      overviewSequence: 0
    }
  },
  computed: {
    monthLabel() {
      const parts = this.month.split('-')
      return parts[0] + '年' + parts[1] + '月'
    },
    currentMonthLabel() {
      const parts = this.currentMonth.split('-')
      return parts[0] + '年' + parts[1] + '月'
    },
    isCurrentPeriod() {
      return this.month === this.currentMonth
    },
    isBeforeCurrentPeriod() {
      return this.month < this.currentMonth
    },
    isWritable() {
      return Boolean(this.accountSet && [1, 3].includes(Number(this.accountSet.level)))
    },
    canClose() {
      return Boolean(this.overview.canClose)
    },
    profitLossCheckLabel() {
      if (!this.overview.profitLossVoucherGenerated) return '未生成结转凭证'
      return Number(this.overview.profitLossBalance) === 0 ? '已结平' : '待结转'
    },
    incomeStatementCheckValue() {
      if (this.overview.incomeStatementUnmappedSubjectCount) {
        return this.overview.incomeStatementUnmappedSubjectCount + ' 个科目未纳入公式'
      }
      return this.overview.incomeStatementBalanced ? '勾稽平衡' : '勾稽不平衡'
    },
    balanceSheetCheckPassed() {
      return Boolean(this.overview.balanceSheetProfitLossTransferred &&
        this.overview.balanceSheetBalanced &&
        this.overview.balanceSheetUnmappedSubjectCount === 0)
    },
    balanceSheetCheckLabel() {
      if (!this.overview.balanceSheetProfitLossTransferred) return '损益未结转'
      if (this.overview.balanceSheetUnmappedSubjectCount > 0) {
        return this.overview.balanceSheetUnmappedSubjectCount + ' 个科目未纳入公式'
      }
      return this.overview.balanceSheetBalanced ? '检查通过' : '不平衡'
    },
    monthPickerOptions() {
      return { disabledDate: this.disabledMonth }
    }
  },
  watch: {
    '$route.query.accountSetId'() {
      const routeAccountSetId = Number(readFmsAccountSetId(this.$route)) || 0
      if (routeAccountSetId && routeAccountSetId !== this.accountSetId) {
        this.accountSetId = routeAccountSetId
        this.initialize()
      }
    }
  },
  created() {
    this.initialize()
  },
  beforeDestroy() {
    this.initSequence += 1
    this.overviewSequence += 1
  },
  methods: {
    formatMoney,
    initialize() {
      const sequence = ++this.initSequence
      this.accountSetLoading = true
      this.ready = false
      return getAccountSetList().then(response => {
        if (sequence !== this.initSequence) return
        const rows = response.data
        this.accountSets = rows.filter(item => item && item.initialized !== false)
        let selected = this.accountSets.find(item => Number(item.id) === Number(this.accountSetId))
        if (!selected) selected = this.accountSets.find(item => item.defaultStatus) || this.accountSets[0]
        if (!selected) {
          this.accountSetId = 0
          this.accountSet = null
          return
        }
        this.accountSet = selected
        this.accountSetId = Number(selected.id)
        saveFmsAccountSet(selected)
        this.startMonth = toMonth(selected.startTime, currentMonthValue())
        return this.loadCurrentMonth().then(() => {
          if (sequence !== this.initSequence) return
          this.month = this.currentMonth
          this.overview = defaultOverview(this.month)
          this.ready = true
          return this.getOverview()
        })
      }).finally(() => {
        if (sequence === this.initSequence) this.accountSetLoading = false
      })
    },
    loadCurrentMonth() {
      return FmsClosingPeriodApi.getCurrentMonth(this.accountSetId).then(response => {
        this.currentMonth = response.data
        return this.currentMonth
      })
    },
    getOverview() {
      if (!this.accountSetId || !this.month) return Promise.resolve()
      const accountSetId = this.accountSetId
      const month = this.month
      const sequence = ++this.overviewSequence
      this.loading = true
      return FmsClosingPeriodApi.getClosingOverview({ accountSetId, month }).then(response => {
        if (sequence !== this.overviewSequence || accountSetId !== this.accountSetId || month !== this.month) return
        const overview = response.data
        this.overview = Object.assign(defaultOverview(month), overview)
      }).finally(() => {
        if (sequence === this.overviewSequence) this.loading = false
      })
    },
    closeToPeriod() {
      if (!this.accountSetId || this.isBeforeCurrentPeriod) return
      const confirmText = this.isCurrentPeriod
        ? '结账后将锁定 ' + this.monthLabel + '，是否继续？'
        : '将按期间顺序结账至 ' + this.monthLabel + '，是否继续？'
      this.$modal.confirm(confirmText).then(() => {
        this.submitting = true
        return FmsClosingPeriodApi.closePeriod({ accountSetId: this.accountSetId, month: this.month })
      }).then(() => {
        this.$modal.msgSuccess('结账成功')
        return this.loadCurrentMonth()
      }).then(() => {
        this.month = this.currentMonth
        return this.getOverview()
      }).catch(() => {}).finally(() => { this.submitting = false })
    },
    cancelToPeriod() {
      if (!this.accountSetId || !this.overview.closed) return
      this.$modal.confirm('反结账会影响历史报表数据，将撤销 ' + this.monthLabel + ' 及之后的结账，确认继续吗？').then(() => {
        this.submitting = true
        return FmsClosingPeriodApi.cancelClosePeriod({ accountSetId: this.accountSetId, month: this.month })
      }).then(() => {
        this.$modal.msgSuccess('反结账成功')
        return this.loadCurrentMonth()
      }).then(() => {
        this.month = this.currentMonth
        return this.getOverview()
      }).catch(() => {}).finally(() => { this.submitting = false })
    },
    disabledMonth(date) {
      const selectedMonth = date.getFullYear() + '-' + pad(date.getMonth() + 1)
      return selectedMonth < this.startMonth || selectedMonth > currentMonthValue()
    }
  }
}
</script>

<style scoped>
.section-card { margin-bottom: 16px; }
.period-form { margin-bottom: -15px; }
.overview-alert { margin-bottom: 16px; }
.closing-actions { display: flex; align-items: center; gap: 12px; min-height: 32px; }
.warning-text { color: #e6a23c; }
</style>
