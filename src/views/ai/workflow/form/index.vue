<template>
  <div class="app-container workflow-form-page" v-loading="initializing">
    <div class="workflow-header">
      <div class="header-title">
        <i class="el-icon-back back-icon" @click="handleBack" />
        <span :title="formData.name || '创建流程'">{{ formData.name || '创建流程' }}</span>
      </div>

      <div class="workflow-steps">
        <div
          v-for="(step, index) in steps"
          :key="step.title"
          class="workflow-step"
          :class="{ active: currentStep === index }"
          @click="handleStepClick(index)"
        >
          <span class="step-index">{{ index + 1 }}</span>
          <span class="step-title">{{ step.title }}</span>
        </div>
      </div>

      <div class="header-actions">
        <el-button type="primary" :loading="saving" @click="handleSave">保 存</el-button>
      </div>
    </div>

    <div v-if="currentStep >= 0" class="workflow-body">
      <div v-if="currentStep === 0" class="basic-info-panel">
        <BasicInfo ref="basicInfo" v-model="formData" />
      </div>
      <WorkflowDesign
        v-if="currentStep === 1"
        ref="workflowDesign"
        :provider="llmProvider"
      />
    </div>
  </div>
</template>

<script>
import { CommonStatusEnum } from '@/utils/constants'
import { getWorkflow, createWorkflow, updateWorkflow } from '@/api/ai/workflow'
import { ModelApi } from '@/api/ai/model/model'
import { AiModelTypeEnum } from '@/views/ai/utils/constants'
import BasicInfo from './BasicInfo.vue'
import WorkflowDesign from './WorkflowDesign.vue'

function createDefaultForm() {
  return {
    id: undefined,
    name: '',
    code: '',
    remark: '',
    graph: '',
    status: CommonStatusEnum.ENABLE
  }
}

export default {
  name: 'AiWorkflowForm',
  components: { BasicInfo, WorkflowDesign },
  provide() {
    return { workflowData: this.workflowDataBridge }
  },
  data() {
    return {
      initializing: false,
      saving: false,
      currentStep: -1,
      steps: [{ title: '基本信息' }, { title: '工作流设计' }],
      formData: createDefaultForm(),
      workflowDataBridge: { value: {}},
      llmProvider: {
        llm: () => [],
        knowledge: () => [],
        internal: () => []
      }
    }
  },
  computed: {
    actionType() {
      return this.$route.params.type || (this.$route.params.id ? 'update' : 'create')
    }
  },
  created() {
    this.initData()
  },
  methods: {
    async initData() {
      this.initializing = true
      try {
        if (this.actionType === 'update') {
          const response = await getWorkflow(this.$route.params.id)
          const workflow = response.data
          this.formData = workflow
          this.workflowDataBridge.value = workflow.graph ? JSON.parse(workflow.graph) : {}
        }

        const response = await ModelApi.getModelSimpleList(AiModelTypeEnum.CHAT)
        const models = response.data
        this.llmProvider = {
          llm: () => models.map(({ id, name }) => ({ value: id, label: name })),
          knowledge: () => [],
          internal: () => []
        }
        this.currentStep = 0
      } finally {
        this.initializing = false
      }
    },
    validateBasic() {
      if (this.$refs.basicInfo) return this.$refs.basicInfo.validate()
      return Promise.resolve(true)
    },
    validateWorkflow() {
      if (this.$refs.workflowDesign) return this.$refs.workflowDesign.validate()
      return Promise.resolve(true)
    },
    async validateAllSteps() {
      try {
        await this.validateBasic()
      } catch (error) {
        this.currentStep = 0
        await this.$nextTick()
        throw new Error('请完善基本信息')
      }
      try {
        await this.validateWorkflow()
      } catch (error) {
        this.currentStep = 1
        await this.$nextTick()
        throw new Error('请完善工作流信息')
      }
    },
    async handleSave() {
      this.saving = true
      try {
        await this.validateAllSteps()
        const data = Object.assign({}, this.formData, {
          graph: JSON.stringify(this.workflowDataBridge.value)
        })
        if (this.actionType === 'update') await updateWorkflow(data)
        else await createWorkflow(data)
        this.$modal.msgSuccess('保存成功')
        await this.closeAndReturn()
      } catch (error) {
        console.error('保存失败:', error)
        this.$modal.msgWarning(error.message || '请完善所有步骤的必填信息')
      } finally {
        this.saving = false
      }
    },
    async handleStepClick(index) {
      if (index === this.currentStep || this.currentStep < 0) return
      try {
        if (index === 1) await this.validateBasic()
        else await this.validateWorkflow()
        this.currentStep = index
      } catch (error) {
        console.error('步骤切换失败:', error)
        this.$modal.msgWarning('请先完善当前步骤必填信息')
      }
    },
    handleBack() {
      this.closeAndReturn()
    },
    async closeAndReturn() {
      if (this.$store) {
        await this.$store.dispatch('tagsView/delView', this.$route).catch(() => {})
      }
      return this.$router.push({ name: 'AiWorkflow' }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.workflow-form-page {
  position: relative;
  min-height: calc(100vh - 84px);
  padding-top: 50px;
}

.workflow-header {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #dcdfe6;
}

.header-title,
.header-actions {
  display: flex;
  align-items: center;
  width: 200px;
}

.header-title {
  min-width: 0;

  span {
    overflow: hidden;
    font-size: 16px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.back-icon {
  flex-shrink: 0;
  margin-right: 10px;
  font-size: 18px;
  cursor: pointer;
}

.header-actions {
  justify-content: flex-end;
}

.workflow-steps {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.workflow-step {
  display: flex;
  align-items: center;
  height: 100%;
  margin: 0 15px;
  color: #909399;
  cursor: pointer;
  border-bottom: 2px solid transparent;

  &.active {
    color: #3473ff;
    border-bottom-color: #3473ff;
  }
}

.step-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-right: 8px;
  font-size: 15px;
  border: 2px solid #dcdfe6;
  border-radius: 50%;
}

.workflow-step.active .step-index {
  color: #fff;
  background: #3473ff;
  border-color: #3473ff;
}

.step-title {
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
}

.workflow-body {
  padding-top: 20px;
}

.basic-info-panel {
  width: 560px;
  max-width: 100%;
  margin: 0 auto;
}
</style>
