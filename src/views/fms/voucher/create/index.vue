<template>
  <div class="app-container fms-voucher-create" data-testid="fms-voucher-create-page">
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-actions">
          <el-button
            v-if="formData.id && currentAccountWritable && checkPermi(['fms:voucher:create'])"
            type="primary"
            @click="resetForm()"
          >新增</el-button>
          <el-button v-if="canSaveAndCreate" type="primary" @click="submitForm(true)">保存并新增</el-button>
          <el-button v-if="canSave" @click="submitForm(false)">保存</el-button>
          <el-button
            v-if="formData.id && currentAccountWritable && !isApproved && !isClosingGenerated && checkPermi(['fms:voucher:review'])"
            @click="handleReview(FMS_VOUCHER_STATUS.APPROVED)"
          >审核</el-button>
          <el-button
            v-if="formData.id && currentAccountWritable && isApproved && !isClosingGenerated && checkPermi(['fms:voucher:review'])"
            @click="handleReview(FMS_VOUCHER_STATUS.PENDING_REVIEW)"
          >反审核</el-button>
          <el-button
            v-if="formData.id && currentAccountWritable && !isApproved && !isClosingGenerated && checkPermi(['fms:voucher:delete'])"
            @click="handleDelete"
          >删除</el-button>
          <el-button
            v-if="formData.id && currentAccountWritable && checkPermi(['fms:voucher:create'])"
            @click="copyVoucher"
          >复制</el-button>
          <el-button v-if="formData.id && checkPermi(['fms:voucher:print'])" @click="printVoucher">打印</el-button>
          <el-dropdown v-if="!formData.id && !readOnly" trigger="click" @command="handleMoreCommand">
            <el-button>更多<i class="el-icon-arrow-down el-icon--right" /></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="checkPermi(['fms:config:voucher-template:create'])" command="saveTemplate">保存为模板</el-dropdown-item>
              <el-dropdown-item command="applyTemplate">使用模板</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div class="toolbar-navigation">
          <fms-voucher-shortcut-help />
          <el-button circle :disabled="!previousVoucherId" title="上一张" icon="el-icon-arrow-left" @click="navigateVoucher(previousVoucherId)" />
          <el-button circle :disabled="!nextVoucherId" title="下一张" icon="el-icon-arrow-right" @click="navigateVoucher(nextVoucherId)" />
        </div>
      </div>
    </el-card>

    <el-card shadow="never">
      <div v-loading="loading" class="voucher-sheet">
        <div class="voucher-title">记账凭证</div>
        <div class="voucher-period">{{ voucherPeriod }}</div>
        <div class="voucher-meta">
          <div class="meta-left">
            <span class="field-label">凭证字</span>
            <fms-voucher-word-select
              v-model="formData.voucherWordId"
              :options="voucherWords"
              :disabled="readOnly"
              placeholder="请选择凭证字"
              style="width: 90px"
              @input="refreshVoucherNumber"
            />
            <el-input v-model.number="formData.voucherNumber" :disabled="readOnly" type="number" style="width: 110px">
              <template slot="append">号</template>
            </el-input>
            <el-date-picker
              v-model="formData.voucherTime"
              :clearable="false"
              :disabled="readOnly"
              :picker-options="voucherDatePickerOptions"
              type="date"
              value-format="timestamp"
              style="width: 150px"
              @change="handleVoucherDateChange"
            />
          </div>
          <div class="meta-right">
            <span>附单据</span>
            <el-input v-model.number="formData.attachmentCount" :disabled="readOnly" type="number" style="width: 110px">
              <template slot="append">张</template>
            </el-input>
          </div>
        </div>

        <div ref="entryTableWrap" class="entry-table-wrap" @keydown="handleEntryTableKeydown">
          <table class="entry-table" data-testid="fms-voucher-entry-table">
            <colgroup>
              <col style="width: 30px" />
              <col style="width: 18.5%" />
              <col />
              <col v-if="showQuantityColumn" style="width: 15%" />
              <col style="width: 20.4%" />
              <col style="width: 20.4%" />
            </colgroup>
            <thead>
              <tr>
                <th class="operation-column" />
                <th>摘要</th>
                <th>会计科目</th>
                <th v-if="showQuantityColumn">数量</th>
                <th class="money-header">
                  <strong>借方金额</strong>
                  <div class="money-units"><span v-for="(unit, index) in FMS_VOUCHER_MONEY_UNITS" :key="'debit-' + index">{{ unit }}</span></div>
                </th>
                <th class="money-header">
                  <strong>贷方金额</strong>
                  <div class="money-units"><span v-for="(unit, index) in FMS_VOUCHER_MONEY_UNITS" :key="'credit-' + index">{{ unit }}</span></div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(entry, index) in entries" :key="entry.rowKey" :data-entry-index="index">
                <td class="operation-column">
                  <div v-if="!readOnly" class="row-actions">
                    <el-dropdown placement="right-start" trigger="hover" @command="handleInsertEntry($event, index)">
                      <el-button circle type="text" icon="el-icon-circle-plus-outline" title="插入分录" />
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="before">从上方插入行</el-dropdown-item>
                        <el-dropdown-item command="after">从下方插入行</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                    <el-button circle type="text" icon="el-icon-remove-outline" title="删除分录" :disabled="entries.length <= 2" @click="deleteEntry(index)" />
                  </div>
                </td>
                <td class="entry-digest">
                  <div v-if="readOnly" class="readonly-cell">{{ entry.digest }}</div>
                  <div v-else class="digest-editor">
                    <el-input v-model="entry.digest" maxlength="500" @focus="fillDigest(index)" />
                    <el-button type="text" @click="openDigestLibrary(index)">摘要库</el-button>
                  </div>
                </td>
                <td class="entry-subject">
                  <div v-if="readOnly" class="readonly-cell">{{ formatEntrySubject(entry) }}</div>
                  <template v-else>
                    <div class="subject-editor">
                      <el-select v-model="entry.subjectId" filterable placeholder="" @change="handleSubjectChange(entry)">
                        <el-option
                          v-for="subject in getEntrySubjectOptions(entry)"
                          :key="subject.id"
                          :disabled="Number(subject.status) !== FMS_SUBJECT_STATUS.ENABLED || Boolean(subject.children && subject.children.length)"
                          :label="subject.code + ' ' + subject.name"
                          :value="subject.id"
                        />
                      </el-select>
                      <el-dropdown
                        v-if="currentAccountWritable"
                        v-hasPermi="['fms:config:subject:create']"
                        placement="bottom-start"
                        @command="openSubjectForm"
                      >
                        <el-button type="text" title="新增科目"><i class="el-icon-plus" /></el-button>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item v-for="subjectType in subjectTypeOptions" :key="subjectType.value" :command="subjectType.value">
                            {{ subjectType.label }}类科目
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                    </div>
                    <div v-if="getSubjectAuxiliaryTypeIds(entry.subjectId).length" class="auxiliary-fields">
                      <div v-for="auxiliaryTypeId in getSubjectAuxiliaryTypeIds(entry.subjectId)" :key="auxiliaryTypeId" class="auxiliary-field">
                        <el-select
                          :value="getEntryAuxiliaryItemId(entry, auxiliaryTypeId)"
                          filterable
                          :placeholder="getAuxiliaryTypeName(auxiliaryTypeId)"
                          @change="setEntryAuxiliary(entry, auxiliaryTypeId, $event)"
                        >
                          <el-option v-for="item in auxiliaryOptions[auxiliaryTypeId] || []" :key="item.id" :label="item.code + ' ' + item.name" :value="item.id" />
                        </el-select>
                        <el-button
                          v-if="currentAccountWritable"
                          v-hasPermi="['fms:config:auxiliary:create']"
                          type="text"
                          :title="'新增' + getAuxiliaryTypeName(auxiliaryTypeId)"
                          @click.stop="openAuxiliaryItemForm(auxiliaryTypeId)"
                        ><i class="el-icon-plus" /></el-button>
                      </div>
                    </div>
                  </template>
                  <div v-if="entry.subjectId" class="subject-balance">余额：{{ formatEntryBalance(entry) }}</div>
                </td>
                <td v-if="showQuantityColumn" class="quantity-cell">
                  <template v-if="isQuantitySubject(entry.subjectId)">
                    <div class="quantity-row">
                      <span>数量</span>
                      <el-input-number v-model="entry.quantity" :controls="false" :disabled="readOnly" :min="0" :precision="4" @change="calculateEntryAmount(entry)" />
                      <span>{{ getQuantityUnit(entry.subjectId) }}</span>
                    </div>
                    <div class="quantity-row">
                      <span>单价</span>
                      <el-input-number v-model="entry.unitPrice" :controls="false" :disabled="readOnly" :min="0" :precision="6" @change="calculateEntryAmount(entry)" />
                    </div>
                  </template>
                  <span v-else class="muted">-</span>
                </td>
                <td class="entry-money" data-entry-money data-entry-direction="debit">
                  <div class="money-editor">
                    <el-input-number v-model="entry.debitAmount" :controls="false" :disabled="readOnly" :precision="2" @change="handleEntryAmountChange(entry, 'debit')" />
                    <div class="money-cell-value" :class="{ negative: Number(entry.debitAmount) < 0 }">
                      <span v-for="(digit, digitIndex) in getMoneyDigits(entry.debitAmount)" :key="digitIndex">{{ digit }}</span>
                    </div>
                  </div>
                </td>
                <td class="entry-money" data-entry-money data-entry-direction="credit">
                  <div class="money-editor">
                    <el-input-number v-model="entry.creditAmount" :controls="false" :disabled="readOnly" :precision="2" @change="handleEntryAmountChange(entry, 'credit')" />
                    <div class="money-cell-value" :class="{ negative: Number(entry.creditAmount) < 0 }">
                      <span v-for="(digit, digitIndex) in getMoneyDigits(entry.creditAmount)" :key="digitIndex">{{ digit }}</span>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td class="operation-column" />
                <td :colspan="showQuantityColumn ? 3 : 2" class="total-label">
                  合计：{{ amountInWords }}
                  <span v-if="!balanced" class="unbalanced">借贷不平衡</span>
                </td>
                <td class="entry-money">
                  <div class="money-cell-value total-money" :class="{ negative: debitTotal < 0 }">
                    <span v-for="(digit, index) in getMoneyDigits(debitTotal, true)" :key="index">{{ digit }}</span>
                  </div>
                </td>
                <td class="entry-money">
                  <div class="money-cell-value total-money" :class="{ negative: creditTotal < 0 }">
                    <span v-for="(digit, index) in getMoneyDigits(creditTotal, true)" :key="index">{{ digit }}</span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="voucher-footer">
          <span>制单人：{{ creatorUserName }}</span>
          <template v-if="formData.id">
            <span>审核人：{{ detail && detail.reviewerUserName || '-' }}</span>
            <el-tag :type="isApproved ? 'success' : 'warning'">{{ isApproved ? '已审核' : '待审核' }}</el-tag>
            <el-tag v-if="isClosingGenerated" type="info">结账生成凭证</el-tag>
          </template>
        </div>
        <div v-if="isApproved" class="approved-stamp">审核通过</div>
      </div>
      <div v-if="canSave" class="bottom-actions">
        <el-button v-if="canSaveAndCreate" type="primary" @click="submitForm(true)">保存并新增</el-button>
        <el-button @click="submitForm(false)">保存</el-button>
      </div>
    </el-card>

    <fms-voucher-template-save-form ref="templateSaveForm" />
    <fms-voucher-template-select ref="templateSelect" @select="applyTemplate" />
    <fms-digest-library ref="digestLibrary" @select="applyDigest" />
    <fms-voucher-print-form ref="printForm" />
    <fms-subject-form ref="subjectForm" @success="refreshSubjectOptions" />
    <fms-auxiliary-item-form ref="auxiliaryItemForm" @success="refreshAuxiliaryItemOptions" />
  </div>
