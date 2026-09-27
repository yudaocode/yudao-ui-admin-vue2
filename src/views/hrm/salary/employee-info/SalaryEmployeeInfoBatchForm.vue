<template>
  <el-dialog
    title="批量调薪"
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
        <el-col :span="12">
          <el-form-item label="部门范围">
            <dept-select
              v-model="formData.deptIds"
              class="full-width"
              multiple
              placeholder="请选择调薪部门"
              @change="$refs.form.validateField('employeeIds')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="指定员工"
            prop="employeeIds"
          >
            <hrm-employee-select
              v-model="formData.employeeIds"
              class="full-width"
              multiple
              placeholder="请选择调薪员工"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
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
        <el-col :span="12">
          <el-form-item
            label="生效日期"
            prop="effectTime"
          >
            <el-date-picker
              v-model="formData.effectTime"
              :picker-options="{ disabledDate: disabledEffectDate }"
              class="full-width"
              type="date"
              value-format="timestamp"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-alert
        v-if="isPendingChange()"
        :closable="false"
        class="pending-alert"
        show-icon
        title="批量调整将在生效日期前保持待生效，不会提前修改所选员工的薪资档案。"
        type="warning"
      />
      <el-form-item
        label="调薪方式"
        prop="type"
      >
        <el-radio-group v-model="formData.type">
          <el-radio :label="HrmSalaryBatchAdjustType.PERCENT">按比例调薪</el-radio>
          <el-radio :label="HrmSalaryBatchAdjustType.AMOUNT">按金额调薪</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-table
        :data="formData.salaryOptions"
        border
        max-height="260"
      >
        <el-table-column
          label="调薪项"
          min-width="180"
          prop="name"
        />
        <el-table-column
          align="center"
          label="编码"
          prop="code"
          width="120"
        />
        <el-table-column
          align="center"
          :label="formData.type === HrmSalaryBatchAdjustType.PERCENT ? '调薪比例' : '调薪金额'"
          width="240"
        >
          <template slot-scope="scope">
            <div class="adjust-input">
              <el-input-number
                v-model="scope.row.value"
                :controls="false"
                :max="formData.type === HrmSalaryBatchAdjustType.PERCENT ? 9999.99 : 9999999.99"
                :precision="2"
                class="input-number"
              />
              <span>{{ formData.type === HrmSalaryBatchAdjustType.PERCENT ? '%' : '元' }}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-form-item
        class="remark-item"
        label="备注"
        prop="remark"
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
import {
  getSalaryAdjustmentMinEffectDate,
  updateSalaryEmployeeInfoList
} from '@/api/hrm/salary/employee-info'
import { getSalaryOptionSimpleList } from '@/api/hrm/salary/config/option'
import HrmEmployeeSelect from '@/views/hrm/employee/components/HrmEmployeeSelect.vue'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import {
  HrmSalaryBatchAdjustType,
  HrmSalaryChangeReason,
  HrmSalaryOptionCategoryCode
} from '@/views/hrm/utils/constants'

function startOfDay(value = Date.now()) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export default {
  name: 'HrmSalaryEmployeeInfoBatchForm',
  components: { HrmEmployeeSelect, DeptSelect },
  data() {
    return {
      DICT_TYPE,
      HrmSalaryBatchAdjustType,
      dialogVisible: false,
      formLoading: false,
      minEffectDate: undefined,
      formData: this.createDefaultFormData(),
      formRules: {
        employeeIds: [{ validator: this.validateEmployeeScope, trigger: 'change' }],
        type: [{ required: true, message: '调薪方式不能为空', trigger: 'change' }],
        changeReason: [{ required: true, message: '调整原因不能为空', trigger: 'change' }],
        effectTime: [{ required: true, message: '生效日期不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    getIntDictOptions,
    createDefaultFormData() {
      return {
        employeeIds: [],
        deptIds: [],
        type: HrmSalaryBatchAdjustType.PERCENT,
        changeReason: HrmSalaryChangeReason.ENTRY_SALARY,
        effectTime: startOfDay(),
        remark: '',
        salaryOptions: []
      }
    },
    validateEmployeeScope(rule, value, callback) {
      if (this.formData.employeeIds.length > 0 || this.formData.deptIds.length > 0) {
        callback()
        return
      }
      callback(new Error('至少需要选择一个部门或员工'))
    },
    isPendingChange() {
      return startOfDay(this.formData.effectTime) > startOfDay()
    },
    disabledEffectDate(date) {
      return Boolean(this.minEffectDate) && startOfDay(date) < startOfDay(this.minEffectDate)
    },
    async open(employeeIds) {
      this.formData = this.createDefaultFormData()
      this.formData.employeeIds = [...employeeIds]
      this.dialogVisible = true
      this.formLoading = true
      try {
        const [optionResponse, dateResponse] = await Promise.all([
          getSalaryOptionSimpleList(),
          getSalaryAdjustmentMinEffectDate()
        ])
        this.formData.salaryOptions = optionResponse.data
          .filter(option => option.parentCode === HrmSalaryOptionCategoryCode.BASIC_SALARY)
          .map(option => ({ code: option.code, name: option.name, value: 0 }))
        this.minEffectDate = dateResponse.data || undefined
      } finally {
        this.formLoading = false
      }
    },
    async submitForm() {
      const valid = await this.$refs.form.validate().catch(() => false)
      if (!valid) return
      this.formLoading = true
      try {
        const response = await updateSalaryEmployeeInfoList(this.formData)
        const successCount = response.data.successEmployeeIds.length
        const failureCount = Object.keys(response.data.failureEmployeeReasons).length
        const content = '批量调薪完成：成功 ' + successCount + ' 人，失败 ' + failureCount + ' 人'
        if (failureCount === 0) this.$modal.msgSuccess(content)
        else if (successCount > 0) this.$modal.msgWarning(content)
        else this.$modal.msgError(content)
        if (successCount > 0) {
          this.dialogVisible = false
          this.$emit('success')
        }
      } finally {
        this.formLoading = false
      }
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
.pending-alert { margin-bottom: 16px; }
.adjust-input { display: flex; align-items: center; justify-content: center; gap: 8px; }
.input-number { width: 180px; }
.remark-item { margin-top: 16px; }
</style>
