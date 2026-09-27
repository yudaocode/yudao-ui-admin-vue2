<template>
  <div class="app-container fms-finance-parameter-page">
    <doc-alert title="【设置】账套管理、财务参数、财务指标" url="https://doc.iocoder.cn/fms/config/account-set/" />

    <el-form :inline="true" class="parameter-toolbar" label-width="78px">
      <el-form-item label="当前账套">
        <el-select
          v-model="accountSetId"
          clearable
          filterable
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
    </el-form>

    <el-card v-loading="loading" class="parameter-card" shadow="never">
      <el-form
        v-if="accountSet"
        ref="form"
        :disabled="!isWritable"
        :model="formData"
        :rules="formRules"
        class="parameter-form"
        label-width="120px"
      >
        <section class="parameter-section">
          <el-divider content-position="left">基础参数</el-divider>
          <el-form-item label="公司名称">
            <el-input :value="accountSet.companyName" class="field-width" disabled />
          </el-form-item>
          <el-form-item label="本位币">
            <el-input :value="currencyLabel" class="field-width" disabled />
          </el-form-item>
          <el-form-item label="启用期间">
            <el-date-picker
              :value="accountSetStartTime"
              class="field-width"
              disabled
              format="yyyy-MM"
              type="month"
              value-format="timestamp"
            />
          </el-form-item>
          <el-form-item label="会计制度" prop="standard">
            <el-select v-model="formData.standard" class="field-width">
              <el-option
                v-for="item in FMS_ACCOUNTING_STANDARD_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </section>

        <template v-if="financeParameter">
          <section class="parameter-section">
            <el-divider content-position="left">科目参数</el-divider>
            <el-form-item label="科目级次" prop="level">
              <div class="level-row">
                <el-select v-model="formData.level" class="level-select" @change="handleLevelChange">
                  <el-option
                    v-for="level in levelOptions"
                    :key="level"
                    :label="level + ' 级'"
                    :value="level"
                  />
                </el-select>
                <span class="parameter-warning">科目级次和编码长度调大后不能再调小，请谨慎操作</span>
              </div>
            </el-form-item>
            <el-form-item label="编码长度" prop="subjectCodeRules">
              <div class="code-rule-row">
                <span
                  v-for="(rule, index) in formData.subjectCodeRules"
                  :key="index"
                  class="code-rule-item"
                >
                  <el-input-number
                    v-model="formData.subjectCodeRules[index]"
                    :max="FMS_SUBJECT_CODE_LENGTH_MAX"
                    :min="getRuleMinimum(index)"
                    class="rule-input"
                    controls-position="right"
                  />
                  <span v-if="index < formData.subjectCodeRules.length - 1" class="rule-separator">-</span>
                </span>
              </div>
            </el-form-item>
          </section>

          <section class="parameter-section">
            <el-divider content-position="left">账簿</el-divider>
            <el-form-item label="账簿余额方向">
              <el-checkbox
                v-model="formData.ledgerBalanceMode"
                :false-label="FMS_LEDGER_BALANCE_MODE.OPPOSITE_TO_SUBJECT"
                :true-label="FMS_LEDGER_BALANCE_MODE.SAME_AS_SUBJECT"
              >与科目方向相同</el-checkbox>
            </el-form-item>
            <el-form-item label="结账条件">
              <el-checkbox v-model="formData.voucherReviewRequired">凭证审核后才允许结账</el-checkbox>
            </el-form-item>
          </section>

          <el-form-item v-if="isWritable">
            <el-button
              v-hasPermi="['fms:config:finance-parameter:update']"
              :loading="submitLoading"
              type="primary"
              @click="submitForm"
            >保存</el-button>
          </el-form-item>
        </template>
        <el-alert
          v-else
          :closable="false"
          :title="accountSet.initialized ? '当前账套缺少财务参数，请检查初始化数据' : '当前账套尚未初始化，请先完成账套初始化'"
          show-icon
          type="info"
        />
      </el-form>
      <el-empty v-else description="请选择账套" />
    </el-card>
  </div>
</template>

