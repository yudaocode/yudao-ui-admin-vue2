<template>
  <div class="app-container process-detail-page">
    <el-card shadow="never" v-loading="processInstanceLoading">
      <div class="detail-top">
        <div>
          <div class="detail-id">编号：{{ currentId }}</div>
          <div class="detail-title">
            <span>{{ processInstance.name || '-' }}</span>
            <dict-tag
              v-if="processInstance.status !== undefined"
              :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS"
              :value="processInstance.status"
            />
          </div>
          <div class="detail-meta">
            <span>发起人：{{ startUserName }}</span>
            <span>提交时间：{{ parseTime(processInstance.startTime || processInstance.createTime) }}</span>
          </div>
        </div>
        <el-button icon="el-icon-printer" @click="handlePrint">打印</el-button>
      </div>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="审批详情" name="form">
          <el-row :gutter="24">
            <el-col :span="16">
              <el-card shadow="never">
                <div slot="header">申请信息</div>
                <template v-if="processDefinition.formType === BpmModelFormType.NORMAL">
                  <form-create
                    v-if="detailForm.rule.length"
                    v-model="fApi"
                    :rule="detailForm.rule"
                    :option="detailForm.option"
                  />
                  <el-empty v-else description="暂无表单信息" />
                </template>
                <template v-else-if="BusinessFormComponent">
                  <component :is="BusinessFormComponent" :id="processInstance.businessKey" />
                </template>
                <el-empty v-else description="暂无业务表单" />
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="never">
                <div slot="header">审批时间线</div>
                <ProcessInstanceTimeline :activity-nodes="activityNodes" />
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>

        <el-tab-pane label="流程图" name="diagram">
          <ProcessInstanceSimpleViewer
            v-if="isSimpleModel"
            :loading="processInstanceLoading"
            :model-view="processModelView"
            :tasks="taskList"
            :process-instance="processInstance"
          />
          <ProcessInstanceBpmnViewer
            v-else
            :loading="processInstanceLoading"
            :model-view="processModelView"
          />
        </el-tab-pane>

        <el-tab-pane label="流转记录" name="record">
          <ProcessInstanceTaskList ref="taskList" :loading="processInstanceLoading" :id="currentId" />
        </el-tab-pane>
      </el-tabs>

      <ProcessInstanceOperationButton
        ref="operationButton"
        :process-instance="processInstance"
        :process-definition="processDefinition"
        :user-options="userOptions"
        @success="refresh"
      />
    </el-card>

    <PrintDialog ref="printDialog" />
  </div>
</template>

<script>
import { BpmModelFormType, BpmModelType } from '@/utils/constants'
import { setConfAndFields2 } from '@/utils/formCreate'
import {
  getApprovalDetail,
  getProcessInstanceBpmnModelView
} from '@/api/bpm/processInstance'
import { listSimpleUsers } from '@/api/system/user'
import ProcessInstanceTimeline from './ProcessInstanceTimeline.vue'
import ProcessInstanceBpmnViewer from './ProcessInstanceBpmnViewer.vue'
import ProcessInstanceSimpleViewer from './ProcessInstanceSimpleViewer.vue'
import ProcessInstanceTaskList from './ProcessInstanceTaskList.vue'
import ProcessInstanceOperationButton from './ProcessInstanceOperationButton.vue'
import PrintDialog from './PrintDialog.vue'

