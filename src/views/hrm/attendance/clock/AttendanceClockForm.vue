<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="680px" append-to-body>
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="112px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="员工" prop="employeeId">
            <HrmEmployeeSelect
              v-model="formData.employeeId"
              :disabled="formType === 'update'"
              @change="handleShiftConditionChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="打卡类型" prop="type">
            <el-select v-model="formData.type" class="form-control" @change="applyShiftDefaultTime">
              <el-option
                v-for="dict in clockTypeDictDatas"
                :key="dict.value"
                :label="dict.label"
                :value="Number(dict.value)"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="打卡日期" prop="attendanceTime">
            <el-date-picker
              v-model="formData.attendanceTime"
              type="date"
              placeholder="请选择打卡日期"
              class="form-control"
              @change="handleShiftConditionChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="打卡时间" prop="clockTime">
            <el-time-picker
              v-model="formData.clockTime"
              format="HH:mm:ss"
              placeholder="请选择打卡时间"
              class="form-control"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-alert
        v-if="shiftInfo"
        :title="shiftTimeTip"
        type="info"
        :closable="false"
        class="shift-alert"
      />
      <el-alert
        v-else-if="formData.employeeId && formData.attendanceTime && !shiftLoading"
        title="该员工当天未配置有效班次，不能补录打卡"
        type="warning"
        :closable="false"
        class="shift-alert"
      />
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          maxlength="255"
          placeholder="请输入备注"
        />
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
  createAttendanceClock,
  getAttendanceClock,
  getAttendanceClockShift,
  updateAttendanceClock
} from '@/api/hrm/attendance/clock'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { HrmAttendanceClockType } from '@/views/hrm/utils/constants'
import HrmEmployeeSelect from '@/views/hrm/employee/components/HrmEmployeeSelect.vue'

function formatDate(value, pattern) {
  const date = new Date(value)
  const values = {
    YYYY: date.getFullYear(),
    MM: String(date.getMonth() + 1).padStart(2, '0'),
    DD: String(date.getDate()).padStart(2, '0'),
    HH: String(date.getHours()).padStart(2, '0'),
    mm: String(date.getMinutes()).padStart(2, '0'),
    ss: String(date.getSeconds()).padStart(2, '0')
  }
  return Object.keys(values).reduce((result, token) => result.replace(token, values[token]), pattern)
}

