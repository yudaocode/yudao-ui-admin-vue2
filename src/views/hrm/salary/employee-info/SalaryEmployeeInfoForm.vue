<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="980px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="104px"
    >
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item
            label="员工"
            prop="employeeId"
          >
            <hrm-employee-select
              v-model="formData.employeeId"
              :disabled="Boolean(formData.id)"
              class="full-width"
              placeholder="请选择员工"
              @change="loadSalaryEmployee"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="记录类型"
            prop="recordType"
          >
            <el-radio-group
              v-model="formData.recordType"
              disabled
            >
              <el-radio :label="HrmSalaryRecordType.FIXED">定薪</el-radio>
              <el-radio :label="HrmSalaryRecordType.CHANGE">调薪</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="调薪模板">
            <salary-change-template-select
              ref="templateSelect"
              v-model="selectedTemplateId"
              @change="applySelectedTemplate()"
            />
          </el-form-item>
        </el-col>
        <el-col
          v-if="formData.recordType === HrmSalaryRecordType.CHANGE"
          :span="6"
        >
          <el-form-item
            label="生效日期"
            prop="effectTime"
          >
            <el-date-picker
              v-model="formData.effectTime"
              :picker-options="{ disabledDate: disabledEffectDate }"
              value-format="timestamp"
              type="date"
              class="full-width"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row
        v-if="formData.recordType === HrmSalaryRecordType.CHANGE"
        :gutter="20"
      >
        <el-col :span="8">
          <el-form-item
            label="调整原因"
            prop="changeReason"
          >
            <el-select
              v-model="formData.changeReason"
              class="full-width"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.HRM_SALARY_CHANGE_REASON)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="调整前正式">
            <el-input-number
              :value="beforeTotal"
              :min="0"
              :precision="2"
              class="full-width"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="调整前试用">
            <el-input-number
              :value="probationBeforeTotal"
              :min="0"
              :precision="2"
              class="full-width"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-alert
        v-if="isPendingChange()"
        type="warning"
        :closable="false"
        show-icon
        class="pending-alert"
        title="该调整将在生效日期前保持待生效，当前薪资档案不会提前变化"
      />
      <el-divider content-position="left">薪资明细</el-divider>
      <el-table
        :data="salaryOptionRows"
        border
      >
        <el-table-column
          label="薪资项"
          prop="name"
          min-width="180"
        />
        <el-table-column
          label="编码"
          prop="code"
          width="120"
          align="center"
        />
        <el-table-column
          label="试用期工资"
          width="220"
          align="center"
        >
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.probationOption.value"
              :precision="2"
              :min="0"
              class="full-width"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="转正后工资"
          width="220"
          align="center"
        >
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.regularOption.value"
              :precision="2"
              :min="0"
              class="full-width"
            />
          </template>
        </el-table-column>
      </el-table>
      <el-form-item
        label="备注"
        prop="remark"
        class="remark-item"
      >
        <el-input
          v-model="formData.remark"
          :rows="3"
          maxlength="500"
          show-word-limit
          type="textarea"
        />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button
        :disabled="formLoading"
        type="primary"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { getSalaryChangeRecord } from '@/api/hrm/salary/change-record'
import {
  getSalaryAdjustmentMinEffectDate,
  getSalaryEmployeeInfo,
  updateSalaryEmployeeInfo
} from '@/api/hrm/salary/employee-info'
import { getSalaryOptionSimpleList } from '@/api/hrm/salary/config/option'
import HrmEmployeeSelect from '@/views/hrm/employee/components/HrmEmployeeSelect.vue'
import SalaryChangeTemplateSelect from '../config/change-template/components/SalaryChangeTemplateSelect.vue'
import {
  HrmSalaryChangeReason,
  HrmSalaryOptionCategoryCode,
  HrmSalaryRecordType
} from '@/views/hrm/utils/constants'

function startOfDay(value = Date.now()) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

