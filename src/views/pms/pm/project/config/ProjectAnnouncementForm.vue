<template>
  <Dialog v-model="dialogVisible" append-to-body :title="dialogTitle" width="680px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="公告内容" prop="content">
        <el-input
          v-model="formData.content"
          :rows="6"
          maxlength="5000"
          placeholder="请输入公告内容"
          show-word-limit
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="附件" prop="fileUrls">
        <UploadFile v-model="formData.fileUrls" />
      </el-form-item>
    </el-form>
    <template slot="footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script>
import * as ProjectAnnouncementApi from '@/api/pms/pm/project/announcement'
import UploadFile from '@/components/UploadFile'
import Dialog from '@/components/Dialog'
export default {
  name: 'PmsProjectAnnouncementForm',
  components: { UploadFile, Dialog },
  data() {
    return { dialogVisible: false, dialogTitle: '', formLoading: false, formType: '',
      formData: { id: undefined, projectId: undefined, content: '', fileUrls: [] },
      formRules: { content: [{ required: true, message: '公告内容不能为空', trigger: 'blur' }] }
    }
  },
  methods: {
    async open(type, projectId, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '发布公告' : '编辑公告'
      this.formType = type
      this.formData = { id: undefined, projectId, content: '', fileUrls: [] }
      await this.$nextTick()
      if (this.$refs.formRef) this.$refs.formRef.clearValidate()
      if (id) {
        this.formLoading = true
        try {
          const response = await ProjectAnnouncementApi.getProjectAnnouncement(id)
          this.formData = response.data
        } finally { this.formLoading = false }
      }
    },
    async submitForm() {
      if (!this.$refs.formRef) return
      const valid = await new Promise(resolve => this.$refs.formRef.validate(resolve))
      if (!valid) return
      this.formLoading = true
      try {
        if (this.formType === 'create') await ProjectAnnouncementApi.createProjectAnnouncement(this.formData)
        else await ProjectAnnouncementApi.updateProjectAnnouncement(this.formData)
        this.$message.success(this.formType === 'create' ? '新增成功' : '修改成功')
        this.dialogVisible = false
        this.$emit('success')
      } finally { this.formLoading = false }
    }
  }
}
</script>

<style scoped>
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.mb-16px { margin-bottom: 16px; }
.ml-8px { margin-left: 8px; }
.mt-4px { margin-top: 4px; }
.m-0 { margin: 0; }
.gap-8px { gap: 8px; }
.gap-12px { gap: 12px; }
.gap-16px { gap: 16px; }
.text-13px { font-size: 13px; color: #909399; }
.text-18px { font-size: 18px; }
.text-20px { font-size: 20px; }
.font-600 { font-weight: 600; }
.whitespace-pre-wrap { white-space: pre-wrap; }
.line-clamp-2 { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.leading-22px { line-height: 22px; }
.leading-20px { line-height: 20px; }
.delete-button { color: #f56c6c; }
</style>
