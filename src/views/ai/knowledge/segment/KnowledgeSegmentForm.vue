<template>
  <Dialog :title="title" v-model="visible" append-to-body>
    <el-form
      ref="form"
      v-loading="loading"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="切片内容" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="6"
          placeholder="请输入切片内容"
        />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" :disabled="loading" @click="submitForm">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </span>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import { KnowledgeSegmentApi } from '@/api/ai/knowledge/segment'

export default {
  name: 'KnowledgeSegmentForm',
  components: { Dialog },
  data() {
    return {
      visible: false,
      loading: false,
      title: '',
      formType: 'create',
      formData: this.getDefaultFormData(),
      rules: {
        content: [{ required: true, message: '切片内容不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    getDefaultFormData() {
      return {
        id: undefined,
        documentId: undefined,
        content: undefined
      }
    },
    async open(type, id, documentId) {
      this.visible = true
      this.formType = type
      this.title = type === 'create' ? '新增知识库分段' : '修改知识库分段'
      this.formData = Object.assign(this.getDefaultFormData(), { documentId })
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
      if (!id) return
      this.loading = true
      try {
        const response = await KnowledgeSegmentApi.getKnowledgeSegment(id)
        this.formData = response.data
      } finally {
        this.loading = false
      }
    },
    async submitForm() {
      const valid = await new Promise(resolve => this.$refs.form.validate(resolve))
      if (!valid) return
      this.loading = true
      try {
        if (this.formType === 'create') {
          await KnowledgeSegmentApi.createKnowledgeSegment(this.formData)
          this.$modal.msgSuccess('新增成功')
        } else {
          await KnowledgeSegmentApi.updateKnowledgeSegment(this.formData)
          this.$modal.msgSuccess('修改成功')
        }
        this.visible = false
        this.$emit('success')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
