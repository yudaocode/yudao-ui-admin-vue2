<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="600px"
    custom-class="diy-template-form-dialog"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item
        label="模板名称"
        prop="name"
      >
        <el-input
          v-model="formData.name"
          placeholder="请输入模板名称"
        />
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="formData.remark"
          placeholder="请输入备注"
          type="textarea"
        />
      </el-form-item>
      <el-form-item
        label="预览图"
        prop="previewPicUrls"
      >
        <UploadImgs v-model="formData.previewPicUrls" />
      </el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        :disabled="formLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as DiyTemplateApi from '@/api/mall/promotion/diy/template'

export default {
  name: 'DiyTemplateForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: this.getDefaultFormData(),
      formRules: {
        name: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    getDefaultFormData() {
      return {
        id: undefined,
        name: undefined,
        remark: undefined,
        previewPicUrls: []
      }
    },
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增' : '修改'
      this.formType = type
      this.resetForm()
      if (id === undefined || id === null) return Promise.resolve()

      this.formLoading = true
      return DiyTemplateApi.getDiyTemplate(id)
        .then((response) => {
          this.formData = response.data
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    submitForm() {
      if (!this.$refs.form) return Promise.resolve(false)
      return new Promise((resolve, reject) => {
        this.$refs.form.validate((valid) => {
          if (!valid) {
            resolve(false)
            return
          }
          this.formLoading = true
          const request = this.formType === 'create'
            ? DiyTemplateApi.createDiyTemplate(this.formData)
            : DiyTemplateApi.updateDiyTemplate(this.formData)
          request
            .then(() => {
              this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
              this.dialogVisible = false
              this.$emit('success')
              return true
            })
            .finally(() => {
              this.formLoading = false
            })
            .then(resolve, reject)
        })
      })
    },
    resetForm() {
      this.formData = this.getDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetFields()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  text-align: right;
}

::v-deep .diy-template-form-dialog {
  max-width: calc(100vw - 30px);
}

@media (max-width: 768px) {
  ::v-deep .diy-template-form-dialog {
    width: calc(100vw - 24px) !important;
    margin-top: 5vh !important;
  }
}
</style>
