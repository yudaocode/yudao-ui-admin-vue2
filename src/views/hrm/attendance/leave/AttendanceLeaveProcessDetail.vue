<template>
  <div
    v-loading="loading"
    class="leave-process-detail"
  >
    <div class="form-title">员工请假申请</div>
    <el-descriptions
      v-if="leave"
      :column="2"
      border
    >
      <el-descriptions-item label="员工姓名">{{ leave.employeeName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="请假类型">
        <dict-tag
          :type="DICT_TYPE.HRM_ATTENDANCE_LEAVE_TYPE"
          :value="leave.type"
        />
      </el-descriptions-item>
      <el-descriptions-item label="开始时间">
        {{ formatDateTime(leave.startTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="结束时间">
        {{ formatDateTime(leave.endTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="请假天数">{{ leave.day }} 天</el-descriptions-item>
      <el-descriptions-item label="审批状态">
        <dict-tag
          v-if="leave.approvalStatus !== undefined"
          :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS"
          :value="leave.approvalStatus"
        />
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item
        label="请假事由"
        :span="2"
      >
        {{ leave.reason || '-' }}
      </el-descriptions-item>
      <el-descriptions-item
        label="备注"
        :span="2"
      >
        {{ leave.remark || '-' }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
import { getAttendanceLeave } from '@/api/hrm/attendance/leave'
import { DICT_TYPE } from '@/utils/dict'
import { formatHrmDateTime } from '@/views/hrm/utils/format'

export default {
  name: 'HrmAttendanceLeaveProcessDetail',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      leave: undefined
    }
  },
  watch: {
    id: {
      immediate: true,
      handler() {
        this.getLeave()
      }
    }
  },
  methods: {
    formatDateTime: formatHrmDateTime,
    async getLeave() {
      const id = Number(this.id)
      if (!id) {
        return
      }
      this.loading = true
      try {
        const response = await getAttendanceLeave(id)
        this.leave = response.data
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.leave-process-detail {
  min-height: 220px;
  padding: 4px 0 20px;
}

.form-title {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
}
</style>
