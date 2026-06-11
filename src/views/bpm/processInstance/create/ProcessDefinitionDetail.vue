<template>
  <div class="process-definition-detail">
    <el-card shadow="never" class="process-create-card">
      <div class="process-create-title">流程：{{ definition.name }}</div>
      <el-divider class="process-create-divider" />

      <el-tabs v-model="activeTab" class="process-create-tabs">
        <el-tab-pane label="表单填写" name="form">
          <div class="process-form-area" v-loading="submitting">
            <el-row :gutter="24">
              <el-col :span="17">
                <template v-if="definition.formType === BpmModelFormType.NORMAL">
                  <form-create
                    v-if="detailForm.rule.length"
                    v-model="fApi"
                    :rule="detailForm.rule"
                    :option="detailForm.option"
                    @change="handleFormChange"
                    @submit="handleSubmit"
                  />
                  <el-empty v-else description="该流程未配置表单字段" />
                </template>
                <template v-else>
                  <el-alert
                    title="该流程使用业务表单，将跳转到业务发起页面"
                    type="info"
                    :closable="false"
                    show-icon
                  />
                </template>
              </el-col>
              <el-col :span="6" :offset="1">
                <ProcessInstanceTimeline
                  ref="timeline"
                  v-loading="approvalLoading"
                  :activity-nodes="activityNodes"
                  :show-status-icon="false"
                  @select-user-confirm="selectUserConfirm"
                />
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <el-tab-pane label="流程图" name="diagram">
          <div class="process-diagram-area">
            <SimpleProcessViewer
              v-if="isSimpleModel && simpleModel"
              :flow-node="simpleModel"
              :tasks="[]"
            />
            <my-process-viewer
              v-else-if="bpmnXML"
              key="create-bpmn-viewer"
              v-model="bpmnXML"
              :prefix="'flowable'"
            />
            <el-empty v-else description="暂无流程图" />
          </div>
        </el-tab-pane>
      </el-tabs>

      <div class="process-action-bar">
        <el-button plain type="success" icon="el-icon-check" :loading="submitting" @click="submitForm">
          发起
        </el-button>
        <el-button plain type="danger" icon="el-icon-close" @click="$emit('cancel')">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getProcessDefinition, getProcessDefinitionBpmnXML } from '@/api/bpm/definition'
import {
  createProcessInstance,
  getApprovalDetail
} from '@/api/bpm/processInstance'
import { BpmModelFormType, BpmModelType } from '@/utils/constants'
import { decodeFields, setConfAndFields2 } from '@/utils/formCreate'
import formCreate from '@form-create/element-ui'
import {
  CandidateStrategy,
  FieldPermissionType,
  NodeId
} from '@/components/SimpleProcessDesignerV2/src/consts'
import { SimpleProcessViewer } from '@/components/SimpleProcessDesignerV2/src'
import ProcessInstanceTimeline from '@/views/bpm/processInstance/detail/ProcessInstanceTimeline.vue'

