<template>
  <Dialog v-model="dialogVisible" append-to-body :title="dialogTitle" width="760px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="96px"
    >
      <!-- 项目基本信息 -->
      <el-form-item v-if="formType === 'create'" label="项目类型" prop="type">
        <div style="width: 100%">
          <el-radio-group v-model="formData.type">
            <el-radio-button :label="PmsProjectType.GENERAL">通用项目</el-radio-button>
            <el-radio-button :label="PmsProjectType.AGILE">敏捷开发项目</el-radio-button>
          </el-radio-group>
          <div class="project-type-tip">
            {{ projectTypeTip }}
          </div>
        </div>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="项目名称" prop="name">
            <el-input
              v-model="formData.name"
              clearable
              maxlength="31"
              placeholder="请输入项目名称"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目封面" prop="icon">
            <IconSelect v-model="formData.icon" style="width: 100%" clearable />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 项目周期 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              style="width: 100%"
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
              style="width: 100%"
              placeholder="请选择截止时间"
              type="datetime"
              value-format="timestamp"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="项目描述" prop="description">
        <el-input
          v-model="formData.description"
          :rows="3"
          maxlength="500"
          placeholder="请输入项目描述"
          show-word-limit
          type="textarea"
        />
      </el-form-item>
      <!-- 项目权限 -->
      <el-form-item label="可见范围" prop="openStatus">
        <el-radio-group v-model="formData.openStatus">
          <el-radio :label="false">私有：只有项目成员可以查看</el-radio>
          <el-radio :label="true">公开：所有人可查看，只有项目成员可以编辑</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="formType === 'create' && !formData.openStatus"
        label="项目成员"
        prop="memberUserIds"
      >
        <UserSelectV2
          v-model="formData.memberUserIds"
          :multiple="true"
          placeholder="请选择项目成员；创建人会自动加入"
        />
      </el-form-item>
    </el-form>
    <template slot="footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script>
import * as ProjectApi from '@/api/pms/pm/project'
import { PmsProjectLevel, PmsProjectType } from '@/views/pms/pm/utils/constants'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import { IconSelect } from '@/components/Icon'
import Dialog from '@/components/Dialog'

function defaultFormData() {
  return {
    id: undefined, name: '', type: PmsProjectType.GENERAL,
    level: PmsProjectLevel.NORMAL, description: '', openStatus: false,
    icon: 'ep:folder', startTime: undefined, endTime: undefined, memberUserIds: []
  }
}

export default {
  name: 'PmsProjectForm',
  components: { UserSelectV2, IconSelect, Dialog },
  data() {
    return {
      PmsProjectType, dialogVisible: false, dialogTitle: '', formLoading: false,
      formType: '', formData: defaultFormData(),
      formRules: {
        type: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
        name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
        icon: [{ required: true, message: '请选择项目封面', trigger: 'change' }],
        openStatus: [{ required: true, message: '请选择项目可见范围', trigger: 'change' }],
        startTime: [{ validator: this.validateProjectTimeRange, trigger: 'change' }],
        endTime: [{ validator: this.validateProjectTimeRange, trigger: 'change' }]
      }
    }
  },
  computed: {
    projectTypeTip() {
      return this.formData.type === PmsProjectType.AGILE
        ? '适合敏捷研发协作，提供需求、迭代、任务、缺陷和甘特图。'
        : '适合日常任务协作，提供项目概况、任务和甘特图。'
    }
  },
  methods: {
    validateProjectTimeRange(rule, value, callback) {
      if (this.formData.startTime && this.formData.endTime &&
          Number(this.formData.startTime) >= Number(this.formData.endTime)) {
        callback(new Error('开始时间必须早于截止时间'))
        return
      }
      callback()
    },
    async open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增' : '修改'
      this.formType = type
      this.resetForm()
      await this.$nextTick()
      if (this.$refs.formRef) this.$refs.formRef.clearValidate()
      if (id) {
        this.formLoading = true
        try {
          const response = await ProjectApi.getProject(id)
          this.formData = response.data
        } finally {
          this.formLoading = false
        }
      }
    },
    async submitForm() {
      if (!this.$refs.formRef || this.formLoading) return
      const valid = await new Promise(resolve => this.$refs.formRef.validate(resolve))
      if (!valid) return
      this.formLoading = true
      try {
        if (this.formType === 'create') {
          await ProjectApi.createProject(this.formData)
          this.$message.success('创建成功')
        } else {
          await ProjectApi.updateProject(this.formData)
          this.$message.success('更新成功')
        }
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.formData = defaultFormData()
    }
  }
}
</script>
<style scoped>
.project-type-tip { margin-top: 8px; font-size: 13px; color: #909399; }
</style>
