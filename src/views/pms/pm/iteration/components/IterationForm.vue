<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="720px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="92px"
    >
      <!-- 迭代基本信息 -->
      <el-form-item label="迭代名称" prop="name">
        <el-input v-model="formData.name" maxlength="100" placeholder="请输入迭代名称" />
      </el-form-item>
      <!-- 迭代周期 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              style="width: 100%"
              clearable
              placeholder="请选择开始时间"
              type="datetime"
              value-format="timestamp"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              v-model="formData.endTime"
              style="width: 100%"
              clearable
              placeholder="请选择结束时间"
              type="datetime"
              value-format="timestamp"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="迭代目标" prop="target">
        <el-input v-model="formData.target" maxlength="255" placeholder="请输入迭代目标" />
      </el-form-item>
      <el-form-item label="负责人" prop="ownerUserId">
        <el-select
          v-model="formData.ownerUserId"
          style="width: 100%"
          clearable
          filterable
          placeholder="请选择项目成员"
        >
          <el-option
            v-for="member in memberList"
            :key="member.userId"
            :label="member.nickname"
            :value="member.userId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="迭代描述" prop="description">
        <el-input
          v-model="formData.description"
          :rows="4"
          maxlength="2000"
          placeholder="请输入迭代描述"
          show-word-limit
          type="textarea"
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
import Dialog from '@/components/Dialog'
import * as IterationApi from '@/api/pms/pm/iteration'
import * as ProjectMemberApi from '@/api/pms/pm/project/member'

export default {
  name: 'PmsIterationForm',
  components: { Dialog },
  data() {
    return {
      dialogVisible: false, dialogTitle: '', formLoading: false, formType: '',
      projectId: 0, memberList: [], formData: { projectId: 0, name: '' },
      formRules: { name: [{ required: true, message: '迭代名称不能为空', trigger: 'blur' }] }
    }
  },
  methods: {
    async open(type, currentProjectId, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新建迭代' : '编辑迭代'
      this.formType = type
      this.projectId = currentProjectId
      this.resetForm()
      await this.$nextTick()
      if (this.$refs.formRef) this.$refs.formRef.clearValidate()
      if (id) {
        this.formLoading = true
        try {
          const response = await IterationApi.getIteration(id)
          this.formData = response.data
        } finally {
          this.formLoading = false
        }
      }
      const response = await ProjectMemberApi.getProjectMemberList(currentProjectId)
      this.memberList = response.data
    },
    async submitForm() {
      if (!this.$refs.formRef || this.formLoading) return
      const valid = await new Promise(resolve => this.$refs.formRef.validate(resolve))
      if (!valid) return
      if (this.formData.startTime && this.formData.endTime &&
          Number(this.formData.startTime) >= Number(this.formData.endTime)) {
        this.$message.warning('迭代开始时间必须早于结束时间')
        return
      }
      this.formLoading = true
      try {
        if (this.formType === 'create') {
          await IterationApi.createIteration(this.formData)
          this.$message.success('创建成功')
        } else {
          await IterationApi.updateIteration(this.formData)
          this.$message.success('更新成功')
        }
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.formData = { projectId: this.projectId, name: '' }
    }
  }
}
</script>
