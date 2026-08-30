<template>
  <div class="process-timeline">
    <el-timeline v-if="activityNodes && activityNodes.length">
      <el-timeline-item
        v-for="(node, index) in activityNodes"
        :key="node.id || node.name || index"
        :timestamp="formatNodeTime(node)"
        placement="top"
        :color="getApprovalNodeColor(node.status)"
      >
        <template slot="dot">
          <span
            class="timeline-status-dot"
            :style="{ backgroundColor: getApprovalNodeColor(node.status) }"
            :aria-label="showStatusIcon ? getStatusIconLabel(node.status) : '流程节点'"
          >
            <i v-if="showStatusIcon" :class="getStatusIconClass(node.status)" />
          </span>
        </template>
        <div class="timeline-title">
          <span>{{ node.name }}<span v-if="node.status === TaskStatusEnum.SKIP">【跳过】</span></span>
          <dict-tag v-if="node.status !== undefined" :type="DICT_TYPE.BPM_TASK_STATUS" :value="node.status" />
        </div>

        <el-button
          v-if="node.nodeType === NodeType.CHILD_PROCESS_NODE"
          type="primary"
          plain
          size="mini"
          :disabled="!node.processInstanceId"
          @click="handleChildProcess(node)"
        >
          查看子流程
        </el-button>

        <div v-if="shouldSelectUser(node)" class="timeline-users">
          <el-tooltip content="添加用户" placement="left">
            <el-button
              class="timeline-add-user"
              size="mini"
              icon="el-icon-plus"
              circle
              @click="handleSelectUser(node)"
            />
          </el-tooltip>
          <span
            v-for="user in customApproveUsers[node.id]"
            :key="user.id || user.nickname || user.name"
            class="timeline-user"
          >
            <el-avatar v-if="user.avatar" :src="user.avatar" :size="28" />
            <el-avatar v-else :size="28">{{ userInitial(user) }}</el-avatar>
            <span>{{ userName(user) }}</span>
          </span>
        </div>

        <div v-else class="timeline-users">
          <template v-if="node.tasks && node.tasks.length">
            <div v-for="task in node.tasks" :key="task.id" class="timeline-task">
              <span v-if="task.assigneeUser || task.ownerUser" class="timeline-user">
                <el-avatar
                  v-if="(task.assigneeUser || task.ownerUser).avatar"
                  :src="(task.assigneeUser || task.ownerUser).avatar"
                  :size="28"
                />
                <el-avatar v-else :size="28">{{ userInitial(task.assigneeUser || task.ownerUser) }}</el-avatar>
                <span>{{ userName(task.assigneeUser || task.ownerUser) }}</span>
              </span>
              <dict-tag v-if="task.status !== undefined" :type="DICT_TYPE.BPM_TASK_STATUS" :value="task.status" />
              <ProcessTaskEvidence
                v-if="shouldShowReasonAndAttachment(task, node, index)"
                :reason="task.reason"
                :reason-label="getReasonLabel(node)"
                :attachments="getAttachmentList(task)"
                :sign-pic-url="task.signPicUrl"
              />
            </div>
          </template>
          <template v-else-if="node.candidateUsers && node.candidateUsers.length">
            <span
              v-for="user in node.candidateUsers"
              :key="user.id || user.nickname || user.name"
              class="timeline-user"
            >
              <el-avatar v-if="user.avatar" :src="user.avatar" :size="28" />
              <el-avatar v-else :size="28">{{ userInitial(user) }}</el-avatar>
              <span>{{ userName(user) }}</span>
            </span>
          </template>
          <span v-else class="timeline-empty">系统自动计算</span>
        </div>

      </el-timeline-item>
    </el-timeline>
    <el-empty v-else description="暂无审批记录" />

    <UserSelectForm ref="userSelectForm" @confirm="handleUserSelectConfirm" />
  </div>
</template>

<script>
import { TaskStatusEnum } from '@/api/bpm/task'
import { CandidateStrategy, NodeType } from '@/components/SimpleProcessDesignerV2/src/consts'
import { isEmpty } from '@/utils/is'
import UserSelectForm from '@/components/UserSelectForm'
import ProcessTaskEvidence from './ProcessTaskEvidence.vue'

