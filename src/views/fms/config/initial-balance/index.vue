<template>
  <div class="app-container fms-initial-balance-page">
    <doc-alert
      title="【设置】币别、科目、辅助核算、初始余额"
      url="https://doc.iocoder.cn/fms/config/accounting/"
    />

    <el-card class="toolbar-card" shadow="never">
      <el-form :inline="true" label-width="78px" class="initial-balance-toolbar">
        <el-form-item label="当前账套">
          <el-select
            v-model="accountSetId"
            filterable
            clearable
            placeholder="请选择账套"
            style="width: 240px"
            @change="handleAccountSetChange"
          >
            <el-option
              v-for="item in accountSets"
              :key="item.id"
              :label="item.companyName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="科目类别">
          <el-select
            v-model="subjectType"
            style="width: 180px"
            @change="changeSubjectType"
          >
            <el-option
              v-for="item in subjectTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            v-if="editable && isWritable"
            v-hasPermi="['fms:config:initial-balance:update']"
            type="primary"
            :loading="saving"
            @click="handleSave"
          >保存</el-button>
          <el-button
            v-hasPermi="['fms:config:initial-balance:query']"
            type="primary"
            plain
            :disabled="!accountSetId"
            @click="openTrialBalance"
          >试算平衡</el-button>
          <el-button
            v-if="editable && isWritable"
            v-hasPermi="['fms:config:initial-balance:import']"
            type="warning"
            plain
            icon="el-icon-upload2"
            @click="openImportForm"
          >导入</el-button>
          <el-button
            v-hasPermi="['fms:config:initial-balance:export']"
            type="success"
            plain
            icon="el-icon-download"
            :loading="exportLoading"
            :disabled="!accountSetId"
            @click="handleExport"
          >导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-alert
        v-if="!accountSetLoading && !accountSetId"
        class="balance-alert"
        :closable="false"
        show-icon
        title="请先选择已初始化的账套"
        type="info"
      />
      <el-alert
        v-if="isJanuary"
        class="balance-alert"
        :closable="false"
        show-icon
        title="账套从一月启用，只需录入期初余额"
        type="info"
      />
      <el-alert
        v-if="accountStartTime && !editable"
        class="balance-alert"
        :closable="false"
        show-icon
        title="账套已结账，初始余额不可修改"
        type="warning"
      />
      <el-alert
        v-if="edited"
        class="balance-alert"
        :closable="false"
        show-icon
        title="当前修改尚未保存，切换科目类别或离开页面前请先保存"
        type="warning"
      />

      <el-table
        v-loading="loading || accountSetLoading"
        :data="tableData"
        :row-key="row => row.rowKey"
        border
        stripe
      >
        <el-table-column fixed="left" label="科目编码" min-width="140">
          <template slot-scope="scope">
            <span :class="{ 'assist-row-text': scope.row.isAssist }">
              {{ scope.row.subjectCode }}
            </span>
          </template>
        </el-table-column>
        <el-table-column fixed="left" label="科目名称" min-width="240">
          <template slot-scope="scope">
            <span
              :class="{ 'assist-row-text': scope.row.isAssist }"
              :style="{ paddingLeft: ((scope.row.level - 1) * 14) + 'px' }"
            >{{ getRowName(scope.row) }}</span>
            <el-button
              v-if="canAddAssist(scope.row)"
              class="row-action"
              type="text"
              icon="el-icon-plus"
              @click="openAssistForm(scope.row)"
            >添加明细</el-button>
            <el-button
              v-if="scope.row.isAssist && editable && isWritable"
              class="row-action danger-text"
              type="text"
              @click="removeAssist(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="left" label="方向" width="72">
          <template slot-scope="scope">
            {{ scope.row.balanceDirection === FMS_DEBIT_CREDIT_DIRECTION.DEBIT ? '借' : '贷' }}
          </template>
        </el-table-column>

        <el-table-column label="期初余额" align="center">
          <el-table-column align="right" label="数量" min-width="135">
            <template slot-scope="scope">
              <el-input-number
                v-if="canEdit(scope.row) && scope.row.quantityAccounting"
                v-model="scope.row.openingQuantity"
                class="amount-input"
                :controls="false"
                :min="0"
                :precision="4"
                @change="handleAmountChange(scope.row)"
              />
              <span v-else>{{ formatQuantity(scope.row.openingQuantity, scope.row.quantityAccounting) }}</span>
            </template>
          </el-table-column>
          <el-table-column align="right" label="金额" min-width="145">
            <template slot-scope="scope">
              <el-input-number
                v-if="canEdit(scope.row)"
                v-model="scope.row.openingAmount"
                class="amount-input"
                :controls="false"
                :min="0"
                :precision="2"
                @change="handleAmountChange(scope.row)"
              />
              <span v-else>{{ formatAmount(scope.row.openingAmount) }}</span>
            </template>
          </el-table-column>
        </el-table-column>

        <el-table-column v-if="!isJanuary" label="本年累计借方" align="center">
          <el-table-column align="right" label="数量" min-width="135">
            <template slot-scope="scope">
              <el-input-number
                v-if="canEdit(scope.row) && scope.row.quantityAccounting"
                v-model="scope.row.yearDebitQuantity"
                class="amount-input"
                :controls="false"
                :min="0"
                :precision="4"
                @change="handleAmountChange(scope.row)"
              />
              <span v-else>{{ formatQuantity(scope.row.yearDebitQuantity, scope.row.quantityAccounting) }}</span>
            </template>
          </el-table-column>
          <el-table-column align="right" label="金额" min-width="145">
            <template slot-scope="scope">
              <el-input-number
                v-if="canEdit(scope.row)"
                v-model="scope.row.yearDebitAmount"
                class="amount-input"
                :controls="false"
                :min="0"
                :precision="2"
                @change="handleAmountChange(scope.row)"
              />
              <span v-else>{{ formatAmount(scope.row.yearDebitAmount) }}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column v-if="!isJanuary" label="本年累计贷方" align="center">
          <el-table-column align="right" label="数量" min-width="135">
            <template slot-scope="scope">
              <el-input-number
                v-if="canEdit(scope.row) && scope.row.quantityAccounting"
                v-model="scope.row.yearCreditQuantity"
                class="amount-input"
                :controls="false"
                :min="0"
                :precision="4"
                @change="handleAmountChange(scope.row)"
              />
              <span v-else>{{ formatQuantity(scope.row.yearCreditQuantity, scope.row.quantityAccounting) }}</span>
            </template>
          </el-table-column>
          <el-table-column align="right" label="金额" min-width="145">
            <template slot-scope="scope">
              <el-input-number
                v-if="canEdit(scope.row)"
                v-model="scope.row.yearCreditAmount"
                class="amount-input"
                :controls="false"
                :min="0"
                :precision="2"
                @change="handleAmountChange(scope.row)"
              />
              <span v-else>{{ formatAmount(scope.row.yearCreditAmount) }}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column v-if="!isJanuary" label="年初余额" align="center">
          <el-table-column align="right" label="数量" min-width="135">
            <template slot-scope="scope">
              {{ formatQuantity(scope.row.yearOpeningQuantity, scope.row.quantityAccounting) }}
            </template>
          </el-table-column>
          <el-table-column align="right" label="金额" min-width="145">
            <template slot-scope="scope">{{ formatAmount(scope.row.yearOpeningAmount) }}</template>
          </el-table-column>
        </el-table-column>
        <el-table-column
          v-if="!isJanuary && subjectType === FMS_SUBJECT_TYPE.PROFIT_LOSS"
          align="center"
          label="实际损益发生额"
        >
          <el-table-column align="right" label="数量" min-width="135">
            <template slot-scope="scope">
              <el-input-number
                v-if="canEdit(scope.row) && scope.row.quantityAccounting"
                v-model="scope.row.profitLossQuantity"
                class="amount-input"
                :controls="false"
                :min="0"
                :precision="4"
                @change="handleProfitLossAmountChange"
              />
              <span v-else>{{ formatQuantity(scope.row.profitLossQuantity, scope.row.quantityAccounting) }}</span>
            </template>
          </el-table-column>
          <el-table-column align="right" label="金额" min-width="145">
            <template slot-scope="scope">
              <el-input-number
                v-if="canEdit(scope.row)"
                v-model="scope.row.profitLossAmount"
                class="amount-input"
                :controls="false"
                :min="0"
                :precision="2"
                @change="handleProfitLossAmountChange"
              />
              <span v-else>{{ formatAmount(scope.row.profitLossAmount) }}</span>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table>
    </el-card>

    <fms-initial-assist-form ref="assistForm" @success="addAssist" />
    <fms-initial-balance-import-form ref="importForm" @success="loadPage" />
    <fms-trial-balance-dialog ref="trialBalance" />
  </div>
