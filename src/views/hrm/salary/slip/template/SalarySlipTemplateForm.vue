<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="1000px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="104px"
    >
      <el-form-item
        label="模板名称"
        prop="name"
      >
        <el-input
          v-model="formData.name"
          maxlength="64"
          placeholder="请输入模板名称"
        />
      </el-form-item>
      <el-form-item label="隐藏空项">
        <el-switch v-model="formData.hideEmpty" />
      </el-form-item>
      <el-form-item label="工资项">
        <salary-option-select
          ref="optionSelect"
          v-model="selectedCodes"
          :disabled-codes="[HrmSalaryOptionCode.REAL_PAY]"
          placeholder="请选择工资条项目"
          @change="handleSelectedCodesChange"
        />
      </el-form-item>
      <el-form-item label="模板明细">
        <salary-slip-template-option-editor
          ref="optionEditor"
          v-model="formData.options"
          @remove="handleOptionRemove"
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
import { createSalarySlipTemplate, getSalarySlipTemplate, updateSalarySlipTemplate } from '@/api/hrm/salary/slip/template'
import {
  HrmSalaryOptionCategoryCode,
  HrmSalaryOptionCode,
  HrmSalarySlipTemplateOptionType
} from '@/views/hrm/utils/constants'
import SalaryOptionSelect from '../../config/option/components/SalaryOptionSelect.vue'
import SalarySlipTemplateOptionEditor from './SalarySlipTemplateOptionEditor.vue'

export default {
  name: 'HrmSalarySlipTemplateForm',
  components: { SalaryOptionSelect, SalarySlipTemplateOptionEditor },
  data() {
    return {
      HrmSalaryOptionCode,
      dialogVisible: false,
      dialogTitle: '',
      formType: '',
      formLoading: false,
      formData: this.createDefaultFormData(),
      salaryOptionList: [],
      salaryOptionAllList: [],
      selectedCodes: [],
      formRules: {
        name: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    async open(type, id) {
      this.dialogVisible = true
      this.resetForm()
      await this.$nextTick()
      this.dialogTitle = this.$t('action.' + type)
      this.formType = type
      this.formLoading = true
      try {
        this.salaryOptionAllList = await this.$refs.optionSelect.init()
        this.salaryOptionList = this.salaryOptionAllList.filter(
          item => item.parentCode !== HrmSalaryOptionCategoryCode.ROOT
        )
        this.selectedCodes = [HrmSalaryOptionCode.REAL_PAY]
        this.handleSelectedCodesChange(this.selectedCodes)
        if (id) {
          const response = await getSalarySlipTemplate(id)
          const detail = response.data
          detail.options = (detail.options || []).map(item => ({
            ...item,
            parentCode: item.parentCode === HrmSalaryOptionCategoryCode.ROOT
              ? undefined
              : item.parentCode
          }))
          this.formData = detail
          this.selectedCodes = (this.formData.options || [])
            .filter(item => item.type !== HrmSalarySlipTemplateOptionType.CATEGORY)
            .map(item => item.code)
            .filter(code => code !== undefined)
          if (!this.selectedCodes.includes(HrmSalaryOptionCode.REAL_PAY)) {
            this.selectedCodes.push(HrmSalaryOptionCode.REAL_PAY)
            this.handleSelectedCodesChange(this.selectedCodes)
          }
        }
      } finally {
        this.formLoading = false
      }
    },
    async submitForm() {
      const valid = await this.$refs.form.validate().catch(() => false)
      if (!valid) return
      const validateMessage = this.$refs.optionEditor.validate()
      if (validateMessage) {
        this.$modal.msgWarning(validateMessage)
        return
      }
      this.formLoading = true
      try {
        this.formData.options = this.$refs.optionEditor.getNormalizedOptions()
        if (this.formType === 'update') {
          await updateSalarySlipTemplate(this.formData)
          this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        } else {
          const response = await createSalarySlipTemplate(this.formData)
          this.formData.id = response.data
          this.$modal.msgSuccess(this.$t('common.createSuccess'))
        }
        this.dialogVisible = false
        this.$emit('success', this.formData.id)
      } finally {
        this.formLoading = false
      }
    },
    handleSelectedCodesChange(codes) {
      const options = this.formData.options || []
      this.formData.options = options.filter(item =>
        item.type === HrmSalarySlipTemplateOptionType.CATEGORY ||
        (item.code !== undefined && codes.includes(item.code))
      )
      codes.forEach(code => {
        if (this.formData.options.some(item =>
          item.type === HrmSalarySlipTemplateOptionType.ITEM && item.code === code
        )) return
        const salaryOption = this.salaryOptionList.find(item => item.code === code)
        if (!salaryOption) return
        const categoryCode = salaryOption.parentCode || HrmSalaryOptionCategoryCode.ROOT
        this.ensureSalaryOptionCategory(categoryCode)
        this.formData.options.push({
          name: salaryOption.name,
          type: HrmSalarySlipTemplateOptionType.ITEM,
          code: salaryOption.code,
          parentCode: categoryCode,
          hidden: false,
          sort: this.getNextSort()
        })
      })
    },
    ensureSalaryOptionCategory(categoryCode) {
      if (!categoryCode || this.formData.options.some(item =>
        item.type === HrmSalarySlipTemplateOptionType.CATEGORY &&
        item.code === categoryCode
      )) return
      const category = this.salaryOptionAllList.find(item => item.code === categoryCode)
      this.formData.options.push({
        name: category ? category.name : '其他',
        type: HrmSalarySlipTemplateOptionType.CATEGORY,
        code: categoryCode,
        parentCode: HrmSalaryOptionCategoryCode.ROOT,
        hidden: false,
        sort: this.getNextSort()
      })
    },
    handleOptionRemove(option) {
      if (option.type === HrmSalarySlipTemplateOptionType.ITEM && option.code !== undefined) {
        this.selectedCodes = this.selectedCodes.filter(code => code !== option.code)
      }
    },
    getNextSort() {
      return Math.max(0, ...(this.formData.options || []).map(item => item.sort || 0)) + 1
    },
    createDefaultFormData() {
      return { id: undefined, name: '', hideEmpty: false, options: [] }
    },
    resetForm() {
      this.formData = this.createDefaultFormData()
      this.selectedCodes = []
      this.formType = ''
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    }
  }
}
</script>
