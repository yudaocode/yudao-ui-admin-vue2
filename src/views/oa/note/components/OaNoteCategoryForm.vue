<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="480px" @closed="resetForm">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="目录名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入目录名称" maxlength="255" />
      </el-form-item>
      <el-form-item label="显示排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" style="width: 100%" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as NoteCategoryApi from '@/api/oa/note/category'
import Dialog from '@/components/Dialog'

function createDefaultFormData() {
  return {
    id: undefined,
    name: '',
    sort: 0
  }
}

export default {
  name: 'OaNoteCategoryForm',
  components: { Dialog },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      formData: createDefaultFormData(),
      formRules: {
        name: [{ required: true, message: '目录名称不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '添加笔记目录' : '修改笔记目录'
      this.formType = type
      this.resetForm()
      // 修改时，设置目录数据
      if (id !== undefined) {
        this.formLoading = true
        NoteCategoryApi.getNoteCategory(id).then(response => {
          this.formData = response.data
        }).catch(error => {
          this.dialogVisible = false
          throw error
        }).finally(() => {
          this.formLoading = false
        })
      }
    },
    submitForm() {
      if (this.formLoading) return
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? NoteCategoryApi.createNoteCategory(this.formData)
          : NoteCategoryApi.updateNoteCategory(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '添加成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    resetForm() {
      this.formData = createDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>
