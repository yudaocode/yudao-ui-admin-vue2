<template>
  <div>
    <Dialog
      v-model="dialogVisible"
      append-to-body
      :title="dialogTitle"
      max-height="55vh"
      scroll
      width="900px"
    >
      <el-form
        ref="formRef"
        v-loading="formLoading"
        class="work-item-form"
        :model="formData"
        :rules="formRules"
        label-width="96px"
      >
        <el-form-item :label="`${workItemTypeName}标题`" prop="name">
          <el-input
            v-model="formData.name"
            maxlength="100"
            :placeholder="`请输入${workItemTypeName}标题`"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="formData.priority" class="full-width">
                <el-option
                  v-for="option in getIntDictOptions(DICT_TYPE.PMS_WORK_ITEM_PRIORITY)"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="assigneeUserId">
              <ProjectMemberSelect
                v-model="formData.assigneeUserId"
                class="full-width"
                :project-id="projectId"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="formData.startTime"
                class="full-width"
                clearable
                placeholder="请选择开始时间"
                type="datetime"
                value-format="timestamp"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止时间" prop="endTime">
              <el-date-picker
                v-model="formData.endTime"
                class="full-width"
                clearable
                placeholder="请选择截止时间"
                type="datetime"
                value-format="timestamp"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col v-if="projectType === PmsProjectType.AGILE" :span="12">
            <el-form-item label="所属迭代" prop="iterationId">
              <IterationSelect
                v-model="formData.iterationId"
                class="full-width"
                :project-id="projectId"
              />
            </el-form-item>
          </el-col>
          <el-col :span="projectType === PmsProjectType.AGILE ? 12 : 24">
            <el-form-item label="父级工作项" prop="parentId">
              <WorkItemSelect
                v-model="formData.parentId"
                class="full-width"
                :exclude-id="formData.id"
                placeholder="请选择父级工作项"
                :project-id="projectId"
                :type="type"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row
          v-if="projectType === PmsProjectType.AGILE && type !== PmsWorkItemType.REQUIREMENT"
          :gutter="20"
        >
          <el-col :span="12">
            <el-form-item label="关联需求" prop="relatedRequirementId">
              <WorkItemSelect
                v-model="formData.relatedRequirementId"
                class="full-width"
                placeholder="请选择关联需求"
                :project-id="projectId"
                :type="PmsWorkItemType.REQUIREMENT"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="type === PmsWorkItemType.DEFECT" :span="12">
            <el-form-item label="缺陷类型" prop="defectType">
              <el-select v-model="formData.defectType" class="full-width">
                <el-option
                  v-for="option in getIntDictOptions(DICT_TYPE.PMS_WORK_ITEM_DEFECT_TYPE)"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="预估工时" prop="estimatedHours">
              <el-input-number
                v-model="formData.estimatedHours"
                class="full-width"
                :min="0"
                placeholder="请输入预估工时"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="完成进度" prop="progress">
              <el-slider v-model="formData.progress" show-input :max="100" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="参与人" prop="memberUserIds">
          <ProjectMemberSelect
            v-model="formData.memberUserIds"
            class="full-width"
            multiple
            :project-id="projectId"
          />
        </el-form-item>
        <el-form-item label="标签" prop="labelIds">
          <div class="label-editor">
            <WorkItemLabelSelect ref="labelSelectRef" v-model="formData.labelIds" class="label-select" />
            <el-button @click="openLabelManage">标签管理</el-button>
          </div>
        </el-form-item>
        <el-form-item :label="`${workItemTypeName}描述`" prop="description">
          <Editor v-model="formData.description" :height="240" />
        </el-form-item>
        <el-form-item label="附件" prop="fileUrls">
          <UploadFile v-model="formData.fileUrls" />
        </el-form-item>
        <template v-if="formType === 'create'">
          <el-form-item label="子工作项">
            <div class="child-list">
              <div v-for="(childName, index) in formData.childWorkItemNames" :key="index" class="child-row">
                <el-input
                  v-model="formData.childWorkItemNames[index]"
                  maxlength="100"
                  placeholder="请输入子工作项标题"
                />
                <el-button class="danger-button" type="text" @click="removeChild(index)">删除</el-button>
              </div>
              <el-button class="add-child-button" plain icon="el-icon-plus" @click="addChild">
                添加子工作项
              </el-button>
            </div>
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="实际投入" prop="actualHours">
                <el-input-number
                  v-model="formData.actualHours"
                  class="full-width"
                  :min="1"
                  placeholder="请输入实际投入工时"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="剩余工时" prop="remainingHours">
                <el-input-number
                  v-model="formData.remainingHours"
                  class="full-width"
                  :min="0"
                  placeholder="请输入剩余工时"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
      </el-form>
      <span slot="footer">
        <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </span>
    </Dialog>
    <WorkItemLabelList ref="labelManageRef" @success="refreshLabelOptions" />
  </div>
</template>

