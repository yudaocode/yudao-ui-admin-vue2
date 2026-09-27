<template>
  <el-dialog :title="title" :visible.sync="visible" width="560px" append-to-body>
    <el-form ref="form" v-loading="loading" :model="formData" :rules="rules" label-width="112px">
      <el-alert v-if="formType === 'create' && parentSubjectUsed" type="warning" :closable="false" class="mb12">
        {{
          subjectUsage.childCount > 0
            ? '上级科目已有业务数据和下级科目，当前数据状态不允许继续新增下级'
            : '上级科目已有 ' + subjectUsage.voucherEntryCount + ' 条凭证分录、' + subjectUsage.initialBalanceCount + ' 条初始余额和 ' + subjectUsage.auxiliaryCombinationCount + ' 个辅助核算组合，创建后将全部迁移到新科目'
        }}
      </el-alert>
      <el-alert v-if="formType === 'update' && (subjectUsage.used || subjectUsage.childCount > 0)" type="warning" :closable="false" class="mb12">
        {{ subjectUsage.used ? '该科目已有业务数据，余额方向不能修改；首次启用辅助核算时，需要为历史数据指定迁移项目' : '该科目已有下级，科目类别、编码和辅助核算不能修改' }}
      </el-alert>
      <el-form-item label="科目编码" prop="code">
        <el-input v-model.trim="formData.code" :disabled="codeDisabled" maxlength="64" placeholder="请输入科目编码" @blur="handleCodeBlur" />
        <div class="form-tip">科目级次：{{ subjectCodeRule || '未配置' }}</div>
      </el-form-item>
      <el-form-item label="科目名称" prop="name">
        <el-input v-model.trim="formData.name" maxlength="255" placeholder="请输入科目名称" />
      </el-form-item>
      <el-form-item label="上级科目">
        <el-input :value="parentSubject ? parentSubject.code + ' ' + parentSubject.name : '无上级科目'" disabled />
      </el-form-item>
      <el-form-item label="科目类别" prop="category">
        <el-select v-model="formData.category" :disabled="!!parentSubject || subjectUsage.childCount > 0" style="width: 100%" placeholder="请选择科目类别">
          <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="余额方向" prop="balanceDirection">
        <el-radio-group v-model="formData.balanceDirection" :disabled="subjectUsage.used">
          <el-radio v-for="item in balanceDirectionOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="辅助核算">
        <fms-auxiliary-type-select
          v-model="formData.auxiliaryTypeIds"
          :account-set-id="accountSetId"
          :disabled="auxiliaryTypeDisabled"
          multiple
          placeholder="请选择辅助核算"
          @change="handleAuxiliaryTypeChange"
          @loaded="auxiliaryTypes = $event"
        />
      </el-form-item>
      <template v-if="auxiliaryMigrationRequired">
        <el-alert title="请选择历史凭证要迁入的辅助核算项目，该操作不可撤销" type="warning" :closable="false" class="mb12" />
        <el-form-item
          v-for="(mapping, index) in formData.auxiliaryMappings"
          :key="mapping.typeId"
          :label="getAuxiliaryTypeName(mapping.typeId)"
          :prop="'auxiliaryMappings.' + index + '.itemId'"
          :rules="[{ required: true, message: '请选择迁移项目', trigger: 'change' }]"
        >
          <fms-auxiliary-item-select
            v-model="mapping.itemId"
            :account-set-id="accountSetId"
            :auxiliary-type-id="mapping.typeId"
            placeholder="请选择迁移项目"
          />
        </el-form-item>
      </template>
      <el-form-item label="外币核算">
        <fms-currency-select
          v-model="formData.currencyIds"
          :account-set-id="accountSetId"
          :disabled="parentSubjectUsed"
          :exclude-standard="true"
          multiple
          placeholder="请选择币别"
        />
      </el-form-item>
      <el-form-item label="数量核算">
        <el-checkbox v-model="formData.quantityAccounting" :disabled="parentSubjectUsed || subjectUsage.quantityDataCount > 0">启用数量核算</el-checkbox>
      </el-form-item>
      <el-form-item v-if="formData.quantityAccounting" label="数量单位" prop="quantityUnit">
        <el-input v-model.trim="formData.quantityUnit" :disabled="parentSubjectUsed" maxlength="255" placeholder="请输入数量单位" />
      </el-form-item>
      <el-form-item label="现金项">
        <el-checkbox v-model="formData.cash" :disabled="!!(parentSubject && parentSubject.cash)">现金及现金等价物</el-checkbox>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="loading" :disabled="loading || parentDataMigrationBlocked" @click="submit">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { FmsFinanceParameterApi } from '@/api/fms/config/finance-parameter'