function startOfMonth() {
  const date = new Date()
  date.setDate(1)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export default {
  name: 'HrmSalaryEmployeeInfoForm',
  components: { HrmEmployeeSelect, SalaryChangeTemplateSelect },
  data() {
    return {
      DICT_TYPE,
      HrmSalaryRecordType,
      dialogVisible: false,
      dialogTitle: '定薪/调薪',
      formLoading: false,
      salaryOptionList: [],
      salaryTemplateList: [],
      selectedTemplateId: undefined,
      minEffectDate: undefined,
      salaryDraftMap: new Map(),
      probationDraftMap: new Map(),
      beforeTotal: 0,
      probationBeforeTotal: 0,
      formData: this.createDefaultFormData(),
      formRules: {
        employeeId: [{ required: true, message: '员工不能为空', trigger: 'change' }],
        recordType: [{ required: true, message: '记录类型不能为空', trigger: 'change' }],
        changeReason: [{ required: true, message: '调整原因不能为空', trigger: 'change' }],
        effectTime: [{ required: true, message: '生效日期不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    salaryOptionRows() {
      const regularOptions = this.formData.salaryOptions || []
      const probationOptions = this.formData.probationSalaryOptions || []
      const regularOptionMap = new Map(regularOptions.map(option => [option.code, option]))
      const probationOptionMap = new Map(probationOptions.map(option => [option.code, option]))
      const optionCodes = Array.from(new Set([
        ...regularOptions.map(option => option.code),
        ...probationOptions.map(option => option.code)
      ]))
      return optionCodes.map(code => ({
        code,
        name: (regularOptionMap.get(code) && regularOptionMap.get(code).name) ||
          (probationOptionMap.get(code) && probationOptionMap.get(code).name),
        regularOption: regularOptionMap.get(code) || { code, value: 0 },
        probationOption: probationOptionMap.get(code) || { code, value: 0 }
      }))
    }
  },
  methods: {
    getIntDictOptions,
    isPendingChange() {
      return this.formData.recordType === HrmSalaryRecordType.CHANGE &&
        Boolean(this.formData.effectTime) &&
        startOfDay(this.formData.effectTime) > startOfDay()
    },
    disabledEffectDate(date) {
      return Boolean(this.minEffectDate) && startOfDay(date) < startOfDay(this.minEffectDate)
    },
    async open(employeeId, recordId) {
      this.dialogVisible = true
      this.dialogTitle = '定薪/调薪'
      this.resetForm()
      await this.loadSimpleData()
      if (recordId) {
        this.dialogTitle = '编辑定薪调薪记录'
        this.selectedTemplateId = undefined
        const response = await getSalaryChangeRecord(recordId)
        const record = response.data
        this.beforeTotal = record.beforeTotal || 0
        this.probationBeforeTotal = record.probationBeforeTotal || 0
        this.formData = {
          id: record.id,
          employeeId: record.employeeId || employeeId,
          recordType: record.recordType,
          changeReason: record.changeReason,
          effectTime: record.effectTime,
          remark: record.remark,
          salaryOptions: (record.salaryOptions || []).map(item => ({ ...item })),
          probationSalaryOptions: (record.probationSalaryOptions || []).map(item => ({ ...item }))
        }
        this.resetDraftMaps(this.formData.salaryOptions, this.formData.probationSalaryOptions)
      } else if (employeeId) {
        this.formData.employeeId = employeeId
        await this.loadSalaryEmployee()
      } else {
        this.selectDefaultTemplate()
        this.resetDraftMaps(this.buildDefaultOptionValues(), this.buildDefaultOptionValues())
        this.applySelectedTemplate(false)
      }
    },
    async submitForm() {
      const valid = await this.$refs.form.validate().catch(() => false)
      if (!valid) return
      this.formLoading = true
      try {
        await updateSalaryEmployeeInfo(this.formData)
        this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    async loadSimpleData() {
      // el-dialog 内容懒渲染：首次 open 时 $refs.templateSelect 尚未创建，与 Vue3 源一致降级为空模板列表
      const [optionResponse, templates, dateResponse] = await Promise.all([
        getSalaryOptionSimpleList(),
        this.$refs.templateSelect ? this.$refs.templateSelect.init() : Promise.resolve(undefined),
        getSalaryAdjustmentMinEffectDate()
      ])
      this.salaryOptionList = optionResponse.data.filter(item =>
        item.parentCode !== HrmSalaryOptionCategoryCode.ROOT && item.calculateEnabled
      )
      this.salaryTemplateList = templates || []
      this.minEffectDate = dateResponse.data || undefined
      this.selectDefaultTemplate()
    },
    createDefaultFormData() {
      return {
        employeeId: undefined,
        recordType: HrmSalaryRecordType.FIXED,
        changeReason: HrmSalaryChangeReason.ENTRY_SALARY,
        effectTime: startOfMonth(),
        remark: '',
        salaryOptions: [],
        probationSalaryOptions: []
      }
    },
    async loadSalaryEmployee() {
      if (!this.formData.employeeId) return
      this.formLoading = true
      try {
        const response = await getSalaryEmployeeInfo(this.formData.employeeId)
        const salaryEmployee = response.data
        if (salaryEmployee && salaryEmployee.id) {
          this.formData.recordType = HrmSalaryRecordType.CHANGE
          this.beforeTotal = salaryEmployee.regularSalary || 0
          this.probationBeforeTotal = salaryEmployee.probationSalary || 0
          this.resetDraftMaps(
            salaryEmployee.salaryOptions && salaryEmployee.salaryOptions.length
              ? salaryEmployee.salaryOptions
              : this.buildDefaultOptionValues(),
            salaryEmployee.probationSalaryOptions && salaryEmployee.probationSalaryOptions.length
              ? salaryEmployee.probationSalaryOptions
              : this.buildDefaultOptionValues()
          )
        } else {
          this.formData.recordType = HrmSalaryRecordType.FIXED
          this.beforeTotal = 0
          this.probationBeforeTotal = 0
          this.resetDraftMaps(this.buildDefaultOptionValues(), this.buildDefaultOptionValues())
        }
        this.applySelectedTemplate(false)
      } finally {
        this.formLoading = false
      }
    },
    buildDefaultOptionValues() {
      return this.salaryOptionList.map(item => ({ code: item.code, name: item.name, value: 0 }))
    },
    selectDefaultTemplate() {
      const template = this.salaryTemplateList.find(item => item.defaultStatus)
      this.selectedTemplateId = template && template.id
    },
    resetDraftMaps(salaryOptions = [], probationSalaryOptions = []) {
      this.salaryDraftMap = new Map(salaryOptions
        .filter(item => item.code !== undefined)
        .map(item => [item.code, { ...item }]))
      this.probationDraftMap = new Map(probationSalaryOptions
        .filter(item => item.code !== undefined)
        .map(item => [item.code, { ...item }]))
    },
    syncDraftMaps() {
      const salaryOptions = this.formData.salaryOptions || []
      salaryOptions.forEach(item => {
        if (item.code !== undefined) this.salaryDraftMap.set(item.code, { ...item })
      })
      const probationSalaryOptions = this.formData.probationSalaryOptions || []
      probationSalaryOptions.forEach(item => {
        if (item.code !== undefined) this.probationDraftMap.set(item.code, { ...item })
      })
    },
    getSelectedOptionDefinitions() {
      const template = this.salaryTemplateList.find(item => item.id === this.selectedTemplateId)
      if (template && template.options && template.options.length) {
        return template.options.map(item => ({ code: item.code, name: item.name }))
      }
      return this.salaryOptionList.map(item => ({ code: item.code, name: item.name }))
    },
    buildSelectedOptions(draftMap) {
      return this.getSelectedOptionDefinitions().filter(item => item.code !== undefined).map(item => {
        const current = draftMap.get(item.code)
        return {
          code: item.code,
          name: item.name || (current && current.name),
          value: current && current.value != null ? current.value : 0
        }
      })
    },
    applySelectedTemplate(syncDraft = true) {
      if (syncDraft) this.syncDraftMaps()
      this.formData.salaryOptions = this.buildSelectedOptions(this.salaryDraftMap)
      this.formData.probationSalaryOptions = this.buildSelectedOptions(this.probationDraftMap)
    },
    resetForm() {
      this.formData = this.createDefaultFormData()
      this.beforeTotal = 0
      this.probationBeforeTotal = 0
      this.selectedTemplateId = undefined
      this.salaryDraftMap = new Map()
      this.probationDraftMap = new Map()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
.pending-alert { margin-bottom: 16px; }
.remark-item { margin-top: 16px; }
</style>