export default {
  name: 'HrmAttendanceClockForm',
  components: { HrmEmployeeSelect },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      shiftLoading: false,
      shiftInfo: undefined,
      formData: {
        id: undefined,
        employeeId: undefined,
        type: HrmAttendanceClockType.ON_DUTY,
        attendanceTime: undefined,
        clockTime: undefined,
        remark: ''
      },
      formRules: {
        employeeId: [{ required: true, message: '员工不能为空', trigger: 'change' }],
        type: [{ required: true, message: '打卡类型不能为空', trigger: 'change' }],
        attendanceTime: [{ required: true, message: '打卡日期不能为空', trigger: 'change' }],
        clockTime: [{ required: true, message: '打卡时间不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    clockTypeDictDatas() {
      return getDictDatas(DICT_TYPE.HRM_ATTENDANCE_CLOCK_TYPE)
    },
    shiftTimeTip() {
      if (!this.shiftInfo) {
        return ''
      }
      const clockInRange = this.formatShiftTimeRange(
        this.shiftInfo.clockInStartTime,
        this.shiftInfo.clockInEndTime
      )
      const clockOutRange = this.formatShiftTimeRange(
        this.shiftInfo.clockOutStartTime,
        this.shiftInfo.clockOutEndTime
      )
      return `班次 ${formatDate(this.shiftInfo.startTime, 'HH:mm')}-${formatDate(
        this.shiftInfo.endTime,
        'HH:mm'
      )}；上班可打卡 ${clockInRange}；下班可打卡 ${clockOutRange}`
    }
  },
  methods: {
    defaultFormData() {
      return {
        id: undefined,
        employeeId: undefined,
        type: HrmAttendanceClockType.ON_DUTY,
        attendanceTime: new Date(),
        clockTime: undefined,
        remark: ''
      }
    },
    async open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增' : '修改'
      this.formType = type
      this.resetForm()
      if (id) {
        this.formLoading = true
        try {
          const response = await getAttendanceClock(id)
          this.formData = response.data
          await this.loadShift()
        } finally {
          this.formLoading = false
        }
      }
    },
    async submitForm() {
      if (!this.$refs.form) return
      await this.$refs.form.validate()
      if (!this.shiftInfo) {
        this.$modal.msgWarning('该员工当天未配置有效班次，不能补录打卡')
        return
      }
      this.formLoading = true
      try {
        const attendanceTime =
          this.formData.type === HrmAttendanceClockType.ON_DUTY
            ? this.shiftInfo.startTime
            : this.shiftInfo.endTime
        const beginClockTime =
          this.formData.type === HrmAttendanceClockType.ON_DUTY
            ? this.shiftInfo.clockInStartTime
            : this.shiftInfo.clockOutStartTime
        const endClockTime =
          this.formData.type === HrmAttendanceClockType.ON_DUTY
            ? this.shiftInfo.clockInEndTime
            : this.shiftInfo.clockOutEndTime
        const clockTime = this.buildClockTime(beginClockTime, endClockTime)
        if (!clockTime) {
          this.$modal.msgWarning(
            `打卡时间需在 ${this.formatShiftTimeRange(beginClockTime, endClockTime)} 内`
          )
          return
        }
        this.formData.attendanceTime = new Date(attendanceTime).getTime()
        this.formData.clockTime = clockTime.getTime()
        if (this.formType === 'create') {
          await createAttendanceClock(this.formData)
          this.$modal.msgSuccess('新增成功')
        } else {
          await updateAttendanceClock(this.formData)
          this.$modal.msgSuccess('修改成功')
        }
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.formData = this.defaultFormData()
      this.shiftInfo = undefined
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.resetFields()
        }
      })
    },
    handleShiftConditionChange() {
      this.$nextTick(() => this.loadShift(true))
    },
    async loadShift(applyDefaultTime = false) {
      this.shiftInfo = undefined
      if (!this.formData.employeeId || !this.formData.attendanceTime) {
        return
      }
      this.shiftLoading = true
      try {
        const response = await getAttendanceClockShift({
          employeeId: this.formData.employeeId,
          attendanceTime: formatDate(this.formData.attendanceTime, 'YYYY-MM-DD HH:mm:ss')
        })
        this.shiftInfo = response.data
        if (applyDefaultTime) {
          this.applyShiftDefaultTime()
        }
      } finally {
        this.shiftLoading = false
      }
    },
    applyShiftDefaultTime() {
      if (!this.shiftInfo) {
        this.formData.clockTime = undefined
        return
      }
      this.formData.clockTime =
        this.formData.type === HrmAttendanceClockType.ON_DUTY
          ? this.shiftInfo.startTime
          : this.shiftInfo.endTime
    },
    buildClockTime(beginTime, endTime) {
      const attendanceDate = new Date(this.formData.attendanceTime)
      const selectedTime = new Date(this.formData.clockTime)
      let clockTime = new Date(
        attendanceDate.getFullYear(),
        attendanceDate.getMonth(),
        attendanceDate.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes(),
        selectedTime.getSeconds()
      )
      const begin = new Date(beginTime)
      const end = new Date(endTime)
      const nextDayClockTime = new Date(clockTime.getTime() + 24 * 60 * 60 * 1000)
      if (clockTime < begin && nextDayClockTime <= end) {
        clockTime = nextDayClockTime
      }
      return clockTime < begin || clockTime > end ? undefined : clockTime
    },
    formatShiftTimeRange(beginTime, endTime) {
      return `${formatDate(beginTime, 'MM-DD HH:mm')} 至 ${formatDate(endTime, 'MM-DD HH:mm')}`
    }
  }
}
</script>

<style scoped>
.form-control {
  width: 100%;
}

.shift-alert {
  margin-bottom: 18px;
}
</style>