<script>
import * as ProjectApi from '@/api/pms/pm/project'
import * as WorkItemApi from '@/api/pms/pm/workitem'
import {
  PmsProjectType,
  PmsWorkItemDefectType,
  PmsWorkItemPriority,
  PmsWorkItemType
} from '@/views/pms/pm/utils/constants'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { getWorkItemTypeName } from '@/views/pms/pm/utils/format'
import Editor from '@/components/Editor'
import Dialog from '@/components/Dialog'
import UploadFile from '@/components/UploadFile'
import ProjectMemberSelect from '@/views/pms/pm/project/components/ProjectMemberSelect.vue'
import IterationSelect from '@/views/pms/pm/iteration/components/IterationSelect.vue'
import WorkItemSelect from '../components/WorkItemSelect.vue'
import WorkItemLabelList from '../label/WorkItemLabelList.vue'
import WorkItemLabelSelect from '../label/WorkItemLabelSelect.vue'

function getDefaultFormData(projectId, type) {
  return {
    projectId,
    type,
    name: '',
    priority: PmsWorkItemPriority.MEDIUM,
    memberUserIds: [],
    progress: 0,
    defectType: type === PmsWorkItemType.DEFECT ? PmsWorkItemDefectType.FUNCTION : undefined,
    fileUrls: [],
    labelIds: [],
    childWorkItemNames: []
  }
}

export default {
  name: 'PmsWorkItemForm',
  components: {
    Editor,
    Dialog,
    UploadFile,
    ProjectMemberSelect,
    IterationSelect,
    WorkItemSelect,
    WorkItemLabelList,
    WorkItemLabelSelect
  },
  data() {
    return {
      DICT_TYPE,
      PmsProjectType,
      PmsWorkItemType,
      dialogVisible: false,
      formLoading: false,
      formType: 'create',
      projectId: 0,
      projectType: PmsProjectType.GENERAL,
      type: PmsWorkItemType.TASK,
      formData: getDefaultFormData(0, PmsWorkItemType.TASK)
    }
  },
  computed: {
    workItemTypeName() {
      return getWorkItemTypeName(this.type)
    },
    dialogTitle() {
      return `${this.formType === 'create' ? '新建' : '编辑'}${this.workItemTypeName}`
    },
    formRules() {
      return {
        name: [{ required: true, message: `${this.workItemTypeName}标题不能为空`, trigger: 'blur' }],
        priority: [{ required: true, message: '优先级不能为空', trigger: 'change' }],
        startTime: [{ validator: this.validateWorkItemTimeRange, trigger: 'change' }],
        endTime: [{ validator: this.validateWorkItemTimeRange, trigger: 'change' }],
        defectType: this.type === PmsWorkItemType.DEFECT
          ? [{ required: true, message: '缺陷类型不能为空', trigger: 'change' }]
          : []
      }
    }
  },
  methods: {
    getIntDictOptions,
    async open(currentFormType, id, createContext) {
      this.formType = currentFormType
      this.formLoading = true
      try {
        if (currentFormType === 'update' && id) {
          const workItemResponse = await WorkItemApi.getWorkItem(id)
          const workItem = workItemResponse.data
          const projectResponse = await ProjectApi.getProject(workItem.projectId)
          this.projectId = workItem.projectId
          this.projectType = projectResponse.data.type
          this.type = workItem.type
          this.formData = {
            ...workItem,
            fileUrls: workItem.fileUrls || [],
            labelIds: workItem.labelIds || []
          }
          this.dialogVisible = true
          await this.clearValidate()
          return
        }
        if (!createContext) return
        this.projectId = createContext.projectId
        this.projectType = createContext.projectType
        this.type = createContext.type
        this.resetForm()
        this.formData.iterationId = createContext.iterationId
        this.dialogVisible = true
        await this.clearValidate()
      } finally {
        this.formLoading = false
      }
    },
    async clearValidate() {
      await this.$nextTick()
      if (this.$refs.formRef) this.$refs.formRef.clearValidate()
    },
    validateWorkItemTimeRange(rule, value, callback) {
      if (this.formData.startTime && this.formData.endTime &&
        Number(this.formData.startTime) >= Number(this.formData.endTime)) {
        callback(new Error('开始时间必须早于截止时间'))
        return
      }
      callback()
    },
    async submitForm() {
      if (!this.$refs.formRef || this.formLoading) return
      const valid = await new Promise(resolve => this.$refs.formRef.validate(resolve))
      if (!valid) return
      this.formLoading = true
      try {
        if (this.formType === 'create') {
          await WorkItemApi.createWorkItem(this.formData)
          this.$message.success('创建成功')
        } else {
          await WorkItemApi.updateWorkItem(this.formData)
          this.$message.success('更新成功')
        }
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.formData = getDefaultFormData(this.projectId, this.type)
      // open() 随后设置入口迭代并清理校验；不能延迟 resetFields 覆盖新的入口参数。
    },
    openLabelManage() {
      this.$refs.labelManageRef.open()
    },
    refreshLabelOptions() {
      if (this.$refs.labelSelectRef) this.$refs.labelSelectRef.getWorkItemLabelList()
    },
    addChild() {
      this.formData.childWorkItemNames.push('')
    },
    removeChild(index) {
      this.formData.childWorkItemNames.splice(index, 1)
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
.label-editor, .child-row { display: flex; align-items: center; gap: 8px; }
.label-select { flex: 1; }
.child-list { display: flex; width: 100%; flex-direction: column; gap: 8px; }
.danger-button { color: #f56c6c; }
.add-child-button { align-self: flex-start; }
</style>
