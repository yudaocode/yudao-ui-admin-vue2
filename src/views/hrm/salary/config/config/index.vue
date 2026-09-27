<template>
  <div class="app-container">
    <el-card shadow="never">
      <el-alert
        v-if="initialized"
        title="计薪初始化已完成，仅可调整对应社保自然月。"
        type="info"
        show-icon
        :closable="false"
        class="config-alert"
      />
      <el-form
        ref="form"
        v-loading="loading"
        :model="formData"
        :rules="formRules"
        label-width="132px"
        class="config-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计薪周期开始日" prop="cycleStartDay">
              <el-input-number
                v-model="formData.cycleStartDay"
                :disabled="initialized"
                :min="1"
                :max="31"
                class="full-width"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工资周期结束日">
              <el-input-number
                :value="getCycleEndDay(formData.cycleStartDay)"
                disabled
                :min="1"
                :max="31"
                class="full-width"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="!initialized" :gutter="20">
          <el-col :span="12">
            <el-form-item label="薪资启用月份" prop="startYearMonth">
              <el-date-picker
                v-model="formData.startYearMonth"
                :disabled="initialized"
                type="month"
                value-format="yyyy-MM"
                placeholder="请选择月份"
                class="full-width"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="对应社保自然月" prop="socialSecurityMonthType">
          <el-radio-group v-model="formData.socialSecurityMonthType">
            <el-radio
              v-for="item in HrmSalarySocialSecurityMonthTypeOptions"
              :key="item.value"
              :label="item.value"
            >{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button
            v-hasPermi="['hrm:salary:config:update']"
            type="primary"
            icon="el-icon-check"
            :disabled="loading"
            @click="submitForm"
          >保存</el-button>
          <el-button icon="el-icon-refresh" @click="loadConfig">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { createSalaryConfig, getSalaryConfig, updateSalaryConfig } from '@/api/hrm/salary/config/config'
import {
  HrmSalarySocialSecurityMonthType,
  HrmSalarySocialSecurityMonthTypeOptions
} from '@/views/hrm/utils/constants'

function createDefaultFormData() {
  return {
    cycleStartDay: 1,
    socialSecurityMonthType: HrmSalarySocialSecurityMonthType.PREVIOUS_MONTH,
    startYearMonth: ''
  }
}

export default {
  name: 'HrmSalaryConfigConfig',
  data() {
    return {
      HrmSalarySocialSecurityMonthTypeOptions,
      loading: false,
      initialized: false,
      formData: createDefaultFormData(),
      formRules: {
        cycleStartDay: [{ required: true, message: '计薪周期开始日不能为空', trigger: 'blur' }],
        socialSecurityMonthType: [
          { required: true, message: '对应社保自然月不能为空', trigger: 'change' }
        ],
        startYearMonth: [{ required: true, message: '薪资启用月份不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.loadConfig()
  },
  methods: {
    getCycleEndDay(cycleStartDay) {
      return cycleStartDay === 1 ? 31 : cycleStartDay - 1
    },
    async loadConfig() {
      this.loading = true
      try {
        const response = await getSalaryConfig()
        const data = response.data
        const nextInitialized = Boolean(data && data.startYear && data.startMonth)
        const nextFormData = data
          ? {
            cycleStartDay: data.cycleStartDay == null ? 1 : data.cycleStartDay,
            socialSecurityMonthType: data.socialSecurityMonthType == null
              ? HrmSalarySocialSecurityMonthType.PREVIOUS_MONTH
              : data.socialSecurityMonthType,
            startYearMonth: data.startYear && data.startMonth
              ? data.startYear + '-' + String(data.startMonth).padStart(2, '0')
              : ''
          }
          : createDefaultFormData()
        this.initialized = nextInitialized
        this.formData = nextFormData
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      } finally {
        this.loading = false
      }
    },
    async validateForm() {
      if (!this.initialized) {
        await this.$refs.form.validate()
        return
      }
      await new Promise((resolve, reject) => {
        this.$refs.form.validateField('socialSecurityMonthType', error => {
          if (error) reject(new Error(error))
          else resolve()
        })
      })
    },
    async submitForm() {
      await this.validateForm()
      this.loading = true
      try {
        if (this.initialized) {
          await updateSalaryConfig({
            socialSecurityMonthType: this.formData.socialSecurityMonthType
          })
          this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        } else {
          const values = this.formData.startYearMonth.split('-').map(Number)
          await createSalaryConfig({
            cycleStartDay: this.formData.cycleStartDay,
            socialSecurityMonthType: this.formData.socialSecurityMonthType,
            startYear: values[0],
            startMonth: values[1]
          })
          this.$modal.msgSuccess(this.$t('common.createSuccess'))
        }
        await this.loadConfig()
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.config-alert { margin-bottom: 15px; }
.config-form { max-width: 900px; }
.full-width { width: 100%; }
</style>
