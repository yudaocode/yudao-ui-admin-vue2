<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card shadow="never">
          <div slot="header">申请信息</div>
          <el-form
            ref="form"
            v-loading="formLoading"
            :model="form"
            :rules="rules"
            label-width="80px"
          >
            <el-form-item
              label="请假类型"
              prop="type"
            >
              <el-select
                v-model="form.type"
                clearable
                placeholder="请选择请假类型"
              >
                <el-option
                  v-for="dict in typeDictData"
                  :key="parseInt(dict.value)"
                  :label="dict.label"
                  :value="parseInt(dict.value)"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              label="开始时间"
              prop="startTime"
            >
              <el-date-picker
                v-model="form.startTime"
                clearable
                type="datetime"
                value-format="timestamp"
                placeholder="请选择开始时间"
              />
            </el-form-item>
            <el-form-item
              label="结束时间"
              prop="endTime"
            >
              <el-date-picker
                v-model="form.endTime"
                clearable
                type="datetime"
                value-format="timestamp"
                placeholder="请选择结束时间"
              />
            </el-form-item>
            <el-form-item
              label="原因"
              prop="reason"
            >
              <el-input
                v-model="form.reason"
                type="textarea"
                placeholder="请输入请假原因"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                :disabled="formLoading"
                @click="submitForm"
              >确 定</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <div slot="header">审批流程</div>
          <ProcessInstanceTimeline
            ref="timeline"
            :activity-nodes="activityNodes"
            :show-status-icon="false"
            @select-user-confirm="selectUserConfirm"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { createLeave, getLeave } from '@/api/bpm/leave'