<script>
import { getAccountSet, getAccountSetList } from '@/api/fms/config/account-set'
import { FmsCurrencyApi } from '@/api/fms/config/currency'
import { FmsFinanceParameterApi } from '@/api/fms/config/finance-parameter'
import { readFmsAccountSetId, saveFmsAccountSet } from '@/views/fms/utils/context'
import {
  FMS_ACCOUNTING_STANDARD_OPTIONS,
  FMS_DEFAULT_SUBJECT_CODE_RULE,
  FMS_DEFAULT_SUBJECT_LEVEL,
  FMS_LEDGER_BALANCE_MODE,
  FMS_SUBJECT_CODE_LENGTH_MAX,
  FMS_SUBJECT_CODE_LENGTH_MIN,
  FMS_SUBJECT_LEVEL_MAX
} from '@/views/fms/utils/constants'

export default {
  name: 'FmsFinanceParameter',
  data() {
    return {
      FMS_ACCOUNTING_STANDARD_OPTIONS,
      FMS_LEDGER_BALANCE_MODE,
      FMS_SUBJECT_CODE_LENGTH_MAX,
      loading: false,
      submitLoading: false,
      accountSets: [],
      accountSetId: readFmsAccountSetId(this.$route),
      accountSet: null,
      currency: null,
      financeParameter: null,
      originalLevel: FMS_DEFAULT_SUBJECT_LEVEL,
      originalRules: this.parseSubjectCodeRules(FMS_DEFAULT_SUBJECT_CODE_RULE),
      formData: this.createEmptyFormData(),
      formRules: {
        standard: [{ required: true, message: '请选择会计制度', trigger: 'change' }],
        level: [{ required: true, message: '请选择科目级次', trigger: 'change' }],
        subjectCodeRules: [{ required: true, message: '请设置各级编码长度', trigger: 'change' }]
      },
      requestSequence: 0
    }
  },
  computed: {
    currentAccountSet() {
      return this.accountSets.find(item => Number(item.id) === Number(this.accountSetId)) || null
    },
    isWritable() {
      return !!(this.currentAccountSet && [1, 3].includes(Number(this.currentAccountSet.level)))
    },
    levelOptions() {
      return Array.from(
        { length: FMS_SUBJECT_LEVEL_MAX - this.originalLevel + 1 },
        (_, index) => this.originalLevel + index
      )
    },
    currencyLabel() {
      return this.currency ? this.currency.code + ' ' + this.currency.name : '-'
    },
    accountSetStartTime() {
      if (!this.accountSet || !this.accountSet.startTime) return null
      const timestamp = Number(this.accountSet.startTime)
      if (Number.isFinite(timestamp) && timestamp > 100000000000) return timestamp
      const parsed = new Date(this.accountSet.startTime).getTime()
      return Number.isFinite(parsed) ? parsed : null
    }
  },
  created() {
    this.loadAccountSets()
  },
  methods: {
    loadAccountSets() {
      return getAccountSetList().then(response => {
        const rows = response.data
        this.accountSets = rows.filter(item => item && item.initialized)
        if (!this.accountSetId || !this.accountSets.some(item => Number(item.id) === Number(this.accountSetId))) {
          const preferred = this.accountSets.find(item => item.defaultStatus) || this.accountSets[0]
          this.accountSetId = preferred ? preferred.id : 0
        }
        if (this.currentAccountSet) saveFmsAccountSet(this.currentAccountSet)
        this.getParameterData()
      })
    },
    handleAccountSetChange(id) {
      const current = this.accountSets.find(item => Number(item.id) === Number(id))
      if (current) saveFmsAccountSet(current)
      this.getParameterData()
    },
    getParameterData() {
      const accountSetId = Number(this.accountSetId) || 0
      const sequence = ++this.requestSequence
      if (!accountSetId) {
        this.accountSet = null
        this.currency = null
        this.financeParameter = null
        this.resetFormData()
        this.loading = false
        return
      }
      this.loading = true
      return Promise.all([
        getAccountSet(accountSetId),
        FmsFinanceParameterApi.getFinanceParameter(accountSetId),
        FmsCurrencyApi.getCurrencySimpleList(accountSetId)
      ]).then(responses => {
        if (sequence !== this.requestSequence || accountSetId !== Number(this.accountSetId)) return
        const accountSet = responses[0].data
        const financeParameter = responses[1].data
        const currencies = responses[2].data
        this.accountSet = accountSet
        this.currency = this.accountSet
          ? currencies.find(item => Number(item.id) === Number(this.accountSet.currencyId))
          : null
        this.financeParameter = financeParameter || null
        if (!financeParameter) {
          this.resetFormData()
          return
        }
        this.originalLevel = Number(financeParameter.level) || FMS_DEFAULT_SUBJECT_LEVEL
        this.originalRules = this.parseSubjectCodeRules(financeParameter.subjectCodeRule)
        Object.assign(this.formData, {
          standard: Number(this.accountSet && this.accountSet.standard) || FMS_ACCOUNTING_STANDARD_OPTIONS[0].value,
          level: this.originalLevel,
          subjectCodeRules: this.originalRules.slice(),
          ledgerBalanceMode: Number(financeParameter.ledgerBalanceMode) || FMS_LEDGER_BALANCE_MODE.SAME_AS_SUBJECT,
          voucherReviewRequired: financeParameter.voucherReviewRequired !== false
        })
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      }).finally(() => {
        if (sequence === this.requestSequence) this.loading = false
      })
    },
    handleLevelChange(level) {
      while (this.formData.subjectCodeRules.length < level) {
        this.formData.subjectCodeRules.push(FMS_SUBJECT_CODE_LENGTH_MIN)
      }
      this.formData.subjectCodeRules.splice(level)
    },
    getRuleMinimum(index) {
      return this.originalRules[index] || FMS_SUBJECT_CODE_LENGTH_MIN
    },
    submitForm() {
      if (!this.$refs.form || !this.accountSetId) return
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.submitLoading = true
        FmsFinanceParameterApi.updateFinanceParameter({
          accountSetId: Number(this.accountSetId),
          standard: this.formData.standard,
          level: this.formData.level,
          subjectCodeRule: this.formData.subjectCodeRules.join('-'),
          ledgerBalanceMode: this.formData.ledgerBalanceMode,
          voucherReviewRequired: this.formData.voucherReviewRequired
        }).then(() => {
          this.$modal.msgSuccess('财务参数保存成功')
          this.getParameterData()
        }).finally(() => {
          this.submitLoading = false
        })
      })
    },
    parseSubjectCodeRules(rule) {
      const values = String(rule || '').split('-').map(Number).filter(value => Number.isFinite(value) && value > 0)
      return values.length ? values : [4, 2, 2, 2]
    },
    resetFormData() {
      this.originalLevel = FMS_DEFAULT_SUBJECT_LEVEL
      this.originalRules = this.parseSubjectCodeRules(FMS_DEFAULT_SUBJECT_CODE_RULE)
      Object.assign(this.formData, this.createEmptyFormData())
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    createEmptyFormData() {
      return {
        standard: FMS_ACCOUNTING_STANDARD_OPTIONS[0].value,
        level: FMS_DEFAULT_SUBJECT_LEVEL,
        subjectCodeRules: this.parseSubjectCodeRules(FMS_DEFAULT_SUBJECT_CODE_RULE),
        ledgerBalanceMode: FMS_LEDGER_BALANCE_MODE.SAME_AS_SUBJECT,
        voucherReviewRequired: true
      }
    }
  }
}
</script>

<style scoped>
.parameter-toolbar { margin-bottom: 12px; }
.parameter-card { min-height: 300px; }
.parameter-form { max-width: 960px; padding: 4px 8px 12px; }
.parameter-section { margin-bottom: 28px; }
.field-width { width: 320px; max-width: 100%; }
.level-row, .code-rule-row, .code-rule-item { display: flex; align-items: center; }
.level-row { flex-wrap: wrap; gap: 12px; }
.level-select { width: 160px; }
.parameter-warning { color: #e6a23c; font-size: 13px; }
.code-rule-row { flex-wrap: wrap; gap: 8px; }
.code-rule-item { gap: 8px; white-space: nowrap; }
.rule-input { width: 86px; }
.rule-separator { color: #909399; }
@media (max-width: 600px) {
  .parameter-form { padding-right: 0; padding-left: 0; }
  .level-row { align-items: flex-start; flex-direction: column; }
}
</style>
