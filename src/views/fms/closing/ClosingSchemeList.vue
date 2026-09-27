<template>
  <el-card shadow="never" class="scheme-list-wrap">
    <div class="list-header">
      <div>
        <div class="list-title">期末结转方案</div>
        <div class="list-subtitle">{{ monthLabel }} 共录入凭证 {{ voucherCount || 0 }} 张</div>
      </div>
      <div class="header-actions">
        <el-checkbox
          v-if="isWritable"
          :value="allSchemesChecked"
          :indeterminate="someSchemesChecked"
          @input="changeAllSchemes"
        >全选</el-checkbox>
        <el-button
          v-if="isWritable"
          v-hasPermi="['fms:closing:profit-loss']"
          type="primary"
          :loading="generating"
          :disabled="closed || !currentPeriod"
          @click="generateSelectedSchemes"
        >生成凭证</el-button>
      </div>
    </div>

    <div v-loading="loading" class="scheme-grid">
      <ClosingSchemeCard
        name="结转损益"
        :checked="selectedSchemeIds.includes(PROFIT_LOSS_SCHEME_ID)"
        :balance="profitLossScheme ? Number(profitLossScheme.balance || 0) : Number(profitLossBalance || 0)"
        :voucher-ids="profitLossScheme ? (profitLossScheme.voucherIds || []) : []"
        :generate-disabled="profitLossGenerateDisabled"
        :is-writable="isWritable"
        @update:checked="changeSchemeChecked(PROFIT_LOSS_SCHEME_ID, $event)"
        @settings="openProfitLossSettings"
        @generate="generateProfitLoss"
        @open-voucher="openVoucher"
      />
      <ClosingSchemeCard
        v-for="scheme in otherSchemes"
        :key="scheme.id"
        :name="scheme.name"
        :checked="selectedSchemeIds.includes(scheme.id)"
        :balance="Number(scheme.balance || 0)"
        :voucher-ids="scheme.voucherIds || []"
        :generate-disabled="schemeGenerateDisabled(scheme)"
        :is-writable="isWritable"
        @update:checked="changeSchemeChecked(scheme.id, $event)"
        @settings="openSchemeSettings(scheme)"
        @generate="generateScheme(scheme)"
        @open-voucher="openVoucher"
      />

      <button
        v-if="isWritable"
        v-hasPermi="['fms:closing:update']"
        type="button"
        class="add-scheme"
        @click="$refs.templateSelect.open()"
      >
        <i class="el-icon-plus add-icon" />
        <span>期末结转凭证方案</span>
      </button>
    </div>

    <ClosingSchemeForm
      ref="schemeForm"
      :account-set-id="accountSetId"
      :subjects="leafSubjects"
      :voucher-words="voucherWords"
      @success="refresh"
    />
    <ClosingTemplateSelect
      ref="templateSelect"
      :account-set-id="accountSetId"
      :subjects="leafSubjects"
      :is-writable="isWritable"
      @select="openSchemeFromTemplate"
    />
    <ProfitLossSettingsForm
      ref="profitLossSettingsForm"
      :account-set-id="accountSetId"
      :month="month"
      :subjects="leafSubjects"
      :voucher-words="voucherWords"
      @success="refresh"
    />
    <SpecialClosingSettingsForm
      ref="specialClosingSettingsForm"
      :account-set-id="accountSetId"
      :subjects="leafSubjects"
      :voucher-words="voucherWords"
      @success="refresh"
    />
  </el-card>
</template>

<script>
import { FmsClosingSchemeApi } from '@/api/fms/closing/scheme'
import { FmsClosingVoucherApi } from '@/api/fms/closing/voucher'
import * as FmsSubjectApi from '@/api/fms/config/subject'
import { FmsVoucherWordApi } from '@/api/fms/config/voucher-word'
import { FMS_CLOSING_TYPE } from '@/views/fms/utils/constants'

import ClosingSchemeCard from './ClosingSchemeCard.vue'
import ClosingSchemeForm from './ClosingSchemeForm.vue'
import ClosingTemplateSelect from './ClosingTemplateSelect.vue'
import ProfitLossSettingsForm from './ProfitLossSettingsForm.vue'
import SpecialClosingSettingsForm from './SpecialClosingSettingsForm.vue'

const PROFIT_LOSS_SCHEME_ID = -1

