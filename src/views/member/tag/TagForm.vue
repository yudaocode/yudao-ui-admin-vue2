<template>
  <Dialog
    :title="title"
    v-model="visible"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="loading"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item
        label="标签名称"
        prop="name"
      ><el-input
        v-model="formData.name"
        placeholder="请输入标签名称"
      /></el-form-item>
    </el-form>
    <div slot="footer"><el-button
      type="primary"
      :loading="loading"
      @click="submitForm"
    >确 定</el-button><el-button @click="visible = false">取 消</el-button></div>
  </Dialog>
</template>

<script>
import * as TagApi from '@/api/member/tag'
import Dialog from '@/components/Dialog'

const blank = () => ({ id: undefined, name: undefined })

export default {
  name: 'MemberTagForm',
  components: { Dialog },
  data() { return { visible: false, loading: false, title: '', formType: 'create', formData: blank(), rules: { name: [{ required: true, message: '标签名称不能为空', trigger: 'blur' }] }} },
  methods: {
    async open(type, id) {
      this.visible = true
      this.formType = type
      this.title = this.$t('action.' + type)
      this.resetForm()
      if (id) {
        this.loading = true
        try {
          const response = await TagApi.getMemberTag(id)
          this.formData = response.data
        } finally {
          this.loading = false
        }
      }
    },
    async submitForm() {
      const valid = await new Promise(resolve => this.$refs.form.validate(resolve))
      if (!valid) return
      this.loading = true
      try {
        if (this.formType === 'create') {
          await TagApi.createMemberTag(this.formData)
          this.$modal.msgSuccess(this.$t('common.createSuccess'))
        } else {
          await TagApi.updateMemberTag(this.formData)
          this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        }
        this.visible = false
        this.$emit('success')
      } finally {
        this.loading = false
      }
    },
    resetForm() {
      this.formData = blank()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    }
  }
}
</script>
