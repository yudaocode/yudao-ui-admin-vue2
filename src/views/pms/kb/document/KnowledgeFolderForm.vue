<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="520px" append-to-body>
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="文件夹名称" prop="title">
        <el-input v-model="formData.title" maxlength="255" placeholder="请输入文件夹名称" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as KnowledgeFolderApi from '@/api/pms/kb/content/folder'
import { PmsKnowledgeRootId } from '@/views/pms/kb/utils/constants'

function getDefaultFormData() {
  return { id: undefined, libraryId: 0, parentId: PmsKnowledgeRootId, title: '' }
}

export default {
  name: 'PmsKnowledgeFolderForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: getDefaultFormData(),
      formRules: { title: [{ required: true, message: '请输入文件夹名称', trigger: 'blur' }] }
    }
  },
  methods: {
    async open(type, libraryId, parentId = PmsKnowledgeRootId, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新建文件夹' : '编辑文件夹'
      this.formType = type
      this.resetForm()
      this.formData.libraryId = libraryId
      this.formData.parentId = parentId
      if (!id) return
      this.formLoading = true
      try {
        const response = await KnowledgeFolderApi.getKnowledgeFolder(id)
        const folder = response.data
        this.formData = {
          id: folder.id,
          libraryId: folder.libraryId,
          parentId: folder.parentId,
          title: folder.title
        }
      } finally {
        this.formLoading = false
      }
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? KnowledgeFolderApi.createKnowledgeFolder(this.formData)
          : KnowledgeFolderApi.updateKnowledgeFolder(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '创建成功' : '更新成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    resetForm() {
      this.formData = getDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>