export default {
  name: 'ProcessDefinitionDetail',
  components: {
    SimpleProcessViewer,
    ProcessInstanceTimeline
  },
  props: {
    selectProcessDefinition: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      BpmModelFormType,
      BpmModelType,
      activeTab: 'form',
      approvalLoading: false,
      definition: {},
      detailForm: {
        rule: [],
        option: {
          submitBtn: false,
          resetBtn: false
        }
      },
      fApi: {},
      bpmnXML: '',
      simpleModel: null,
      activityNodes: [],
      startUserSelectTasks: [],
      startUserSelectAssignees: {},
      tempStartUserSelectAssignees: {},
      approvalRefreshTimer: null,
      submitting: false
    }
  },
  computed: {
    isSimpleModel() {
      return this.definition.modelType === BpmModelType.SIMPLE || this.definition.type === BpmModelType.SIMPLE
    }
  },
  beforeDestroy() {
    if (this.approvalRefreshTimer) {
      clearTimeout(this.approvalRefreshTimer)
    }
  },
  methods: {
    async initProcessInfo(definition, formVariables) {
      this.definition = definition || this.selectProcessDefinition
      this.detailForm.rule = []
      this.detailForm.value = {}
      this.bpmnXML = ''
      this.simpleModel = null
      this.activityNodes = []
      this.startUserSelectTasks = []
      this.startUserSelectAssignees = {}
      this.tempStartUserSelectAssignees = {}
      this.activeTab = 'form'
      this.$nextTick(() => {
        if (this.$refs.timeline && this.$refs.timeline.resetCustomApproveUsers) {
          this.$refs.timeline.resetCustomApproveUsers()
        }
      })
      if (this.definition.formType === BpmModelFormType.NORMAL && this.definition.formConf && this.definition.formFields) {
        const variables = this.filterFormVariables(this.definition.formFields, formVariables || {})
        setConfAndFields2(this.detailForm, this.definition.formConf, this.definition.formFields, variables)
        this.detailForm.option.submitBtn = false
        this.detailForm.option.resetBtn = false
        this.$nextTick(() => {
          if (this.fApi && this.fApi.setValue && variables) {
            this.fApi.setValue(variables)
          }
        })
      }
      await this.loadProcessDiagram()
      await this.loadApprovalDetail(this.getCurrentFormData(formVariables || {}))
    },
    filterFormVariables(formFields, formVariables) {
      if (!formVariables || Object.keys(formVariables).length === 0) {
        return {}
      }
      try {
        const formApi = formCreate.create(decodeFields(formFields || []))
        const allowedFields = formApi.fields()
        const variables = {}
        Object.keys(formVariables).forEach((key) => {
          if (allowedFields.includes(key)) {
            variables[key] = formVariables[key]
          }
        })
        if (formApi.destroy) {
          formApi.destroy()
        }
        return variables
      } catch (e) {
        return formVariables
      }
    },
    async loadProcessDiagram() {
      let definitionDetail = null
      try {
        const response = await getProcessDefinition(this.definition.id)
        definitionDetail = response.data || null
      } catch (e) {}
      if (definitionDetail) {
        this.definition = {
          ...this.definition,
          ...definitionDetail
        }
      }
      if (this.isSimpleModel) {
        const simpleModel = this.definition.simpleModel || (definitionDetail && definitionDetail.simpleModel)
        if (simpleModel) {
          this.simpleModel = typeof simpleModel === 'string'
            ? JSON.parse(simpleModel)
            : simpleModel
        }
      } else {
        try {
          if (this.definition.bpmnXml || this.definition.bpmnXML) {
            this.bpmnXML = this.definition.bpmnXml || this.definition.bpmnXML
          } else {
            const response = await getProcessDefinitionBpmnXML(this.definition.id)
            this.bpmnXML = response.data
          }
        } catch (e) {}
      }
    },
    async loadApprovalDetail(variables) {
      if (!this.definition || !this.definition.id) {
        this.activityNodes = []
        return
      }
      this.approvalLoading = true
      try {
        const response = await getApprovalDetail({
          processDefinitionId: this.definition.id,
          activityId: NodeId.START_USER_NODE_ID,
          processVariablesStr: JSON.stringify(variables || {})
        })
        const data = response.data || {}
        this.activityNodes = data.activityNodes || []
        this.restoreStartUserSelectAssignees(this.activityNodes)
        this.applyFormFieldsPermission(data.formFieldsPermission)
      } catch (e) {
        this.activityNodes = []
      } finally {
        this.approvalLoading = false
      }
    },
    handleFormChange(field, value, origin, api) {
      if (this.approvalRefreshTimer) {
        clearTimeout(this.approvalRefreshTimer)
      }
      this.tempStartUserSelectAssignees = { ...this.startUserSelectAssignees }
      this.startUserSelectAssignees = {}
      this.approvalRefreshTimer = setTimeout(() => {
        const formData = this.getCurrentFormData({}, api)
        this.loadApprovalDetail(formData)
      }, 300)
    },
    submitForm() {
      if (this.definition.formType === BpmModelFormType.CUSTOM) {
        this.$router.push({
          path: this.definition.formCustomCreatePath,
          query: { processDefinitionId: this.definition.id }
        })
        return
      }
      if (this.fApi && this.fApi.submit) {
        this.fApi.submit()
      } else {
        this.handleSubmit(this.getCurrentFormData())
      }
    },
    async handleSubmit(formData) {
      if (!this.validateStartUserSelectAssignees()) {
        return
      }
      this.submitting = true
      try {
        await createProcessInstance({
          processDefinitionId: this.definition.id,
          variables: formData || {},
          startUserSelectAssignees: this.startUserSelectAssignees
        })
        this.$modal.msgSuccess('发起流程成功')
        this.$tab.closeOpenPage({ name: 'BpmProcessInstanceMy' })
      } finally {
        this.submitting = false
      }
    },
    getCurrentFormData(defaultValue, api) {
      const formApi = api || this.fApi
      if (formApi && formApi.formData) {
        return formApi.formData()
      }
      return defaultValue || this.detailForm.value || {}
    },
    restoreStartUserSelectAssignees(activityNodes) {
      this.startUserSelectTasks = (activityNodes || []).filter((node) => {
        return CandidateStrategy.START_USER_SELECT === node.candidateStrategy
      })
      if (this.startUserSelectTasks.length === 0) {
        this.startUserSelectAssignees = {}
        return
      }
      const nextAssignees = {}
      this.startUserSelectTasks.forEach((node) => {
        const previous = this.tempStartUserSelectAssignees[node.id]
        nextAssignees[node.id] = Array.isArray(previous) ? previous : []
      })
      this.startUserSelectAssignees = nextAssignees
      this.$nextTick(() => {
        const usersByActivity = {}
        this.startUserSelectTasks.forEach((node) => {
          const previousIds = this.startUserSelectAssignees[node.id] || []
          usersByActivity[node.id] = (node.candidateUsers || []).filter((user) => {
            return previousIds.map(String).includes(String(user.id))
          })
        })
        if (this.$refs.timeline && this.$refs.timeline.batchSetCustomApproveUsers) {
          this.$refs.timeline.batchSetCustomApproveUsers(usersByActivity)
        }
      })
    },
    selectUserConfirm(activityId, userList) {
      this.$set(this.startUserSelectAssignees, activityId, (userList || []).map((user) => user.id))
    },
    validateStartUserSelectAssignees() {
      for (const task of this.startUserSelectTasks) {
        const assignees = this.startUserSelectAssignees[task.id]
        if (!Array.isArray(assignees) || assignees.length === 0) {
          this.$message.warning(`请选择${task.name}的候选人`)
          return false
        }
      }
      return true
    },
    applyFormFieldsPermission(formFieldsPermission) {
      if (!formFieldsPermission || !this.fApi) {
        return
      }
      this.$nextTick(() => {
        Object.keys(formFieldsPermission).forEach((field) => {
          this.setFieldPermission(field, formFieldsPermission[field])
        })
      })
    },
    setFieldPermission(field, permission) {
      if (!this.fApi) {
        return
      }
      if (permission === FieldPermissionType.READ) {
        if (this.fApi.disabled) {
          this.fApi.disabled(true, field)
        }
        this.clearFieldValidate(field)
      } else if (permission === FieldPermissionType.WRITE) {
        if (this.fApi.disabled) {
          this.fApi.disabled(false, field)
        }
        if (this.fApi.hidden) {
          this.fApi.hidden(false, field)
        }
      } else if (permission === FieldPermissionType.NONE) {
        if (this.fApi.hidden) {
          this.fApi.hidden(true, field)
        }
        this.clearFieldValidate(field)
      }
    },
    clearFieldValidate(field) {
      try {
        if (this.fApi.updateValidate) {
          this.fApi.updateValidate(field, [], false)
        }
        const rule = this.fApi.getRule && this.fApi.getRule(field)
        if (rule) {
          this.$set(rule, '$required', false)
          if (rule.validate) {
            this.$set(rule, 'validate', [])
          }
        }
      } catch (e) {}
    }
  }
}
</script>

<style scoped>
.process-create-card {
  min-height: calc(100vh - 190px);
}

.process-create-title {
  color: #909399;
  font-size: 14px;
  line-height: 22px;
}

.process-create-divider {
  margin: 8px 0 0;
}

.process-create-tabs /deep/ .el-tabs__header {
  margin-bottom: 16px;
}

.process-form-area,
.process-diagram-area {
  min-height: calc(100vh - 360px);
}

.process-form-area {
  padding-right: 8px;
}

.process-diagram-area {
  overflow: auto;
}

.process-action-bar {
  padding-top: 12px;
  margin-top: 18px;
  border-top: 1px solid #dcdfe6;
}

.process-action-bar .el-button {
  min-width: 96px;
}
</style>