export default {
  name: 'FmsClosingSchemeList',
  components: {
    ClosingSchemeCard,
    ClosingSchemeForm,
    ClosingTemplateSelect,
    ProfitLossSettingsForm,
    SpecialClosingSettingsForm
  },
  props: {
    accountSetId: { type: Number, required: true },
    month: { type: String, required: true },
    currentPeriod: { type: Boolean, required: true },
    closed: { type: Boolean, required: true },
    voucherCount: { type: Number, default: 0 },
    profitLossBalance: { type: Number, default: 0 },
    isWritable: { type: Boolean, required: true }
  },
  data() {
    return {
      PROFIT_LOSS_SCHEME_ID,
      loading: false,
      generating: false,
      voucherWords: [],
      leafSubjects: [],
      closingSchemes: [],
      selectedSchemeIds: [],
      initSequence: 0,
      schemeSequence: 0,
      initializedAccountSetId: 0
    }
  },
  computed: {
    monthLabel() {
      const parts = this.month.split('-')
      return parts[0] + '年' + parts[1] + '月'
    },
    otherSchemes() {
      return this.closingSchemes.filter(item => Number(item.type) !== FMS_CLOSING_TYPE.PROFIT_LOSS)
    },
    profitLossScheme() {
      return this.closingSchemes.find(item => Number(item.type) === FMS_CLOSING_TYPE.PROFIT_LOSS)
    },
    allSchemeIds() {
      return [PROFIT_LOSS_SCHEME_ID].concat(this.otherSchemes.map(item => item.id))
    },
    allSchemesChecked() {
      return this.allSchemeIds.length > 0 && this.allSchemeIds.every(id => this.selectedSchemeIds.includes(id))
    },
    someSchemesChecked() {
      return this.selectedSchemeIds.length > 0 && !this.allSchemesChecked
    },
    profitLossGenerateDisabled() {
      const voucherIds = this.profitLossScheme && this.profitLossScheme.voucherIds
      return this.closed || !this.currentPeriod || (Number(this.profitLossBalance) === 0 && !(voucherIds && voucherIds.length))
    }
  },
  watch: {
    accountSetId: {
      immediate: true,
      handler() { this.init() }
    },
    month() {
      if (this.initializedAccountSetId === this.accountSetId) this.getSchemeList()
    }
  },
  beforeDestroy() {
    this.initSequence += 1
    this.schemeSequence += 1
  },
  methods: {
    init() {
      const accountSetId = this.accountSetId
      const sequence = ++this.initSequence
      this.initializedAccountSetId = 0
      this.voucherWords = []
      this.leafSubjects = []
      return Promise.all([
        FmsVoucherWordApi.getVoucherWordSimpleList(accountSetId),
        FmsSubjectApi.getSubjectSimpleList(accountSetId)
      ]).then(responses => {
        if (sequence !== this.initSequence || accountSetId !== this.accountSetId) return
        const words = responses[0].data
        const subjectList = responses[1].data
        this.voucherWords = words
        const subjects = subjectList
        const parentSubjectIds = new Set(subjects.map(item => item.parentId))
        this.leafSubjects = subjects.filter(item => !parentSubjectIds.has(item.id))
        this.initializedAccountSetId = accountSetId
        return this.getSchemeList()
      })
    },
    getSchemeList() {
      const accountSetId = this.accountSetId
      const month = this.month
      const sequence = ++this.schemeSequence
      this.loading = true
      return FmsClosingSchemeApi.getClosingSchemeList({ accountSetId, month }).then(response => {
        if (sequence !== this.schemeSequence || accountSetId !== this.accountSetId || month !== this.month) return
        const rows = response.data
        this.closingSchemes = rows
        const validIds = [PROFIT_LOSS_SCHEME_ID].concat(this.closingSchemes.map(item => item.id))
        this.selectedSchemeIds = this.selectedSchemeIds.filter(id => validIds.includes(id))
      }).finally(() => {
        if (sequence === this.schemeSequence) this.loading = false
      })
    },
    refresh() {
      return this.getSchemeList().then(() => this.$emit('success'))
    },
    openProfitLossSettings() {
      this.$refs.profitLossSettingsForm.open(this.profitLossScheme)
    },
    generateProfitLoss() {
      if (!this.currentPeriod) {
        this.$modal.msgWarning('只能生成当前会计期间的结转凭证')
        return
      }
      if (!this.profitLossScheme) {
        this.$modal.msgWarning('请先完成结转损益参数设置')
        this.$refs.profitLossSettingsForm.open()
        return
      }
      this.$modal.confirm('确认生成 ' + this.monthLabel + ' 的结转损益凭证吗？').then(() => {
        this.generating = true
        return FmsClosingVoucherApi.generateProfitLossVoucher({ accountSetId: this.accountSetId, month: this.month })
      }).then(response => {
        const voucherId = response.data
        this.$modal.msgSuccess('结转损益凭证已生成')
        return this.refresh().then(() => this.openVoucher(voucherId))
      }).catch(() => {}).finally(() => { this.generating = false })
    },
    generateScheme(scheme) {
      if (!this.currentPeriod) return
      this.$modal.confirm('确认生成 ' + this.monthLabel + ' 的“' + scheme.name + '”凭证吗？').then(() => {
        this.generating = true
        return FmsClosingVoucherApi.generateClosingSchemeVoucher({
          accountSetId: this.accountSetId,
          month: this.month,
          id: scheme.id
        })
      }).then(response => {
        const voucherId = response.data
        this.$modal.msgSuccess('结转凭证已生成')
        return this.refresh().then(() => this.openVoucher(voucherId))
      }).catch(() => {}).finally(() => { this.generating = false })
    },
    generateSelectedSchemes() {
      if (!this.currentPeriod) return
      const ids = this.selectedSchemeIds.length ? this.selectedSchemeIds : this.allSchemeIds
      const availableIds = ids.filter(id => {
        if (id === PROFIT_LOSS_SCHEME_ID) {
          return Number(this.profitLossBalance) !== 0 || Boolean(this.profitLossScheme && this.profitLossScheme.voucherIds && this.profitLossScheme.voucherIds.length)
        }
        const scheme = this.otherSchemes.find(item => item.id === id)
        return Boolean(scheme && (Number(scheme.balance) !== 0 || (scheme.voucherIds && scheme.voucherIds.length)))
      })
      if (!availableIds.length) {
        this.$modal.msgWarning('当前没有需要生成凭证的结账方案')
        return
      }
      if (availableIds.includes(PROFIT_LOSS_SCHEME_ID) && !this.profitLossScheme) {
        this.$modal.msgWarning('请先完成结转损益参数设置')
        this.$refs.profitLossSettingsForm.open()
        return
      }
      this.$modal.confirm('确认生成已选择的 ' + availableIds.length + ' 个结账方案凭证吗？').then(() => {
        this.generating = true
        return FmsClosingVoucherApi.generateClosingVoucherList({
          accountSetId: this.accountSetId,
          month: this.month,
          ids: availableIds.map(id => id === PROFIT_LOSS_SCHEME_ID ? this.profitLossScheme.id : id)
        })
      }).then(response => {
        const values = response.data
        const voucherIds = values
        const skippedCount = availableIds.length - voucherIds.length
        this.$modal.msgSuccess(skippedCount
          ? '已生成 ' + voucherIds.length + ' 个结账方案凭证，' + skippedCount + ' 个方案无需生成'
          : '已生成 ' + voucherIds.length + ' 个结账方案凭证')
        return this.refresh()
      }).catch(() => {}).finally(() => { this.generating = false })
    },
    changeAllSchemes(checked) {
      this.selectedSchemeIds = checked ? this.allSchemeIds.slice() : []
    },
    changeSchemeChecked(id, checked) {
      if (checked) {
        if (!this.selectedSchemeIds.includes(id)) this.selectedSchemeIds.push(id)
      } else {
        this.selectedSchemeIds = this.selectedSchemeIds.filter(item => item !== id)
      }
    },
    schemeGenerateDisabled(scheme) {
      return this.closed || !this.currentPeriod || (Number(scheme.balance) === 0 && !(scheme.voucherIds && scheme.voucherIds.length))
    },
    openSchemeSettings(scheme) {
      if (Number(scheme.type) === FMS_CLOSING_TYPE.REGULAR) {
        this.$refs.schemeForm.open(scheme)
      } else {
        this.$refs.specialClosingSettingsForm.open(scheme)
      }
    },
    openSchemeFromTemplate(template) {
      this.$refs.schemeForm.open(undefined, template)
    },
    openVoucher(voucherId) {
      if (!voucherId) return
      this.$router.push({ path: '/fms/voucher/create', query: { id: voucherId }})
    }
  }
}
</script>

<style scoped>
.scheme-list-wrap { margin-bottom: 16px; }
.list-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.list-title { font-size: 16px; font-weight: 600; }
.list-subtitle { margin-top: 6px; color: #909399; }
.header-actions { display: flex; align-items: center; gap: 12px; }
.scheme-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 16px; min-height: 174px; }
.add-scheme { min-height: 174px; display: flex; cursor: pointer; flex-direction: column; align-items: center; justify-content: center; gap: 12px; border: 1px dashed #dcdfe6; border-radius: 6px; background: transparent; color: #909399; transition: color .2s, border-color .2s; }
.add-scheme:hover { border-color: #409eff; color: #409eff; }
.add-icon { font-size: 34px; }
</style>
