<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card shadow="never">
          <div slot="header">申请信息</div>
          <el-form ref="form" v-loading="formLoading" :model="form" :rules="rules" label-width="90px">
            <el-form-item label="请假类型" prop="type">
              <el-select v-model="form.type" clearable placeholder="请选择请假类型">
                <el-option
                  v-for="dict in typeDictData"
                  :key="parseInt(dict.value)"
                  :label="dict.label"
                  :value="parseInt(dict.value)"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="form.startTime"
                clearable
                type="datetime"
                value-format="timestamp"
                placeholder="选择开始时间"
              />
            </el-form-item>
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="form.endTime"
                clearable
                type="datetime"
                value-format="timestamp"
                placeholder="选择结束时间"
              />
            </el-form-item>
            <el-form-item label="原因" prop="reason">
              <el-input type="textarea" :rows="4" v-model="form.reason" placeholder="请输入请假原因" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="formLoading" @click="submitForm">提 交</el-button>
              <el-button @click="$tab.closeOpenPage({ name: 'BpmOALeave' })">取 消</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <div slot="header">审批流程</div>
          <ProcessInstanceTimeline :activity-nodes="activityNodes" />
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
      form: {
        startTime: undefined,
        endTime: undefined,
        type: undefined,
        reason: undefined
      },
      rules: {
        startTime: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
        endTime: [{ required: true, message: '结束时间不能为空', trigger: 'change' }],
        type: [{ required: true, message: '请假类型不能为空', trigger: 'change' }],
        reason: [{ required: true, message: '请假原因不能为空', trigger: 'blur' }]
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
        this.$message.error('OA 请假的流程模型未配置，请检查')
        return
      }
      this.processDefinitionId = definition.id
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
      if (!this.form.startTime || !this.form.endTime) {
        return 0
      }
      return Math.floor(Math.abs(Number(this.form.endTime) - Number(this.form.startTime)) / (24 * 60 * 60 * 1000))
    },
    async getApprovalDetail() {
      try {
        const response = await getApprovalDetail({
          processDefinitionId: this.processDefinitionId,
          activityId: NodeId.START_USER_NODE_ID,
          processVariablesStr: JSON.stringify({ day: this.daysDifference() })
        })
        const data = response.data || {}
        this.activityNodes = data.activityNodes || []
        this.startUserSelectTasks = this.activityNodes.filter((node) => CandidateStrategy.START_USER_SELECT === node.candidateStrategy)
      } catch (e) {
        this.activityNodes = []
      }
    },
    submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) {
          return
        }
        this.formLoading = true
        try {
          await createLeave({
            ...this.form,
            startUserSelectAssignees: this.startUserSelectAssignees
          })
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