export default {
  name: 'BpmProcessInstanceDetail',
  components: {
    ProcessInstanceTimeline,
    ProcessInstanceBpmnViewer,
    ProcessInstanceSimpleViewer,
    ProcessInstanceTaskList,
    ProcessInstanceOperationButton,
    PrintDialog
  },
  props: {
    id: {
      type: [String, Number],
      default: undefined
    },
    taskId: {
      type: [String, Number],
      default: undefined
    },
    activityId: {
      type: [String, Number],
      default: undefined
    }
  },
  data() {
    return {
      BpmModelFormType,
      BpmModelType,
      activeTab: 'form',
      processInstanceLoading: false,
      processInstance: {},
      processDefinition: {},
      processModelView: {},
      activityNodes: [],
      taskList: [],
      userOptions: [],
      fApi: {},
      detailForm: {
        rule: [],
        option: {
          submitBtn: false,
          resetBtn: false
        },
        value: {}
      },
      BusinessFormComponent: null
    }
  },
  computed: {
    currentId() {
      return this.id || this.$route.query.id
    },
    currentTaskId() {
      return this.taskId || this.$route.query.taskId
    },
    currentActivityId() {
      return this.activityId || this.$route.query.activityId
    },
    startUserName() {
      const user = this.processInstance.startUser || {}
      return user.nickname || user.name || this.processInstance.startUserNickname || '-'
    },
    isSimpleModel() {
      return this.processDefinition.modelType === BpmModelType.SIMPLE ||
        this.processDefinition.type === BpmModelType.SIMPLE ||
        !!(this.processModelView && this.processModelView.simpleModel)
    }
  },
  created() {
    this.loadUsers()
    this.getDetail()
  },
  methods: {
    async loadUsers() {
      try {
        const response = await listSimpleUsers()
        this.userOptions = response.data || []
      } catch (e) {
        this.userOptions = []
      }
    },
    async getDetail() {
      if (!this.currentId) {
        this.$message.error('未传递流程实例编号')
        return
      }
      this.processInstanceLoading = true
      try {
        await Promise.all([this.getApprovalDetail(), this.getProcessModelView()])
      } finally {
        this.processInstanceLoading = false
      }
    },
    async getApprovalDetail() {
      const response = await getApprovalDetail({
        processInstanceId: this.currentId,
        taskId: this.currentTaskId,
        activityId: this.currentActivityId
      })
      const data = response.data
      if (!data) {
        this.$message.error('查询不到审批详情信息')
        return
      }
      this.processInstance = data.processInstance || {}
      this.processDefinition = data.processDefinition || {}
      this.activityNodes = data.activityNodes || []
      this.taskList = []
      this.activityNodes.forEach((node) => {
        if (node.tasks && node.tasks.length) {
          this.taskList = this.taskList.concat(node.tasks)
        }
      })
      this.initForm(data)
      this.$nextTick(() => {
        if (this.$refs.operationButton) {
          this.$refs.operationButton.loadTodoTask(data.todoTask)
        }
      })
    },
    initForm(data) {
      if (this.processDefinition.formType === BpmModelFormType.NORMAL) {
        if (this.processDefinition.formConf && this.processDefinition.formFields) {
          setConfAndFields2(
            this.detailForm,
            this.processDefinition.formConf,
            this.processDefinition.formFields,
            this.processInstance.formVariables || {}
          )
          this.detailForm.option.submitBtn = false
          this.detailForm.option.resetBtn = false
          this.$nextTick(() => {
            if (this.fApi && this.fApi.setValue) {
              this.fApi.setValue(this.processInstance.formVariables || {})
            }
            if (this.fApi && this.fApi.disabled) {
              this.fApi.disabled(true)
            }
          })
        }
      } else if (this.processDefinition.formCustomViewPath) {
        this.BusinessFormComponent = this.loadBusinessComponent(this.processDefinition.formCustomViewPath)
      }
    },
    loadBusinessComponent(path) {
      const normalized = String(path || '').replace(/^\/+/, '').replace(/^src\/views\//, '').replace(/^views\//, '')
      if (!normalized) {
        return null
      }
      return (resolve) => {
        try {
          require([`@/views/${normalized}`], resolve)
        } catch (e) {
          resolve({ render: (h) => h('el-alert', { props: { type: 'warning', title: '业务表单组件加载失败', closable: false } }) })
        }
      }
    },
    async getProcessModelView() {
      try {
        const response = await getProcessInstanceBpmnModelView(this.currentId)
        this.processModelView = response.data || {}
      } catch (e) {
        this.processModelView = {}
      }
    },
    refresh() {
      this.getDetail()
      if (this.$refs.taskList) {
        this.$refs.taskList.getList()
      }
    },
    handlePrint() {
      this.$refs.printDialog.open(this.currentId)
    }
  }
}
</script>

<style scoped>
.detail-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.detail-id {
  color: #909399;
  font-size: 13px;
}

.detail-title {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 6px;
  font-size: 22px;
  font-weight: 600;
}

.detail-meta {
  display: flex;
  gap: 18px;
  margin-top: 8px;
  color: #606266;
}
</style>