export default {
  name: 'ProcessInstanceTimeline',
  components: {
    ProcessTaskEvidence,
    UserSelectForm
  },
  props: {
    activityNodes: {
      type: Array,
      default: () => []
    },
    showStatusIcon: {
      type: Boolean,
      default: true
    },
    enableApproveUserSelect: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      TaskStatusEnum,
      CandidateStrategy,
      NodeType,
      customApproveUsers: {}
    }
  },
  methods: {
    userName(user) {
      return user ? (user.nickname || user.name || user.username || user.id) : '系统'
    },
    userInitial(user) {
      return String(this.userName(user)).slice(0, 1)
    },
    formatNodeTime(node) {
      const start = node.startTime ? this.parseTime(node.startTime) : ''
      const end = node.endTime ? this.parseTime(node.endTime) : ''
      return [start, end].filter(Boolean).join(' ~ ')
    },
    getApprovalNodeColor(status) {
      const map = {
        '-2': '#909399',
        '-1': '#909399',
        0: '#00b32a',
        1: '#448ef7',
        2: '#00b32a',
        3: '#f56c6c',
        4: '#c0c4cc',
        5: '#f56c6c',
        6: '#448ef7',
        7: '#00b32a'
      }
      return map[status] || '#409eff'
    },
    getStatusIconClass(status) {
      const map = {
        '-2': 'el-icon-arrow-down',
        '-1': 'el-icon-time',
        0: 'el-icon-time',
        1: 'el-icon-loading',
        2: 'el-icon-success',
        3: 'el-icon-error',
        4: 'el-icon-delete',
        5: 'el-icon-error',
        6: 'el-icon-loading',
        7: 'el-icon-success'
      }
      return map[status] || 'el-icon-more'
    },
    getStatusIconLabel(status) {
      const map = {
        '-2': '已跳过',
        '-1': '未开始',
        0: '待审批',
        1: '审批中',
        2: '审批通过',
        3: '审批不通过',
        4: '已取消',
        5: '已退回',
        6: '委派中',
        7: '审批通过中'
      }
      return map[status] || '流程节点状态'
    },
    shouldSelectUser(node) {
      return isEmpty(node.tasks) &&
        (
          (CandidateStrategy.START_USER_SELECT === node.candidateStrategy && isEmpty(node.candidateUsers)) ||
          // APPROVE_USER_SELECT can return candidateUsers from the preview;
          // those users are still editable and must not hide the selector.
          (this.enableApproveUserSelect && CandidateStrategy.APPROVE_USER_SELECT === node.candidateStrategy)
        )
    },
    shouldShowReasonAndAttachment(task, node, nodeIndex) {
      if (!task || !node) {
        return false
      }
      if (node.nodeType === NodeType.START_USER_NODE && nodeIndex === 0) {
        return false
      }
      return this.hasTaskEvidence(task) &&
        [NodeType.START_USER_NODE, NodeType.TRANSACTOR_NODE, NodeType.USER_TASK_NODE].includes(node.nodeType)
    },
    hasTaskEvidence(task) {
      return !!(task && (task.reason || this.getAttachmentList(task).length > 0 || task.signPicUrl))
    },
    getReasonLabel(node) {
      return node && node.nodeType === NodeType.TRANSACTOR_NODE ? '办理意见' : '审批意见'
    },
    getAttachmentList(task) {
      const attachments = task && task.attachments
      if (!attachments) return []
      if (Array.isArray(attachments)) return attachments
      return String(attachments).split(',').map((item) => item.trim()).filter(Boolean)
    },
    handleSelectUser(node) {
      if (!node || !node.id) {
        return
      }
      this.$refs.userSelectForm.open(node.id, this.customApproveUsers[node.id] || [])
    },
    handleUserSelectConfirm(activityId, userList) {
      this.$set(this.customApproveUsers, activityId, userList || [])
      this.$emit('select-user-confirm', activityId, userList || [])
    },
    setCustomApproveUsers(activityId, users) {
      this.$set(this.customApproveUsers, activityId, users || [])
    },
    batchSetCustomApproveUsers(data) {
      const nextData = data || {}
      Object.keys(nextData).forEach((activityId) => {
        this.setCustomApproveUsers(activityId, nextData[activityId])
      })
    },
    resetCustomApproveUsers() {
      this.customApproveUsers = {}
    },
    handleChildProcess(node) {
      if (!node.processInstanceId) {
        return
      }
      this.$router.push({
        name: 'BpmProcessInstanceDetail',
        query: {
          id: node.processInstanceId
        }
      })
    }
  }
}
</script>

<style scoped>
.process-timeline {
  padding-top: 18px;
}

.timeline-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.timeline-status-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
  border-radius: 50%;
  color: #fff;
  box-shadow: 0 0 0 1px #dcdfe6;
  font-size: 10px;
}

.timeline-users {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-height: 34px;
  margin-top: 8px;
}

.timeline-task {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  color: #606266;
}

.timeline-user {
  display: inline-flex;
  align-items: center;
  height: 34px;
  padding-right: 10px;
  color: #606266;
  background: #f4f5f7;
  border-radius: 17px;
}

.timeline-user .el-avatar {
  margin: 3px 6px 3px 3px;
}

.timeline-add-user {
  width: 32px;
  height: 32px;
  padding: 0;
}

.timeline-empty {
  color: #909399;
}

</style>
