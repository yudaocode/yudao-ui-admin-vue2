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
              <span v-if="task.reason" class="timeline-reason">审批意见：{{ task.reason }}</span>
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

        <div v-if="showStatusIcon && node.tasks && node.tasks.length" class="timeline-task-extra">
          <div v-for="task in node.tasks" :key="task.id + '-extra'">
            <div v-if="task.signPicUrl" class="timeline-reason">
              签名：
              <el-image
                class="timeline-sign"
                :src="task.signPicUrl"
                :preview-src-list="[task.signPicUrl]"
              />
            </div>
          </div>
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

export default {
  name: 'ProcessInstanceTimeline',
  components: {
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
    shouldSelectUser(node) {
      return isEmpty(node.tasks) &&
        (
          (CandidateStrategy.START_USER_SELECT === node.candidateStrategy && isEmpty(node.candidateUsers)) ||
          (this.enableApproveUserSelect && CandidateStrategy.APPROVE_USER_SELECT === node.candidateStrategy)
        )
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

.timeline-reason {
  width: 100%;
  color: #909399;
}

.timeline-task-extra {
  margin-top: 6px;
}

.timeline-sign {
  width: 90px;
  height: 40px;
  margin-left: 5px;
  vertical-align: middle;
}
</style>
