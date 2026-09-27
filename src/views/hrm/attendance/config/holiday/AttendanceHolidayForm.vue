<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="520px" append-to-body>
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="88px"
    >
      <el-form-item label="日期" prop="date">
        <el-date-picker
          v-model="formData.date"
          type="date"
          value-format="timestamp"
          placeholder="请选择日期"
          class="form-control"
        />
      </el-form-item>
      <el-form-item label="日期类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择日期类型" class="form-control">
          <el-option
            v-for="dict in holidayTypeOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  createAttendanceHoliday,
  getAttendanceHoliday,
  updateAttendanceHoliday
} from '@/api/hrm/attendance/holiday'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { HrmAttendanceHolidayType } from '@/views/hrm/utils/constants'

export default {
  name: 'HrmAttendanceHolidayForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: {
        id: undefined,
        date: undefined,
        type: HrmAttendanceHolidayType.REST
      },
      formRules: {
        date: [{ required: true, message: '日期不能为空', trigger: 'change' }],
        type: [{ required: true, message: '日期类型不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    holidayTypeOptions() {
      return getDictDatas(DICT_TYPE.HRM_ATTENDANCE_HOLIDAY_TYPE).map(item => ({
        ...item,
        value: Number(item.value)
      }))
    }
  },
  methods: {
    /** 打开弹窗 */
    async open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增' : '修改'
      this.formType = type
      this.resetForm()
      if (id) {
        this.formLoading = true
        try {
          const response = await getAttendanceHoliday(id)
          this.formData = response.data
        } finally {
          this.formLoading = false
        }
      }
    },
    /** 提交表单 */
    async submitForm() {
      if (!this.$refs.form) return
      const valid = await this.$refs.form.validate()
      if (!valid) return
      this.formLoading = true
      try {
        if (this.formType === 'create') {
          await createAttendanceHoliday(this.formData)
          this.$modal.msgSuccess('新增成功')
        } else {
          await updateAttendanceHoliday(this.formData)
          this.$modal.msgSuccess('修改成功')
        }
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    /** 重置表单 */
    resetForm() {
      this.formData = {
        id: undefined,
        date: undefined,
        type: HrmAttendanceHolidayType.REST
      }
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    }
  }
}
</script>

<style scoped>
.form-control {
  width: 100%;
}
</style>