</template>

<script>
import { getAccountSet, getAccountSetList } from '@/api/fms/config/account-set'
import { FmsClosingPeriodApi } from '@/api/fms/closing/period'
import { FmsInitialBalanceApi } from '@/api/fms/config/initial-balance'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { FMS_DEBIT_CREDIT_DIRECTION, FMS_SUBJECT_TYPE, FMS_SUBJECT_TYPE_OPTIONS } from '@/views/fms/utils/constants'
import { readFmsAccountSetId, saveFmsAccountSet } from '@/views/fms/utils/context'
import { formatAmount } from '@/views/fms/utils/format'
import FmsInitialAssistForm from './FmsInitialAssistForm.vue'
import FmsInitialBalanceImportForm from './FmsInitialBalanceImportForm.vue'
import FmsTrialBalanceDialog from './FmsTrialBalanceDialog.vue'

const AMOUNT_FIELDS = [
  'openingAmount',
  'openingQuantity',
  'yearDebitAmount',
  'yearDebitQuantity',
  'yearCreditAmount',
  'yearCreditQuantity',
  'yearOpeningAmount',
  'yearOpeningQuantity',
  'profitLossAmount',
  'profitLossQuantity'
]
const DIRECT_SUM_FIELDS = ['yearDebitAmount', 'yearDebitQuantity', 'yearCreditAmount', 'yearCreditQuantity']

