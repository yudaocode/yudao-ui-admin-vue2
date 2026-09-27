<!-- MES 假期设置表单 -->
<template>
  <el-dialog title="假期设置" :visible.sync="dialogVisible" width="400px" append-to-body>
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="日期" prop="day">
        <el-input :value="dayDisplay" readonly />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio v-for="dict in holidayTypeOptions" :key="dict.value" :label="dict.value">
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getIntDictOptions } from '@/utils/dict'
import { CalHolidayApi } from '@/api/mes/cal/holiday'
import { formatDate } from '@/utils/formatTime'
import { HolidayType } from '@/views/mes/utils/constants'

const MES_CAL_HOLIDAY_TYPE = 'mes_cal_holiday_type'

export default {
  name: 'HolidayForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      dayDisplay: '',
      formData: this.getDefaultForm(),
      holidayTypeOptions: getIntDictOptions(MES_CAL_HOLIDAY_TYPE),
      formRules: {
        type: [{ required: true, message: '请选择类型', trigger: 'change' }]
      }
    }
  },
  methods: {
    getDefaultForm() {
      return { day: undefined, type: HolidayType.WORKDAY, remark: '' }
    },
    async open(day) {
      this.dialogVisible = true
      this.resetFormData()
      this.dayDisplay = day
      this.formData.day = new Date(day + ' 00:00:00').getTime()
      this.formLoading = true
      try {
        const response = await CalHolidayApi.getHolidayByDay(formatDate(this.formData.day))
        if (response.data) {
          this.formData.type = response.data.type == null ? HolidayType.WORKDAY : response.data.type
          this.formData.remark = response.data.remark == null ? '' : response.data.remark
        }
      } finally {
        this.formLoading = false
      }
    },
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        this.formLoading = true
        try {
          await CalHolidayApi.saveHoliday(this.formData)
          this.$modal.msgSuccess('设置成功')
          this.dialogVisible = false
          this.$emit('success')
        } finally {
          this.formLoading = false
        }
      })
    },
    resetFormData() {
      this.formData = this.getDefaultForm()
      this.dayDisplay = ''
      // 弹窗已挂载时同步重置，避免 nextTick 晚于 open 中的日期赋值而把 day 重置为首次打开的值（对齐 Vue3 源行为）
      if (this.$refs.form) this.$refs.form.resetFields()
    }
  }
}
</script>
