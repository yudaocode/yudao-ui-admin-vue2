<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="620px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="96px"
    >
      <el-form-item label="方案名称" prop="name">
        <el-input v-model="formData.name" maxlength="64" placeholder="请输入方案名称" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="个税类型" prop="type">
            <el-select
              v-model="formData.type"
              class="full-width"
              placeholder="请选择个税类型"
              @change="handleTypeChange"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.HRM_SALARY_TAX_TYPE)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否计税" prop="taxEnabled">
            <el-switch
              v-model="formData.taxEnabled"
              :disabled="formData.type === HrmSalaryTaxType.NONE"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="formData.type !== HrmSalaryTaxType.NONE" :gutter="20">
        <el-col :span="12">
          <el-form-item label="起征点" prop="threshold">
            <el-input-number v-model="formData.threshold" :min="0" :precision="2" class="full-width" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="小数位" prop="decimalScale">
            <el-input-number v-model="formData.decimalScale" :min="0" :max="4" class="full-width" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-alert
        v-if="formData.type !== HrmSalaryTaxType.NONE"
        class="tax-alert"
        :closable="false"
        type="info"
        show-icon
        title="工资薪金默认起征点为 5000 元，劳务报酬默认 800 元，起征点不得小于 0；小数位决定个税计算结果保留 0～4 位。"
      />
      <el-form-item
        v-if="formData.type === HrmSalaryTaxType.SALARY"
        label="计税周期"
        prop="cycleType"
      >
        <el-radio-group v-model="formData.cycleType">
          <el-radio
            v-for="item in HrmSalaryTaxCycleTypeOptions"
            :key="item.value"
            :label="item.value"
          >{{ item.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import {
  createSalaryTaxRule,
  getSalaryTaxRule,
  updateSalaryTaxRule
} from '@/api/hrm/salary/config/tax-rule'
import {
  HrmSalaryTaxCycleType,
  HrmSalaryTaxCycleTypeOptions,
  HrmSalaryTaxType
} from '@/views/hrm/utils/constants'

function createDefaultFormData() {
  return {
    id: undefined,
    name: '',
    type: HrmSalaryTaxType.SALARY,
    taxEnabled: true,
    threshold: 5000,
    decimalScale: 2,
    cycleType: HrmSalaryTaxCycleType.JANUARY_TO_DECEMBER
  }
}

export default {
  name: 'HrmSalaryTaxRuleForm',
  data() {
    return {
      DICT_TYPE,
      HrmSalaryTaxType,
      HrmSalaryTaxCycleTypeOptions,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: createDefaultFormData(),
      formRules: {
        name: [{ required: true, message: '方案名称不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '个税类型不能为空', trigger: 'change' }],
        taxEnabled: [{ required: true, message: '是否计税不能为空', trigger: 'change' }],
        threshold: [{ validator: this.validateThreshold, trigger: ['blur', 'change'] }],
        decimalScale: [{ validator: this.validateDecimalScale, trigger: ['blur', 'change'] }],
        cycleType: [{ validator: this.validateCycleType, trigger: 'change' }]
      }
    }
  },
  methods: {
    getIntDictOptions,
    validateThreshold(rule, value, callback) {
      if (this.formData.type !== HrmSalaryTaxType.NONE && value == null) {
        callback(new Error('起征点不能为空'))
        return
      }
      callback()
    },
    validateDecimalScale(rule, value, callback) {
      if (this.formData.type !== HrmSalaryTaxType.NONE && value == null) {
        callback(new Error('小数位不能为空'))
        return
      }
      callback()
    },
    validateCycleType(rule, value, callback) {
      if (this.formData.type === HrmSalaryTaxType.SALARY && value == null) {
        callback(new Error('计税周期不能为空'))
        return
      }
      callback()
    },
    async open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = this.$t('action.' + type)
      this.formType = type
      if (!id) {
        this.resetForm()
        return
      }
      this.formLoading = true
      try {
        const response = await getSalaryTaxRule(id)
        this.formData = response.data
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      } finally {
        this.formLoading = false
      }
    },
    handleTypeChange(type) {
      if (type === HrmSalaryTaxType.SALARY) {
        this.formData.taxEnabled = true
        this.formData.threshold = 5000
        this.formData.decimalScale = 2
        this.formData.cycleType = HrmSalaryTaxCycleType.JANUARY_TO_DECEMBER
      } else if (type === HrmSalaryTaxType.REMUNERATION) {
        this.formData.taxEnabled = true
        this.formData.threshold = 800
        this.formData.decimalScale = 2
        this.formData.cycleType = undefined
      } else {
        this.formData.taxEnabled = false
        this.formData.threshold = 0
        this.formData.decimalScale = undefined
        this.formData.cycleType = undefined
      }
      this.$refs.form.clearValidate(['threshold', 'decimalScale', 'cycleType'])
    },
    async submitForm() {
      await this.$refs.form.validate()
      this.formLoading = true
      try {
        if (this.formType === 'create') {
          await createSalaryTaxRule(this.formData)
          this.$modal.msgSuccess(this.$t('common.createSuccess'))
        } else {
          await updateSalaryTaxRule(this.formData)
          this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        }
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.formData = createDefaultFormData()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
.tax-alert { margin-bottom: 16px; }
</style>