function pad(value) {
  return String(value).padStart(2, '0')
}

function toMonth(value) {
  if (!value) return ''
  if (Array.isArray(value) && value.length >= 2) return String(value[0]) + '-' + pad(value[1])
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{1,2})/)
    if (match) return match[1] + '-' + pad(match[2])
  }
  let dateValue = value
  if (typeof dateValue === 'number' && dateValue > 0 && dateValue < 100000000000) dateValue *= 1000
  const date = new Date(dateValue)
  return Number.isNaN(date.getTime()) ? '' : date.getFullYear() + '-' + pad(date.getMonth() + 1)
}

function zeroAmounts() {
  return {
    openingAmount: 0,
    openingQuantity: 0,
    yearDebitAmount: 0,
    yearDebitQuantity: 0,
    yearCreditAmount: 0,
    yearCreditQuantity: 0,
    yearOpeningAmount: 0,
    yearOpeningQuantity: 0,
    profitLossAmount: 0,
    profitLossQuantity: 0
  }
}

function normalizeAmounts(row) {
  const amounts = {}
  AMOUNT_FIELDS.forEach(field => { amounts[field] = Number(row && row[field]) || 0 })
  return amounts
}

export default {
  name: 'FmsInitialBalance',
  components: { FmsInitialAssistForm, FmsInitialBalanceImportForm, FmsTrialBalanceDialog },
  data() {
    const options = getDictDatas(DICT_TYPE.FMS_SUBJECT_TYPE)
      .map(item => ({ label: item.label, value: Number(item.value) }))
      .filter(item => Number.isFinite(item.value))
    const accountSetId = Number(readFmsAccountSetId(this.$route)) || 0
    return {
      FMS_DEBIT_CREDIT_DIRECTION,
      FMS_SUBJECT_TYPE,
      accountSetLoading: false,
      accountSets: [],
      accountSetId,
      loadedAccountSetId: accountSetId,
      accountSet: null,
      loading: false,
      saving: false,
      exportLoading: false,
      edited: false,
      subjectType: FMS_SUBJECT_TYPE.ASSET,
      loadedSubjectType: FMS_SUBJECT_TYPE.ASSET,
      subjectTypeOptions: options.length ? options : FMS_SUBJECT_TYPE_OPTIONS,
      tableData: [],
      accountStartTime: null,
      currentMonth: '',
      assistSubject: null,
      accountSetSequence: 0,
      loadSequence: 0
    }
  },
  computed: {
    currentAccountSet() {
      return this.accountSet || this.accountSets.find(item => Number(item.id) === Number(this.accountSetId)) || null
    },
    isWritable() {
      return Boolean(this.currentAccountSet && [1, 3].includes(Number(this.currentAccountSet.level)))
    },
    startMonth() {
      return toMonth(this.accountStartTime)
    },
    isJanuary() {
      return Boolean(this.startMonth && this.startMonth.slice(5) === '01')
    },
    editable() {
      return Boolean(this.accountStartTime && this.currentMonth && this.currentMonth === this.startMonth)
    }
  },
  watch: {
    '$route.query.accountSetId'() {
      const routeAccountSetId = Number(readFmsAccountSetId(this.$route)) || 0
      if (routeAccountSetId && routeAccountSetId !== Number(this.accountSetId)) {
        this.accountSetId = routeAccountSetId
        this.loadedAccountSetId = routeAccountSetId
        this.initialize()
      }
    }
  },
  created() {
    window.addEventListener('beforeunload', this.handleBeforeUnload)
    this.initialize()
  },
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
    this.accountSetSequence += 1
    this.loadSequence += 1
  },
  beforeRouteLeave(to, from, next) {
    if (!this.edited) {
      next()
      return
    }
    this.$modal.confirm('当前修改尚未保存，确定放弃修改并离开页面吗？').then(() => {
      this.edited = false
      next()
    }).catch(() => next(false))
  },
  methods: {
    formatAmount,
    formatQuantity(value, enabled) {
      return enabled
        ? Number(value || 0).toLocaleString('zh-CN', { maximumFractionDigits: 4 })
        : '-'
    },
    initialize() {
      const sequence = ++this.accountSetSequence
      this.accountSetLoading = true
      return getAccountSetList().then(response => {
        if (sequence !== this.accountSetSequence) return
        const rows = response.data
        this.accountSets = rows.filter(item => item && item.initialized !== false)
        let selected = this.accountSets.find(item => Number(item.id) === Number(this.accountSetId))
        if (!selected) selected = this.accountSets.find(item => item.defaultStatus) || this.accountSets[0]
        if (!selected) {
          this.accountSetId = 0
          this.loadedAccountSetId = 0
          this.accountSet = null
          this.tableData = []
          return
        }
        this.accountSetId = Number(selected.id)
        this.loadedAccountSetId = this.accountSetId
        this.accountSet = selected
        saveFmsAccountSet(selected)
        return this.loadPage()
      }).finally(() => {
        if (sequence === this.accountSetSequence) this.accountSetLoading = false
      })
    },
    handleAccountSetChange(id) {
      const nextId = Number(id) || 0
      const applyChange = () => {
        this.accountSetId = nextId
        this.loadedAccountSetId = nextId
        this.accountSet = this.accountSets.find(item => Number(item.id) === nextId) || null
        if (this.accountSet) saveFmsAccountSet(this.accountSet)
        this.loadPage()
      }
      if (!this.edited) {
        applyChange()
        return
      }
      this.$modal.confirm('当前修改尚未保存，确定放弃修改并切换账套吗？').then(() => {
        this.edited = false
        applyChange()
      }).catch(() => {
        this.accountSetId = this.loadedAccountSetId
      })
    },
    loadPage() {
      const accountSetId = Number(this.accountSetId) || 0
      const subjectType = Number(this.subjectType)
      const sequence = ++this.loadSequence
      if (!accountSetId) {
        this.accountSet = null
        this.accountStartTime = null
        this.currentMonth = ''
        this.tableData = []
        this.loading = false
        return Promise.resolve()
      }
      this.loading = true
      return Promise.all([
        getAccountSet(accountSetId),
        FmsInitialBalanceApi.getInitialBalanceList(accountSetId, subjectType),
        FmsClosingPeriodApi.getCurrentMonth(accountSetId)
      ]).then(responses => {
        if (sequence !== this.loadSequence || accountSetId !== Number(this.accountSetId) || subjectType !== Number(this.subjectType)) return
        const accountSet = responses[0].data
        const balances = responses[1].data
        const month = responses[2].data
        this.accountSet = accountSet
        this.accountStartTime = this.accountSet.startTime || null
        this.currentMonth = toMonth(month) || String(month || '')
        this.tableData = this.buildViewRows(balances)
        this.loadedSubjectType = subjectType
        this.loadedAccountSetId = accountSetId
        this.edited = false
      }).finally(() => {
        if (sequence === this.loadSequence) this.loading = false
      })
    },
    changeSubjectType(type) {
      const nextType = Number(type)
      const applyChange = () => {
        if (this.isJanuary && nextType === FMS_SUBJECT_TYPE.PROFIT_LOSS) {
          this.subjectType = this.loadedSubjectType
          this.$modal.msgWarning('年初启用的账套不需要录入损益初始余额')
          return
        }
        this.subjectType = nextType
        this.loadPage()
      }
      if (!this.edited) {
        applyChange()
        return
      }
      this.$modal.confirm('当前修改尚未保存，确定放弃修改并切换科目类别吗？').then(() => {
        this.edited = false
        applyChange()
      }).catch(() => {
        this.subjectType = this.loadedSubjectType
      })
    },
    openImportForm() {
      if (this.accountSetId) this.$refs.importForm.open(this.accountSetId)
    },
    openTrialBalance() {
      if (this.accountSetId) this.$refs.trialBalance.open(this.accountSetId)
    },
    handleExport() {
      if (!this.accountSetId || this.exportLoading) return
      this.exportLoading = true
      FmsInitialBalanceApi.exportInitialBalance(this.accountSetId).then(response => {
        this.$download.excel(response.data, '财务初始余额.xlsx')
      }).finally(() => {
        this.exportLoading = false
      })
    },
    buildViewRows(list) {
      const rows = []
      const levelMap = {}
      const parentIds = {}
      list.forEach(item => {
        if (item && item.parentId) parentIds[String(item.parentId)] = true
      })
      list.forEach(item => {
        if (!item) return
        const parentLevel = item.parentId ? (levelMap[String(item.parentId)] || 0) : 0
        const level = parentLevel + 1
        levelMap[String(item.subjectId)] = level
        const subjectRow = Object.assign({}, zeroAmounts(), item, normalizeAmounts(item), {
          rowKey: 'subject-' + item.subjectId,
          isLeaf: !parentIds[String(item.subjectId)],
          level,
          auxiliaryConfigs: Array.isArray(item.auxiliaryConfigs) ? item.auxiliaryConfigs : [],
          assistBalances: Array.isArray(item.assistBalances) ? item.assistBalances : []
        })
        rows.push(subjectRow)
        subjectRow.assistBalances.forEach((assist, index) => {
          rows.push(this.buildAssistViewRow(subjectRow, assist, index))
        })
      })
      return rows
    },
    buildAssistViewRow(subject, assist, index) {
      const auxiliaries = assist && Array.isArray(assist.auxiliaries) ? assist.auxiliaries : []
      return Object.assign({}, subject, zeroAmounts(), assist || {}, normalizeAmounts(assist), {
        rowKey: 'assist-' + subject.subjectId + '-' + ((assist && assist.assistCombinationId) || index),
        isAssist: true,
        level: subject.level + 1,
        auxiliaries,
        auxiliaryItemIds: auxiliaries.map(item => item.itemId),
        assistBalances: []
      })
    },
    canEdit(row) {
      return this.isWritable && this.editable && Boolean(row.isAssist || (row.isLeaf && !row.auxiliaryAccounting))
    },
    canAddAssist(row) {
      return this.isWritable && this.editable && !row.isAssist && row.isLeaf && row.auxiliaryAccounting
    },
    getRowName(row) {
      if (!row.isAssist) return row.subjectName
      const names = (row.auxiliaries || []).map(item => item.name).filter(Boolean)
      return row.subjectName + (names.length ? '_' + names.join('_') : '')
    },
    openAssistForm(row) {
      if (!this.accountSetId) return
      this.assistSubject = row
      this.$refs.assistForm.open(row, this.accountSetId)
    },
    addAssist(combinations) {
      const subject = this.assistSubject
      if (!subject) return
      let insertIndex = this.tableData.findIndex(row => row.rowKey === subject.rowKey) + 1
      while (
        insertIndex < this.tableData.length &&
        this.tableData[insertIndex].isAssist &&
        Number(this.tableData[insertIndex].subjectId) === Number(subject.subjectId)
      ) insertIndex += 1
      const newRows = (combinations || []).filter(items => {
        return !this.tableData.some(row => {
          if (!row.isAssist || Number(row.subjectId) !== Number(subject.subjectId)) return false
          if (!row.auxiliaryItemIds || row.auxiliaryItemIds.length !== items.length) return false
          return items.every(item => row.auxiliaryItemIds.some(id => Number(id) === Number(item.id)))
        })
      }).map((items, index) => {
        return this.buildAssistViewRow(subject, Object.assign(zeroAmounts(), {
          auxiliaries: subject.auxiliaryConfigs.map((config, configIndex) => {
            const item = items[configIndex]
            return {
              type: config.type,
              typeId: config.auxiliaryTypeId,
              itemId: item.id,
              name: item.name
            }
          })
        }), Date.now() + index)
      })
      if (!newRows.length) {
        this.$modal.msgWarning('所选辅助核算明细均已存在')
        return
      }
      this.tableData.splice(insertIndex, 0, ...newRows)
      this.edited = true
      this.aggregateRows()
    },
    removeAssist(row) {
      this.tableData = this.tableData.filter(item => item.rowKey !== row.rowKey)
      this.edited = true
      this.aggregateRows()
    },
    handleAmountChange(row) {
      if (!this.isJanuary) {
        if (row.balanceDirection === FMS_DEBIT_CREDIT_DIRECTION.DEBIT) {
          row.yearOpeningAmount = Number(row.openingAmount) - Number(row.yearDebitAmount) + Number(row.yearCreditAmount)
          row.yearOpeningQuantity = Number(row.openingQuantity) - Number(row.yearDebitQuantity) + Number(row.yearCreditQuantity)
        } else {
          row.yearOpeningAmount = Number(row.openingAmount) + Number(row.yearDebitAmount) - Number(row.yearCreditAmount)
          row.yearOpeningQuantity = Number(row.openingQuantity) + Number(row.yearDebitQuantity) - Number(row.yearCreditQuantity)
        }
      }
      this.edited = true
      this.aggregateRows()
    },
    handleProfitLossAmountChange() {
      this.edited = true
      this.aggregateRows()
    },
    aggregateRows() {
      const subjectMap = {}
      this.tableData.forEach(row => {
        if (row.isAssist) return
        subjectMap[String(row.subjectId)] = row
        if (!row.isLeaf || row.auxiliaryAccounting) {
          AMOUNT_FIELDS.forEach(field => { row[field] = 0 })
        }
      })
      for (let index = this.tableData.length - 1; index >= 0; index -= 1) {
        const row = this.tableData[index]
        const parentId = row.isAssist ? row.subjectId : row.parentId
        const parent = subjectMap[String(parentId)]
        if (!parent || parent === row) continue
        AMOUNT_FIELDS.forEach(field => {
          const amount = Number(row[field] || 0)
          const direct = DIRECT_SUM_FIELDS.includes(field)
          parent[field] = Number(parent[field] || 0) + (direct || row.balanceDirection === parent.balanceDirection ? amount : -amount)
        })
      }
    },
    handleSave() {
      if (!this.accountSetId || !this.editable || this.saving) return
      const assistRows = this.tableData.filter(row => row.isAssist)
      const balances = this.tableData.filter(row => !row.isAssist && row.isLeaf).map(row => {
        return Object.assign({ subjectId: row.subjectId }, this.pickAmounts(row), {
          assistBalances: assistRows.filter(item => Number(item.subjectId) === Number(row.subjectId)).map(item => {
            return Object.assign({ auxiliaryItemIds: item.auxiliaryItemIds || [] }, this.pickAmounts(item))
          })
        })
      })
      if (
        this.subjectType === FMS_SUBJECT_TYPE.PROFIT_LOSS &&
        balances.some(item => Math.abs(item.yearOpeningAmount) >= 0.005)
      ) {
        this.$modal.msgWarning('损益类科目的年初余额必须为 0')
        return
      }
      this.saving = true
      FmsInitialBalanceApi.saveInitialBalance(this.accountSetId, balances).then(() => {
        this.$modal.msgSuccess('保存成功')
        return this.loadPage()
      }).finally(() => {
        this.saving = false
      })
    },
    pickAmounts(row) {
      return normalizeAmounts(row)
    },
    handleBeforeUnload(event) {
      if (!this.edited) return
      event.preventDefault()
      event.returnValue = ''
    }
  }
}
</script>

<style scoped>
.toolbar-card { margin-bottom: 16px; }
.initial-balance-toolbar { margin-bottom: -15px; }
.balance-alert { margin-bottom: 16px; }
.assist-row-text { color: #909399; }
.row-action { margin-left: 8px; }
.danger-text { color: #f56c6c; }
.fms-initial-balance-page /deep/ .amount-input { width: 118px; }
.fms-initial-balance-page /deep/ .amount-input .el-input__inner { text-align: right; }
</style>
