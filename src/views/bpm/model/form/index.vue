<template>
  <div class="app-container bpm-model-form">
    <div class="model-form-header">
      <div class="model-form-header__left">
        <el-button type="text" icon="el-icon-back" class="model-form-back" @click="handleBack" />
        <span class="model-form-title">{{ formData.name || title }}</span>
      </div>
      <el-steps :active="currentStep" finish-status="success" align-center class="model-form-steps">
        <el-step v-for="step in steps" :key="step.title" :title="step.title" @click.native="handleStepClick(step.index)" />
      </el-steps>
      <div class="model-form-header__right">
        <el-button v-if="formData.id" type="success" @click="handleDeploy">发 布</el-button>
        <el-button type="primary" @click="handleSave">{{ actionType === 'definition' ? '恢 复' : '保 存' }}</el-button>
      </div>
    </div>

    <div class="model-form-body">
      <BasicInfo
        v-show="currentStep === 0"
        ref="basicInfo"
        v-model="formData"
        :category-list="categoryList"
        :user-list="userList"
        :dept-list="deptList"
        :is-copy="actionType === 'copy'"
      />
      <FormDesign
        v-show="currentStep === 1"
        ref="formDesign"
        v-model="formData"
        :form-list="formList"
      />
      <ProcessDesign
        v-if="currentStep === 2"
        ref="processDesign"
        v-model="formData"
      />
      <ExtraSettings
        v-show="currentStep === 3"
        ref="extraSettings"
        v-model="formData"
      />
    </div>
  </div>
</template>

<script>
import { createModel, deployModel, getModel, updateModel } from '@/api/bpm/model'
import { getFormSimpleList } from '@/api/bpm/form'
import { getCategorySimpleList } from '@/api/bpm/category'
import { getProcessDefinition } from '@/api/bpm/definition'
import { listSimpleUsers } from '@/api/system/user'
import { listSimpleDepts } from '@/api/system/dept'
import { BpmAutoApproveType, BpmModelFormType, BpmModelType } from '@/utils/constants'
import BasicInfo from './BasicInfo.vue'
import FormDesign from './FormDesign.vue'
import ProcessDesign from './ProcessDesign.vue'
import ExtraSettings from './ExtraSettings.vue'

function defaultFormData(managerUserId) {
  return {
    id: undefined,
    name: '',
    key: '',
    category: undefined,
    icon: '',
    description: '',
    type: BpmModelType.BPMN,
    formType: BpmModelFormType.NORMAL,
    formId: undefined,
    formCustomCreatePath: '',
    formCustomViewPath: '',
    visible: true,
    startUserType: 0,
    startUserIds: [],
    startDeptIds: [],
    managerUserIds: managerUserId ? [managerUserId] : [],
    allowCancelRunningProcess: true,
    allowWithdrawTask: false,
    processIdRule: {
      enable: false,
      prefix: '',
      infix: '',
      postfix: '',
      length: 5
    },
    autoApprovalType: BpmAutoApproveType.NONE,
    titleSetting: {
      enable: false,
      title: ''
    },
    summarySetting: {
      enable: false,
      summary: []
    },
    printTemplateSetting: {
      enable: false,
      template: ''
    },
    bpmnXml: undefined,
    simpleModel: undefined
  }
}

function normalizeModel(data) {
  const result = {
    ...defaultFormData(),
    ...data
  }
  if (typeof result.simpleModel === 'string' && result.simpleModel) {
    try {
      result.simpleModel = JSON.parse(result.simpleModel)
    } catch (e) {
      result.simpleModel = undefined
    }
  }
  if (!Array.isArray(result.startUserIds)) result.startUserIds = []
  if (!Array.isArray(result.startDeptIds)) result.startDeptIds = []
  if (!Array.isArray(result.managerUserIds)) result.managerUserIds = []
  result.startUserType = result.startUserIds.length > 0 ? 1 : result.startDeptIds.length > 0 ? 2 : 0
  if (!result.processIdRule) result.processIdRule = defaultFormData().processIdRule
  if (!result.titleSetting) result.titleSetting = defaultFormData().titleSetting
  if (!result.summarySetting) result.summarySetting = defaultFormData().summarySetting
  if (!result.printTemplateSetting) result.printTemplateSetting = defaultFormData().printTemplateSetting
  return result
}

