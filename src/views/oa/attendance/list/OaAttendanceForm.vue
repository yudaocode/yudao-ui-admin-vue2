<template>
  <Dialog
    title="修改考勤记录"
    v-model="dialogVisible"
    append-to-body
    @closed="resetForm"
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="员工">
        <el-input :value="formData.userName" disabled />
      </el-form-item>
      <el-form-item label="考勤类型">
        <el-input :value="getAttendanceTypeLabel" disabled />
      </el-form-item>
      <el-form-item label="考勤时间">
        <el-input :value="formatDate(formData.attendanceTime)" disabled />
      </el-form-item>
      <el-form-item label="考勤状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择考勤状态" style="width: 100%">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          maxlength="500"
          show-word-limit
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as AttendanceApi from '@/api/oa/attendance'
import Dialog from '@/components/Dialog'
import { DICT_TYPE, getDictLabel, getIntDictOptions } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { OA_ATTENDANCE_STATUS, OA_ATTENDANCE_TYPE } from '@/views/oa/utils/constants'

function createDefaultForm() {
  return {
    id: 0,
    userId: 0,
    userName: undefined,
    type: OA_ATTENDANCE_TYPE.CLOCK_IN,
    status: OA_ATTENDANCE_STATUS.NORMAL,
    attendanceTime: '',
    remark: undefined,
    createTime: ''
  }
}

export default {
  name: 'OaAttendanceForm',
  components: { Dialog },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formData: createDefaultForm(),
      formRules: {
        status: [{ required: true, message: '考勤状态不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    getAttendanceTypeLabel() {
      return getDictLabel(DICT_TYPE.OA_ATTENDANCE_TYPE, this.formData.type)
    },
    statusOptions() {
      const allowedStatusValues = this.formData.type === OA_ATTENDANCE_TYPE.CLOCK_IN
        ? [OA_ATTENDANCE_STATUS.NORMAL, OA_ATTENDANCE_STATUS.LATE]
        : [OA_ATTENDANCE_STATUS.NORMAL, OA_ATTENDANCE_STATUS.EARLY]
      return getIntDictOptions(DICT_TYPE.OA_ATTENDANCE_STATUS)
        .filter(item => allowedStatusValues.includes(item.value))
    }
  },
  methods: {
    formatDate,
    open(id) {
      this.resetForm()
      this.dialogVisible = true
      this.formLoading = true
      return AttendanceApi.getAttendance(id).then(response => {
        this.formData = response.data
      }).finally(() => {
        this.formLoading = false
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        AttendanceApi.updateAttendance(this.formData).then(() => {
          this.$modal.msgSuccess('修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    resetForm() {
      this.formData = createDefaultForm()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>
