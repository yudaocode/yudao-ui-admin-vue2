<template>
  <div>
    <div class="leave-title">我的请假申请</div>
    <el-table
      v-loading="loading"
      :data="list"
      :show-overflow-tooltip="true"
      stripe
    >
      <el-table-column
        label="请假类型"
        align="center"
        width="110"
      >
        <template slot-scope="scope">
          <dict-tag
            :type="DICT_TYPE.HRM_ATTENDANCE_LEAVE_TYPE"
            :value="scope.row.type"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="开始时间"
        align="center"
        width="170"
      >
        <template slot-scope="scope">{{ formatDate(scope.row.startTime) }}</template>
      </el-table-column>
      <el-table-column
        label="结束时间"
        align="center"
        width="170"
      >
        <template slot-scope="scope">{{ formatDate(scope.row.endTime) }}</template>
      </el-table-column>
      <el-table-column
        label="请假天数"
        align="center"
        prop="day"
        width="100"
      >
        <template slot-scope="scope">{{ scope.row.day }} 天</template>
      </el-table-column>
      <el-table-column
        label="请假事由"
        align="center"
        prop="reason"
        min-width="160"
      />
      <el-table-column
        label="审批状态"
        align="center"
        width="110"
      >
        <template slot-scope="scope">
          <dict-tag
            :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS"
            :value="scope.row.approvalStatus"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="150"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.processInstanceId"
            type="text"
            @click="openProcessDetail(scope.row.processInstanceId)"
          >审批进度</el-button>
          <el-button
            v-if="scope.row.approvalStatus === RUNNING_STATUS"
            v-hasPermi="['hrm:portal:attendance:leave']"
            type="text"
            class="text-danger"
            @click="handleCancel(scope.row.id)"
          >取消</el-button>
        </template>
      </el-table-column>
    </el-table>
    <AttendanceLeaveForm
      ref="formRef"
      @success="getList"
    />
  </div>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { cancelMyAttendanceLeave, getMyAttendanceLeaveList } from '@/api/hrm/portal/attendance/leave'
import AttendanceLeaveForm from '../leave/AttendanceLeaveForm.vue'

export default {
  name: 'HrmPortalAttendanceLeaveList',
  components: { AttendanceLeaveForm },
  data() {
    return { DICT_TYPE, RUNNING_STATUS: 1, loading: false, list: [] }
  },
  methods: {
    formatDate,
    async getList() {
      this.loading = true
      try {
        const response = await getMyAttendanceLeaveList()
        this.list = response.data
      } finally {
        this.loading = false
      }
    },
    refresh() {
      return this.getList()
    },
    openCreate() {
      this.$refs.formRef.open()
    },
    async handleCancel(id) {
      if (!id) return
      try {
        const result = await this.$prompt('请输入取消原因', '取消请假申请')
        if (!result.value.trim()) {
          this.$modal.msgWarning('请输入取消原因')
          return
        }
        await cancelMyAttendanceLeave(id, result.value)
        this.$modal.msgSuccess('请假申请已取消')
        await this.getList()
        this.$emit('changed')
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') throw error
      }
    },
    openProcessDetail(processInstanceId) {
      if (!processInstanceId) return
      this.$router.push({ name: 'BpmProcessInstanceDetail', query: { id: processInstanceId }})
    }
  }
}
</script>

<style scoped>
.leave-title { margin: 24px 0 12px; color: #303133; font-size: 15px; font-weight: 600; }
.text-danger { color: #f56c6c; }
</style>