export default {
  name: 'BpmModelForm',
  components: {
    BasicInfo,
    FormDesign,
    ProcessDesign,
    ExtraSettings
  },
  data() {
    return {
      currentStep: 0,
      steps: [
        { index: 0, title: '基本信息', ref: 'basicInfo' },
        { index: 1, title: '表单设计', ref: 'formDesign' },
        { index: 2, title: '流程设计', ref: 'processDesign' },
        { index: 3, title: '更多设置', ref: 'extraSettings' }
      ],
      actionType: this.getActionType(),
      formData: defaultFormData(this.$store.getters.userId),
      formList: [],
      categoryList: [],
      userList: [],
      deptList: []
    }
  },
  computed: {
    title() {
      const map = {
        create: '创建流程',
        update: '修改流程',
        copy: '复制流程',
        definition: '恢复流程'
      }
      return map[this.actionType] || '流程模型'
    }
  },
  created() {
    this.initData()
  },
  methods: {
    getActionType() {
      const routeNameMap = {
        BpmModelCreate: 'create',
        BpmModelUpdate: 'update',
        BpmModelCopy: 'copy',
        BpmModelDefinitionRestore: 'definition'
      }
      return this.$route.params.type || routeNameMap[this.$route.name] || 'create'
    },
    async initData() {
      await this.loadOptions()
      const id = this.$route.params.id || this.$route.query.id
      if (this.actionType === 'update' || this.actionType === 'copy') {
        const response = await getModel(id)
        this.formData = normalizeModel(response.data)
        if (this.actionType === 'copy') {
          this.formData.id = undefined
          this.formData.name = `${this.formData.name || ''}副本`
          this.formData.key = `${this.formData.key || ''}_copy`
          if (this.formData.bpmnXml) {
            this.formData.bpmnXml = this.formData.bpmnXml
              .replace(new RegExp(response.data.name, 'g'), this.formData.name)
              .replace(new RegExp(response.data.key, 'g'), this.formData.key)
          }
        }
      } else if (this.actionType === 'definition') {
        const response = await getProcessDefinition(id)
        const data = response.data || {}
        this.formData = normalizeModel({
          ...data,
          id: data.modelId,
          type: data.modelType || data.type
        })
      }
    },
    async loadOptions() {
      const normalize = (response) => response && response.data ? response.data : []
      const responses = await Promise.all([
        getFormSimpleList(),
        getCategorySimpleList(),
        listSimpleUsers(),
        listSimpleDepts()
      ])
      this.formList = normalize(responses[0])
      this.categoryList = normalize(responses[1])
      this.userList = normalize(responses[2])
      this.deptList = normalize(responses[3])
    },
    async validateStep(index) {
      const step = this.steps[index]
      const ref = this.$refs[step.ref]
      if (ref && ref.validate) {
        await ref.validate()
      }
    },
    async validateAll() {
      for (let i = 0; i < this.steps.length; i++) {
        try {
          await this.validateStep(i)
        } catch (e) {
          this.currentStep = i
          throw e
        }
      }
    },
    async handleStepClick(index) {
      if (index === this.currentStep) {
        return
      }
      try {
        if (index > this.currentStep) {
          await this.validateStep(this.currentStep)
        }
        this.currentStep = index
      } catch (e) {
        this.$message.warning(e.message || '请先完善当前步骤')
      }
    },
    buildSubmitData() {
      return {
        ...this.formData,
        simpleModel: this.formData.simpleModel || undefined
      }
    },
    async handleSave() {
      try {
        await this.validateAll()
        const data = this.buildSubmitData()
        if (data.id) {
          await updateModel(data)
          this.$modal.msgSuccess(this.actionType === 'definition' ? '恢复成功' : '修改成功')
        } else {
          const response = await createModel(data)
          const id = response.data && response.data.id ? response.data.id : response.data
          this.formData.id = id
          this.$modal.msgSuccess(this.actionType === 'copy' ? '复制成功' : '新建成功')
        }
        if (this.actionType !== 'update') {
          this.$router.push({ name: 'BpmModel' })
        }
      } catch (e) {
        this.$message.warning(e.message || '请完善流程模型配置')
      }
    },
    async handleDeploy() {
      try {
        await this.validateAll()
        const data = this.buildSubmitData()
        if (data.id) {
          await updateModel(data)
        } else {
          const response = await createModel(data)
          this.formData.id = response.data && response.data.id ? response.data.id : response.data
        }
        await deployModel(this.formData.id)
        this.$modal.msgSuccess('发布成功')
        this.$router.push({ name: 'BpmModel' })
      } catch (e) {
        this.$message.warning(e.message || '发布失败')
      }
    },
    handleBack() {
      this.$tab.closeOpenPage({ name: 'BpmModel' })
    }
  }
}
</script>

<style scoped>
.bpm-model-form {
  padding-top: 0;
}

.model-form-header {
  position: sticky;
  top: 0;
  z-index: 3;
  display: grid;
  grid-template-columns: 220px 1fr 220px;
  gap: 12px;
  align-items: center;
  min-height: 64px;
  padding: 10px 0;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}

.model-form-header__left,
.model-form-header__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.model-form-header__right {
  justify-content: flex-end;
}

.model-form-title {
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-form-back {
  padding: 0;
  font-size: 18px;
}

.model-form-body {
  padding-top: 12px;
}
</style>