</template>

<script>
import { FmsAuxiliaryItemApi } from '@/api/fms/config/auxiliary/item'
import { FmsAuxiliaryTypeApi } from '@/api/fms/config/auxiliary/type'
import * as FmsSubjectApi from '@/api/fms/config/subject'
import { FmsVoucherWordApi } from '@/api/fms/config/voucher-word'
import { FmsVoucherApi } from '@/api/fms/voucher'
import { checkPermi } from '@/utils/permission'
import { FMS_DEBIT_CREDIT_DIRECTION, FMS_SUBJECT_STATUS, FMS_SUBJECT_TYPE_OPTIONS } from '@/views/fms/utils/constants'

import FmsVoucherTemplateSelect from '@/views/fms/config/voucher-template/components/FmsVoucherTemplateSelect.vue'
import FmsDigestLibrary from '@/views/fms/config/digest/components/FmsDigestLibrary.vue'
import FmsVoucherTemplateSaveForm from '@/views/fms/config/voucher-template/components/FmsVoucherTemplateSaveForm.vue'
import FmsVoucherWordSelect from '@/views/fms/config/voucher-word/components/FmsVoucherWordSelect.vue'
import FmsSubjectForm from '@/views/fms/config/subject/FmsSubjectForm.vue'
import FmsAuxiliaryItemForm from '@/views/fms/config/auxiliary/item/FmsAuxiliaryItemForm.vue'
import FmsVoucherShortcutHelp from './FmsVoucherShortcutHelp.vue'
import FmsVoucherPrintForm from '../components/FmsVoucherPrintForm.vue'
import voucherContextMixin from '../mixin'
import {
  FMS_VOUCHER_MONEY_UNITS,
  FMS_VOUCHER_STATUS,
  buildTree,
  flattenTree,
  formatDateOnly,
  formatDateTime,
  formatMonth,
  formatPeriodLabel,
  formatSubjectBalance,
  formatSubjectDisplay,
  formatUppercaseMoney
} from '../helpers'

