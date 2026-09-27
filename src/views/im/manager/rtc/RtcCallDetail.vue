<template>
  <el-drawer
    :visible.sync="drawerVisible"
    title="通话记录详情"
    size="900px"
    destroy-on-close
    append-to-body
  >
    <div class="drawer-content">
      <el-descriptions
        :column="2"
        border
      >
        <el-descriptions-item label="编号">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="业务通话编号">{{ detail.room }}</el-descriptions-item>
        <el-descriptions-item label="发起人">{{ detail.inviterNickname || '-' }} ({{ detail.inviterUserId }})</el-descriptions-item>
        <el-descriptions-item label="会话类型"><dict-tag
          :type="DICT_TYPE.IM_RTC_CALL_CONVERSATION_TYPE"
          :value="detail.conversationType"
        /></el-descriptions-item>
        <el-descriptions-item label="群"><span v-if="detail.groupId">{{ detail.groupName || '-' }} ({{ detail.groupId }})</span><span v-else>-</span></el-descriptions-item>
        <el-descriptions-item label="媒体类型"><dict-tag
          :type="DICT_TYPE.IM_RTC_CALL_MEDIA_TYPE"
          :value="detail.mediaType"
        /></el-descriptions-item>
        <el-descriptions-item label="通话状态"><dict-tag
          :type="DICT_TYPE.IM_RTC_CALL_STATUS"
          :value="detail.status"
        /></el-descriptions-item>
        <el-descriptions-item label="结束原因"><dict-tag
          v-if="detail.endReason"
          :type="DICT_TYPE.IM_RTC_CALL_END_REASON"
          :value="detail.endReason"
        /><span v-else>-</span></el-descriptions-item>
        <el-descriptions-item label="发起时间">{{ formatDate(detail.startTime) }}</el-descriptions-item>
        <el-descriptions-item label="接通时间">{{ detail.acceptTime ? formatDate(detail.acceptTime) : '-' }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ detail.endTime ? formatDate(detail.endTime) : '-' }}</el-descriptions-item>
        <el-descriptions-item label="通话时长">{{ duration }}</el-descriptions-item>
      </el-descriptions>

      <div class="section-title">参与者列表</div>
      <el-table
        v-loading="loading"
        :data="participants"
        border
      >
        <el-table-column
          label="用户编号"
          prop="userId"
          width="120"
          align="center"
        />
        <el-table-column
          label="昵称"
          prop="userNickname"
          min-width="160"
          show-overflow-tooltip
        ><template #default="scope">{{ scope.row.userNickname || '-' }}</template></el-table-column>
        <el-table-column
          label="参与角色"
          prop="role"
          width="120"
          align="center"
        ><template #default="scope"><dict-tag
          :type="DICT_TYPE.IM_RTC_PARTICIPANT_ROLE"
          :value="scope.row.role"
        /></template></el-table-column>
        <el-table-column
          label="参与状态"
          prop="status"
          width="120"
          align="center"
        ><template #default="scope"><dict-tag
          :type="DICT_TYPE.IM_RTC_PARTICIPANT_STATUS"
          :value="scope.row.status"
        /></template></el-table-column>
        <el-table-column
          label="被邀请时间"
          prop="inviteTime"
          width="170"
          align="center"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="接听时间"
          prop="acceptTime"
          width="170"
          align="center"
        ><template #default="scope">{{ scope.row.acceptTime ? formatDate(scope.row.acceptTime) : '-' }}</template></el-table-column>
        <el-table-column
          label="离开时间"
          prop="leaveTime"
          width="170"
          align="center"
        ><template #default="scope">{{ scope.row.leaveTime ? formatDate(scope.row.leaveTime) : '-' }}</template></el-table-column>
      </el-table>
    </div>
  </el-drawer>
</template>

<script>
import { dateFormatter } from '@/utils'
import { formatDate } from '@/utils/formatTime'
import { DICT_TYPE } from '@/utils/dict'
import { getManagerRtcCallParticipantList } from '@/api/im/manager/rtc'

function formatCallDuration(seconds) {
  const total = Math.max(0, Math.floor(seconds || 0))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const rest = total % 60
  const pad = value => String(value).padStart(2, '0')
  return hours > 0 ? hours + ':' + pad(minutes) + ':' + pad(rest) : pad(minutes) + ':' + pad(rest)
}

function resolveCallDuration(acceptTime, endTime) {
  if (!acceptTime || !endTime) return '-'
  const seconds = Math.floor((new Date(endTime).getTime() - new Date(acceptTime).getTime()) / 1000)
  return seconds > 0 ? formatCallDuration(seconds) : '-'
}

export default {
  name: 'ImRtcCallDetail',
  data() {
    return { DICT_TYPE, drawerVisible: false, detail: {}, loading: false, participants: [] }
  },
  computed: {
    duration() {
      return resolveCallDuration(this.detail.acceptTime, this.detail.endTime)
    }
  },
  methods: {
    dateFormatter,
    formatDate,
    async open(row) {
      this.detail = row
      this.drawerVisible = true
      this.loading = true
      try {
        const response = await getManagerRtcCallParticipantList(row.id)
        this.participants = response.data
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.drawer-content { padding: 0 20px 20px; }
.section-title { margin: 20px 0 15px; font-weight: bold; }
</style>
