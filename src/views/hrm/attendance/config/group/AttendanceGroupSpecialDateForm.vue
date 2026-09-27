<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="560px" append-to-body>
    <el-form ref="form" :model="formData" :rules="formRules" label-width="120px">
      <el-form-item label="特殊日期类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择特殊日期类型" class="form-control">
          <el-option label="上班" :value="holidayType.WORK" />
          <el-option label="休息" :value="holidayType.REST" />
        </el-select>
      </el-form-item>
      <el-form-item label="日期" prop="date">
        <el-date-picker
          v-model="formData.date"
          type="date"
          value-format="timestamp"
          placeholder="请选择日期"
          class="form-control"
        />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { HrmAttendanceHolidayType } from '@/views/hrm/utils/constants'

export default {
  name: 'HrmAttendanceGroupSpecialDateForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formData: {},
      formRules: {
        type: [{ required: true, message: '特殊日期类型不能为空', trigger: 'change' }],
        date: [{ required: true, message: '日期不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    holidayType() {
      return HrmAttendanceHolidayType
    }
  },
  methods: {
    /** 打开弹窗 */
    open(specialDate) {
      this.dialogVisible = true
      this.dialogTitle = specialDate ? '编辑特殊日期' : '新增特殊日期'
      this.resetForm()
      if (specialDate) {
        this.formData = { ...specialDate }
      }
    },
    /** 提交表单 */
    async submitForm() {
      await this.$refs.form.validate()
      this.$emit('confirm', { ...this.formData })
      this.dialogVisible = false
    },
    /** 重置表单 */
    resetForm() {
      this.formData = {
        type: HrmAttendanceHolidayType.WORK,
        date: undefined
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