let voucherEntrySequence = 0

export default {
  name: 'FmsVoucherCreate',
  components: {
    FmsVoucherTemplateSelect,
    FmsDigestLibrary,
    FmsVoucherTemplateSaveForm,
    FmsVoucherWordSelect,
    FmsSubjectForm,
    FmsAuxiliaryItemForm,
    FmsVoucherShortcutHelp,
    FmsVoucherPrintForm
  },
  mixins: [voucherContextMixin],
  data() {
    return {
      FMS_SUBJECT_STATUS,
      FMS_VOUCHER_MONEY_UNITS,
      FMS_VOUCHER_STATUS,
      subjectTypeOptions: FMS_SUBJECT_TYPE_OPTIONS,
      loading: false,
      voucherWords: [],
      subjects: [],
      auxiliaryTypes: [],
      auxiliaryOptions: {},
      subjectBalances: [],
      auxiliaryBalances: {},
      detail: null,
      formData: {
        id: undefined,
        voucherWordId: undefined,
        voucherNumber: undefined,
        voucherTime: Date.now(),
        attachmentCount: 0
      },
      entries: [],
      digestEntryIndex: undefined,
      creatingAuxiliaryTypeId: undefined,
      createRequestSequence: 0
    }
  },
  computed: {
    flatSubjects() {
      return flattenTree(this.subjects)
    },
    leafSubjects() {
      return this.flatSubjects.filter(subject =>
        !(subject.children && subject.children.length) && Number(subject.status) === FMS_SUBJECT_STATUS.ENABLED
      )
    },
    subjectBalanceMap() {
      return new Map(this.subjectBalances.map(item => [Number(item.subjectId), item]))
    },
    isApproved() {
      return Boolean(this.detail && Number(this.detail.status) === FMS_VOUCHER_STATUS.APPROVED)
    },
    isClosingGenerated() {
      return Boolean(this.detail && this.detail.closingGenerated)
    },
    currentAccountWritable() {
      const accountSet = this.fmsStore.getAccountSet
      return Boolean(accountSet && [1, 3].includes(Number(accountSet.level)))
    },
    savePermission() {
      return this.formData.id ? 'fms:voucher:update' : 'fms:voucher:create'
    },
    readOnly() {
      return this.isApproved || this.isClosingGenerated || !this.currentAccountWritable || !checkPermi([this.savePermission])
    },
    canSave() {
      return !this.readOnly
    },
    canSaveAndCreate() {
      return this.canSave && checkPermi(['fms:voucher:create'])
    },
    voucherIds() {
      return String(this.$route.query.ids || '').split(',').map(Number).filter(id => id > 0)
    },
    currentVoucherIndex() {
      return this.voucherIds.indexOf(Number(this.$route.query.id || 0))
    },
    previousVoucherId() {
      return this.currentVoucherIndex > 0 ? this.voucherIds[this.currentVoucherIndex - 1] : undefined
    },
    nextVoucherId() {
      return this.currentVoucherIndex >= 0 && this.currentVoucherIndex < this.voucherIds.length - 1
        ? this.voucherIds[this.currentVoucherIndex + 1]
        : undefined
    },
    debitTotal() {
      return this.sumAmount('debitAmount')
    },
    creditTotal() {
      return this.sumAmount('creditAmount')
    },
    balanced() {
      return this.debitTotal === this.creditTotal
    },
    amountInWords() {
      return this.balanced ? formatUppercaseMoney(this.debitTotal) : ''
    },
    voucherPeriod() {
      const month = formatMonth(this.formData.voucherTime)
      return month ? formatPeriodLabel(month, month) : ''
    },
    showQuantityColumn() {
      return this.entries.some(entry => this.isQuantitySubject(entry.subjectId))
    },
    creatorUserName() {
      return (this.detail && this.detail.creatorUserName) || this.$store.getters.nickname || ''
    },
    voucherDatePickerOptions() {
      return { disabledDate: this.disableVoucherDate }
    }
  },
  watch: {
    '$route.query.id': 'handleVoucherRouteChange',
    '$route.query.copyFrom': 'handleVoucherRouteChange'
  },
  mounted() {
    window.addEventListener('keydown', this.handlePageShortcut)
  },
  activated() {
    window.addEventListener('keydown', this.handlePageShortcut)
  },
  deactivated() {
    window.removeEventListener('keydown', this.handlePageShortcut)
  },
  beforeDestroy() {
    this.createRequestSequence += 1
    window.removeEventListener('keydown', this.handlePageShortcut)
  },
  methods: {
    checkPermi,
    clearVoucherData() {
      this.voucherWords = []
      this.subjects = []
      this.auxiliaryTypes = []
      this.subjectBalances = []
      this.entries = []
      this.detail = null
    },
    onVoucherContextReady() {
      return this.initializeCreatePage()
    },
    initializeCreatePage() {
      const accountSetId = Number(this.accountSetId) || 0
      if (!accountSetId) return Promise.resolve()
      const sequence = ++this.createRequestSequence
      this.loading = true
      this.auxiliaryBalances = {}
      return Promise.all([
        FmsVoucherWordApi.getVoucherWordSimpleList(accountSetId),
        FmsSubjectApi.getSubjectSimpleList(accountSetId),
        FmsAuxiliaryTypeApi.getAuxiliaryTypeSimpleList(accountSetId)
      ]).then(responses => {
        if (sequence !== this.createRequestSequence || accountSetId !== Number(this.accountSetId)) return
        const words = responses[0].data
        const subjects = responses[1].data
        const auxiliaryTypes = responses[2].data
        this.voucherWords = words
        this.subjects = buildTree(subjects)
        this.auxiliaryTypes = auxiliaryTypes
        this.auxiliaryOptions = {}
        return this.loadRouteVoucher()
      }).finally(() => {
        if (sequence === this.createRequestSequence) this.loading = false
      })
    },
    handleVoucherRouteChange() {
      if (this.accountSetId && this.voucherWords.length) this.loadRouteVoucher()
    },
    loadRouteVoucher() {
      const voucherId = Number(this.$route.query.id || 0)
      if (voucherId) return this.loadDetail(voucherId)
      const copyFrom = Number(this.$route.query.copyFrom || 0)
      if (copyFrom) return this.initializeCopiedVoucher(copyFrom)
      return this.resetForm(false)
    },
    loadDetail(id) {
      const accountSetId = Number(this.accountSetId) || 0
      if (!accountSetId) return Promise.resolve()
      return FmsVoucherApi.getVoucher(accountSetId, id).then(response => {
        if (accountSetId !== Number(this.accountSetId)) return
        const data = response.data
        if (!data) return
        this.detail = data
        Object.assign(this.formData, {
          id: data.id,
          voucherWordId: data.voucherWordId,
          voucherNumber: data.voucherNumber,
          voucherTime: new Date(data.voucherTime).setHours(0, 0, 0, 0),
          attachmentCount: Number(data.attachmentCount || 0)
        })
        this.entries = data.entries.map(entry => this.createEntryFrom(entry))
        this.padEntries()
        return Promise.all([
          this.loadSubjectBalances(formatMonth(data.voucherTime)),
          ...this.entries.map(entry => this.loadEntryAuxiliaryOptions(entry))
        ])
      })
    },
    initializeCopiedVoucher(id) {
      return this.loadDetail(id).then(() => {
        const copiedEntries = this.entries.map(entry => this.createEntryFrom(Object.assign({}, entry, { id: undefined })))
        return this.resetForm(false).then(() => {
          this.entries = copiedEntries
          this.padEntries()
          return Promise.all(this.entries.map(entry => this.loadEntryAuxiliaryOptions(entry)))
        }).then(() => {
          this.$modal.msgSuccess('已复制凭证内容，请确认后保存')
        })
      })
    },
    resetForm(updateRoute) {
      const shouldUpdateRoute = updateRoute !== false
      if (!this.accountSetId) return Promise.resolve()
      if (shouldUpdateRoute && (this.$route.query.id || this.$route.query.copyFrom)) {
        return this.$router.replace({
          path: '/fms/voucher/create',
          query: { accountSetId: this.accountSetId }
        })
      }
      this.detail = null
      this.auxiliaryBalances = {}
      const preferredWord = this.voucherWords.find(item => item.defaultStatus) || this.voucherWords[0]
      Object.assign(this.formData, {
        id: undefined,
        voucherWordId: preferredWord && preferredWord.id,
        voucherNumber: undefined,
        voucherTime: this.getDefaultVoucherTime(),
        attachmentCount: 0
      })
      this.entries = Array.from({ length: 4 }, () => this.createEmptyEntry())
      return Promise.all([
        this.refreshVoucherNumber(),
        this.loadSubjectBalances(formatMonth(this.formData.voucherTime))
      ])
    },
    refreshVoucherNumber() {
      if (this.formData.id || !this.accountSetId || !this.formData.voucherWordId || !this.formData.voucherTime) return Promise.resolve()
      const accountSetId = Number(this.accountSetId)
      const voucherWordId = Number(this.formData.voucherWordId)
      const voucherTime = this.formData.voucherTime
      return FmsVoucherApi.getNextVoucherNumber(accountSetId, voucherWordId, formatDateTime(voucherTime)).then(response => {
        if (accountSetId !== Number(this.accountSetId) || voucherWordId !== Number(this.formData.voucherWordId) || voucherTime !== this.formData.voucherTime) return
        this.formData.voucherNumber = Number(response.data) || undefined
      })
    },
    handleVoucherDateChange() {
      return Promise.all([
        this.refreshVoucherNumber(),
        this.loadSubjectBalances(formatMonth(this.formData.voucherTime)),
        ...this.entries.map(entry => this.loadEntryAuxiliaryBalance(entry))
      ])
    },
    loadSubjectBalances(month) {
      if (!this.accountSetId || !month) return Promise.resolve()
      const accountSetId = Number(this.accountSetId)
      return FmsVoucherApi.getVoucherSubjectBalanceList(accountSetId, month).then(response => {
        if (accountSetId !== Number(this.accountSetId) || month !== formatMonth(this.formData.voucherTime)) return
        const rows = response.data
        this.subjectBalances = rows
      })
    },
    getDefaultVoucherTime() {
      const today = new Date()
      if (!this.currentMonth || formatMonth(today) === this.currentMonth) return new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
      const parts = this.currentMonth.split('-').map(Number)
      return new Date(parts[0], parts[1], 0).setHours(0, 0, 0, 0)
    },
    disableVoucherDate(date) {
      return Boolean(this.currentMonth) && formatDateOnly(date) < this.currentMonth + '-01'
    },
    createEmptyEntry() {
      voucherEntrySequence += 1
      return { rowKey: 'voucher-entry-' + voucherEntrySequence, digest: '', auxiliaries: [] }
    },
    createEntryFrom(entry) {
      return Object.assign(this.createEmptyEntry(), entry || {}, {
        rowKey: 'voucher-entry-' + voucherEntrySequence,
        auxiliaries: (entry && entry.auxiliaries || []).map(item => Object.assign({}, item))
      })
    },
    fillDigest(index) {
      if (index > 0 && !String(this.entries[index].digest || '').trim()) this.entries[index].digest = this.entries[index - 1].digest
    },
    fillEntryDigests(entries) {
      entries.forEach((entry, index) => {
        if (index > 0 && !String(entry.digest || '').trim()) entry.digest = entries[index - 1].digest
      })
    },
    addEntry(index) {
      this.entries.splice(index, 0, this.createEmptyEntry())
    },
    handleInsertEntry(command, index) {
      this.addEntry(command === 'before' ? index : index + 1)
    },
    deleteEntry(index) {
      this.$delete(this.auxiliaryBalances, this.entries[index].rowKey)
      this.entries.splice(index, 1)
    },
    openDigestLibrary(index) {
      if (!this.accountSetId) return
      this.digestEntryIndex = index
      this.$refs.digestLibrary.open(this.accountSetId)
    },
    applyDigest(digest) {
      if (this.digestEntryIndex === undefined || !this.entries[this.digestEntryIndex]) return
      this.entries[this.digestEntryIndex].digest = digest
      this.digestEntryIndex = undefined
    },
    padEntries() {
      while (this.entries.length < 4) this.entries.push(this.createEmptyEntry())
    },
    handleSubjectChange(entry) {
      this.$delete(this.auxiliaryBalances, entry.rowKey)
      entry.quantity = undefined
      entry.unitPrice = undefined
      const subject = this.getSubject(entry.subjectId)
      entry.auxiliaries = this.getSubjectAuxiliaryTypeIds(entry.subjectId).map(typeId => ({
        type: this.getAuxiliaryType(typeId) && this.getAuxiliaryType(typeId).type,
        typeId,
        itemId: undefined
      }))
      return subject ? this.loadEntryAuxiliaryOptions(entry) : Promise.resolve()
    },
    loadEntryAuxiliaryOptions(entry) {
      const typeIds = this.getSubjectAuxiliaryTypeIds(entry.subjectId)
      const accountSetId = Number(this.accountSetId) || 0
      if (!typeIds.length || !accountSetId) return Promise.resolve()
      return Promise.all(typeIds.map(typeId => {
        if (this.auxiliaryOptions[typeId]) return Promise.resolve()
        return FmsAuxiliaryItemApi.getAuxiliaryItemSimpleList(accountSetId, typeId).then(response => {
          if (accountSetId !== Number(this.accountSetId)) return
          const rows = response.data
          this.$set(this.auxiliaryOptions, typeId, rows)
        })
      })).then(() => this.loadEntryAuxiliaryBalance(entry))
    },
    loadEntryAuxiliaryBalance(entry) {
      const accountSetId = Number(this.accountSetId) || 0
      const subject = this.getSubject(entry.subjectId)
      const typeIds = this.getSubjectAuxiliaryTypeIds(entry.subjectId)
      const itemIds = typeIds.map(typeId => this.getEntryAuxiliaryItemId(entry, typeId))
      if (!accountSetId || !subject || !typeIds.length || itemIds.some(itemId => !itemId)) {
        this.$delete(this.auxiliaryBalances, entry.rowKey)
        return Promise.resolve()
      }
      const month = formatMonth(this.formData.voucherTime)
      return FmsVoucherApi.getVoucherAuxiliaryBalance(accountSetId, month, subject.id, itemIds).then(response => {
        if (accountSetId !== Number(this.accountSetId) || month !== formatMonth(this.formData.voucherTime) || Number(subject.id) !== Number(entry.subjectId)) return
        this.$set(this.auxiliaryBalances, entry.rowKey, response.data)
      })
    },
    getSubject(subjectId) {
      return this.flatSubjects.find(subject => Number(subject.id) === Number(subjectId))
    },
    getEntrySubjectOptions(entry) {
      const currentSubject = this.getSubject(entry.subjectId)
      if (!currentSubject || this.leafSubjects.some(subject => Number(subject.id) === Number(currentSubject.id))) return this.leafSubjects
      return this.leafSubjects.concat(currentSubject)
    },
    getSubjectAuxiliaryTypeIds(subjectId) {
      const subject = this.getSubject(subjectId)
      return subject && Array.isArray(subject.auxiliaryTypeIds) ? subject.auxiliaryTypeIds : []
    },
    getAuxiliaryType(typeId) {
      return this.auxiliaryTypes.find(item => Number(item.id) === Number(typeId))
    },
    getAuxiliaryTypeName(typeId) {
      const type = this.getAuxiliaryType(typeId)
      return type ? type.name : ''
    },
    getEntryAuxiliary(entry, typeId) {
      let auxiliary = (entry.auxiliaries || []).find(item => Number(item.typeId) === Number(typeId))
      if (!auxiliary) {
        auxiliary = { typeId, type: this.getAuxiliaryType(typeId) && this.getAuxiliaryType(typeId).type, itemId: undefined }
        entry.auxiliaries.push(auxiliary)
      }
      return auxiliary
    },
    getEntryAuxiliaryItemId(entry, typeId) {
      const auxiliary = (entry.auxiliaries || []).find(item => Number(item.typeId) === Number(typeId))
      return auxiliary && auxiliary.itemId
    },
    setEntryAuxiliary(entry, typeId, itemId) {
      this.getEntryAuxiliary(entry, typeId).itemId = itemId
      this.loadEntryAuxiliaryBalance(entry)
    },
    formatEntryBalance(entry) {
      const balance = this.getSubjectAuxiliaryTypeIds(entry.subjectId).length
        ? this.auxiliaryBalances[entry.rowKey]
        : this.subjectBalanceMap.get(Number(entry.subjectId))
      return formatSubjectBalance(balance && balance.balance, balance && balance.balanceDirection)
    },
    formatEntrySubject(entry) {
      const subject = this.getSubject(entry.subjectId)
      return formatSubjectDisplay(
        this.readOnly ? entry.subjectCode || (subject && subject.code) : subject && subject.code,
        this.readOnly ? entry.subjectName || (subject && subject.name) : subject && subject.name,
        (entry.auxiliaries || []).map(item => item.name)
      )
    },
    isQuantitySubject(subjectId) {
      const subject = this.getSubject(subjectId)
      return Boolean(subject && subject.quantityAccounting)
    },
    getQuantityUnit(subjectId) {
      const subject = this.getSubject(subjectId)
      return subject && subject.quantityUnit || ''
    },
    calculateEntryAmount(entry) {
      if (!entry.quantity || !entry.unitPrice) return
      const amount = Math.floor(Number(entry.quantity) * Number(entry.unitPrice) * 100) / 100
      const subject = this.getSubject(entry.subjectId)
      if (subject && Number(subject.balanceDirection) === FMS_DEBIT_CREDIT_DIRECTION.CREDIT) {
        entry.debitAmount = undefined
        entry.creditAmount = amount
      } else {
        entry.debitAmount = amount
        entry.creditAmount = undefined
      }
    },
    handleEntryAmountChange(entry, direction) {
      if (direction === 'debit' && entry.debitAmount !== undefined) entry.creditAmount = undefined
      else if (direction === 'credit' && entry.creditAmount !== undefined) entry.debitAmount = undefined
    },
    sumAmount(field) {
      return Number(this.entries.reduce((total, entry) => total + Number(entry[field] || 0), 0).toFixed(2))
    },
    getMoneyDigits(value, showZero) {
      if (!showZero && !value) return []
      return String(Math.round(Math.abs(Number(value) || 0) * 100)).split('')
    },
    openSubjectForm(subjectType) {
      this.$refs.subjectForm.open('create', subjectType)
    },
    refreshSubjectOptions() {
      const accountSetId = Number(this.accountSetId) || 0
      if (!accountSetId) return Promise.resolve()
      return FmsSubjectApi.getSubjectSimpleList(accountSetId).then(response => {
        if (accountSetId !== Number(this.accountSetId)) return
        const rows = response.data
        this.subjects = buildTree(rows)
      })
    },
    openAuxiliaryItemForm(typeId) {
      const type = this.getAuxiliaryType(typeId)
      if (!type) return
      this.creatingAuxiliaryTypeId = typeId
      this.$refs.auxiliaryItemForm.open(type, undefined, this.accountSetId)
    },
    refreshAuxiliaryItemOptions() {
      const accountSetId = Number(this.accountSetId) || 0
      const typeId = Number(this.creatingAuxiliaryTypeId) || 0
      if (!accountSetId || !typeId) return Promise.resolve()
      return FmsAuxiliaryItemApi.getAuxiliaryItemSimpleList(accountSetId, typeId).then(response => {
        if (accountSetId !== Number(this.accountSetId)) return
        const rows = response.data
        this.$set(this.auxiliaryOptions, typeId, rows)
        this.creatingAuxiliaryTypeId = undefined
      })
    },
    handleEntryTableKeydown(event) {
      if (this.readOnly || this.loading || event.isComposing) return
      const target = event.target
      if (!(target instanceof HTMLInputElement)) return
      const entryRow = target.closest('tr[data-entry-index]')
      if (!entryRow) return
      const entryIndex = Number(entryRow.dataset.entryIndex)
      if (event.key === '=' && target.closest('[data-entry-money]')) {
        event.preventDefault()
        const moneyCell = target.closest('[data-entry-direction]')
        this.balanceEntry(this.entries[entryIndex], moneyCell && moneyCell.dataset.entryDirection || 'debit')
        return
      }
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) && target.getAttribute('aria-expanded') !== 'true') {
        event.preventDefault()
        this.focusEntryInputByArrow(target, entryRow, event.key)
        return
      }
      if (event.key !== 'Enter' || target.getAttribute('aria-expanded') === 'true') return
      event.preventDefault()
      this.focusNextEntryInput(target)
    },
    focusEntryInputByArrow(target, entryRow, key) {
      if (key === 'ArrowLeft' || key === 'ArrowRight') {
        const inputs = this.getEntryInputs()
        const currentIndex = inputs.indexOf(target)
        const next = inputs[currentIndex + (key === 'ArrowLeft' ? -1 : 1)]
        if (next) next.focus()
        return
      }
      const rows = Array.from(this.$refs.entryTableWrap.querySelectorAll('tbody tr[data-entry-index]'))
      const rowIndex = rows.indexOf(entryRow)
      const targetRow = rows[rowIndex + (key === 'ArrowUp' ? -1 : 1)]
      if (!targetRow) return
      const rowInputs = Array.from(entryRow.querySelectorAll('input:not([disabled])'))
      const targetInputs = Array.from(targetRow.querySelectorAll('input:not([disabled])'))
      const next = targetInputs[Math.min(rowInputs.indexOf(target), targetInputs.length - 1)]
      if (next) next.focus()
    },
    balanceEntry(entry, direction) {
      const debitWithout = Number((this.debitTotal - Number(entry.debitAmount || 0)).toFixed(2))
      const creditWithout = Number((this.creditTotal - Number(entry.creditAmount || 0)).toFixed(2))
      const difference = creditWithout - debitWithout
      if (!difference) return
      if (direction === 'credit') {
        entry.creditAmount = Number((-difference).toFixed(2))
        entry.debitAmount = undefined
      } else {
        entry.debitAmount = Number(difference.toFixed(2))
        entry.creditAmount = undefined
      }
    },
    focusNextEntryInput(target) {
      let inputs = this.getEntryInputs()
      const currentIndex = inputs.indexOf(target)
      if (currentIndex < 0) return
      if (currentIndex === inputs.length - 1) {
        this.addEntry(this.entries.length)
        this.$nextTick(() => {
          inputs = this.getEntryInputs()
          if (inputs[currentIndex + 1]) inputs[currentIndex + 1].focus()
        })
        return
      }
      if (inputs[currentIndex + 1]) inputs[currentIndex + 1].focus()
    },
    getEntryInputs() {
      return this.$refs.entryTableWrap
        ? Array.from(this.$refs.entryTableWrap.querySelectorAll('tbody input:not([disabled])'))
        : []
    },
    isEntryEmpty(entry) {
      return !(entry.digest || entry.subjectId || entry.quantity || entry.unitPrice || entry.debitAmount || entry.creditAmount ||
        (entry.auxiliaries || []).some(item => item.itemId))
    },
    validateEntry(entry, amountRequired) {
      const subject = this.getSubject(entry.subjectId)
      if (!subject) {
        this.$modal.msgWarning('请选择每条分录的会计科目')
        return false
      }
      if (Number(subject.status) !== FMS_SUBJECT_STATUS.ENABLED || (subject.children && subject.children.length)) {
        this.$modal.msgWarning('会计科目“' + subject.name + '”已停用或不是末级科目，请重新选择')
        return false
      }
      if (!entry.digest) {
        this.$modal.msgWarning('请填写每条分录的摘要')
        return false
      }
      const debit = Number(entry.debitAmount || 0)
      const credit = Number(entry.creditAmount || 0)
      if (debit !== 0 && credit !== 0) {
        this.$modal.msgWarning('同一条分录不能同时填写借方和贷方金额')
        return false
      }
      if (amountRequired && debit === 0 && credit === 0) {
        this.$modal.msgWarning('请填写每条分录的借方或贷方金额')
        return false
      }
      if (this.getSubjectAuxiliaryTypeIds(entry.subjectId).some(typeId => !this.getEntryAuxiliaryItemId(entry, typeId))) {
        this.$modal.msgWarning('请完整选择“' + subject.name + '”的辅助核算项目')
        return false
      }
      return true
    },
    buildEntryAuxiliaries(entry) {
      return this.getSubjectAuxiliaryTypeIds(entry.subjectId).map(typeId => ({
        typeId,
        itemId: this.getEntryAuxiliaryItemId(entry, typeId)
      }))
    },
    buildVoucherEntry(entry) {
      return {
        id: entry.id,
        digest: entry.digest,
        subjectId: entry.subjectId,
        quantity: entry.quantity,
        unitPrice: entry.unitPrice,
        debitAmount: entry.debitAmount,
        creditAmount: entry.creditAmount,
        auxiliaries: this.buildEntryAuxiliaries(entry)
      }
    },
    buildPayload() {
      const voucherWordId = this.formData.voucherWordId
      const voucherNumber = this.formData.voucherNumber
      if (!this.accountSetId || !voucherWordId || voucherNumber === undefined || !this.formData.voucherTime) {
        this.$modal.msgWarning('请完整填写凭证字、凭证号和凭证日期')
        return undefined
      }
      if (!Number.isInteger(voucherNumber) || voucherNumber <= 0) {
        this.$modal.msgWarning('凭证号必须为正整数')
        return undefined
      }
      if (!Number.isInteger(this.formData.attachmentCount) || this.formData.attachmentCount < 0) {
        this.$modal.msgWarning('附单据张数必须为非负整数')
        return undefined
      }
      const filledEntries = this.entries.filter(entry => !this.isEntryEmpty(entry))
      if (filledEntries.length < 2) {
        this.$modal.msgWarning('凭证至少需要两条有效分录')
        return undefined
      }
      this.fillEntryDigests(filledEntries)
      if (filledEntries.some(entry => !this.validateEntry(entry, true))) return undefined
      if (!this.balanced) {
        this.$modal.msgWarning('凭证借贷金额不平衡')
        return undefined
      }
      return {
        id: this.formData.id,
        accountSetId: Number(this.accountSetId),
        voucherWordId,
        voucherNumber,
        voucherTime: this.formData.voucherTime,
        attachmentCount: this.formData.attachmentCount,
        entries: filledEntries.map(this.buildVoucherEntry)
      }
    },
    buildTemplateEntries() {
      const filledEntries = this.entries.filter(entry => !this.isEntryEmpty(entry))
      if (filledEntries.length < 2) {
        this.$modal.msgWarning('凭证模板至少需要两条有效分录')
        return undefined
      }
      this.fillEntryDigests(filledEntries)
      if (filledEntries.some(entry => !this.validateEntry(entry, true))) return undefined
      if (!this.balanced) {
        this.$modal.msgWarning('凭证模板借贷金额不平衡')
        return undefined
      }
      return filledEntries.map(this.buildVoucherEntry)
    },
    handleMoreCommand(command) {
      this.handleTemplateCommand(command === 'saveTemplate' ? 'save' : 'apply')
    },
    handleTemplateCommand(command) {
      if (!this.accountSetId) return
      if (command === 'apply') {
        this.$refs.templateSelect.open(this.accountSetId)
        return
      }
      const entries = this.buildTemplateEntries()
      if (entries) this.$refs.templateSaveForm.open(this.accountSetId, entries)
    },
    applyTemplate(template) {
      const unavailable = (template.entries || []).find(entry => {
        const subject = this.getSubject(entry.subjectId)
        return !subject || Number(subject.status) !== FMS_SUBJECT_STATUS.ENABLED || (subject.children && subject.children.length)
      })
      if (unavailable) {
        this.$modal.msgError('模板包含当前账套不可用的会计科目，暂不能套用')
        return
      }
      this.entries = (template.entries || []).map(entry => this.createEntryFrom(entry))
      this.padEntries()
      Promise.all(this.entries.map(entry => this.loadEntryAuxiliaryOptions(entry))).then(() => {
        this.$modal.msgSuccess('已套用凭证模板“' + template.name + '”')
      })
    },
    submitForm(saveAndCreate) {
      const payload = this.buildPayload()
      if (!payload) return
      this.loading = true
      const request = payload.id
        ? FmsVoucherApi.updateVoucher(payload).then(() => payload.id)
        : FmsVoucherApi.createVoucher(payload).then(response => Number(response.data))
      request.then(voucherId => {
        this.$modal.msgSuccess('保存成功')
        if (saveAndCreate) return this.resetForm()
        if (Number(this.$route.query.id) === Number(voucherId)) return this.loadDetail(voucherId)
        return this.$router.replace({
          path: '/fms/voucher/create',
          query: { accountSetId: this.accountSetId, id: voucherId }
        })
      }).finally(() => {
        this.loading = false
      })
    },
    handleReview(status) {
      if (!this.accountSetId || !this.formData.id) return
      const text = status === FMS_VOUCHER_STATUS.APPROVED ? '确认审核该凭证吗？' : '确认反审核该凭证吗？'
      this.$modal.confirm(text).then(() => {
        return FmsVoucherApi.updateVoucherReviewStatus(this.accountSetId, [this.formData.id], status)
      }).then(() => {
        this.$modal.msgSuccess('操作成功')
        this.loadDetail(this.formData.id)
      }).catch(() => {})
    },
    handleDelete() {
      if (!this.accountSetId || !this.formData.id) return
      this.$modal.confirm('确认删除该凭证吗？删除后会产生凭证断号').then(() => {
        return FmsVoucherApi.deleteVoucherList(this.accountSetId, [this.formData.id])
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.resetForm()
      }).catch(() => {})
    },
    copyVoucher() {
      if (!this.detail) return
      this.$router.replace({
        path: '/fms/voucher/create',
        query: { accountSetId: this.accountSetId, copyFrom: this.detail.id }
      })
    },
    printVoucher() {
      if (!this.accountSetId || !this.detail) return
      this.$refs.printForm.open(this.accountSetId, this.accountSetCompanyName, [this.detail])
    },
    navigateVoucher(voucherId) {
      if (!voucherId) return
      this.$router.push({ path: '/fms/voucher/create', query: Object.assign({}, this.$route.query, { accountSetId: this.accountSetId, id: voucherId }) })
    },
    handlePageShortcut(event) {
      if (event.isComposing || event.repeat || this.loading || (event.target && event.target.closest('.el-dialog, .el-message-box'))) return
      const key = String(event.key || '').toLowerCase()
      if ((event.ctrlKey || event.metaKey) && key === 's') {
        event.preventDefault()
        if (this.canSave) this.submitForm(false)
      } else if (event.key === 'F12') {
        event.preventDefault()
        if (this.canSaveAndCreate) this.submitForm(true)
      } else if (event.altKey && key === 'n') {
        event.preventDefault()
        if (this.currentAccountWritable && checkPermi(['fms:voucher:create'])) this.resetForm()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.toolbar-card { margin-bottom: 16px; }
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.toolbar-actions, .toolbar-navigation, .meta-left, .meta-right { display: flex; align-items: center; gap: 8px; }
.toolbar-actions ::v-deep .el-button + .el-button { margin-left: 0; }
.voucher-sheet { position: relative; padding: 26px 28px 18px 0; border: 1px solid #dcdfe6; border-top: 4px solid #409eff; background: #fafafa; box-shadow: 0 2px 12px rgba(0, 0, 0, .08); }
.voucher-title { margin: 0 0 4px 28px; text-align: center; font-family: STKaiti, KaiTi, serif; font-size: 24px; font-weight: 600; letter-spacing: 6px; }
.voucher-period { position: absolute; top: 34px; right: 28px; color: #606266; font-weight: 600; }
.voucher-meta { display: flex; box-sizing: border-box; min-height: 60px; align-items: center; justify-content: space-between; padding-left: 24px; }
.field-label { color: #606266; font-weight: 600; white-space: nowrap; }
.entry-table-wrap { overflow-x: auto; }
.entry-table { width: 100%; min-width: 960px; table-layout: fixed; border-spacing: 0; border-collapse: collapse; background: #fff; }
.entry-table th, .entry-table td { border: 1px solid #dcdfe6; vertical-align: middle; }
.entry-table th { height: 48px; padding: 0 8px; color: #303133; }
.entry-table tbody td, .entry-table tfoot td { height: 60px; padding: 0 8px; }
.operation-column { padding: 0 !important; border-color: #f5f7fa !important; border-right-color: #dcdfe6 !important; background: #f5f7fa; text-align: center; }
.row-actions { display: flex; height: 100%; flex-direction: column; align-items: center; justify-content: center; opacity: 0; transition: opacity .15s; }
.entry-table tr:hover .row-actions, .entry-table tr:focus-within .row-actions { opacity: 1; }
.row-actions ::v-deep .el-button { margin: 0; }
.money-header { padding: 0 !important; }
.money-header strong { display: block; height: 25px; line-height: 25px; }
.money-units { display: flex; height: 22px; border-top: 1px solid #dcdfe6; font-size: 12px; font-weight: 400; line-height: 22px; color: #909399; }
.money-units span { display: inline-flex; box-sizing: border-box; width: calc(100% / 11); align-items: center; justify-content: center; border-right: 1px solid #ebeef5; }
.money-units span:nth-child(4), .money-units span:nth-child(8) { border-right-color: #a0cfff; }
.money-units span:nth-child(9) { border-right-color: #fab6b6; }
.digest-editor { position: relative; display: flex; height: 100%; align-items: center; }
.digest-editor ::v-deep .el-button { position: absolute; right: 0; bottom: 0; opacity: 0; }
.entry-digest:hover .digest-editor ::v-deep .el-button, .entry-digest:focus-within .digest-editor ::v-deep .el-button { opacity: 1; }
.digest-editor ::v-deep .el-input__inner, .subject-editor ::v-deep .el-input__inner { border: 0; }
.readonly-cell { display: flex; min-height: 60px; align-items: center; line-height: 20px; }
.subject-editor { display: flex; align-items: center; }
.subject-editor > .el-select { flex: 1; }
.subject-balance { position: absolute; bottom: 1px; left: 10px; display: none; color: #c0c4cc; font-size: 12px; pointer-events: none; }
.entry-subject { position: relative; padding: 0 10px !important; }
.entry-subject:hover .subject-balance, .entry-subject:focus-within .subject-balance { display: block; }
.auxiliary-fields { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.auxiliary-field { display: flex; width: calc(50% - 2px); align-items: center; }
.auxiliary-field > .el-select { flex: 1; min-width: 0; }
.quantity-cell { padding: 0 4px !important; text-align: center; }
.quantity-row { display: flex; align-items: center; justify-content: center; gap: 4px; margin: 2px 0; font-size: 12px; white-space: nowrap; }
.quantity-row ::v-deep .el-input-number { width: 68px; }
.entry-money { position: relative; padding: 0 !important; background-image: repeating-linear-gradient(to right, transparent 0, transparent calc(100% / 11 - 1px), #ebeef5 calc(100% / 11 - 1px), #ebeef5 calc(100% / 11)); }
.money-editor { position: relative; height: 60px; }
.money-editor ::v-deep .el-input-number { position: absolute; z-index: 2; inset: 0; width: 100%; height: 100%; opacity: 0; }
.money-editor:focus-within ::v-deep .el-input-number { opacity: 1; }
.money-editor:focus-within .money-cell-value { opacity: 0; }
.money-editor ::v-deep .el-input__inner { height: 60px; border: 0; font-family: Arial, sans-serif; font-size: 16px; font-weight: 600; text-align: right; }
.money-cell-value { position: absolute; inset: 0; display: flex; align-items: center; justify-content: flex-end; pointer-events: none; }
.money-cell-value span { flex: 0 0 calc(100% / 11); font-family: Tahoma, Arial, sans-serif; font-size: 14px; font-weight: 600; text-align: center; }
.total-money { height: 60px; }
.negative, .unbalanced { color: #f56c6c; }
.total-label { font-weight: 600; }
.unbalanced { margin-left: 16px; }
.voucher-footer { display: flex; align-items: center; gap: 36px; padding: 16px 0 0 28px; color: #606266; }
.approved-stamp { position: absolute; z-index: 3; top: 12px; right: 25%; padding: 10px 14px; transform: rotate(-12deg); border: 3px double #f56c6c; border-radius: 50%; color: #f56c6c; font-size: 20px; font-weight: 700; letter-spacing: 4px; opacity: .72; pointer-events: none; }
.bottom-actions { display: flex; justify-content: flex-end; margin-top: 16px; }
.muted { color: #c0c4cc; }
@media (max-width: 1100px) {
  .toolbar { align-items: flex-start; flex-direction: column; }
  .voucher-period { position: static; margin-left: 28px; text-align: center; }
}
</style>