import * as SubjectApi from '@/api/fms/config/subject'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { FMS_DEBIT_CREDIT_DIRECTION, FMS_SUBJECT_PARENT_ID_ROOT, FMS_SUBJECT_TYPE } from '@/views/fms/utils/constants'
import { readFmsAccountSetId } from '@/views/fms/utils/context'
import FmsAuxiliaryItemSelect from '@/views/fms/config/auxiliary/components/FmsAuxiliaryItemSelect.vue'
import FmsAuxiliaryTypeSelect from '@/views/fms/config/auxiliary/components/FmsAuxiliaryTypeSelect.vue'
import FmsCurrencySelect from '@/views/fms/config/currency/components/FmsCurrencySelect.vue'

export default {
  name: 'FmsSubjectForm',
  components: { FmsAuxiliaryItemSelect, FmsAuxiliaryTypeSelect, FmsCurrencySelect },
  data() {
    return {
      visible: false,
      title: '',
      loading: false,
      formType: 'create',
      accountSetId: 0,
      formData: this.defaults(),
      parentSubject: null,
      subjectUsage: this.emptyUsage(),
      subjectCandidates: [],
      subjectCodeRule: '',
      explicitParent: false,
      originalAuxiliaryTypeIds: [],
      auxiliaryTypes: [],
      categoryOptions: [],
      balanceDirectionOptions: this.getBalanceDirectionOptions(),
      rules: {
        code: [{ required: true, message: '科目编码不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '科目名称不能为空', trigger: 'blur' }],
        category: [{ required: true, message: '科目类别不能为空', trigger: 'change' }],
        balanceDirection: [{ required: true, message: '余额方向不能为空', trigger: 'change' }],
        quantityUnit: [{ validator: (rule, value, callback) => { if (!this.formData.quantityAccounting || value) callback(); else callback(new Error('数量单位不能为空')) }, trigger: 'blur' }]
      }
    }
  },
  computed: {
    codeDisabled() { return this.formType === 'update' && this.subjectUsage.childCount > 0 },
    parentSubjectUsed() {
      return this.formType === 'create' && !!this.parentSubject && this.subjectUsage.used
    },
    parentDataMigrationBlocked() {
      return this.parentSubjectUsed && this.subjectUsage.childCount > 0
    },
    auxiliaryTypeDisabled() {
      return this.parentSubjectUsed ||
        this.subjectUsage.childCount > 0 ||
        (this.subjectUsage.used && this.originalAuxiliaryTypeIds.length > 0)
    },
    auxiliaryMigrationRequired() {
      return this.formType === 'update' &&
        this.subjectUsage.voucherEntryCount > 0 &&
        this.originalAuxiliaryTypeIds.length === 0 &&
        (this.formData.auxiliaryTypeIds || []).length > 0
    }
  },
  methods: {
    defaults(accountSetId, type) {
      return {
        id: 0,
        accountSetId: accountSetId || 0,
        code: '',
        name: '',
        parentId: FMS_SUBJECT_PARENT_ID_ROOT,
        type: type || FMS_SUBJECT_TYPE.ASSET,
        category: undefined,
        balanceDirection: FMS_DEBIT_CREDIT_DIRECTION.DEBIT,
        auxiliaryTypeIds: [],
        auxiliaryTypeNames: [],
        currencyIds: [],
        quantityAccounting: false,
        quantityUnit: '',
        cash: false,
        migrateParentData: false,
        auxiliaryMappings: [],
        children: [],
        createTime: new Date()
      }
    },
    emptyUsage() {
      return { childCount: 0, voucherEntryCount: 0, initialBalanceCount: 0, auxiliaryCombinationCount: 0, quantityDataCount: 0, used: false }
    },
    getBalanceDirectionOptions() {
      const values = getDictDatas(DICT_TYPE.FMS_DEBIT_CREDIT_DIRECTION)
      return values.length ? values.map(item => ({ label: item.label, value: Number(item.value) })) : [{ label: '借', value: 1 }, { label: '贷', value: 2 }]
    },
    async open(type, subjectType, row, parent) {
      this.formType = type
      this.accountSetId = Number((row && row.accountSetId) || (parent && parent.accountSetId) || readFmsAccountSetId(this.$route))
      if (!this.accountSetId) return
      this.title = type === 'update' ? '编辑科目' : (parent ? '新建下级科目' : '新建科目')
      this.resetForm(this.accountSetId, subjectType, parent)
      this.visible = true
      this.loading = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      try {
        if (type === 'update' && row) {
          const [financeParameterResponse, subjectResponse, usageResponse, subjectListResponse] = await Promise.all([
            FmsFinanceParameterApi.getFinanceParameter(this.accountSetId),
            SubjectApi.getSubject(this.accountSetId, row.id),
            SubjectApi.getSubjectUsage(this.accountSetId, row.id),
            parent ? Promise.resolve(undefined) : SubjectApi.getSubjectList(this.accountSetId, subjectType)
          ])
          const financeParameter = financeParameterResponse.data
          const subject = subjectResponse.data
          this.subjectCodeRule = financeParameter ? (financeParameter.subjectCodeRule || '') : ''
          this.formData = {
            ...subject,
            accountSetId: this.accountSetId,
            auxiliaryTypeIds: (subject.auxiliaryTypeIds || []).slice(),
            currencyIds: (subject.currencyIds || []).slice(),
            auxiliaryMappings: []
          }
          this.parentSubject = parent || this.findById(subjectListResponse.data, subject.parentId) || null
          this.originalAuxiliaryTypeIds = (this.formData.auxiliaryTypeIds || []).slice()
          this.subjectUsage = usageResponse.data
          this.categoryOptions = this.getCategoryOptions(this.formData.type)
          return
        }
        const [financeParameterResponse, parentUsageResponse, subjectListResponse] = await Promise.all([
          FmsFinanceParameterApi.getFinanceParameter(this.accountSetId),
          parent ? SubjectApi.getSubjectUsage(this.accountSetId, parent.id) : Promise.resolve(undefined),
          SubjectApi.getSubjectList(this.accountSetId, subjectType)
        ])
        const financeParameter = financeParameterResponse.data
        this.subjectCodeRule = financeParameter ? (financeParameter.subjectCodeRule || '') : ''
        this.subjectCandidates = subjectListResponse.data
        if (parent) {
          this.subjectUsage = parentUsageResponse.data
          this.formData.parentId = parent.id
          this.formData.code = this.suggestChildCode(parent)
          this.formData.category = parent.category
          this.formData.balanceDirection = parent.balanceDirection
          this.formData.auxiliaryTypeIds = (parent.auxiliaryTypeIds || []).slice()
          this.formData.currencyIds = (parent.currencyIds || []).slice()
          this.formData.quantityAccounting = !!parent.quantityAccounting
          this.formData.quantityUnit = parent.quantityUnit || ''
          this.formData.cash = !!parent.cash
        }
        this.categoryOptions = this.getCategoryOptions(this.formData.type)
      } finally {
        this.loading = false
      }
    },
    getCategoryOptions(type) {
      const values = getDictDatas(DICT_TYPE.FMS_SUBJECT_CATEGORY)
      const prefix = String(type) + '-'
      const options = values.filter(item => String(item.value).indexOf(prefix) === 0).map(item => ({ label: item.label, value: Number(String(item.value).slice(prefix.length)) }))
      return options.length ? options : [{ label: '一般', value: 1 }]
    },
    async submit() {
      if (!this.$refs.form || this.parentDataMigrationBlocked) return
      const valid = await new Promise(resolve => this.$refs.form.validate(resolve))
      if (!valid) return
      return this.submitValidated()
    },
    async submitValidated() {
      if (this.parentDataMigrationBlocked) return
      const payload = {
        ...this.formData,
        accountSetId: this.accountSetId,
        auxiliaryTypeIds: (this.formData.auxiliaryTypeIds || []).slice(),
        auxiliaryTypeNames: (this.formData.auxiliaryTypeNames || []).slice(),
        currencyIds: (this.formData.currencyIds || []).slice(),
        auxiliaryMappings: (this.formData.auxiliaryMappings || []).map(mapping => ({ ...mapping }))
      }
      if (!payload.quantityAccounting) payload.quantityUnit = undefined
      this.loading = true
      try {
        if (this.formType === 'create') {
          const duplicateSubject = this.subjectCandidates.find(subject =>
            subject.parentId === payload.parentId && subject.name === payload.name.trim()
          )
          if (duplicateSubject) {
            try {
              await this.$confirm(
                '同级已有名称为“' + duplicateSubject.name + '”的科目（' + duplicateSubject.code + '），是否仍要继续？',
                '科目名称重复',
                { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
              )
            } catch (error) {
              return
            }
          }
          if (this.parentSubjectUsed) {
            try {
              await this.$confirm(
                '继续后会把上级科目的 ' + this.subjectUsage.voucherEntryCount + ' 条凭证分录、' + this.subjectUsage.initialBalanceCount + ' 条初始余额和 ' + this.subjectUsage.auxiliaryCombinationCount + ' 个辅助核算组合迁移到新科目，且无法撤销。是否继续？',
                '迁移上级科目历史数据',
                { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
              )
            } catch (error) {
              return
            }
            payload.migrateParentData = true
          }
          await SubjectApi.createSubject(payload)
          this.$modal.msgSuccess('新增成功')
        } else {
          if (this.auxiliaryMigrationRequired) {
            try {
              await this.$confirm(
                '继续后会把该科目的 ' + this.subjectUsage.voucherEntryCount + ' 条凭证分录迁移到所选辅助核算项目，且无法撤销。是否继续？',
                '迁移历史辅助核算数据',
                { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
              )
            } catch (error) {
              return
            }
          } else {
            payload.auxiliaryMappings = undefined
          }
          await SubjectApi.updateSubject(payload)
          this.$modal.msgSuccess('修改成功')
        }
        this.visible = false
        this.$emit('success')
      } finally {
        this.loading = false
      }
    },
    resetForm(accountSetId, type, parent) {
      this.formData = this.defaults(accountSetId, type)
      this.parentSubject = parent || null
      this.explicitParent = !!parent
      this.subjectCandidates = []
      this.subjectUsage = this.emptyUsage()
      this.subjectCodeRule = ''
      this.originalAuxiliaryTypeIds = []
      this.auxiliaryTypes = []
      this.categoryOptions = []
    },
    handleAuxiliaryTypeChange(value) {
      const typeIds = Array.isArray(value) ? value : []
      const mappingMap = new Map((this.formData.auxiliaryMappings || []).map(mapping => [mapping.typeId, mapping]))
      this.formData.auxiliaryMappings = typeIds.map(typeId => mappingMap.get(typeId) || { typeId })
    },
    getAuxiliaryTypeName(typeId) {
      const auxiliaryType = this.auxiliaryTypes.find(item => item.id === typeId)
      return auxiliaryType ? auxiliaryType.name : '辅助核算项目'
    },
    async handleCodeBlur() {
      if (this.formType !== 'create' || this.explicitParent) return
      const code = String(this.formData.code || '').trim()
      const parent = this.findParentByCode(code)
      this.parentSubject = parent || null
      this.formData.parentId = parent ? parent.id : FMS_SUBJECT_PARENT_ID_ROOT
      if (!parent) {
        this.subjectUsage = this.emptyUsage()
        return
      }
      this.formData.category = parent.category
      this.formData.balanceDirection = parent.balanceDirection
      this.formData.auxiliaryTypeIds = (parent.auxiliaryTypeIds || []).slice()
      this.formData.currencyIds = (parent.currencyIds || []).slice()
      this.formData.quantityAccounting = !!parent.quantityAccounting
      this.formData.quantityUnit = parent.quantityUnit || ''
      this.formData.cash = !!parent.cash
      this.loading = true
      try {
        const response = await SubjectApi.getSubjectUsage(this.accountSetId, parent.id)
        if (String(this.formData.code || '').trim() === code && this.parentSubject && this.parentSubject.id === parent.id) {
          this.subjectUsage = response.data
        }
      } finally {
        this.loading = false
      }
    },
    findParentByCode(code) {
      const value = String(code || '')
      if (!/^\d+$/.test(value)) return null
      const segments = String(this.subjectCodeRule || '').split('-').map(Number)
      let total = 0
      let parentLength = 0
      segments.some(length => { total += length; if (total < value.length) parentLength = total; return total >= value.length })
      if (!parentLength) return null
      return this.subjectCandidates.find(item => item.code === value.slice(0, parentLength)) || null
    },
    findById(items, id) {
      for (let i = 0; i < (items || []).length; i += 1) {
        if (Number(items[i].id) === Number(id)) return items[i]
        const child = this.findById(items[i].children, id)
        if (child) return child
      }
      return null
    },
    suggestChildCode(parent) {
      const segments = String(this.subjectCodeRule || '').split('-').map(Number)
      const length = segments[parent.level || 1] || 2
      const used = (parent.children || []).map(item => String(item.code || '').slice(String(parent.code).length))
      for (let number = 1; number < (10 ** length); number += 1) {
        const suffix = String(number).padStart(length, '0')
        if (used.indexOf(suffix) < 0) return String(parent.code) + suffix
      }
      return String(parent.code) + String(10 ** length - 1).padStart(length, '0')
    }
  }
}
</script>

<style scoped>
.mb12 { margin-bottom: 12px; }
.form-tip { color: #909399; font-size: 12px; line-height: 22px; }
.dialog-footer { text-align: right; }
</style>
