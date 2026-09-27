<template>
  <el-drawer
    :visible.sync="drawerVisible"
    title="群详情"
    size="900px"
    destroy-on-close
    append-to-body
  >
    <div class="drawer-content">
      <el-descriptions
        :column="2"
        border
      >
        <el-descriptions-item label="群编号">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="群名称">{{ detail.name }}</el-descriptions-item>
        <el-descriptions-item label="头像">
          <el-avatar
            :src="detail.avatar"
            :size="36"
          >{{ firstCharacter(detail.name) }}</el-avatar>
        </el-descriptions-item>
        <el-descriptions-item label="群主">{{ detail.ownerNickname || '-' }} ({{ detail.ownerUserId }})</el-descriptions-item>
        <el-descriptions-item label="成员数">{{ detail.memberCount == null ? 0 : detail.memberCount }}</el-descriptions-item>
        <el-descriptions-item label="群状态"><dict-tag
          :type="DICT_TYPE.IM_GROUP_STATUS"
          :value="detail.status"
        /></el-descriptions-item>
        <el-descriptions-item label="封禁状态">
          <dict-tag
            :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
            :value="detail.banned"
          />
          <span
            v-if="detail.banned"
            class="secondary-text"
          >{{ detail.bannedReason }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="全群禁言"><el-tag
          v-if="detail.mutedAll"
          type="danger"
        >已禁言</el-tag><el-tag
          v-else
          type="info"
        >未禁言</el-tag></el-descriptions-item>
        <el-descriptions-item
          label="群公告"
          :span="2"
        >{{ detail.notice || '-' }}</el-descriptions-item>
        <el-descriptions-item
          label="创建时间"
          :span="2"
        >{{ formatDate(detail.createTime) }}</el-descriptions-item>
      </el-descriptions>

      <div class="member-header"><span>群成员</span><el-checkbox v-model="activeOnly">仅展示当前群内的成员</el-checkbox></div>
      <el-table
        v-loading="loading"
        :data="filteredMembers"
        border
      >
        <el-table-column
          label="头像"
          width="80"
          align="center"
        >
          <template #default="scope"><el-avatar
            :src="scope.row.avatar"
            :size="40"
          >{{ firstCharacter(scope.row.nickname) }}</el-avatar></template>
        </el-table-column>
        <el-table-column
          label="用户编号"
          prop="userId"
          width="100"
          align="center"
        />
        <el-table-column
          label="角色"
          prop="role"
          width="100"
          align="center"
        >
          <template #default="scope"><dict-tag
            :type="DICT_TYPE.IM_GROUP_MEMBER_ROLE"
            :value="scope.row.role"
          /></template>
        </el-table-column>
        <el-table-column
          label="昵称"
          prop="nickname"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          label="组内显示名"
          prop="displayUserName"
          min-width="120"
          show-overflow-tooltip
        >
          <template #default="scope">{{ scope.row.displayUserName || '-' }}</template>
        </el-table-column>
        <el-table-column
          label="群备注"
          prop="groupRemark"
          min-width="120"
          show-overflow-tooltip
        >
          <template #default="scope">{{ scope.row.groupRemark || '-' }}</template>
        </el-table-column>
        <el-table-column
          label="免打扰"
          prop="silent"
          width="80"
          align="center"
        >
          <template #default="scope"><dict-tag
            :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
            :value="scope.row.silent"
          /></template>
        </el-table-column>
        <el-table-column
          label="状态"
          prop="status"
          width="100"
          align="center"
        >
          <template #default="scope"><dict-tag
            :type="DICT_TYPE.COMMON_STATUS"
            :value="scope.row.status"
          /></template>
        </el-table-column>
        <el-table-column
          label="入群时间"
          prop="joinTime"
          width="170"
          align="center"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="退群时间"
          prop="quitTime"
          width="170"
          align="center"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="禁言状态"
          width="170"
          align="center"
        >
          <template #default="scope">
            <template v-if="isMuted(scope.row)"><el-tag type="danger">禁言中</el-tag><div class="mute-time">{{ formatDate(scope.row.muteEndTime) }}</div></template>
            <span
              v-else
              class="secondary-text"
            >-</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-drawer>
</template>

<script>
import { dateFormatter } from '@/utils'
import { formatDate } from '@/utils/formatTime'
import { DICT_TYPE } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { getManagerGroupMemberList } from '@/api/im/manager/group'

export default {
  name: 'ImGroupDetail',
  data() {
    return { DICT_TYPE, drawerVisible: false, detail: {}, loading: false, memberList: [], activeOnly: true }
  },
  computed: {
    filteredMembers() {
      return this.activeOnly ? this.memberList.filter(member => member.status === CommonStatusEnum.ENABLE) : this.memberList
    }
  },
  methods: {
    dateFormatter,
    formatDate,
    firstCharacter(value) {
      return value ? value.charAt(0) : '?'
    },
    isMuted(row) {
      return row.muteEndTime && new Date(row.muteEndTime) > new Date()
    },
    async open(row) {
      this.detail = row
      this.drawerVisible = true
      this.activeOnly = true
      this.loading = true
      try {
        const response = await getManagerGroupMemberList(row.id)
        this.memberList = response.data
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.drawer-content { padding: 0 20px 20px; }
.member-header { display: flex; align-items: center; justify-content: space-between; margin: 20px 0 15px; font-weight: bold; }
.secondary-text { margin-left: 5px; color: #909399; }
.mute-time { margin-top: 2px; color: #909399; font-size: 12px; }
</style>
