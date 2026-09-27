<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="760px" append-to-body>
    <el-form ref="form" :model="formData" :rules="formRules" label-position="top">
      <el-form-item label="工作日" prop="weeks">
        <el-checkbox-group v-model="formData.weeks">
          <el-checkbox v-for="item in weekOptions" :key="item.value" :label="item.value">
            {{ item.label }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-alert
        class="form-alert"
        :closable="false"
        type="info"
        show-icon
        title="打卡窗口需覆盖对应的上下班时间；结束时间早于开始时间时按次日计算，例如 18:00 至次日 04:59。"
      />
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="上班时间" prop="startTime">
            <el-time-picker
              v-model="formData.startTime"
              class="form-control"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="请选择上班时间"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="下班时间" prop="endTime">
            <el-time-picker
              v-model="formData.endTime"
              class="form-control"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="请选择下班时间"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="上班打卡时间段" prop="clockInTimeRange">
        <el-time-picker
          v-model="clockInTimeRange"
          is-range
          class="form-control"
          format="HH:mm"
          value-format="HH:mm"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item>
      <el-form-item label="下班打卡时间段" prop="clockOutTimeRange">
        <el-time-picker
          v-model="clockOutTimeRange"
          is-range
          class="form-control"
          format="HH:mm"
          value-format="HH:mm"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item>
      <el-form-item label="休息时间" prop="restTimeRange">
        <div class="time-range-row">
          <el-time-picker
            v-model="restTimeRange"
            is-range
            class="time-range-picker"
            format="HH:mm"
            value-format="HH:mm"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
          <el-checkbox v-model="formData.excludeRestTime">不计入工作时长</el-checkbox>
        </div>
      </el-form-item>
      <el-form-item label="合计工作时长">
        <span>{{ formatShiftDuration(formData) }}</span>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { HRM_WEEK_OPTIONS } from '@/views/hrm/utils/constants'
import { formatHrmAttendanceShiftDuration } from '@/views/hrm/utils/format'

export default {
  name: 'HrmAttendanceGroupShiftForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formData: this.createDefaultShift(),
      formRules: {
        weeks: [{ required: true, message: '工作日不能为空', trigger: 'change' }],
        startTime: [{ required: true, message: '上班时间不能为空', trigger: 'change' }],
        endTime: [{ required: true, message: '下班时间不能为空', trigger: 'change' }],
        clockInTimeRange: [
          {
            validator: (_, __, callback) =>
              callback(
                this.clockInTimeRange && this.clockInTimeRange[0] && this.clockInTimeRange[1]
                  ? undefined
                  : new Error('上班打卡时间段不能为空')
              ),
            trigger: 'change'
          }
        ],
        clockOutTimeRange: [
          {
            validator: (_, __, callback) =>
              callback(
                this.clockOutTimeRange && this.clockOutTimeRange[0] && this.clockOutTimeRange[1]
                  ? undefined
                  : new Error('下班打卡时间段不能为空')
              ),
            trigger: 'change'
          }
        ],
        restTimeRange: [
          {
            validator: (_, __, callback) =>
              callback(
                this.restTimeRange && this.restTimeRange[0] && this.restTimeRange[1]
                  ? undefined
                  : new Error('休息时间不能为空')
              ),
            trigger: 'change'
          }
        ]
      }
    }
  },
  computed: {
    weekOptions() {
      return HRM_WEEK_OPTIONS
    },
    clockInTimeRange: {
      get() {
        return this.buildTimeRange(this.formData.clockInStartTime, this.formData.clockInEndTime)
      },
      set(value) {
        this.formData.clockInStartTime = (value && value[0]) || ''
        this.formData.clockInEndTime = (value && value[1]) || ''
      }
    },
    clockOutTimeRange: {
      get() {
        return this.buildTimeRange(this.formData.clockOutStartTime, this.formData.clockOutEndTime)
      },
      set(value) {
        this.formData.clockOutStartTime = (value && value[0]) || ''
        this.formData.clockOutEndTime = (value && value[1]) || ''
      }
    },
    restTimeRange: {
      get() {
        return this.buildTimeRange(this.formData.restStartTime, this.formData.restEndTime)
      },
      set(value) {
        this.formData.restStartTime = (value && value[0]) || ''
        this.formData.restEndTime = (value && value[1]) || ''
      }
    }
  },
  methods: {
    formatShiftDuration: formatHrmAttendanceShiftDuration,
    /** 打开弹窗 */
    open(shift) {
      this.dialogVisible = true
      this.dialogTitle = shift ? '编辑班次' : '新增班次'
      this.resetForm()
      if (shift) {
        this.formData = { ...shift, weeks: [...shift.weeks] }
      }
    },
    /** 提交表单 */
    async submitForm() {
      await this.$refs.form.validate()
      this.$emit('confirm', {
        ...this.formData,
        weeks: [...this.formData.weeks].sort()
      })
      this.dialogVisible = false
    },
    /** 构造时间范围 */
    buildTimeRange(startTime, endTime) {
      return startTime && endTime ? [startTime, endTime] : undefined
    },
    /** 重置表单 */
    resetForm() {
      this.formData = this.createDefaultShift()
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },
    /** 创建默认班次 */
    createDefaultShift() {
      return {
        weeks: [1, 2, 3, 4, 5],
        startTime: '09:00',
        endTime: '18:00',
        clockInStartTime: '05:00',
        clockInEndTime: '17:59',
        clockOutStartTime: '09:01',
        clockOutEndTime: '04:59',
        restStartTime: '12:00',
        restEndTime: '13:00',
        excludeRestTime: false
      }
    }
  }
}
</script>

<style scoped>
.form-alert {
  margin-bottom: 16px;
}

.form-control,
.time-range-row {
  width: 100%;
}

.time-range-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.time-range-picker {
  flex: 1;
}
</style>
