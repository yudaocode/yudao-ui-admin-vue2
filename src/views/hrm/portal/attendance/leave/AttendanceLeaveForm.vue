<template>
  <el-dialog
    title="请假申请"
    :visible.sync="dialogVisible"
    width="600px"
    append-to-body
  >
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item
        label="请假类型"
        prop="type"
      >
        <el-select
          v-model="formData.type"
          placeholder="请选择请假类型"
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="item in getStrDictOptions(DICT_TYPE.HRM_ATTENDANCE_LEAVE_TYPE)"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="开始时间"
        prop="startTime"
      >
        <el-date-picker
          v-model="formData.startTime"
          type="datetime"
          value-format="timestamp"
          placeholder="请选择开始时间"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item
        label="结束时间"
        prop="endTime"
      >
        <el-date-picker
          v-model="formData.endTime"
          type="datetime"
          value-format="timestamp"
          placeholder="请选择结束时间"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item
        label="请假天数"
        prop="day"
      >
        <el-input-number
          v-model="formData.day"
          :min="0.01"
          :precision="2"
          :step="0.5"
          controls-position="right"
          placeholder="请输入请假天数"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item
        label="请假事由"
        prop="reason"
      >
        <el-input
          v-model="formData.reason"
          type="textarea"
          :rows="3"
          :maxlength="300"
          show-word-limit
          placeholder="请输入请假事由"
        />
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          :maxlength="500"
          show-word-limit
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button
        type="primary"
        :disabled="formLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { DICT_TYPE, getStrDictOptions } from '@/utils/dict'
import { createMyAttendanceLeave } from '@/api/hrm/portal/attendance/leave'

export default {
  name: 'HrmPortalAttendanceLeaveForm',
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      formLoading: false,
      formData: this.createDefaultFormData(),
      formRules: {
        type: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [
          { required: true, message: '请选择结束时间', trigger: 'change' },
          { validator: this.validateEndTime, trigger: 'change' }
        ],
        day: [{ required: true, message: '请输入请假天数', trigger: 'blur' }],
        reason: [{ required: true, message: '请输入请假事由', trigger: 'blur' }]
      }
    }
  },
  methods: {
    getStrDictOptions,
    createDefaultFormData() {
      return { type: undefined, startTime: undefined, endTime: undefined, day: 1, reason: '', remark: '' }
    },
    validateEndTime(rule, value, callback) {
      if (value && this.formData.startTime && new Date(value).getTime() <= new Date(this.formData.startTime).getTime()) {
        callback(new Error('结束时间必须晚于开始时间'))
        return
      }
      callback()
    },
    open() {
      this.dialogVisible = true
      this.resetForm()
    },
    async submitForm() {
      const valid = await this.$refs.formRef.validate().catch(() => false)
      if (!valid) return
      this.formLoading = true
      try {
        await createMyAttendanceLeave({
          ...this.formData,
          startTime: Number(this.formData.startTime),
          endTime: Number(this.formData.endTime)
        })
        this.$modal.msgSuccess('请假申请已提交')
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.formData = this.createDefaultFormData()
      this.$nextTick(() => this.$refs.formRef && this.$refs.formRef.resetFields())
    }
  }
}
</script>