import { getProcessDefinition } from '@/api/bpm/definition'
import { getApprovalDetail } from '@/api/bpm/processInstance'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { CandidateStrategy, NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'
import ProcessInstanceTimeline from '@/views/bpm/processInstance/detail/ProcessInstanceTimeline.vue'

export default {
  name: 'BpmOALeaveCreate',
  components: {
    ProcessInstanceTimeline
  },
  data() {
    return {
      formLoading: false,
      processDefinitionId: '',
      activityNodes: [],
      startUserSelectTasks: [],
      startUserSelectAssignees: {},
      // Keep the user's choices while approval nodes are re-evaluated after a
      // form field change. The approval-detail endpoint returns a fresh node
      // array on every request, so storing only the current array would lose
      // selections made in the timeline.
      tempStartUserSelectAssignees: {},
      tempStartUserSelectUsers: {},
      form: {
        startTime: undefined,
        endTime: undefined,
        type: undefined,
        reason: undefined
      },
      rules: {
        startTime: [{ required: true, message: '请假开始时间不能为空', trigger: 'change' }],
        endTime: [{ required: true, message: '请假结束时间不能为空', trigger: 'change' }],
        type: [{ required: true, message: '请假类型不能为空', trigger: 'blur' }],
        reason: [{ required: true, message: '请假原因不能为空', trigger: 'change' }]
      },
      typeDictData: getDictDatas(DICT_TYPE.BPM_OA_LEAVE_TYPE)
    }
  },
  watch: {
    form: {
      deep: true,
      handler() {
        if (this.processDefinitionId) {
          this.getApprovalDetail()
        }
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    async init() {
      const response = await getProcessDefinition(undefined, 'oa_leave')
      const definition = response.data
      if (!definition) {
        this.$message.error('OA 请假的流程模型未配置，请检查！')
        return
      }
      this.processDefinitionId = definition.id
      this.startUserSelectTasks = definition.startUserSelectTasks
      if (this.$route.query.id) {
        await this.loadLeave(this.$route.query.id)
      }
      await this.getApprovalDetail()
    },
    async loadLeave(id) {
      this.formLoading = true
      try {
        const response = await getLeave(id)
        const data = response.data
        if (!data) {
          this.$message.error('重新发起请假失败，原因：请假数据不存在')
          return
        }
        this.form = {
          type: data.type,
          reason: data.reason,
          startTime: data.startTime,
          endTime: data.endTime
        }
      } finally {
        this.formLoading = false
      }
    },
    daysDifference() {
      return Math.floor(Math.abs(Number(this.form.endTime) - Number(this.form.startTime)) / (24 * 60 * 60 * 1000))
    },
    async getApprovalDetail() {
      // Preserve selected users before replacing the node list. This mirrors
      // the generic process-create page and prevents a date/reason edit from
      // silently clearing START_USER_SELECT choices.
      this.tempStartUserSelectAssignees = { ...this.startUserSelectAssignees }
      const timelineUsers = this.$refs.timeline && this.$refs.timeline.customApproveUsers
      if (timelineUsers) {
        this.tempStartUserSelectUsers = { ...timelineUsers }
      }
      const response = await getApprovalDetail({
        processDefinitionId: this.processDefinitionId,
        activityId: NodeId.START_USER_NODE_ID,
        processVariablesStr: JSON.stringify({ day: this.daysDifference() })
      })
      const data = response.data
      if (!data) {
        this.$message.error('查询不到审批详情信息！')
        return
      }
      this.activityNodes = data.activityNodes
      this.startUserSelectTasks = data.activityNodes?.filter((node) => CandidateStrategy.START_USER_SELECT === node.candidateStrategy)
      const nextAssignees = {}
      ;(this.startUserSelectTasks || []).forEach((node) => {
        const previous = this.tempStartUserSelectAssignees[node.id]
        nextAssignees[node.id] = Array.isArray(previous) ? previous : []
      })
      this.startUserSelectAssignees = nextAssignees
      // Rehydrate the timeline's visual chips from the retained ids. The
      // Vue2 timeline needs complete user objects in addition to API ids.
      this.$nextTick(() => {
        const usersByActivity = {}
        ;(this.startUserSelectTasks || []).forEach((node) => {
          const selectedIds = this.startUserSelectAssignees[node.id] || []
          const usersFromNode = (node.candidateUsers || []).filter((user) => {
            return selectedIds.map(String).includes(String(user.id))
          })
          usersByActivity[node.id] = usersFromNode.length > 0
            ? usersFromNode
            : (this.tempStartUserSelectUsers[node.id] || []).filter((user) => {
              return selectedIds.map(String).includes(String(user.id))
            })
        })
        if (this.$refs.timeline && this.$refs.timeline.batchSetCustomApproveUsers) {
          this.$refs.timeline.batchSetCustomApproveUsers(usersByActivity)
        }
      })
    },
    /** Receive the complete user objects selected in the timeline. */
    selectUserConfirm(activityId, userList) {
      this.$set(this.startUserSelectAssignees, activityId, (userList || []).map((user) => user.id))
      this.$set(this.tempStartUserSelectUsers, activityId, userList || [])
    },
    /** The backend requires at least one assignee for each start-user-select node. */
    validateStartUserSelectAssignees() {
      if (this.startUserSelectTasks?.length > 0) {
        for (const task of this.startUserSelectTasks) {
          const assignees = this.startUserSelectAssignees[task.id]
          if (Array.isArray(assignees) && assignees.length === 0) {
            this.$message.warning(`请选择${task.name}的审批人`)
            return false
          }
        }
      }
      return true
    },
    submitForm() {
      if (this.formLoading) {
        return
      }
      this.$refs.form.validate(async(valid) => {
        if (!valid) {
          return
        }
        if (!this.validateStartUserSelectAssignees()) {
          return
        }
        this.formLoading = true
        try {
          // Keep the payload aligned with the Vue3 page: only send the
          // optional map when the approval definition actually contains a
          // START_USER_SELECT task.
          const data = {
            ...this.form,
            ...(this.startUserSelectTasks?.length > 0
              ? { startUserSelectAssignees: this.startUserSelectAssignees }
              : {})
          }
          await createLeave(data)
          this.$modal.msgSuccess('发起成功')
          this.$tab.closeOpenPage({ name: 'BpmOALeave' })
        } finally {
          this.formLoading = false
        }
      })
    }
  }
}
</script>
